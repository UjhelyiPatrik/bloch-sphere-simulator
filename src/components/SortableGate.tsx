import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GateCommand, ComplexVector } from '../quantum/types';
import { formatComplex } from '../utils';

interface SortableGateProps {
  gate: GateCommand;
  index: number;
  displayIndex: number;
  active: boolean;
  error?: boolean;
  onSelect: (index: number) => void;
  onParamChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  resultState?: ComplexVector;
}

export const SortableGate: React.FC<SortableGateProps> = ({ gate, index, displayIndex, active, error, onSelect, onParamChange, onRemove, resultState }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: gate.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const isParam = ['Rx','Ry','Rz','Phase'].includes(gate.type);

  return (
    <li 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`
        grid grid-cols-[20px_140px_1fr_20px] gap-2 items-center 
        p-1 rounded-lg border transition-all duration-200
        ${active 
          ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}
      `}
    >
      <div className={`
        w-5 h-5 flex-shrink-0 flex items-center justify-center 
        text-[10px] font-mono font-bold rounded-full border 
        transition-colors duration-200 select-none
        ${active ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-800 text-slate-500 border-slate-700'}
      `}>
        {displayIndex}
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onSelect(index)} 
          className={`
            px-3 py-1 rounded-md text-xs font-bold font-mono select-none transition-colors
            ${active ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
          `}
        >
          {gate.type}
        </button>
        {isParam && (
          <input
            value={gate.params || ''}
            onChange={e=>onParamChange(gate.id, e.target.value)}
            placeholder="angle"
            className={`
              bg-slate-950 border rounded px-2 py-1 w-20 text-xs outline-none transition-colors
              ${error ? 'border-red-500/50 text-red-400 animate-pulse' : 'border-slate-700 text-cyan-300 focus:border-cyan-500/50'}
            `}
          />
        )}
      </div>
      
      {resultState ? (
        <div className="text-sm font-mono text-slate-300 flex items-center gap-x-1 whitespace-nowrap">
           <span className="mr-1 text-slate-500">|ψ'⟩ =</span>
           <span className="text-cyan-300">{formatComplex(resultState[0])}</span>
           <span className="text-slate-500">|0⟩ +</span>
           <span className="text-cyan-300">{formatComplex(resultState[1])}</span>
           <span className="text-slate-500">|1⟩</span>
        </div>
      ) : <div></div>}
      
      <button 
        onPointerDown={e => e.stopPropagation()} 
        onClick={(e) => { e.stopPropagation(); onRemove(gate.id); }} 
        className="
          w-5 h-5 flex items-center justify-center rounded-full 
          text-slate-600 hover:text-red-400 hover:bg-red-950/30 
          transition-colors
        "
      >
        ✕
      </button>
    </li>
  );
};
