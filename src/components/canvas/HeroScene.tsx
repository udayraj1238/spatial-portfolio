'use client'

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, PerspectiveCamera, Sparkles, Float as FloatDrei } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

function QuantumStreams() {
  const count = 40;
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [THREE.MathUtils.randFloatSpread(20), THREE.MathUtils.randFloatSpread(20), THREE.MathUtils.randFloatSpread(50)],
      speed: THREE.MathUtils.randFloat(0.1, 0.5),
      length: THREE.MathUtils.randFloat(2, 8)
    }));
  }, []);

  return (
    <group>
      {lines.map((line, i) => (
        <DataLine key={i} {...line} />
      ))}
    </group>
  );
}

function DataLine({ position, speed, length }: { position: any, speed: number, length: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.z += speed;
      if (ref.current.position.z > 10) ref.current.position.z = -40;
    }
  });

  return (
    <mesh position={position} ref={ref}>
      <boxGeometry args={[0.02, 0.02, length]} />
      <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={4} transparent opacity={0.6} />
    </mesh>
  );
}

function SceneContent() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.15, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.15, 0.05);
    }
    if (coreRef.current) {
      coreRef.current.rotation.z = time * 0.2;
      const pulse = 1 + Math.sin(time * 1.5) * 0.1;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Nebula */}
      <mesh position={[0, 0, -25]}>
        <sphereGeometry args={[50, 64, 64]} />
        <MeshDistortMaterial color="#000205" speed={0.5} distort={0.4} radius={1} side={THREE.BackSide} emissive="#000810" emissiveIntensity={2} />
      </mesh>

      {/* The Quantum Core */}
      <FloatDrei speed={3} rotationIntensity={2} floatIntensity={3}>
        <mesh ref={coreRef} position={[0, 0, -5]}>
          <icosahedronGeometry args={[2, 4]} />
          <MeshDistortMaterial color="#00f0ff" speed={5} distort={0.5} radius={1} emissive="#00f0ff" emissiveIntensity={3} transparent opacity={0.95} />
        </mesh>
      </FloatDrei>

      <Sparkles count={100} scale={10} size={2} speed={0.5} color="#00f0ff" />
      <QuantumStreams />
      <Stars radius={150} depth={50} count={10000} factor={4} saturation={0} fade speed={2} />
      
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#00f0ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#5500ff" />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#000', zIndex: -1 }}>
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={55} />
        <Suspense fallback={null}>
          <SceneContent />
          <fog attach="fog" args={['#000', 10, 60]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
