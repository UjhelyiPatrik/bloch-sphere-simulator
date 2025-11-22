import React from 'react';
import { GateCommand } from '../quantum/types';
import { SortableGate } from './SortableGate';
import { useDroppable } from '@dnd-kit/core';

interface TimelineProps {
  gates: GateCommand[];
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
}

export const Timeline: React.FC<TimelineProps> = ({ gates, activeIndex, onSelect, onParamChange, onRemove, paramErrors, alpha, setAlpha, beta, setBeta, ampErrors }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'timeline-drop' });
  return (
    <div className="p-2 space-y-2" ref={setNodeRef}>
      <h2 className="text-sm font-semibold flex items-center gap-2">Timeline {isOver && <span className="text-[10px] text-neon">Drop to Add</span>}</h2>
        <p className="text-xs text-gray-500 italic text-left mt-2">Drag and drop to rearrange order</p>
      <ol className="space-y-1 min-h-16 border border-dashed border-gray-600 rounded p-1">
        <li className="mb-1">
          <div 
            className={`p-2 rounded border ${activeIndex === -1 ? 'border-neon bg-gray-800' : 'border-gray-700 bg-gray-900'} cursor-pointer transition-colors`}
            onClick={() => onSelect(-1)}
          >
            <div className="flex items-center gap-1 text-sm font-mono text-gray-200 justify-center">
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
          </div>
        </li>
        {gates.map((g,i) => (
          <SortableGate key={g.id} gate={g} index={i} active={i===activeIndex} error={!!paramErrors?.[g.id]} onSelect={onSelect} onParamChange={onParamChange} onRemove={onRemove} />
        ))}
        {gates.length===0 && <li className="text-[10px] text-gray-400 px-1">Drag gates here</li>}
      </ol>
    </div>
  );
};
