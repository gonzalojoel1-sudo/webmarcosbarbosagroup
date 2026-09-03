"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react"

const steps = [
  {
    n: "01",
    title: "Diagnóstico",
    desc: "Radiografía 360° del negocio, equipo y números. Dónde estás y qué te frena.",
  },
  {
    n: "02",
    title: "Análisis",
    desc: "Detectamos causas raíz, cuellos de botella y oportunidades de mayor palanca.",
  },
  {
    n: "03",
    title: "Estrategia",
    desc: "Plan claro, prioridades y métricas. Sin humo: decisiones con impacto directo.",
  },
  {
    n: "04",
    title: "Implementación",
    desc: "Acompañamos la ejecución en campo. Procesos, liderazgo y tech en marcha.",
  },
  {
    n: "05",
    title: "Seguimiento",
    desc: "Tableros, rituales semanales y ajustes. Lo que no se mide, no mejora.",
  },
  {
    n: "06",
    title: "Escalamiento",
    desc: "Gobierno y escala. La empresa opera sin vos y crece con sistemas.",
  },
] as const

export function MethodologyPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const progress = useMotionValue(0)
  const scaleX = useSpring(progress, { stiffness: 150, damping: 30, mass: 0.4 })

  function onCarouselScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const max = el.scrollWidth - el.clientWidth
    progress.set(max > 0 ? el.scrollLeft / max : 0)
  }

  function scrollBy(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    const amount = Math.min(360, el.clientWidth * 0.85)
    el.scrollBy({ left: dir * amount, behavior: "smooth" })
  }

  return (
    <section className="bg-paper py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between gap-6 mb-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight leading-none text-foreground">
            Un camino probado.
            <br />
            <span className="text-primary">Sin improvisación.</span>
          </h2>
          <div className="hidden md:flex items-center gap-2 shrink-0 pt-2">
            <button
              aria-label="Anterior"
              onClick={() => scrollBy(-1)}
              className="w-10 h-10 rounded-full border border-line bg-surface flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => scrollBy(1)}
              className="w-10 h-10 rounded-full bg-primary text-primary-fg flex items-center justify-center hover:bg-primary-hover transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={ref}
          onScroll={onCarouselScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 md:mx-0 md:px-0 scroll-snap-x"
        >
          {steps.map((s) => (
            <div
              key={s.n}
              className="snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[31%] bg-surface border border-line rounded-xl p-6 flex flex-col min-h-[230px] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-foreground/10 transition-all duration-300 ease-out-expo select-none"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-display text-6xl md:text-7xl leading-[0.85] text-primary tracking-tight">
                  {s.n}
                </span>
                <span className="w-2 h-2 rounded-full bg-primary mt-2" aria-hidden />
              </div>
              <div className="h-px w-full bg-primary/15 mb-4" aria-hidden />
              <h3 className="font-display text-xl leading-none text-foreground">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed mt-2">{s.desc}</p>
              <p className="mt-auto pt-4 text-xs tracking-widest text-muted">{s.n} / 06</p>
            </div>
          ))}
        </div>

        {/* progress line #fe4100 */}
        <div className="mt-4 h-0.5 w-full max-w-[240px] bg-line rounded-full overflow-hidden" aria-hidden>
          <motion.div className="h-full w-full bg-primary origin-left" style={{ scaleX }} />
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="flex md:hidden items-center gap-2">
            <button
              aria-label="Anterior"
              onClick={() => scrollBy(-1)}
              className="w-10 h-10 rounded-full border border-line bg-surface flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => scrollBy(1)}
              className="w-10 h-10 rounded-full bg-primary text-primary-fg flex items-center justify-center hover:bg-primary-hover transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <Link
            href="/metodologia"
            className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover underline-offset-4 hover:underline transition-colors"
          >
            Ver metodología completa <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
