'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Jar from './Jar';
import MarbleSimulation from './MarbleSimulation';
import { getJarDimensions } from './marbleLayout';

interface SceneProps {
  marbles: number[];
  maxCapacity: number;
}

export default function Scene({ marbles, maxCapacity }: SceneProps) {
  const jarDimensions = useMemo(() => getJarDimensions(maxCapacity), [maxCapacity]);
  const largestDimension = Math.max(
    jarDimensions.width,
    jarDimensions.height,
    jarDimensions.depth
  );
  const cameraDistance = Math.max(2.1, largestDimension * 2.35);

  return (
    <Canvas
      camera={{ position: [0, jarDimensions.height * 0.3, cameraDistance], fov: 55 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#0a0e27']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} />

      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate={false}
      />

      <Jar dimensions={jarDimensions} />

      <MarbleSimulation marbles={marbles} jarDimensions={jarDimensions} />
    </Canvas>
  );
}
