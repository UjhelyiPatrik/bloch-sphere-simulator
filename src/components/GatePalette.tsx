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
      className="
        relative group overflow-hidden
        px-3 py-2 rounded-lg 
        bg-slate-800 border border-slate-700 
        hover:border-cyan-500/50 hover:bg-slate-700/80 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-200 ease-out
        cursor-grab active:cursor-grabbing select-none
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative font-mono text-sm font-bold text-slate-300 group-hover:text-cyan-300">{type}</span>
    </button>
  );
};

export const GatePalette: React.FC<GatePaletteProps> = ({ onAdd }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Gate Palette</h2>
      <div className="h-px flex-1 bg-slate-800 ml-4"></div>
    </div>
    <div className="grid grid-cols-5 gap-2">
      {GATE_LIST.map(g => <DraggableGate key={g} type={g} onAdd={onAdd} />)}
    </div>
    <p className="text-[10px] text-slate-500 text-center pt-1">Drag to timeline or double-click</p>
  </div>
);
