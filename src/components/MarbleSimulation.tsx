'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MARBLE_RADIUS, type JarDimensions } from './marbleLayout';

type Body = {
  id: number;
  color: THREE.Color;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  spin: THREE.Vector3;
};

interface MarbleSimulationProps {
  marbles: number[];
  jarDimensions: JarDimensions;
}

const GRAVITY = -6.8;
const FLOOR_RESTITUTION = 0.1;
const WALL_RESTITUTION = 0.18;
const MARBLE_RESTITUTION = 0.08;
const AIR_DAMPING = 0.992;
const CONTACT_DAMPING = 0.72;
const MAX_DELTA = 1 / 30;

const getMarbleHue = (id: number) => ((id * 0.61803398875) % 1);
const getNoise = (id: number, seed: number) => {
  const value = Math.sin((id + 1) * seed) * 10000;

  return value - Math.floor(value);
};

function createMarbleTexture(id: number, color: THREE.Color) {
  const canvas = document.createElement('canvas');
  const size = 64;
  const center = size / 2;
  const context = canvas.getContext('2d');

  canvas.width = size;
  canvas.height = size;

  if (!context) {
    return null;
  }

  const base = `#${color.getHexString()}`;
  const light = `#${color.clone().lerp(new THREE.Color('#ffffff'), 0.42).getHexString()}`;
  const dark = `#${color.clone().lerp(new THREE.Color('#050816'), 0.42).getHexString()}`;
  const background = context.createRadialGradient(
    center * 0.7,
    center * 0.65,
    3,
    center,
    center,
    center
  );

  background.addColorStop(0, light);
  background.addColorStop(0.42, base);
  background.addColorStop(1, dark);
  context.fillStyle = background;
  context.fillRect(0, 0, size, size);

  for (let i = 0; i < 7; i += 1) {
    const y = size * (0.18 + getNoise(id, 18.7 + i) * 0.64);
    const offset = (getNoise(id, 31.3 + i) - 0.5) * 18;

    context.beginPath();
    context.moveTo(-8, y);
    context.bezierCurveTo(
      size * 0.25,
      y - 16 + offset,
      size * 0.65,
      y + 16 - offset,
      size + 8,
      y + offset * 0.35
    );
    context.strokeStyle = i % 2 === 0
      ? 'rgba(255,255,255,0.22)'
      : 'rgba(5,8,22,0.18)';
    context.lineWidth = 2 + getNoise(id, 44.1 + i) * 4;
    context.stroke();
  }

  context.fillStyle = 'rgba(255,255,255,0.22)';
  context.beginPath();
  context.ellipse(size * 0.34, size * 0.28, 7, 4, -0.6, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.rotation = getNoise(id, 55.5) * Math.PI * 2;

  return texture;
}

function createBody(id: number, index: number, jarDimensions: JarDimensions): Body {
  const spawnSpread = Math.min(jarDimensions.width, jarDimensions.depth) * 0.22;

  return {
    id,
    color: new THREE.Color().setHSL(getMarbleHue(id), 0.7, 0.5),
    position: new THREE.Vector3(
      (getNoise(id, 12.9898) - 0.5) * spawnSpread,
      jarDimensions.height / 2 + 0.55 + index * 0.018,
      (getNoise(id, 78.233) - 0.5) * spawnSpread
    ),
    velocity: new THREE.Vector3(
      (getNoise(id, 4.17) - 0.5) * 0.35,
      -0.35,
      (getNoise(id, 9.91) - 0.5) * 0.35
    ),
    rotation: new THREE.Euler(
      getNoise(id, 2.31) * Math.PI,
      getNoise(id, 5.73) * Math.PI,
      getNoise(id, 8.19) * Math.PI
    ),
    spin: new THREE.Vector3(
      (getNoise(id, 11.11) - 0.5) * 2.5,
      (getNoise(id, 13.13) - 0.5) * 2.5,
      (getNoise(id, 17.17) - 0.5) * 2.5
    ),
  };
}

function clampToJar(body: Body, dimensions: JarDimensions) {
  const minX = -dimensions.width / 2 + MARBLE_RADIUS;
  const maxX = dimensions.width / 2 - MARBLE_RADIUS;
  const minY = -dimensions.height / 2 + MARBLE_RADIUS;
  const maxY = dimensions.height / 2 - MARBLE_RADIUS;
  const minZ = -dimensions.depth / 2 + MARBLE_RADIUS;
  const maxZ = dimensions.depth / 2 - MARBLE_RADIUS;

  if (body.position.x < minX) {
    body.position.x = minX;
    body.velocity.x = Math.abs(body.velocity.x) * WALL_RESTITUTION;
  } else if (body.position.x > maxX) {
    body.position.x = maxX;
    body.velocity.x = -Math.abs(body.velocity.x) * WALL_RESTITUTION;
  }

  if (body.position.y < minY) {
    body.position.y = minY;
    body.velocity.y = Math.abs(body.velocity.y) * FLOOR_RESTITUTION;
    body.velocity.x *= CONTACT_DAMPING;
    body.velocity.z *= CONTACT_DAMPING;
  } else if (body.position.y > maxY) {
    body.position.y = maxY;
    body.velocity.y = -Math.abs(body.velocity.y) * WALL_RESTITUTION;
  }

  if (body.position.z < minZ) {
    body.position.z = minZ;
    body.velocity.z = Math.abs(body.velocity.z) * WALL_RESTITUTION;
  } else if (body.position.z > maxZ) {
    body.position.z = maxZ;
    body.velocity.z = -Math.abs(body.velocity.z) * WALL_RESTITUTION;
  }
}

function resolveCollision(a: Body, b: Body) {
  const delta = b.position.clone().sub(a.position);
  let distance = delta.length();
  const minDistance = MARBLE_RADIUS * 2;

  if (distance >= minDistance) {
    return;
  }

  if (distance < 0.0001) {
    delta.set(0.001, 0, 0);
    distance = 0.001;
  }

  const normal = delta.multiplyScalar(1 / distance);
  const overlap = minDistance - distance;
  a.position.addScaledVector(normal, -overlap * 0.5);
  b.position.addScaledVector(normal, overlap * 0.5);

  const relativeVelocity = b.velocity.clone().sub(a.velocity);
  const separatingSpeed = relativeVelocity.dot(normal);

  if (separatingSpeed < 0) {
    const impulse = (-(1 + MARBLE_RESTITUTION) * separatingSpeed) / 2;
    a.velocity.addScaledVector(normal, -impulse);
    b.velocity.addScaledVector(normal, impulse);
  }

  a.velocity.multiplyScalar(0.985);
  b.velocity.multiplyScalar(0.985);
}

export default function MarbleSimulation({ marbles, jarDimensions }: MarbleSimulationProps) {
  const bodiesRef = useRef<Body[]>([]);
  const meshRefs = useRef(new Map<number, THREE.Mesh>());
  const marbleSet = useMemo(() => new Set(marbles), [marbles]);
  const textures = useMemo(() => {
    const textureMap = new Map<number, THREE.CanvasTexture | null>();

    marbles.forEach((id) => {
      const color = new THREE.Color().setHSL(getMarbleHue(id), 0.7, 0.5);

      textureMap.set(id, createMarbleTexture(id, color));
    });

    return textureMap;
  }, [marbles]);

  useEffect(() => {
    const bodies = bodiesRef.current.filter((body) => marbleSet.has(body.id));
    const existingIds = new Set(bodies.map((body) => body.id));

    marbles.forEach((id, index) => {
      if (!existingIds.has(id)) {
        bodies.push(createBody(id, index, jarDimensions));
      }
    });

    bodiesRef.current = bodies;
  }, [jarDimensions, marbleSet, marbles]);

  useFrame((_, frameDelta) => {
    const bodies = bodiesRef.current;
    const delta = Math.min(frameDelta, MAX_DELTA);

    bodies.forEach((body) => {
      body.velocity.y += GRAVITY * delta;
      body.velocity.multiplyScalar(AIR_DAMPING);
      body.position.addScaledVector(body.velocity, delta);
      clampToJar(body, jarDimensions);
    });

    for (let pass = 0; pass < 3; pass += 1) {
      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          resolveCollision(bodies[i], bodies[j]);
        }
      }

      bodies.forEach((body) => clampToJar(body, jarDimensions));
    }

    bodies.forEach((body) => {
      const mesh = meshRefs.current.get(body.id);

      body.rotation.x += body.spin.x * delta;
      body.rotation.y += body.spin.y * delta;
      body.rotation.z += body.spin.z * delta;
      body.spin.multiplyScalar(0.995);

      if (mesh) {
        mesh.position.copy(body.position);
        mesh.rotation.copy(body.rotation);
      }
    });
  });

  return (
    <>
      {marbles.map((id) => {
        const color = new THREE.Color().setHSL(getMarbleHue(id), 0.7, 0.5);
        const texture = textures.get(id);

        return (
          <mesh
            key={id}
            ref={(mesh) => {
              if (mesh) {
                meshRefs.current.set(id, mesh);
              } else {
                meshRefs.current.delete(id);
              }
            }}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[MARBLE_RADIUS, 32, 32]} />
            <meshStandardMaterial
              color={color}
              map={texture}
              metalness={0.35}
              roughness={0.16}
              emissive={color}
              emissiveIntensity={0.05}
            />
          </mesh>
        );
      })}
    </>
  );
}
