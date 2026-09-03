"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, CheckCircle2 } from "lucide-react"

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
  const reduce = useReducedMotion()

  return (
    <section className="relative bg-surface border-t border-hairline py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-fg leading-tight">
            Un camino probado.
            <br />
            <span className="italic text-primary">Sin improvisación.</span>
          </h2>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {steps.map((s) => (
            <div key={s.n} className="card-luxury rounded-2xl p-7 flex flex-col min-h-[210px]">
              <span className="font-mono text-4xl leading-none text-primary">{s.n}</span>
              <h3 className="mt-5 font-display text-xl tracking-tight text-fg">{s.title}</h3>
              <p className="mt-2 text-fg-muted text-sm leading-relaxed">{s.desc}</p>
              <p className="mt-auto pt-4 text-[11px] font-mono text-fg-muted border-t border-hairline flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" aria-hidden />
                {s.n} / 06
              </p>
            </div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Link
            href="/metodologia"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover underline-offset-4 hover:underline transition-colors"
          >
            Ver metodología completa <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
