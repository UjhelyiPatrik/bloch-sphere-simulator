import React from 'react';
import { GateType } from '../quantum/types';
import { useDraggable } from '@dnd-kit/core';

const GATE_LIST: GateType[] = ['H','X','Y','Z','S','T','Phase','Rx','Ry','Rz'];

interface GatePaletteProps {
  onAdd: (type: GateType) => void;
}

const DraggableGate: React.FC<{ type: GateType; onAdd: (t: GateType)=>void }> = ({ type, onAdd }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `palette-${type}`, data: { gateType: type } });
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onDoubleClick={()=>onAdd(type)}
      className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs cursor-grab active:cursor-grabbing select-none"
    >{type}</button>
  );
};

export const GatePalette: React.FC<GatePaletteProps> = ({ onAdd }) => (
  <div className="space-y-2 p-2">
    <h2 className="text-sm font-semibold">Gate Palette</h2>
    <div className="grid grid-cols-5 gap-2">
      {GATE_LIST.map(g => <DraggableGate key={g} type={g} onAdd={onAdd} />)}
    </div>
    <p className="text-[10px] text-gray-400">Drag into timeline or double-click to add.</p>
  </div>
);
