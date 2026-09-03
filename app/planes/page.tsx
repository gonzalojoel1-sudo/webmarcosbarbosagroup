import type { Metadata } from "next"
import Link from "next/link"
import { PlansTable } from "@/components/plans-table"
import { Check, ArrowRight, Crown, ShieldCheck, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Planes 1—4 — Comparativa Consultoría Estratégica | Marcos Barbosa Group",
  description:
    "4 planes: Consultor Empresarial, Consejero Estratégico, Director Externo (más elegido) y Director Corporativo. Diagnóstico 360°, roadmap, coaching, tableros y gobierno. Propuesta a medida.",
  openGraph: {
    title: "Planes 1—4 | Marcos Barbosa Group",
    description:
      "De Consultor a Board. 4 niveles de intervención. El Plan 3 es el más elegido para escalar sin perder control.",
    url: "https://marcosbarbosagroup.com/planes",
    type: "website",
  },
  alternates: { canonical: "https://marcosbarbosagroup.com/planes" },
}

const planDetails = [
  {
    id: "Plan 1",
    name: "Consultor Empresarial",
    subtitle: "Fundamentos · Ideal: dueños que ordenan",
    bullets: ["Diagnóstico 360° + roadmap 90 días", "1× reunión mensual 1:1", "Garantía de seguimiento", "Foco: orden y prioridades"],
    highlight: false,
  },
  {
    id: "Plan 2",
    name: "Consejero Estratégico",
    subtitle: "Crecimiento · Ideal: equipos que traccionan",
    bullets: [
      "Todo Plan 1 + coaching de liderazgo",
      "2× reuniones mensuales + WhatsApp directo",
      "Tableros y automatización",
      "Acompañamiento trimestral en territorio",
    ],
    highlight: false,
  },
  {
    id: "Plan 3",
    name: "Director Externo Estratégico",
    subtitle: "Escalamiento · Más elegido",
    bullets: [
      "Acompañamiento semanal + gobierno corporativo",
      "Coaching + tableros + expansión",
      "Acompañamiento mensual en territorio",
      "Playbooks y sistema para escalar sin vos",
    ],
    highlight: true,
  },
  {
    id: "Plan 4",
    name: "Director Corporativo",
    subtitle: "Board · Ideal: grupos y directorios",
    bullets: [
      "Board externo + gobierno corporativo",
      "Acompañamiento semanal + quincenal en territorio",
      "Expansión internacional y mesa directiva",
      "Advisor directo de Marcos",
    ],
    highlight: false,
  },
] as const

const faqs = [
  {
    q: "¿Cómo elijo el plan?",
    a: "No elegís a ciegas. En la Primera Reunión Estratégica diagnosticamos tu momento, equipo y números. De ahí sale la propuesta a medida — el plan es la intensidad, no una caja cerrada.",
  },
  {
    q: "¿Los valores son fijos?",
    a: "No. Cada empresa tiene contexto distinto. Los valores y alcance se definen tras el diagnóstico 360°. La tabla es comparativa de alcance, no lista de precios.",
  },
  {
    q: "¿Qué incluye todos los planes?",
    a: "Todos incluyen Diagnóstico 360°, roadmap, roadmap 90 días y garantía de seguimiento. La diferencia es intensidad, coaching, territorio y gobierno.",
  },
  {
    q: "¿Y si necesito algo intermedio?",
    a: "Pasa siempre. Armamos propuesta híbrida. La metodología 01—06 es la misma; ajustamos rituales y acompañamiento.",
  },
] as const

