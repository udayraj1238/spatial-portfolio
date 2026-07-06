'use client'

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { EffectComposer, ChromaticAberration, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

// ─── Project Constellation ──────────────────────────────────────────────────
const PROJECTS = [
  { name: 'Adversarial ReID', pos: [3.2, 1.8, -2.1], color: '#ff4466' },
  { name: 'PaliGemma VLM',    pos: [-2.8, 2.4, -1.5], color: '#00f0ff' },
  { name: 'CourtSense-AI',    pos: [2.1, -2.6, -1.8], color: '#44ff88' },
  { name: 'Grid07',           pos: [-3.5, -1.2, -2.8], color: '#ff8844' },
  { name: 'Transformer',      pos: [0.8, 3.1, -3.2],  color: '#aa44ff' },
  { name: 'This Portfolio',   pos: [-1.4, -3.0, -1.9], color: '#ffdd00' },
];

function ProjectNode({ project, pulseSignal }: { project: any, pulseSignal: number }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const pulseTimer = useRef(0);

  useEffect(() => {
    if (pulseSignal > 0) {
      pulseTimer.current = 0.8; // 800ms
    }
  }, [pulseSignal]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      if (pulseTimer.current > 0) {
        pulseTimer.current -= delta;
        materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, 4, delta * 15);
      } else {
        materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, 1.5, delta * 5);
      }
    }
  });

  return (
    <mesh position={project.pos as [number, number, number]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={project.color}
        emissive={project.color}
        emissiveIntensity={1.5}
      />
    </mesh>
  );
}

