"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Target, Users, Zap, MonitorSmartphone } from "lucide-react"

const pillars = [
  {
    id: "01",
    title: "Estrategia",
    desc: "Claridad para decidir. Definimos rumbo, prioridades y tableros que ordenan el crecimiento.",
    Icon: Target,
    featured: true,
  },
  {
    id: "02",
    title: "Liderazgo",
    desc: "De jefe a líder. Cultura, roles y rituales que hacen que el equipo ejecute sin depender de vos.",
    Icon: Users,
    featured: false,
  },
  {
    id: "03",
    title: "Automatización",
    desc: "Procesos que corren solos. Operaciones, ventas y soporte con sistemas que escalan.",
    Icon: Zap,
    featured: false,
  },
  {
    id: "04",
    title: "Software y Web",
    desc: "Arquitectura digital a medida. Webs, CRMs y tableros que convierten y miden.",
    Icon: MonitorSmartphone,
    featured: true,
  },
] as const

export function Pillars() {
  const reduce = useReducedMotion()

  return (
    <section className="bg-paper-2 border-y border-line py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight leading-none text-foreground">
            Cuatro frentes. <span className="text-primary">Un solo sistema.</span>
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
          className="grid grid-cols-1 md:grid-cols-6 gap-5"
        >
          {pillars.map(({ id, title, desc, Icon, featured }) => (
            <div
              key={id}
              className={`group relative bg-surface border border-line rounded-xl p-6 md:p-7 flex flex-col gap-4 border-l-2 border-l-transparent hover:border-l-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 ease-out-expo ${
                featured ? "md:col-span-4" : "md:col-span-2"
              } ${featured ? "bg-gradient-to-br from-primary/[0.05] to-transparent" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-full bg-primary-soft border border-primary/15 flex items-center justify-center text-primary">
                  <Icon size={19} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium tracking-widest text-muted">{id}</span>
              </div>
              <div className="space-y-2">
                <h3
                  className={`font-display tracking-tight leading-none text-foreground ${
                    featured ? "text-2xl md:text-3xl" : "text-xl"
                  }`}
                >
                  {title}
                </h3>
                <p className={`leading-relaxed text-muted ${featured ? "text-sm md:text-base max-w-md" : "text-sm"}`}>
                  {desc}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-line/60 flex items-center gap-2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="h-px w-6 bg-primary" aria-hidden />
                Ver cómo trabajamos
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
