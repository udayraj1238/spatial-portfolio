'use client'

import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollCamera() {
  const { camera } = useThree()
  const tl = useRef<gsap.core.Timeline>(null)

  useEffect(() => {
    // We create a timeline that is scrubbed by the scroll position
    tl.current = gsap.timeline({
      scrollTrigger: {
        trigger: '#dom-root',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrubbing
      }
    })

    // Define camera path
    // Initial position is [0, 0, 5]
    tl.current.to(camera.position, {
      z: -2,
      y: 0,
      x: 0,
      ease: 'power1.inOut'
    }, 0)

    tl.current.to(camera.rotation, {
      x: -Math.PI / 8,
      ease: 'power1.inOut'
    }, 0)

    return () => {
      if (tl.current) tl.current.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [camera])

  return null
}
