'use client'

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

// --- LAVISH DATA STREAMS ---
function DataSilk() {
  const count = 30;
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [THREE.MathUtils.randFloatSpread(25), THREE.MathUtils.randFloatSpread(25), THREE.MathUtils.randFloatSpread(60)],
      speed: THREE.MathUtils.randFloat(0.05, 0.2),
      length: THREE.MathUtils.randFloat(5, 15)
    }));
  }, []);

  return (
    <group>
      {lines.map((line, i) => (
        <mesh key={i} position={line.position as any} onUpdate={(self) => {
          self.userData.speed = line.speed;
          self.userData.length = line.length;
        }}>
          <boxGeometry args={[0.01, 0.01, line.length]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={5} transparent opacity={0.3} />
        </mesh>
      ))}
      <DataSilkAnimator />
    </group>
  );
}

function DataSilkAnimator() {
  const { scene } = useThree();
  useFrame(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData.speed) {
        obj.position.z += obj.userData.speed;
        if (obj.position.z > 15) obj.position.z = -45;
      }
    });
  });
  return null;
}

// --- TECHNICAL GRID ---
function TechGrid() {
  return (
    <gridHelper args={[100, 50, "#00f0ff", "#001520"]} position={[0, -10, 0]} rotation={[Math.PI / 2.5, 0, 0]} />
  );
}

function SceneContent() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.12, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.12, 0.05);
    }
    if (coreRef.current) {
      coreRef.current.rotation.z = time * 0.1;
      coreRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Deep Space Background */}
      <mesh position={[0, 0, -25]}>
        <sphereGeometry args={[50, 64, 64]} />
        <MeshDistortMaterial
          color="#000205"
          speed={0.5}
          distort={0.4}
          radius={1}
          side={THREE.BackSide}
          emissive="#00050a"
          emissiveIntensity={2}
        />
      </mesh>

      <TechGrid />
      <DataSilk />

      {/* The Lavish Star */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={coreRef} position={[0, 0, -6]}>
          <icosahedronGeometry args={[2.2, 3]} />
          <MeshDistortMaterial 
            color="#00f0ff" 
            speed={4} 
            distort={0.4} 
            radius={1}
            emissive="#00f0ff"
            emissiveIntensity={3}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      <Sparkles count={80} scale={15} size={3} speed={0.4} color="#00f0ff" />
      <Stars radius={150} depth={50} count={8000} factor={4} saturation={0} fade speed={1.5} />
      
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={2.5} color="#00f0ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#3300ff" />
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
