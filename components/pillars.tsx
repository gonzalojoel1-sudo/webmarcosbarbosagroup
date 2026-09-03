"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Target, Users, Zap, MonitorSmartphone, ArrowRight } from "lucide-react"

const pillars = [
  {
    id: "01",
    title: "Estrategia",
    desc: "Claridad para decidir. Definimos rumbo, prioridades y tableros que ordenan el crecimiento.",
    Icon: Target,
  },
  {
    id: "02",
    title: "Liderazgo",
    desc: "De jefe a líder. Cultura, roles y rituales que hacen que el equipo ejecute sin depender de vos.",
    Icon: Users,
  },
  {
    id: "03",
    title: "Automatización",
    desc: "Procesos que corren solos. Operaciones, ventas y soporte con sistemas que escalan.",
    Icon: Zap,
  },
  {
    id: "04",
    title: "Software y Web",
    desc: "Arquitectura digital a medida. Webs, CRMs y tableros que convierten y miden.",
    Icon: MonitorSmartphone,
  },
] as const

export function Pillars() {
  const reduce = useReducedMotion()

  return (
    <section className="relative py-24 px-6 border-t border-line">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Cuatro frentes. <span className="text-gradient-accent">Un solo sistema.</span>
          </h2>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            Intervenimos donde más tracciona — estrategia, personas, sistemas y tecnología.
          </p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {pillars.map(({ id, title, desc, Icon }) => (
            <div
              key={id}
              className="card-luxury rounded-2xl p-8 group flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono-tech text-xs text-primary tracking-widest px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 font-semibold">
                  {id}
                </span>
                <span className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5 text-muted" strokeWidth={1.75} aria-hidden />
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">{title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-6 font-light">{desc}</p>
              <div className="mt-auto flex items-center text-xs font-semibold text-muted group-hover:text-primary transition-colors gap-1.5">
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
