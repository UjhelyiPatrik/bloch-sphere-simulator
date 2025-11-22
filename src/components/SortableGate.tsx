import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GateCommand } from '../quantum/types';

interface SortableGateProps {
  gate: GateCommand;
  index: number;
  active: boolean;
  error?: boolean;
  onSelect: (index: number) => void;
  onParamChange: (id: string, value: string) => void;
}

export const SortableGate: React.FC<SortableGateProps> = ({ gate, index, active, error, onSelect, onParamChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: gate.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const isParam = ['Rx','Ry','Rz','Phase'].includes(gate.type);

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className={`flex items-center gap-2 p-1 rounded border text-xs ${active? 'border-neon bg-gray-800':'border-gray-600 bg-gray-900'}`}>
      <button onClick={() => onSelect(index)} className="px-2 py-0.5 bg-gray-700 rounded cursor-pointer select-none">{gate.type}</button>
      {isParam && (
        <input
          value={gate.params || ''}
          onChange={e=>onParamChange(gate.id, e.target.value)}
          placeholder="angle"
          className={`bg-gray-900 border ${error? 'border-red-500 animate-pulse':'border-gray-600'} focus:border-neon rounded px-1 py-0.5 w-20 outline-none`}
        />
      )}
    </li>
  );
};