export default function PlanesPage() {
  return (
    <main className="bg-paper">
      {/* Hero */}
      <section className="pt-28 pb-10 border-b border-line bg-paper-2">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-[0.2em] text-muted">PLANES 1 — 4</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[0.95] mt-3 text-foreground max-w-3xl">
            Elegí la intensidad.
            <br />
            <span className="text-primary">Nosotros ponemos el sistema.</span>
          </h1>
          <p className="mt-4 text-muted max-w-2xl leading-relaxed">
            Del brochure p07 — 4 niveles de intervención. Todos con diagnóstico, roadmap y seguimiento. El
            Plan 3 es el más elegido para escalar sin perder control. Propuesta a medida tras Primera
            Reunión Estratégica.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-surface border border-line rounded-full px-3 py-1.5 text-foreground">
              <ShieldCheck size={14} className="text-success" /> Garantía de seguimiento
            </span>
            <span className="inline-flex items-center gap-1.5 bg-surface border border-line rounded-full px-3 py-1.5 text-foreground">
              <Clock size={14} className="text-primary" /> Acompañamiento en territorio
            </span>
            <span className="inline-flex items-center gap-1.5 bg-primary text-primary-fg rounded-full px-3 py-1.5 font-semibold">
              <Crown size={14} /> Plan 3 · Más elegido
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="bg-primary text-primary-fg px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
            >
              Agendar Reunión Estratégica <ArrowRight size={16} />
            </Link>
            <Link
              href="/metodologia"
              className="border border-line bg-surface px-6 py-3 rounded-full text-sm font-semibold text-foreground hover:border-foreground/25 transition-colors inline-flex items-center gap-2"
            >
              Ver metodología 01—06
            </Link>
          </div>
        </div>
      </section>

      {/* Comparativa — reuse component */}
      <PlansTable />

      {/* Detalle por plan */}
      <section className="bg-paper py-12 md:py-16 border-t border-line">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl tracking-tight leading-none mt-2 text-foreground">¿Qué trae cada plan?</h2>
            <p className="text-sm text-muted leading-relaxed mt-3">
              Resumen editorial. El alcance fino se define en la propuesta tras diagnóstico. Acá ves la
              esencia y para quién es cada nivel.
            </p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {planDetails.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border bg-surface overflow-hidden flex flex-col ${p.highlight ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/10" : "border-line"}`}
              >
                <div className={`p-6 ${p.highlight ? "bg-primary text-primary-fg" : "bg-paper/40 border-b border-line"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-[11px] tracking-[0.16em] font-medium ${p.highlight ? "text-primary-fg/80" : "text-muted"}`}>
                        {p.id.toUpperCase()}
                      </p>
                      <h3 className={`font-display text-xl tracking-tight leading-none mt-1 ${p.highlight ? "text-primary-fg" : "text-foreground"}`}>{p.name}</h3>
                      <p className={`text-xs mt-1.5 ${p.highlight ? "text-primary-fg/70" : "text-muted"}`}>{p.subtitle}</p>
                    </div>
                    {p.highlight && (
                      <span className="shrink-0 inline-flex bg-paper-2 text-primary text-[11px] font-bold tracking-widest px-2.5 py-1 rounded-full">
                        MÁS ELEGIDO
                      </span>
                    )}
                  </div>
                </div>
                <ul className="p-6 space-y-3 flex-1">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                      <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="p-6 pt-0">
                  <Link
                    href="/contacto"
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${p.highlight ? "bg-primary text-primary-fg hover:bg-primary-hover" : "bg-ink text-white hover:bg-ink-soft"}`}
                  >
                    Elegir {p.id} <ArrowRight size={16} />
                  </Link>
                  <p className="mt-2 text-xs text-muted text-center">Propuesta a medida tras diagnóstico.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo elegir + FAQs */}
      <section className="bg-paper-2 border-y border-line py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl tracking-tight leading-none mt-2 text-foreground">
              3 pasos.
              <br />
              <span className="text-primary">Sin vueltas.</span>
            </h2>
            <div className="mt-6 space-y-4">
              {[
                { n: "01", t: "Primera Reunión", d: "45 min. Entendemos tu momento, equipo y números. Sin costo." },
                { n: "02", t: "Diagnóstico 360°", d: "Radiografía y ranking de palancas. Ves claro qué priorizar." },
                { n: "03", t: "Propuesta a medida", d: "Plan, alcance y roadmap 90 días. Decidís con datos." },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 bg-surface border border-line rounded-xl p-4">
                  <span className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-fg flex items-center justify-center text-xs font-bold">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{s.t}</p>
                    <p className="text-xs text-muted leading-relaxed mt-1.5">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/contacto"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-fg px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Empezar ahora <ArrowRight size={16} />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <h3 className="font-display text-2xl tracking-tight leading-none text-foreground">Preguntas frecuentes</h3>
            <p className="text-sm text-muted mt-2">Respuestas cortas. Si queda duda, la resolvemos en la reunión.</p>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <div key={f.q} className="bg-surface border border-line rounded-xl p-5">
                  <p className="text-sm font-semibold text-foreground">{f.q}</p>
                  <p className="text-sm text-muted leading-relaxed mt-2">{f.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-ink-soft text-white rounded-xl p-6 relative overflow-hidden border border-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden />
              <p className="text-sm leading-relaxed text-white/80">
                * Todos los valores y alcances se definen tras la Primera Reunión Estratégica. La comparativa
                es orientativa para entender niveles de intensidad.
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-white transition-colors"
              >
                ¿Dudas? Escribinos por WhatsApp <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
