import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line, Billboard } from '@react-three/drei';
import { blochVector } from '../quantum/engine';
import { ComplexVector } from '../quantum/types';
import { formatComplex } from '../utils';
import * as THREE from 'three';

const formatLabel = (index: number, state: ComplexVector) => {
  return `${index}. [${formatComplex(state[0])}; ${formatComplex(state[1])}]`;
};

interface BlochSphereProps {
  current: ComplexVector;
  ghosts: ComplexVector[]; // previous states
}

interface ArrowProps { vec: {x:number;y:number;z:number}; color: string; opacity?: number; label?: string | number }
const Arrow: React.FC<ArrowProps> = ({ vec, color, opacity=1, label }) => {
  // Map Bloch coordinates to Three.js: x->x, z->y, -y->z (to correct for handedness/code inversion)
  const dir = new THREE.Vector3(vec.x, vec.z, -vec.y).normalize();
  const length = 1;
  const headLength = 0.15;
  const headWidth = 0.08;
  const origin = new THREE.Vector3(0,0,0);
  const arrowHelper = useMemo(() => new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth), [dir, color]);
  
  return (
    <group>
      <primitive object={arrowHelper} />
      {label !== undefined && (
        <Billboard position={dir.clone().multiplyScalar(1.1)}>
          <Text fontSize={0.1} color={color} outlineWidth={0.01} outlineColor="black">
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

export const BlochSphere: React.FC<BlochSphereProps> = ({ current, ghosts }) => {
  const currentVec = useMemo(() => blochVector(current), [current]);
  const ghostVecs = useMemo(() => ghosts.map(g => blochVector(g)), [ghosts]);
  return (
    <Canvas camera={{ position: [2,2,2], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5,5,5]} />
      <mesh>
        <sphereGeometry args={[1, 24, 24,]} />
        <meshPhongMaterial color="#ffffff" transparent opacity={0.3} wireframe />
      </mesh>
      {/* Axes using Line helper */}
      <Line points={[[0,-1,0],[0,1,0]]} color="white" lineWidth={1} />
      <Line points={[[-1,0,0],[1,0,0]]} color="white" lineWidth={1} />
      <Line points={[[0,0,-1],[0,0,1]]} color="white" lineWidth={1} />

      {/* Labels - moved further out to avoid overlap with vector indices */}
      <Billboard position={[0,1.4,0]}><Text fontSize={0.12}>|0⟩</Text></Billboard>
      <Billboard position={[0,-1.4,0]}><Text fontSize={0.12}>|1⟩</Text></Billboard>
      <Billboard position={[1.4,0,0]}><Text fontSize={0.12}>|+⟩</Text></Billboard>
      <Billboard position={[-1.4,0,0]}><Text fontSize={0.12}>|-⟩</Text></Billboard>
      <Billboard position={[0,0,1.4]}><Text fontSize={0.12}>|-i⟩</Text></Billboard>
      <Billboard position={[0,0,-1.4]}><Text fontSize={0.12}>|+i⟩</Text></Billboard>

      {ghostVecs.map((v, i) => (
        <Arrow key={`${i}-${v.x.toFixed(3)}-${v.y.toFixed(3)}-${v.z.toFixed(3)}`} vec={v} color="#00b4ff" opacity={0.3} label={formatLabel(i, ghosts[i])} />
      ))}
      <Arrow vec={currentVec} color="#ff0000" label={formatLabel(ghostVecs.length, current)} />
      <OrbitControls />
    </Canvas>
  );
};
