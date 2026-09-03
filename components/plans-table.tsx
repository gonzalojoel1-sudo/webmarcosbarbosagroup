"use client"

import Link from "next/link"
import { Check, Minus, ArrowRight, CheckCircle2 } from "lucide-react"

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
    cta: "Elegir Plan 1",
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
    badge: "MÁS ELEGIDO",
    highlight: true,
    ideal: "Empresas que escalan",
    cta: "Elegir Plan 3",
  },
  {
    id: "p4",
    name: "Director Corporativo",
    subtitle: "Plan 4 · Board",
    ideal: "Grupos y directorios",
    cta: "Elegir Plan 4",
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

function CellValue({ value, highlight }: { value: Cell; highlight?: boolean }) {
  if (value === true)
    return highlight ? (
      <CheckCircle2 size={18} className="text-primary mx-auto" />
    ) : (
      <Check size={18} className="text-primary mx-auto" strokeWidth={2.5} />
    )
  if (value === false) return <Minus size={16} className="text-fg-muted/50 mx-auto" />
  return <span className="text-sm text-fg font-medium">{value}</span>
}

export function PlansTable() {
  return (
    <section className="relative py-24 px-6 border-t border-hairline" id="planes">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight text-fg">
            Elegí la intensidad.
            <br />
            <span className="italic text-primary">Nosotros ponemos el sistema.</span>
          </h2>
          <p className="text-sm text-fg-muted leading-relaxed mt-3">
            4 niveles de intervención. Todos con diagnóstico, roadmap y seguimiento. El Plan 3 es el
            más elegido para escalar sin perder control.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block card-luxury rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-surface-2">
                  <th className="p-5 w-[22%] text-[10px] font-medium tracking-[0.18em] text-fg-muted uppercase align-bottom">
                    Comparativa
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className={`p-5 align-bottom ${p.highlight ? "bg-primary/[0.06]" : ""}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[10px] tracking-[0.18em] font-medium uppercase text-fg-muted">
                            {p.subtitle.toUpperCase()}
                          </p>
                          {p.badge && (
                            <span className="inline-flex bg-primary text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`font-display tracking-tight leading-tight text-fg ${
                            p.highlight ? "text-2xl" : "text-xl"
                          }`}
                        >
                          {p.name}
                        </p>
                        <p className={`text-xs ${p.highlight ? "text-primary" : "text-fg-muted"}`}>
                          {p.ideal}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-hairline transition-colors hover:bg-surface-2"
                  >
                    <th className="p-4 text-sm font-medium text-fg text-left">{row.label}</th>
                    {row.cells.map((cell, i) => {
                      const isHighlight = plans[i]?.highlight
                      return (
                        <td
                          key={i}
                          className={`p-4 text-center align-middle ${
                            isHighlight ? "bg-primary/[0.06]" : ""
                          }`}
                        >
                          <CellValue value={cell} highlight={isHighlight} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-surface-2">
                  <td className="p-5" />
                  {plans.map((p) => (
                    <td key={p.id} className={`p-5 ${p.highlight ? "bg-primary/[0.06]" : ""}`}>
                      <Link
                        href="/contacto"
                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider ${
                          p.highlight ? "btn-primary" : "btn-secondary"
                        }`}
                      >
                        {p.cta} <ArrowRight size={14} aria-hidden />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-[11px] text-fg-muted border-t border-hairline bg-surface-2">
            * Propuesta a medida tras Primera Reunión Estratégica. Valores y alcance se definen según
            diagnóstico.
          </p>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-5 lg:hidden">
          {plans.map((p, pIdx) => (
            <div
              key={p.id}
              className={`card-luxury rounded-2xl overflow-hidden ${
                p.highlight ? "card-highlight" : ""
              }`}
            >
              <div className="p-6 border-b border-hairline">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.18em] font-medium uppercase text-fg-muted">
                      {p.subtitle.toUpperCase()}
                    </p>
                    <h3
                      className={`mt-1 font-display tracking-tight leading-tight text-fg ${
                        p.highlight ? "text-2xl" : "text-xl"
                      }`}
                    >
                      {p.name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${p.highlight ? "text-primary" : "text-fg-muted"}`}>
                      {p.ideal}
                    </p>
                  </div>
                  {p.badge && (
                    <span className="shrink-0 inline-flex bg-primary text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">
                      {p.badge}
                    </span>
                  )}
                </div>
              </div>
              <ul className="divide-y divide-hairline p-2">
                {rows.map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm text-fg">{row.label}</span>
                    <span className="shrink-0">
                      <CellValue value={row.cells[pIdx]!} highlight={p.highlight} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t border-hairline">
                <Link
                  href="/contacto"
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider ${
                    p.highlight ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {p.cta} <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-fg-muted text-center px-4">
            * Propuesta a medida tras Primera Reunión Estratégica. Valores según diagnóstico.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/planes"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover underline-offset-4 hover:underline"
          >
            Comparar planes en detalle <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
