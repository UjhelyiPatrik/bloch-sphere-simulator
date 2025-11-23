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
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className={`grid grid-cols-[20px_140px_1fr_20px] gap-2 items-center p-1 rounded border text-xs ${active? 'border-neon bg-gray-800':'border-gray-600 bg-gray-900'}`}>
      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-gray-800 text-gray-400 text-[10px] font-mono rounded border border-gray-700 select-none">
        {displayIndex}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onSelect(index)} className="px-2 py-0.5 bg-gray-700 rounded cursor-pointer select-none">{gate.type}</button>
        {isParam && (
          <input
            value={gate.params || ''}
            onChange={e=>onParamChange(gate.id, e.target.value)}
            placeholder="angle"
            className={`bg-gray-900 border ${error? 'border-red-500 animate-pulse':'border-gray-600'} focus:border-neon rounded px-1 py-0.5 w-20 outline-none`}
          />
        )}
      </div>
      {resultState ? (
        <div className="text-sm font-mono text-gray-200 flex items-center gap-1">
           <span className="mr-1">|ψ'⟩ =</span>
           <span>{formatComplex(resultState[0])}</span>
           <span>|0⟩ +</span>
           <span>{formatComplex(resultState[1])}</span>
           <span>|1⟩</span>
        </div>
      ) : <div></div>}
      <button onPointerDown={e => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onRemove(gate.id); }} className="text-red-500 hover:text-red-400 px-1 font-bold flex justify-center">✕</button>
    </li>
  );
};
