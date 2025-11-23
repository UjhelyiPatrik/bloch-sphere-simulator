import { Complex } from 'mathjs';

export type ComplexVector = [Complex, Complex];

export type GateType = 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'Phase' | 'Rx' | 'Ry' | 'Rz';

export interface GateCommand {
  id: string;
  type: GateType;
  params?: string; // expression string (angle etc.)
}

export interface ExecutableGate extends GateCommand {
  execute: (state: ComplexVector) => ComplexVector;
}
