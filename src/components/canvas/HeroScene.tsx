'use client'

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function DigitalCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
    if (outerRef.current) {
      outerRef.current.rotation.z = -time * 0.1;
      outerRef.current.rotation.y = -time * 0.15;
    }
  });

  return (
    <group position={[0, 0, -5]}>
      {/* Inner Core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.5, 1]} />
          <MeshDistortMaterial 
            color="#00f0ff" 
            speed={3} 
            distort={0.4} 
            radius={1}
            emissive="#00f0ff"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* Outer Wireframe / Shield */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={outerRef}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshStandardMaterial 
            color="#00f0ff" 
            wireframe 
            transparent 
            opacity={0.1} 
            emissive="#00f0ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      {/* Distant Glow Aura */}
      <Sphere args={[15, 32, 32]}>
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.02} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#00050a', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <DigitalCore />
          
          <fog attach="fog" args={['#00050a', 5, 20]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
