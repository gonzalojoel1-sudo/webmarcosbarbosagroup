"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Target, Users, Zap, MonitorSmartphone, ArrowRight } from "lucide-react"

const pillars = [
  {
    title: "Estrategia",
    desc: "Claridad para decidir. Definimos rumbo, prioridades y tableros que ordenan el crecimiento.",
    Icon: Target,
  },
  {
    title: "Liderazgo",
    desc: "De jefe a líder. Cultura, roles y rituales que hacen que el equipo ejecute sin depender de vos.",
    Icon: Users,
  },
  {
    title: "Automatización",
    desc: "Procesos que corren solos. Operaciones, ventas y soporte con sistemas que escalan.",
    Icon: Zap,
  },
  {
    title: "Software y Web",
    desc: "Arquitectura digital a medida. Webs, CRMs y tableros que convierten y miden.",
    Icon: MonitorSmartphone,
  },
] as const

export function Pillars() {
  const reduce = useReducedMotion()

  return (
    <section className="relative py-24 px-6 border-t border-hairline">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-fg">
            Cuatro frentes. <span className="italic text-primary">Un solo sistema.</span>
          </h2>
          <p className="text-sm text-fg-muted max-w-md leading-relaxed">
            Intervenimos donde más tracciona — estrategia, personas, sistemas y tecnología.
          </p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {pillars.map(({ title, desc, Icon }) => (
            <div key={title} className="card-luxury rounded-2xl p-8 group flex flex-col">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-tight text-fg">{title}</h3>
              <p className="mt-2 text-fg-muted text-sm leading-relaxed">{desc}</p>
              <div className="mt-auto pt-6 flex items-center text-xs font-semibold text-fg-muted group-hover:text-primary transition-colors gap-1.5">
                <span className="h-px w-6 bg-primary" aria-hidden />
                Ver cómo trabajamos
                <ArrowRight
                  className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
