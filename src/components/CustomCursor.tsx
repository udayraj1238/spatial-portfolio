'use client'
import { useEffect, useRef, useCallback } from 'react'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  // Use MutationObserver to keep interactive element listeners up-to-date
  const attachListeners = useCallback(() => {
    const onEnter = () => ringRef.current?.classList.add('expanded')
    const onLeave = () => ringRef.current?.classList.remove('expanded')

    const interactiveEls = document.querySelectorAll('button, a, input, [role="button"], .apex-chip')
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  useEffect(() => {
    let mouseX = 0, mouseY = 0
    let ringX = 0,  ringY = 0
    let animId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }
    }

    const animate = () => {
      // Ring follows with lag — Emil's inertia principle
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      }
      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    animId = requestAnimationFrame(animate)

    // Initial listener attachment
    const cleanupListeners = attachListeners()

    // Watch for DOM changes so new interactive elements get listeners
    const observer = new MutationObserver(() => {
      cleanupListeners()
      attachListeners()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
      cleanupListeners()
      observer.disconnect()
    }
  }, [attachListeners])

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        .cursor-dot {
          position: fixed; top: -4px; left: -4px;
          width: 8px; height: 8px;
          background: #00f0ff;
          border-radius: 50%;
          pointer-events: none; z-index: 99999;
          will-change: transform;
          transition: opacity 0.2s;
          box-shadow: 0 0 10px #00f0ff, 0 0 20px rgba(0,240,255,0.4);
        }
        .cursor-ring {
          position: fixed; top: -20px; left: -20px;
          width: 40px; height: 40px;
          border: 1px solid rgba(0,240,255,0.5);
          border-radius: 50%;
          pointer-events: none; z-index: 99998;
          will-change: transform;
          transition: width 0.25s cubic-bezier(0.22,1,0.36,1),
                      height 0.25s cubic-bezier(0.22,1,0.36,1),
                      top 0.25s cubic-bezier(0.22,1,0.36,1),
                      left 0.25s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.25s;
        }
        .cursor-ring.expanded {
          width: 64px; height: 64px;
          top: -32px; left: -32px;
          border-color: rgba(0,240,255,0.8);
          background: rgba(0,240,255,0.04);
        }
        @media (hover: none) {
          .cursor-dot, .cursor-ring { display: none; }
          * { cursor: auto !important; }
        }
      `}</style>
      <div className="cursor-dot"  ref={dotRef}  />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}
