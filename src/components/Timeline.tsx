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
    <div className="p-2 space-y-2" ref={setNodeRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">Timeline {isOver && <span className="text-[10px] text-neon">Drop to Add</span>}</h2>
        <button
          onClick={() => !isInitial && setShowHistory(!showHistory)}
          disabled={isInitial}
          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
            isInitial 
              ? 'border-gray-700 text-gray-500 cursor-not-allowed bg-gray-900' 
              : showHistory 
                ? 'border-neon text-neon bg-gray-800 hover:bg-gray-700' 
                : 'border-gray-500 text-gray-300 bg-gray-800 hover:bg-gray-700'
          }`}
        >
          {showHistory ? 'Hide history' : 'Show history'}
        </button>
      </div>
        <p className="text-xs text-gray-500 italic text-left mt-2">Drag and drop to rearrange order</p>
      <ol className="space-y-1 min-h-16 border border-dashed border-gray-600 rounded p-1 relative">
        <li className="mb-1">
          <div 
            className={`p-1 rounded border ${activeIndex === -1 ? 'border-neon bg-gray-800' : 'border-gray-700 bg-gray-900'} cursor-pointer transition-colors grid grid-cols-[20px_140px_1fr_20px] gap-2 items-center`}
            onClick={() => onSelect(-1)}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-gray-800 text-gray-400 text-[10px] font-mono rounded border border-gray-700 select-none">0</div>
            <div></div>
            <div className="flex items-center gap-1 text-sm font-mono text-gray-200">
               <span className="mr-1">|ψ⟩ =</span>
               <input 
                 value={alpha} 
                 onChange={(e) => setAlpha(e.target.value)}
                 className={`bg-black border ${ampErrors.alpha ? 'border-red-500' : 'border-gray-600'} rounded px-1 py-0.5 w-12 text-center text-xs focus:border-neon outline-none`}
                 onClick={(e) => e.stopPropagation()}
               />
               <span>|0⟩ +</span>
               <input 
                 value={beta} 
                 onChange={(e) => setBeta(e.target.value)}
                 className={`bg-black border ${ampErrors.beta ? 'border-red-500' : 'border-gray-600'} rounded px-1 py-0.5 w-12 text-center text-xs focus:border-neon outline-none`}
                 onClick={(e) => e.stopPropagation()}
               />
               <span>|1⟩</span>
            </div>
            <div></div>
          </div>
        </li>
        {gates.map((g,i) => (
          <React.Fragment key={g.id}>
            {insertionIndex === i && <div className="h-1 bg-neon rounded my-1 shadow-[0_0_5px_#0ff]" />}
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
        {insertionIndex === gates.length && <div className="h-1 bg-neon rounded my-1 shadow-[0_0_5px_#0ff]" />}
        {gates.length===0 && <li className="text-[10px] text-gray-400 px-1">Drag gates here</li>}
      </ol>
    </div>
  );
};
