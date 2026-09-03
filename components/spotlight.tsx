"use client"

import { useEffect, useRef } from "react"

/**
 * Spotlight global: glow radial naranja de 420px que sigue al cursor.
 * Un solo listener con rAF; respeta prefers-reduced-motion y pointer fino.
 */
export function SpotlightLayer() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!window.matchMedia("(pointer: fine)").matches) return

    let raf = 0
    let x = -600
    let y = -600

    const paint = () => {
      el.style.setProperty("--sx", `${x}px`)
      el.style.setProperty("--sy", `${y}px`)
      el.style.opacity = "1"
      raf = 0
    }

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(paint)
    }

    const onLeave = () => {
      el.style.opacity = "0"
    }

    window.addEventListener("mousemove", onMove)
    document.documentElement.addEventListener("mouseleave", onLeave)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.documentElement.removeEventListener("mouseleave", onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="spotlight-layer pointer-events-none fixed inset-0 hidden md:block"
    />
  )
}
