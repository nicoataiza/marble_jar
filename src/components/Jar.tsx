'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import type { JarDimensions } from './marbleLayout';

interface JarProps {
  dimensions: JarDimensions;
}

export default function Jar({ dimensions }: JarProps) {
  const jarRef = useRef<THREE.Group>(null);
  const { width, height, depth } = dimensions;

  return (
    <group ref={jarRef} position={[0, 0, 0]}>
      {/* Visible jar geometry - translucent glass box */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#4dd0e1"
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#a5f3fc" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}
