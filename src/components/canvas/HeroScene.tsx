'use client'

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function SceneContent() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Gentle mouse parallax
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.1, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.05);
    }

    // Glowing Core animation
    if (coreRef.current) {
      coreRef.current.rotation.z = time * 0.15;
      const pulse = 1 + Math.sin(time * 1.5) * 0.05;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Nebula */}
      <mesh position={[0, 0, -20]}>
        <sphereGeometry args={[45, 64, 64]} />
        <MeshDistortMaterial
          color="#00050a"
          speed={0.4}
          distort={0.3}
          radius={1}
          side={THREE.BackSide}
          emissive="#000810"
          emissiveIntensity={1}
        />
      </mesh>

      {/* The Glowing Star (Core) */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={coreRef} position={[0, 0, -6]}>
          <icosahedronGeometry args={[2, 2]} />
          <MeshDistortMaterial 
            color="#00f0ff" 
            speed={3} 
            distort={0.3} 
            radius={1}
            emissive="#00f0ff"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* Subtle Star Particles */}
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.2} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4400ff" />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#000', zIndex: -1 }}>
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <Suspense fallback={null}>
          <SceneContent />
          <fog attach="fog" args={['#000', 10, 50]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
