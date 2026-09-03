import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Clock, FileText, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Metodología 01—06 — De Diagnóstico a Escalamiento | Marcos Barbosa Group",
  description:
    "Metodología probada en 6 pasos: Diagnóstico 360°, Análisis, Estrategia, Implementación, Seguimiento y Escalamiento. Sin improvisación. Con tableros, rituales y gobierno.",
  openGraph: {
    title: "Metodología 01—06 | Marcos Barbosa Group",
    description:
      "Un camino probado de Diagnóstico a Escalamiento. Estrategia + ejecución + tableros. Sin improvisación.",
    url: "https://marcosbarbosagroup.com/metodologia",
    type: "website",
  },
  alternates: { canonical: "https://marcosbarbosagroup.com/metodologia" },
}

const steps = [
  {
    n: "01",
    title: "Diagnóstico",
    subtitle: "Radiografía 360°",
    desc: "Dónde estás y qué te frena. Relevamos números, equipo, procesos, cultura y mercado. Sin filtro.",
    entregables: ["Mapa 360° del negocio", "Matriz de cuellos de botella", "Score de madurez"],
    duracion: "Semana 1",
  },
  {
    n: "02",
    title: "Análisis",
    subtitle: "Causa raíz",
    desc: "Detectamos las causas que explican síntomas. Priorizamos palancas de mayor ROI con criterio táctico.",
    entregables: ["5 Porqués + Ishikawa", "Ranking de palancas", "Hipótesis de crecimiento"],
    duracion: "Semana 1–2",
  },
  {
    n: "03",
    title: "Estrategia",
    subtitle: "Plan sin humo",
    desc: "Roadmap claro, objetivos, métricas y due-dates. Decisiones con impacto directo, no powerpoint bonito.",
    entregables: ["Roadmap 90 días", "OKRs / KPIs", "Tablero de control v1"],
    duracion: "Semana 2–3",
  },
  {
    n: "04",
    title: "Implementación",
    subtitle: "En territorio",
    desc: "Acompañamos la ejecución en campo. Procesos, roles, rituales y tech se ponen en marcha con tu equipo.",
    entregables: ["SOPs + RACI", "Onboarding de rituales", "Stack operativo"],
    duracion: "Semana 3–8",
  },
  {
    n: "05",
    title: "Seguimiento",
    subtitle: "Lo que no se mide, no mejora",
    desc: "Tableros semanales, reuniones tácticas y ajustes. Disciplina de ejecución hasta que el sistema corre solo.",
    entregables: ["Dashboard semanal", "Weekly táctico", "Ajustes de roadmap"],
    duracion: "Continuo",
  },
  {
    n: "06",
    title: "Escalamiento",
    subtitle: "Gobierno y escala",
    desc: "La empresa opera sin depender de vos. Gobierno corporativo, playbooks y expansión con sistemas.",
    entregables: ["Gobierno + Board", "Playbooks", "Plan de expansión"],
    duracion: "Trimestre 2+",
  },
] as const

