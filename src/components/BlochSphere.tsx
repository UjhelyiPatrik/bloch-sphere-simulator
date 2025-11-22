import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { blochVector } from '../quantum/engine';
import { ComplexVector } from '../quantum/types';
import * as THREE from 'three';

interface BlochSphereProps {
  current: ComplexVector;
  ghosts: ComplexVector[]; // previous states
}

interface ArrowProps { vec: {x:number;y:number;z:number}; color: string; opacity?: number }
const Arrow: React.FC<ArrowProps> = ({ vec, color, opacity=1 }) => {
  // Map Bloch coordinates to Three.js: x->x, z->y, -y->z (to correct for handedness/code inversion)
  const dir = new THREE.Vector3(vec.x, vec.z, -vec.y).normalize();
  const length = 1;
  const headLength = 0.15;
  const headWidth = 0.08;
  const origin = new THREE.Vector3(0,0,0);
  const arrowHelper = useMemo(() => new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth), [dir, color]);
  return <primitive object={arrowHelper} />;
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

      {/* Labels */}
      <Text position={[0,1.15,0]} fontSize={0.12}>|0⟩</Text>
      <Text position={[0,-1.2,0]} fontSize={0.12}>|1⟩</Text>
      <Text position={[1.15,0,0]} fontSize={0.12}>|+⟩</Text>
      <Text position={[-1.2,0,0]} fontSize={0.12}>|-⟩</Text>
      <Text position={[0,0,1.15]} fontSize={0.12}>|+i⟩</Text>
      <Text position={[0,0,-1.2]} fontSize={0.12}>|-i⟩</Text>

      {ghostVecs.map((v) => (
        <Arrow key={`${v.x.toFixed(3)}-${v.y.toFixed(3)}-${v.z.toFixed(3)}`} vec={v} color="#00b4ff" opacity={0.3} />
      ))}
      <Arrow vec={currentVec} color="#ff0000" />
      <OrbitControls />
    </Canvas>
  );
};
