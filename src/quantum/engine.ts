import { complex, evaluate } from 'mathjs';
import { ComplexVector, GateCommand } from './types';
import { buildExecutable } from './gates';
import { normalize } from './complex';

export interface SimulationResult {
  history: ComplexVector[]; // includes initial state at index 0
}

export function computeHistory(initial: ComplexVector, commands: GateCommand[]): SimulationResult {
  let state = normalize(initial);
  const history: ComplexVector[] = [state];
  for (const cmd of commands) {
    const exec = buildExecutable(cmd, expr => evaluate(expr));
    state = exec.execute(state);
    history.push(state);
  }
  return { history };
}

export function defaultInitialState(): ComplexVector {
  return [complex(1,0), complex(0,0)];
}

export function blochVector([a,b]: ComplexVector) {
  // Bloch coordinates: x = 2 Re(a* b̄), y = 2 Im(a* b̄), z = |a|^2 - |b|^2
  const aConj = { re: a.re, im: -a.im };
  const prod = { re: aConj.re * b.re - aConj.im * b.im, im: aConj.re * b.im + aConj.im * b.re };
  const x = 2 * prod.re;
  const y = 2 * prod.im;
  const z = (a.re*a.re + a.im*a.im) - (b.re*b.re + b.im*b.im);
  return { x, y, z };
}
