import React from 'react';
import { GateCommand, ComplexVector } from '../quantum/types';
import { SortableGate } from './SortableGate';
import { useDroppable } from '@dnd-kit/core';

interface TimelineProps {
  gates: GateCommand[];
  history: ComplexVector[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onParamChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  paramErrors?: Record<string, boolean>;
  alpha: string;
  setAlpha: (v: string) => void;
  beta: string;
  setBeta: (v: string) => void;
  ampErrors: { alpha: boolean; beta: boolean };
  insertionIndex?: number | null;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ gates, history, activeIndex, onSelect, onParamChange, onRemove, paramErrors, alpha, setAlpha, beta, setBeta, ampErrors, insertionIndex, showHistory, setShowHistory }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'timeline-drop' });
  const isInitial = activeIndex === -1;
  
  return (
    <div className="space-y-3" ref={setNodeRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Timeline</h2>
          {isOver && <span className="text-[10px] font-bold text-cyan-400 animate-pulse bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-900">Drop to Add</span>}
        </div>
        <button
          onClick={() => !isInitial && setShowHistory(!showHistory)}
          disabled={isInitial}
          className={`text-[10px] px-2 py-1 rounded-md border transition-all duration-200 ${
            isInitial 
              ? 'border-slate-800 text-slate-600 bg-slate-900/50 cursor-not-allowed' 
              : showHistory 
                ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                : 'border-slate-600 text-slate-400 bg-slate-800 hover:bg-slate-700'
          }`}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-800 z-0"></div>

        <ol className="space-y-2 relative z-10">
          <li className="group">
            <div 
              className={`
                p-1 rounded-lg border transition-all duration-200 
                grid grid-cols-[20px_140px_1fr_20px] gap-2 items-center
                ${activeIndex === -1 
                  ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}
                cursor-pointer
              `}
              onClick={() => onSelect(-1)}
            >
              <div className={`
                w-5 h-5 flex-shrink-0 flex items-center justify-center 
                text-[10px] font-mono font-bold rounded-full border 
                transition-colors duration-200
                ${activeIndex === -1 ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-800 text-slate-500 border-slate-700'}
              `}>0</div>
              
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Initial State</div>

              <div className="flex items-center gap-1 text-sm font-mono text-slate-300 whitespace-nowrap">
                 <span className="mr-1 text-slate-500">|ψ⟩ =</span>
                 <input 
                   value={alpha}  
                   onChange={(e) => setAlpha(e.target.value)}
                   className={`
                     bg-slate-950 border rounded px-1.5 py-0.5 w-12 text-center text-xs outline-none transition-colors
                     ${ampErrors.alpha ? 'border-red-500/50 text-red-400' : 'border-slate-700 text-cyan-300 focus:border-cyan-500/50'}
                   `}
                   onClick={(e) => e.stopPropagation()}
                 />
                 <span className="text-slate-500">|0⟩ +</span>
                 <input 
                   value={beta} 
                   onChange={(e) => setBeta(e.target.value)}
                   className={`
                     bg-slate-950 border rounded px-1.5 py-0.5 w-12 text-center text-xs outline-none transition-colors
                     ${ampErrors.beta ? 'border-red-500/50 text-red-400' : 'border-slate-700 text-cyan-300 focus:border-cyan-500/50'}
                   `}
                   onClick={(e) => e.stopPropagation()}
                 />
                 <span className="text-slate-500">|1⟩</span>
              </div>
              <div></div>
            </div>
          </li>
          
          {gates.map((g,i) => (
            <React.Fragment key={g.id}>
              {insertionIndex === i && (
                <div className="h-0.5 bg-cyan-500 rounded-full my-1 shadow-[0_0_8px_#22d3ee] animate-pulse mx-4" />
              )}
              <SortableGate 
                gate={g} 
                index={i} 
                displayIndex={i+1} 
                active={i===activeIndex} 
                error={!!paramErrors?.[g.id]} 
                onSelect={onSelect} 
                onParamChange={onParamChange} 
                onRemove={onRemove} 
                resultState={history[i+1]}
              />
            </React.Fragment>
          ))}
          
          {insertionIndex === gates.length && (
            <div className="h-0.5 bg-cyan-500 rounded-full my-1 shadow-[0_0_8px_#22d3ee] animate-pulse mx-4" />
          )}
          
          {gates.length===0 && (
            <li className="text-center py-8 border-2 border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
              Drag gates here to start building your circuit
            </li>
          )}
        </ol>
      </div>
    </div>
  );
};
