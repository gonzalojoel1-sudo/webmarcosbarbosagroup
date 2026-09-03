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
    <section className="relative bg-paper-2 border-t border-line py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Un camino probado.
            <br />
            <span className="text-gradient-accent">Sin improvisación.</span>
          </h2>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {steps.map((s) => (
            <div
              key={s.n}
              className={`card-luxury p-7 rounded-2xl flex flex-col min-h-[210px] select-none ${
                s.n === "06" ? "card-accent" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`font-mono-tech text-xl font-bold tracking-tight ${
                    s.n === "06" ? "text-primary" : "text-foreground"
                  }`}
                >
                  {s.n}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">{s.desc}</p>
              <p className="mt-auto text-[11px] font-mono-tech text-muted border-t border-line/60 dark:border-white/[0.06] pt-3 flex items-center gap-1.5">
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
