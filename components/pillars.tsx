"use client"

import { Target, Users, Zap, MonitorSmartphone } from "lucide-react"

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
  return (
    <section className="bg-paper-2 border-y border-line py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted">NUESTROS PILARES</p>
            <h2 className="font-display text-3xl md:text-4xl leading-none mt-2 text-ink">
              Cuatro frentes. <span className="text-primary">Un solo sistema.</span>
            </h2>
          </div>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            Del brochure p01: intervenimos donde más tracciona — estrategia, personas, sistemas y tecnología.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map(({ id, title, desc, Icon }) => (
            <div
              key={id}
              className="group relative bg-white border border-line rounded-xl p-6 flex flex-col gap-4 border-l-4 border-l-transparent hover:border-l-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary-soft border border-primary/10 flex items-center justify-center text-primary">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium tracking-widest text-muted">{id}</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl leading-none text-ink group-hover:text-ink-soft transition-colors">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{desc}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-line/60 flex items-center gap-2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="h-px w-6 bg-primary" aria-hidden />
                Ver cómo trabajamos
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
