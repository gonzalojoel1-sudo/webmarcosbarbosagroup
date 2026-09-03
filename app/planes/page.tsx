import type { Metadata } from "next"
import Link from "next/link"
import { PlansTable } from "@/components/plans-table"
import { Check, ArrowRight, ShieldCheck, Clock, Crown, CheckCircle2 } from "lucide-react"

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
    <main>
      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-10 border-b border-line bg-paper-2">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono-tech text-xs tracking-widest text-primary uppercase font-semibold">
            [ PLANES 1 — 4 ]
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mt-3 text-foreground max-w-3xl">
            Elegí la intensidad.
            <br />
            <span className="text-gradient-accent">Nosotros ponemos el sistema.</span>
          </h1>
          <p className="mt-4 text-muted max-w-2xl leading-relaxed font-light">
            4 niveles de intervención. Todos con diagnóstico, roadmap y seguimiento. El
            Plan 3 es el más elegido para escalar sin perder control. Propuesta a medida tras Primera
            Reunión Estratégica.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 glass-nav rounded-full px-3 py-1.5 text-foreground">
              <ShieldCheck size={14} className="text-success" aria-hidden /> Garantía de seguimiento
            </span>
            <span className="inline-flex items-center gap-1.5 glass-nav rounded-full px-3 py-1.5 text-foreground">
              <Clock size={14} className="text-primary" aria-hidden /> Acompañamiento en territorio
            </span>
            <span className="inline-flex items-center gap-1.5 bg-primary text-primary-fg rounded-full px-3 py-1.5 font-semibold">
              <Crown size={14} aria-hidden /> Plan 3 · Más elegido
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contacto"
              className="btn-high-ticket px-6 py-3 rounded-xl text-sm font-bold tracking-wide inline-flex items-center gap-2"
            >
              Agendar Reunión Estratégica <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/metodologia"
              className="btn-ghost-lux px-6 py-3 rounded-xl text-sm font-semibold tracking-wide inline-flex items-center gap-2"
            >
              Ver metodología 01—06
            </Link>
          </div>
        </div>
      </section>

      {/* Comparativa — reuse component */}
      <PlansTable />

      {/* Detalle por plan — pricing 4-col */}
      <section className="relative py-24 px-6 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-foreground">
              ¿Qué trae cada plan?
            </h2>
            <p className="text-sm text-muted leading-relaxed mt-3">
              Resumen editorial. El alcance fino se define en la propuesta tras diagnóstico. Acá ves la
              esencia y para quién es cada nivel.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {planDetails.map((p) => (
              <div
                key={p.id}
                className={`card-luxury rounded-2xl p-6 flex flex-col ${
                  p.highlight
                    ? "card-accent-strong lg:-translate-y-3 shadow-2xl relative"
                    : ""
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-orange-600 text-white font-mono-tech text-[10px] font-extrabold uppercase tracking-widest shadow-lg whitespace-nowrap">
                    MÁS ELEGIDO
                  </span>
                )}
                <p
                  className={`text-[10px] font-mono-tech tracking-widest uppercase ${
                    p.highlight ? "text-primary" : "text-muted"
                  }`}
                >
                  {p.id.toUpperCase()}
                </p>
                <h3
                  className={`mt-1 leading-tight ${
                    p.highlight ? "text-2xl font-black text-foreground" : "text-xl font-bold text-foreground"
                  }`}
                >
                  {p.name}
                </h3>
                <p
                  className={`text-xs font-mono-tech mt-0.5 ${
                    p.highlight ? "text-primary" : "text-muted"
                  }`}
                >
                  {p.subtitle}
                </p>
                <ul className="mt-6 space-y-3 text-xs text-zinc-700 dark:text-zinc-300 flex-1">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 leading-relaxed">
                      {p.highlight ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
                      ) : (
                        <Check size={14} className="text-orange-500 shrink-0 mt-0.5" aria-hidden />
                      )}
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/contacto"
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                      p.highlight ? "btn-high-ticket py-3.5 font-black" : "btn-ghost-lux"
                    }`}
                  >
                    Elegir {p.id}
                  </Link>
                  <p className="mt-2 text-[11px] font-mono-tech text-muted text-center">
                    Propuesta a medida tras diagnóstico.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo elegir + FAQs */}
      <section className="relative bg-paper-2 border-t border-line py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-foreground">
              3 pasos.
              <br />
              <span className="text-gradient-accent">Sin vueltas.</span>
            </h2>
            <div className="mt-6 space-y-4">
              {[
                { n: "01", t: "Primera Reunión", d: "45 min. Entendemos tu momento, equipo y números. Sin costo." },
                { n: "02", t: "Diagnóstico 360°", d: "Radiografía y ranking de palancas. Ves claro qué priorizar." },
                { n: "03", t: "Propuesta a medida", d: "Plan, alcance y roadmap 90 días. Decidís con datos." },
              ].map((s) => (
                <div key={s.n} className="card-luxury rounded-xl p-4 flex gap-4">
                  <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-mono-tech font-bold text-primary">
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
              className="mt-6 inline-flex items-center gap-2 btn-high-ticket px-6 py-3 rounded-xl text-sm font-bold tracking-wide"
            >
              Empezar ahora <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Preguntas frecuentes</h3>
            <p className="text-sm text-muted mt-2">Respuestas cortas. Si queda duda, la resolvemos en la reunión.</p>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <div key={f.q} className="card-luxury rounded-xl p-5">
                  <p className="text-sm font-semibold text-foreground">{f.q}</p>
                  <p className="text-sm text-muted leading-relaxed mt-2">{f.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-l-2 border-primary pl-4 py-1">
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 italic font-light">
                * Todos los valores y alcances se definen tras la Primera Reunión Estratégica. La comparativa
                es orientativa para entender niveles de intensidad.
              </p>
              <Link
                href="/contacto"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                ¿Dudas? Escribinos por WhatsApp <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
