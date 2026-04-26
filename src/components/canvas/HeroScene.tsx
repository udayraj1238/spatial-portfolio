'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { r3f } from '@/helpers/tunnel'
import * as THREE from 'three'

function ParticleNetwork() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.05
      ref.current.rotation.x += delta * 0.02
    }
  })

  return (
    <group ref={ref}>
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </group>
  )
}

export default function HeroScene() {
  return (
    <r3f.In>
      <color attach="background" args={['#00050a']} />
      <ambientLight intensity={0.5} />
      <ParticleNetwork />
    </r3f.In>
  )
}
