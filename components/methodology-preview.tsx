"use client"

import { useRef } from "react"
import Link from "next/link"
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

  function scrollBy(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    const amount = Math.min(360, el.clientWidth * 0.85)
    el.scrollBy({ left: dir * amount, behavior: "smooth" })
  }

  return (
    <section className="bg-paper py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted">METODOLOGÍA 01 — 06</p>
            <h2 className="font-display text-3xl md:text-4xl leading-none mt-2 text-ink">
              Un camino probado.
              <br />
              <span className="text-primary">Sin improvisación.</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0 pt-2">
            <button
              aria-label="Anterior"
              onClick={() => scrollBy(-1)}
              className="w-10 h-10 rounded-full border border-line bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => scrollBy(1)}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 text-xs text-muted">
          <span className="hidden md:inline">Deslizá o arrastrá</span>
          <span className="h-px flex-1 bg-line max-w-[240px]" aria-hidden />
          <span className="tracking-widest">DRAG →</span>
        </div>

        {/* Carousel */}
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line"
          style={{ scrollbarWidth: "thin" }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              className="snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[31%] bg-white border border-line rounded-xl p-6 flex flex-col min-h-[220px] hover:shadow-md hover:border-ink/10 transition-all select-none"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="font-display text-5xl leading-none text-primary tracking-tight">{s.n}</span>
                <span className="w-2 h-2 rounded-full bg-primary mt-3" aria-hidden />
              </div>
              <div className="h-px w-full bg-primary/15 mb-4" aria-hidden />
              <h3 className="font-display text-xl leading-none text-ink">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed mt-2">{s.desc}</p>
              <p className="mt-auto pt-4 text-xs tracking-widest text-muted">{s.n} / 06</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="flex md:hidden items-center gap-2">
            <button
              aria-label="Anterior"
              onClick={() => scrollBy(-1)}
              className="w-10 h-10 rounded-full border border-line bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => scrollBy(1)}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <Link
            href="/metodologia"
            className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Ver metodología completa <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
