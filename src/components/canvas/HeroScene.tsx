'use client'

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

// ─── Floating Data Streams ─────────────────────────────────────────────────
function DataStream() {
  const count = 40;
  const meshes = useRef<THREE.Mesh[]>([]);

  const data = useMemo(() =>
    Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(30),
        THREE.MathUtils.randFloatSpread(30),
        THREE.MathUtils.randFloatSpread(80)
      ),
      speed: THREE.MathUtils.randFloat(0.04, 0.18),
      length: THREE.MathUtils.randFloat(4, 18),
      opacity: THREE.MathUtils.randFloat(0.15, 0.5),
    })), []
  );

  useFrame(() => {
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.z += data[i].speed;
      if (mesh.position.z > 20) {
        mesh.position.z = -60;
        mesh.position.x = THREE.MathUtils.randFloatSpread(30);
        mesh.position.y = THREE.MathUtils.randFloatSpread(30);
      }
    });
  });

  return (
    <group>
      {data.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) meshes.current[i] = el }}
          position={d.position}
        >
          <boxGeometry args={[0.008, 0.008, d.length]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={6}
            transparent
            opacity={d.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Orbital Rings ──────────────────────────────────────────────────────────
function OrbitalRing({ radius, tilt, speed, color }: {
  radius: number; tilt: number; speed: number; color: string
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * speed;
    }
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[radius, 0.015, 8, 128]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

// ─── The Core Orb ───────────────────────────────────────────────────────────
function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.z = t * 0.12;
      ref.current.rotation.y = t * 0.08;
      ref.current.scale.setScalar(1 + Math.sin(t * 1.8) * 0.04);
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = t * -0.06;
      outerRef.current.rotation.x = t * 0.04;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={2.5}>
      <group position={[0, 0, -5]}>
        {/* Outer shell — wireframe-style */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[3.2, 1]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#0040ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.06}
            wireframe
          />
        </mesh>

        {/* Inner core — distorted */}
        <mesh ref={ref}>
          <icosahedronGeometry args={[2.0, 4]} />
          <MeshDistortMaterial
            color="#00c8ff"
            speed={5}
            distort={0.35}
            radius={1}
            emissive="#00f0ff"
            emissiveIntensity={3}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Glow layer */}
        <mesh>
          <sphereGeometry args={[2.6, 32, 32]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.04}
          />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Tech Grid ──────────────────────────────────────────────────────────────
function TechGrid() {
  const ref = useRef<THREE.GridHelper>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.z = (clock.getElapsedTime() * 0.3) % 2;
    }
  });

  return (
    <gridHelper
      ref={ref}
      args={[120, 60, '#002030', '#001520']}
      position={[0, -10, 0]}
      rotation={[Math.PI / 2.2, 0, 0]}
    />
  );
}

// ─── Mouse-reactive Group ───────────────────────────────────────────────────
function SceneContent() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.1, 0.04);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.04);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Deep space sphere */}
      <mesh position={[0, 0, -30]}>
        <sphereGeometry args={[60, 64, 64]} />
        <MeshDistortMaterial
          color="#000208"
          speed={0.3}
          distort={0.3}
          radius={1}
          side={THREE.BackSide}
          emissive="#00050f"
          emissiveIntensity={1.5}
        />
      </mesh>

      <TechGrid />
      <DataStream />

      {/* Orbital rings */}
      <OrbitalRing radius={5.5} tilt={0.8}  speed={0.15}  color="#00f0ff" />
      <OrbitalRing radius={7.0} tilt={-0.5} speed={-0.1}  color="#0066ff" />
      <OrbitalRing radius={9.0} tilt={1.2}  speed={0.08}  color="#00f0ff" />

      {/* Core orb */}
      <CoreOrb />

      {/* Particles */}
      <Sparkles count={120} scale={18} size={2.5} speed={0.3} color="#00f0ff" opacity={0.7} />
      <Stars radius={200} depth={60} count={10000} factor={4} saturation={0} fade speed={1} />

      {/* Lighting */}
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#00f0ff" distance={20} />
      <pointLight position={[15, 10, 10]} intensity={2} color="#00c8ff" distance={30} />
      <pointLight position={[-15, -10, -10]} intensity={1.5} color="#3300ff" distance={30} />
      <pointLight position={[0, 15, -10]} intensity={1} color="#00f0ff" distance={25} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 50% 50%, #000510 0%, #000208 100%)',
      zIndex: -1,
    }}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={52} />
        <Suspense fallback={null}>
          <SceneContent />
          <fog attach="fog" args={['#000208', 15, 70]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
