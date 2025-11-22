import { complex, abs, add, multiply, Complex } from 'mathjs';
import { ComplexVector } from './types';

export function normalize([a, b]: ComplexVector): ComplexVector {
  const mag = Math.hypot(abs(a), abs(b));
  if (mag === 0) return [complex(1, 0), complex(0, 0)];
  return [divideComplex(a, mag), divideComplex(b, mag)];
}

function divideComplex(c: Complex, denom: number): Complex {
  return complex(c.re / denom, c.im / denom);
}

export function toSpherical([alpha, beta]: ComplexVector) {
  // |psi> = cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>
  const aMag = abs(alpha);
  const theta = 2 * Math.acos(aMag); // from cos(theta/2) = |alpha|
  // phase of beta relative to alpha
  const phi = Math.atan2(beta.im, beta.re) - Math.atan2(alpha.im, alpha.re);
  return { theta, phi };
}

export function addComplex(a: Complex, b: Complex): Complex { return add(a, b) as Complex; }
export function mulComplex(a: Complex, b: Complex): Complex { return multiply(a, b) as Complex; }
