'use client'

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

function SceneContent() {
  const { mouse, viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const nebulaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Smooth Parallax Effect
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.1, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.05);
    }

    // Core Animation
    if (coreRef.current) {
      coreRef.current.rotation.z = time * 0.1;
      coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }

    // Nebula Flow
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Nebula Effect */}
      <mesh ref={nebulaRef} position={[0, 0, -20]}>
        <sphereGeometry args={[40, 64, 64]} />
        <MeshDistortMaterial
          color="#000810"
          speed={0.5}
          distort={0.3}
          radius={1}
          side={THREE.BackSide}
          emissive="#001520"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* The Digital Soul (Core) */}
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2}>
        <mesh ref={coreRef} position={[0, 0, -5]}>
          <icosahedronGeometry args={[1.8, 2]} />
          <MeshDistortMaterial 
            color="#00f0ff" 
            speed={4} 
            distort={0.45} 
            radius={1}
            emissive="#00f0ff"
            emissiveIntensity={2.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Synaptic Aura */}
      <mesh position={[0, 0, -5]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial 
          color="#00f0ff" 
          wireframe 
          transparent 
          opacity={0.08} 
          emissive="#00f0ff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Floating Particles (Stars) */}
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1.5} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 5]} intensity={2} color="#00f0ff" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#4400ff" />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#000205', zIndex: -1 }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        <Suspense fallback={null}>
          <SceneContent />
          <fog attach="fog" args={['#000205', 10, 50]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
