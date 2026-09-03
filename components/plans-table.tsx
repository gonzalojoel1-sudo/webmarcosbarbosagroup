"use client"

import Link from "next/link"
import { Check, Minus, Crown, ArrowRight } from "lucide-react"

type Cell = boolean | string

type Plan = {
  id: string
  name: string
  subtitle: string
  badge?: string
  highlight?: boolean
  ideal: string
  cta: string
}

type Row = {
  label: string
  cells: Cell[]
}

const plans: Plan[] = [
  {
    id: "p1",
    name: "Consultor Empresarial",
    subtitle: "Plan 1 · Fundamentos",
    ideal: "Dueños que ordenan",
    cta: "Empezar",
  },
  {
    id: "p2",
    name: "Consejero Estratégico",
    subtitle: "Plan 2 · Crecimiento",
    ideal: "Equipos que traccionan",
    cta: "Elegir Plan 2",
  },
  {
    id: "p3",
    name: "Director Externo",
    subtitle: "Plan 3 · Escalamiento",
    badge: "Más elegido",
    highlight: true,
    ideal: "Empresas que escalan",
    cta: "Elegir Plan 3",
  },
  {
    id: "p4",
    name: "Director Corporativo",
    subtitle: "Plan 4 · Board",
    ideal: "Grupos y directorios",
    cta: "Hablar con Marcos",
  },
]

const rows: Row[] = [
  { label: "Diagnóstico 360°", cells: [true, true, true, true] },
  { label: "Roadmap estratégico", cells: [true, true, true, true] },
  { label: "Reuniones mensuales 1:1", cells: ["1×/mes", "2×/mes", "Semanal", "Semanal + Board"] },
  { label: "Coaching de liderazgo", cells: [false, true, true, true] },
  { label: "Acompañamiento en territorio", cells: [false, "Trimestral", "Mensual", "Quincenal"] },
  { label: "Tableros y automatización", cells: [false, true, true, true] },
  { label: "Gobierno corporativo", cells: [false, false, true, true] },
  { label: "Expansión y escalamiento", cells: [false, false, true, true] },
  { label: "WhatsApp directo con Marcos", cells: [false, true, true, true] },
  { label: "Garantía de seguimiento", cells: [true, true, true, true] },
]

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check size={18} className="text-success mx-auto" strokeWidth={2.25} />
  if (value === false) return <Minus size={16} className="text-line mx-auto" />
  return <span className="text-sm text-ink font-medium">{value}</span>
}

export function PlansTable() {
  return (
    <section className="bg-paper-2 border-y border-line py-16 md:py-20" id="planes">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs tracking-[0.2em] text-muted">PLANES 1 — 4</p>
          <h2 className="font-display text-3xl md:text-4xl leading-none mt-2 text-ink">
            Elegí la intensidad.
            <br />
            <span className="text-primary">Nosotros ponemos el sistema.</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed mt-3">
            Del brochure p07 — 4 niveles de intervención. Todos con diagnóstico, roadmap y seguimiento. El Plan 3 es el más
            elegido para escalar sin perder control.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-paper/40">
                  <th className="p-5 w-[22%] text-xs tracking-widest text-muted font-medium">COMPARATIVA</th>
                  {plans.map((p) => (
                    <th key={p.id} className={`p-5 align-bottom ${p.highlight ? "bg-primary text-white" : ""}`}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {p.highlight && <Crown size={16} className="text-white" />}
                          <p className={`text-xs tracking-widest font-medium ${p.highlight ? "text-white/80" : "text-muted"}`}>
                            {p.subtitle.toUpperCase()}
                          </p>
                        </div>
                        {p.badge && (
                          <span className="inline-flex bg-white text-primary text-[11px] font-bold tracking-widest px-2 py-1 rounded-full">
                            {p.badge.toUpperCase()}
                          </span>
                        )}
                        <p className={`font-display text-base leading-tight ${p.highlight ? "text-white" : "text-ink"}`}>
                          {p.name}
                        </p>
                        <p className={`text-xs ${p.highlight ? "text-white/70" : "text-muted"}`}>{p.ideal}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-line/60 hover:bg-paper/30 transition-colors">
                    <th className="p-4 text-sm font-medium text-ink text-left">{row.label}</th>
                    {row.cells.map((cell, i) => {
                      const isHighlight = plans[i]?.highlight
                      return (
                        <td
                          key={i}
                          className={`p-4 text-center align-middle ${isHighlight ? "bg-primary/[0.04] border-x border-primary/10" : ""}`}
                        >
                          <CellValue value={cell} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-paper/20">
                  <td className="p-5" />
                  {plans.map((p) => (
                    <td key={p.id} className={`p-5 ${p.highlight ? "bg-primary/[0.04] border-x border-primary/10" : ""}`}>
                      <Link
                        href="/contacto"
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors ${
                          p.highlight
                            ? "bg-primary text-white hover:bg-primary-hover"
                            : "bg-ink text-white hover:bg-ink-soft"
                        }`}
                      >
                        {p.cta} <ArrowRight size={16} />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-muted border-t border-line bg-paper/20">
            * Propuesta a medida tras Primera Reunión Estratégica. Valores y alcance se definen según diagnóstico.
          </p>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-5 lg:hidden">
          {plans.map((p, pIdx) => (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white overflow-hidden ${p.highlight ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary" : "border-line"}`}
            >
              <div className={`p-6 ${p.highlight ? "bg-primary text-white" : "bg-paper/40"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-[11px] tracking-[0.16em] font-medium ${p.highlight ? "text-white/80" : "text-muted"}`}>
                      {p.subtitle.toUpperCase()}
                    </p>
                    <h3 className={`font-display text-xl leading-none mt-1 ${p.highlight ? "text-white" : "text-ink"}`}>
                      {p.name}
                    </h3>
                    <p className={`text-xs mt-1 ${p.highlight ? "text-white/70" : "text-muted"}`}>{p.ideal}</p>
                  </div>
                  {p.badge && (
                    <span
                      className={`shrink-0 text-[11px] font-bold tracking-widest px-2.5 py-1 rounded-full ${p.highlight ? "bg-white text-primary" : "bg-primary text-white"}`}
                    >
                      {p.badge.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <ul className="divide-y divide-line/60 p-2">
                {rows.map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm text-ink">{row.label}</span>
                    <span className="shrink-0">
                      <CellValue value={row.cells[pIdx]!} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-paper/20 border-t border-line">
                <Link
                  href="/contacto"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors ${p.highlight ? "bg-primary text-white hover:bg-primary-hover" : "bg-ink text-white hover:bg-ink-soft"}`}
                >
                  {p.cta} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted text-center px-4">
            * Propuesta a medida tras Primera Reunión Estratégica. Valores según diagnóstico.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/planes" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover">
            Comparar planes en detalle <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
