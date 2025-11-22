import React, { useState, useMemo } from 'react';
import { GateCommand, GateType, ComplexVector } from './quantum/types';
import { computeHistory, defaultInitialState } from './quantum/engine';
import { BlochSphere } from './components/BlochSphere';
import { GatePalette } from './components/GatePalette';
import { Timeline } from './components/Timeline';
import { Controls } from './components/Controls';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { evaluate, complex, Complex } from 'mathjs';

function uuid() { return Math.random().toString(36).slice(2,9); }

export default function App() {
  const [alphaExpr, setAlphaExpr] = useState('1');
  const [betaExpr, setBetaExpr] = useState('0');
  const [paramErrors, setParamErrors] = useState<Record<string, boolean>>({});
  const [gates, setGates] = useState<GateCommand[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const parseExpr = (expr: string): Complex => {
    try {
      const val = evaluate(expr);
      if (typeof val === 'number') return complex(val, 0);
      if (val && typeof val === 'object' && 're' in val && 'im' in val) {
        const anyVal = val as { re: number; im: number };
        return complex(anyVal.re, anyVal.im);
      }
      return complex(0,0);
    } catch {
      return complex(Number.NaN, Number.NaN);
    }
  };

  const { initialState, ampErrors } = useMemo(() => {
    const a = parseExpr(alphaExpr);
    const b = parseExpr(betaExpr);
    const aInvalid = Number.isNaN(a.re) || Number.isNaN(a.im);
    const bInvalid = Number.isNaN(b.re) || Number.isNaN(b.im);
    
    const aUse = aInvalid ? complex(1,0) : a;
    const bUse = bInvalid ? complex(0,0) : b;
    // Normalize
    const mag = Math.hypot(Math.hypot(aUse.re, aUse.im), Math.hypot(bUse.re, bUse.im)) || 1;
    return {
      initialState: [complex(aUse.re / mag, aUse.im / mag), complex(bUse.re / mag, bUse.im / mag)] as ComplexVector,
      ampErrors: { alpha: aInvalid, beta: bInvalid }
    };
  }, [alphaExpr, betaExpr]);

  const history = useMemo(() => computeHistory(initialState, gates).history, [initialState, gates]);
  const current = history[stepIndex] || history[history.length -1];
  const ghosts = history.slice(0, stepIndex);

  function addGate(type: GateType) {
    setGates(g => [...g, { id: uuid(), type }]);
    setStepIndex(0);
  }
  function onParamChange(id: string, value: string) {
    setGates(g => g.map(x => x.id === id ? { ...x, params: value } : x));
    // validate expression
    let valid = true;
    try { const v = evaluate(value); if (typeof v !== 'number') valid = false; } catch { valid = false; }
    setParamErrors(errs => ({ ...errs, [id]: !valid }));
  }
  function removeGate(id: string) {
    setGates(g => g.filter(x => x.id !== id));
    setStepIndex(0);
  }
  function onSelect(i: number) { setStepIndex(prev => prev === i + 1 ? 0 : i + 1); }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (String(active.id).startsWith('palette-') && over.id === 'timeline-drop') {
      // add new gate
      const type = String(active.id).replace('palette-','') as GateType;
      addGate(type);
      return;
    }
    setGates(items => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  return (
    <div className="h-full flex flex-col">
      <header className="p-2 bg-gray-800 flex items-center gap-4 text-sm">
        <span className="font-semibold text-neon">Bloch Sphere Simulator</span>
        <div className="flex items-center gap-2">
          <label htmlFor="alpha" className="sr-only">alpha amplitude</label>
          <input id="alpha" value={alphaExpr} onChange={e=>setAlphaExpr(e.target.value)} placeholder="alpha" className={`bg-gray-900 border ${ampErrors.alpha? 'border-red-500':'border-gray-600'} rounded px-1 py-0.5 w-24`} />
          <label htmlFor="beta" className="sr-only">beta amplitude</label>
          <input id="beta" value={betaExpr} onChange={e=>setBetaExpr(e.target.value)} placeholder="beta" className={`bg-gray-900 border ${ampErrors.beta? 'border-red-500':'border-gray-600'} rounded px-1 py-0.5 w-24`} />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 bg-gray-900 overflow-y-auto border-r border-gray-700">
          <GatePalette onAdd={addGate} />
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={gates.map(g=>g.id)}>
              <Timeline gates={gates} activeIndex={stepIndex-1} onSelect={onSelect} onParamChange={onParamChange} onRemove={removeGate} paramErrors={paramErrors} />
            </SortableContext>
          </DndContext>
          <Controls
            canPrev={stepIndex>0}
            canNext={stepIndex < history.length-1}
            onPrev={()=>setStepIndex(i=>Math.max(0,i-1))}
            onNext={()=>setStepIndex(i=>Math.min(history.length-1,i+1))}
            onStart={()=>setStepIndex(0)}
            onEnd={()=>setStepIndex(history.length-1)}
          />
        </div>
        <div className="flex-1 bg-black">
          <BlochSphere current={current} ghosts={ghosts} />
        </div>
      </div>
    </div>
  );
}
