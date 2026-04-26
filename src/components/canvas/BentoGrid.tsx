'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, MeshTransmissionMaterial, PositionalAudio } from '@react-three/drei'
import * as THREE from 'three'

interface BentoTileProps {
  position: [number, number, number]
  title: string
  color: string
}

function BentoTile({ position, title, color }: BentoTileProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const audioRef = useRef<THREE.PositionalAudio>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth scaling on hover
      const targetScale = hovered ? 1.1 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={(e) => { 
          e.stopPropagation()
          setHovered(true)
          if (audioRef.current && !audioRef.current.isPlaying) {
             audioRef.current.setVolume(0.5)
             audioRef.current.play()
          }
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2, 2, 0.2]} />
        <MeshTransmissionMaterial 
          backside 
          thickness={0.5} 
          roughness={0.2} 
          transmission={1} 
          ior={1.5} 
          chromaticAberration={0.1} 
          color={color} 
        />
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
        <PositionalAudio ref={audioRef} url="/hover.wav" distance={3} loop={false} autoplay={false} />
      </mesh>
    </Float>
  )
}

export default function BentoGrid() {
  const projects = [
    { title: 'Adversarial AI', position: [-2.5, 1.5, 0] as [number, number, number], color: '#ff4081' },
    { title: 'Multimodal LLMs', position: [0, 1.5, 0] as [number, number, number], color: '#00e5ff' },
    { title: 'GDG ML Lead', position: [2.5, 1.5, 0] as [number, number, number], color: '#76ff03' },
    { title: 'CV Lead', position: [-1.25, -1.5, 0] as [number, number, number], color: '#ea80fc' },
    { title: 'Top 20 Shell.ai', position: [1.25, -1.5, 0] as [number, number, number], color: '#ffd740' },
  ]

  return (
    <group position={[0, 0, -5]}>
      {projects.map((proj, idx) => (
        <BentoTile key={idx} {...proj} />
      ))}
    </group>
  )
}
