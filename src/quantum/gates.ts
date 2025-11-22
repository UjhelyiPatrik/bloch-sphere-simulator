import { complex, Complex, multiply, sin, cos, exp } from 'mathjs';
import { ComplexVector, GateType, ExecutableGate, GateCommand } from './types';
import { normalize } from './complex';

function matMul(m: Complex[][], v: ComplexVector): ComplexVector {
  const [a, b] = v;
  return [
    addComplex(multiply(m[0][0], a) as Complex, multiply(m[0][1], b) as Complex),
    addComplex(multiply(m[1][0], a) as Complex, multiply(m[1][1], b) as Complex)
  ];
}

function addComplex(a: Complex, b: Complex): Complex { return complex(a.re + b.re, a.im + b.im); }

const I = complex(0, 1);

// Fixed gate matrices
const GATES: Record<Exclude<GateType, 'Rx' | 'Ry' | 'Rz' | 'Phase'>, Complex[][]> = {
  X: [ [complex(0,0), complex(1,0)], [complex(1,0), complex(0,0)] ],
  Y: [ [complex(0,0), complex(0,-1)], [complex(0,1), complex(0,0)] ],
  Z: [ [complex(1,0), complex(0,0)], [complex(0,0), complex(-1,0)] ],
  H: [ [complex(1/Math.sqrt(2),0), complex(1/Math.sqrt(2),0)], [complex(1/Math.sqrt(2),0), complex(-1/Math.sqrt(2),0)] ],
  S: [ [complex(1,0), complex(0,0)], [complex(0,0), complex(0,1)] ], // phase pi/2
  T: [ [complex(1,0), complex(0,0)], [complex(0,0), exp(complex(0, Math.PI/4)) as Complex] ]
};

function rotationMatrixX(theta: number): Complex[][] {
  const c = cos(theta/2) as number; const s = sin(theta/2) as number;
  return [
    [complex(c,0), multiply(complex(0,-1), complex(s,0)) as Complex],
    [multiply(complex(0,-1), complex(s,0)) as Complex, complex(c,0)]
  ];
}
function rotationMatrixY(theta: number): Complex[][] {
  const c = cos(theta/2) as number; const s = sin(theta/2) as number;
  return [ [complex(c,0), complex(-s,0)], [complex(s,0), complex(c,0)] ];
}
function rotationMatrixZ(theta: number): Complex[][] {
  return [ [exp(complex(0,-theta/2)) as Complex, complex(0,0)], [complex(0,0), exp(complex(0,theta/2)) as Complex] ];
}
function phaseMatrix(phi: number): Complex[][] {
  return [ [complex(1,0), complex(0,0)], [complex(0,0), exp(complex(0,phi)) as Complex] ];
}

export function buildExecutable(g: GateCommand, evaluate: (expr: string) => number): ExecutableGate {
  let execute: (state: ComplexVector) => ComplexVector;
  if (g.type in GATES) {
    const mat = GATES[g.type as keyof typeof GATES];
    execute = (state) => normalize(matMul(mat, state));
  } else {
    // param gates
    const angleExpr = g.params ?? '0';
    let angle: number;
    try { angle = evaluate(angleExpr); } catch { angle = 0; }
    if (g.type === 'Rx') {
      const mat = rotationMatrixX(angle);
      execute = (s) => normalize(matMul(mat, s));
    } else if (g.type === 'Ry') {
      const mat = rotationMatrixY(angle);
      execute = (s) => normalize(matMul(mat, s));
    } else if (g.type === 'Rz') {
      const mat = rotationMatrixZ(angle);
      execute = (s) => normalize(matMul(mat, s));
    } else if (g.type === 'Phase') {
      const mat = phaseMatrix(angle);
      execute = (s) => normalize(matMul(mat, s));
    } else {
      execute = (s) => s;
    }
  }
  return { ...g, execute };
}