export default function MetodologiaPage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-12 border-b border-hairline bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            Metodología 01 — 06
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-fg max-w-3xl">
            Un camino probado.
            <br />
            <span className="italic text-primary">Sin improvisación.</span>
          </h1>
          <p className="mt-5 text-fg-muted max-w-2xl leading-relaxed">
            Del Diagnóstico al Escalamiento. 6 pasos secuenciales con entregables, métricas y rituales.
            La misma disciplina táctica de Fuerzas Especiales, aplicada a tu empresa.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-fg">
              <Clock size={14} className="text-primary" aria-hidden /> 90 días para tracción
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-fg">
              <FileText size={14} className="text-primary" aria-hidden /> Entregables por paso
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-fg">
              <Target size={14} className="text-primary" aria-hidden /> Tableros + OKRs
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contacto"
              className="btn-primary px-6 py-3 text-sm font-medium tracking-wide inline-flex items-center gap-2"
            >
              Agendar Reunión Estratégica <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/planes"
              className="btn-secondary px-6 py-3 text-sm font-medium tracking-wide inline-flex items-center gap-2"
            >
              Ver planes 1—4
            </Link>
          </div>
        </div>
      </section>

      {/* Steps — editorial vertical timeline */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sticky intro (desktop) */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-4">
                <h2 className="font-display text-3xl tracking-tight leading-tight text-fg">
                  Estrategia
                  <br />
                  <span className="italic text-primary">que se ejecuta.</span>
                </h2>
                <p className="text-sm text-fg-muted leading-relaxed">
                  Cada paso tiene dueño, entregable y métrica. Nada queda en ideas. Si no se mide y no
                  tiene ritual, no existe.
                </p>
                <div className="hidden lg:block pt-4">
                  <div className="h-px w-full bg-hairline" aria-hidden />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="card-luxury rounded-2xl p-3">
                      <p className="font-mono text-xl leading-none text-primary">01—06</p>
                      <p className="text-[10px] tracking-[0.18em] text-fg-muted mt-1 uppercase">
                        Pasos
                      </p>
                    </div>
                    <div className="card-luxury rounded-2xl p-3">
                      <p className="font-mono text-xl leading-none text-fg">90d</p>
                      <p className="text-[10px] tracking-[0.18em] text-fg-muted mt-1 uppercase">
                        Roadmap
                      </p>
                    </div>
                    <div className="card-luxury rounded-2xl p-3">
                      <p className="font-mono text-xl leading-none text-fg">∞</p>
                      <p className="text-[10px] tracking-[0.18em] text-fg-muted mt-1 uppercase">
                        Seguimiento
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/contacto"
                  className="hidden lg:inline-flex mt-6 items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Empezar por Diagnóstico <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-8">
              <div className="relative">
                {/* connecting hairline entre pasos */}
                <div
                  className="absolute left-4 top-4 bottom-4 w-px bg-hairline hidden sm:block"
                  aria-hidden
                />
                <div className="space-y-6">
                  {steps.map((s) => (
                    <div key={s.n} className="relative card-luxury rounded-2xl p-6 md:p-7">
                      <div className="flex items-start justify-between gap-4 sm:pl-10">
                        <span className="font-mono text-4xl md:text-5xl leading-none text-primary">
                          {s.n}
                        </span>
                        <span className="shrink-0 mt-1 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                          {s.duracion}
                        </span>
                      </div>
                      <div className="sm:pl-10">
                        <p className="mt-5 text-sm font-medium text-primary">{s.subtitle}</p>
                        <h3 className="font-display text-2xl tracking-tight leading-tight mt-1 text-fg">
                          {s.title}
                        </h3>
                        <p className="text-sm text-fg-muted leading-relaxed mt-2 max-w-xl">{s.desc}</p>
                      </div>
                      <div className="sm:pl-10 mt-5">
                        <div className="h-px w-full bg-hairline" aria-hidden />
                        <div className="mt-4 flex flex-wrap gap-2">
                          {s.entregables.map((e) => (
                            <span
                              key={e}
                              className="inline-flex items-center gap-1.5 bg-surface-2 border border-hairline rounded-full px-3 py-1.5 text-xs text-fg"
                            >
                              <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center text-success">
                                <Check size={12} strokeWidth={2.5} aria-hidden />
                              </span>
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote — estilo referencia */}
              <blockquote className="mt-8 border-l-2 border-primary pl-5 py-1 font-display italic text-xl md:text-2xl tracking-tight text-fg leading-snug">
                &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa
                ejecute, mida y escale — incluso cuando vos no estés.&rdquo;
                <footer className="mt-3 not-italic font-body text-[11px] tracking-[0.18em] text-fg-muted uppercase">
                  — Marcos Barbosa · Fundador
                </footer>
              </blockquote>

              <div className="mt-8 card-luxury card-accent rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl tracking-tight text-fg">
                    ¿Listo para el Diagnóstico 01?
                  </h3>
                  <p className="text-sm text-fg-muted mt-1.5">
                    Primera Reunión Estratégica — 45 min · Sin costo · Cupos limitados
                  </p>
                </div>
                <Link
                  href="/contacto"
                  className="shrink-0 btn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  Agendar Diagnóstico <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