function ProjectConstellation() {
  const [pulseEvents, setPulseEvents] = useState<Record<string, number>>({});

  useEffect(() => {
    let lastSeenContent = "";
    
    const handleMessageWrapper = (e: any) => {
      const text = e.detail || "";
      if (text.length < lastSeenContent.length) {
        lastSeenContent = "";
      }
      const newText = text.slice(lastSeenContent.length);
      lastSeenContent = text;
      
      let updated = false;
      const newEvents = { ...pulseEvents };
      
      PROJECTS.forEach(p => {
        if (newText.includes(p.name)) {
          newEvents[p.name] = Date.now();
          updated = true;
        }
      });
      
      if (updated) {
        setPulseEvents(newEvents);
      }
    };

    window.addEventListener('apex-message', handleMessageWrapper);
    return () => window.removeEventListener('apex-message', handleMessageWrapper);
  }, [pulseEvents]);

  const lineGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < PROJECTS.length; i++) {
      for (let j = i + 1; j < PROJECTS.length; j++) {
        points.push(new THREE.Vector3(...PROJECTS[i].pos));
        points.push(new THREE.Vector3(...PROJECTS[j].pos));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#00f0ff" transparent opacity={0.15} />
      </lineSegments>
      {PROJECTS.map((proj, i) => (
        <ProjectNode key={i} project={proj} pulseSignal={pulseEvents[proj.name] || 0} />
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

// ─── Hexagonal Tube Ring ────────────────────────────────────────────────────
function HexagonalTubeRing() {
  const ref = useRef<THREE.Mesh>(null);
  const radius = 11;

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const angle = (i % 6) * (Math.PI * 2) / 6;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 64, 0.025, 6, true);
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.z = t * 0.05;
      ref.current.rotation.x = Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial
        color="#00f0ff"
        emissive="#00f0ff"
        emissiveIntensity={2}
        transparent
        opacity={0.12}
      />
    </mesh>
  );
}

// ─── Orbiting Dots ──────────────────────────────────────────────────────────
interface OrbitingDotConfig {
  radius: number;
  tilt: number;
  speed: number;
  color: string;
}

function OrbitingDots() {
  const dot0 = useRef<THREE.Mesh>(null);
  const dot1 = useRef<THREE.Mesh>(null);
  const dot2 = useRef<THREE.Mesh>(null);

  const configs: OrbitingDotConfig[] = useMemo(() => [
    { radius: 5.5, tilt: 0.8,  speed: 0.6,  color: '#00f0ff' },
    { radius: 7.0, tilt: -0.5, speed: -0.45, color: '#0066ff' },
    { radius: 9.0, tilt: 1.2,  speed: 0.35,  color: '#00f0ff' },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const dots = [dot0.current, dot1.current, dot2.current];

    dots.forEach((dot, i) => {
      if (!dot) return;
      const cfg = configs[i];
      const angle = t * cfg.speed;

      // Position on the ring's local plane, then apply tilt rotation
      const localX = Math.cos(angle) * cfg.radius;
      const localY = Math.sin(angle) * cfg.radius;

      // Apply tilt (rotation around X axis)
      const cosT = Math.cos(cfg.tilt);
      const sinT = Math.sin(cfg.tilt);
      dot.position.x = localX;
      dot.position.y = localY * cosT;
      dot.position.z = localY * sinT;
    });
  });

  return (
    <group>
      {configs.map((cfg, i) => (
        <mesh
          key={i}
          ref={i === 0 ? dot0 : i === 1 ? dot1 : dot2}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={cfg.color}
            emissive={cfg.color}
            emissiveIntensity={8}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Custom GLSL Shaders for the Core Orb ───────────────────────────────────
const orbVertexShader = /* glsl */ `
uniform float u_time;
uniform float u_mouse_x;
uniform float u_mouse_y;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Simplex noise inline (no library needed)
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vNormal = normal;
  vPosition = position;
  
  // Organic breathing
  float noise = snoise(position * 0.8 + u_time * 0.18);
  float mouseInfluence = snoise(position + vec3(u_mouse_x, u_mouse_y, 0.0) * 0.5);
  
  vec3 displaced = position + normal * (noise * 0.22 + mouseInfluence * 0.08);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const orbFragmentShader = /* glsl */ `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Fresnel rim glow
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 3.0);
  
  // Iridescent color shift (cyan → blue → violet)
  vec3 colorA = vec3(0.0, 0.94, 1.0);   // #00f0ff
  vec3 colorB = vec3(0.0, 0.26, 1.0);   // #0043ff
  vec3 colorC = vec3(0.55, 0.0, 1.0);   // #8c00ff
  
  float t = sin(u_time * 0.4 + vUv.x * 3.14) * 0.5 + 0.5;
  float t2 = sin(u_time * 0.3 + vUv.y * 3.14) * 0.5 + 0.5;
  
  vec3 color = mix(mix(colorA, colorB, t), colorC, t2 * 0.4);
  color += fresnel * colorA * 0.8;  // bright rim glow
  
  gl_FragColor = vec4(color, 0.92);
}
`;

// ─── The Core Orb (Custom GLSL Iridescent Shader) ───────────────────────────
function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    u_time: { value: 0.0 },
    u_mouse_x: { value: 0.0 },
    u_mouse_y: { value: 0.0 },
  }), []);

  const { mouse } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.z = t * 0.12;
      ref.current.rotation.y = t * 0.08;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = t * -0.06;
      outerRef.current.rotation.x = t * 0.04;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = t;
      materialRef.current.uniforms.u_mouse_x.value = mouse.x;
      materialRef.current.uniforms.u_mouse_y.value = mouse.y;
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

        {/* Inner core — custom GLSL iridescent shader */}
        <mesh ref={ref}>
          <icosahedronGeometry args={[2.0, 4]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={orbVertexShader}
            fragmentShader={orbFragmentShader}
            uniforms={uniforms}
            transparent
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
  const groupRef = useRef<THREE.Group>(null);

  // Frame-rate independent lerp for spring-like camera easing
  useFrame((state, delta) => {
    if (groupRef.current) {
      const t = 1 - Math.pow(0.001, delta)  // frame-rate independent lerp
      groupRef.current.rotation.x += (state.mouse.y * 0.06 - groupRef.current.rotation.x) * t * 3.5
      groupRef.current.rotation.y += (state.mouse.x * 0.06 - groupRef.current.rotation.y) * t * 3.5
    }
  });

  return (
    <group ref={groupRef}>
      <TechGrid />
      <ProjectConstellation />

      {/* Core orb */}
      <CoreOrb />

      {/* Lighting */}
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#00f0ff" distance={20} />
      <pointLight position={[15, 10, 10]} intensity={2} color="#00c8ff" distance={30} />
      <pointLight position={[-15, -10, -10]} intensity={1.5} color="#3300ff" distance={30} />
      <pointLight position={[0, 15, -10]} intensity={1} color="#00f0ff" distance={25} />
      <pointLight position={[10, 12, 5]} intensity={1.2} color="#00f0ff" distance={25} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      background: 'transparent',
      zIndex: -1,
    }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={52} />
        <Suspense fallback={null}>
          <SceneContent />
          {/* Post-processing: Chromatic Aberration + Bloom (igloo.inc signature) */}
          <EffectComposer multisampling={0}>
            <ChromaticAberration
              offset={new THREE.Vector2(0.0003, 0.0003)}
              blendFunction={BlendFunction.NORMAL}
            />
            <Bloom
              intensity={0.15}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.025}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
