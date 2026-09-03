import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Clock, FileText, Target, Quote } from "lucide-react"

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
    <main className="bg-paper">
      {/* Hero */}
      <section className="pt-28 pb-12 border-b border-line bg-paper-2">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-[0.2em] text-muted">METODOLOGÍA 01 — 06</p>
          <h1 className="font-display text-4xl md:text-5xl leading-[0.9] mt-3 text-ink max-w-3xl">
            Un camino probado.
            <br />
            <span className="underline decoration-primary decoration-4 underline-offset-4">
              Sin improvisación.
            </span>
          </h1>
          <p className="mt-5 text-muted max-w-2xl leading-relaxed">
            Del Diagnóstico al Escalamiento. 6 pasos secuenciales con entregables, métricas y rituales.
            La misma disciplina táctica de Fuerzas Especiales, aplicada a tu empresa.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-white border border-line rounded-full px-3 py-1.5 text-ink">
              <Clock size={14} className="text-primary" /> 90 días para tracción
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-line rounded-full px-3 py-1.5 text-ink">
              <FileText size={14} className="text-primary" /> Entregables por paso
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-line rounded-full px-3 py-1.5 text-ink">
              <Target size={14} className="text-primary" /> Tableros + OKRs
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
            >
              Agendar Reunión Estratégica <ArrowRight size={16} />
            </Link>
            <Link
              href="/planes"
              className="border border-line bg-white px-6 py-3 rounded-full text-sm font-medium text-ink hover:border-ink/20 hover:bg-white transition-colors inline-flex items-center gap-2"
            >
              Ver planes 1—4
            </Link>
          </div>
        </div>
      </section>

      {/* Steps — editorial vertical timeline */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sticky intro (desktop) */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-4">
                <p className="text-xs tracking-[0.2em] text-muted">CÓMO TRABAJAMOS</p>
                <h2 className="font-display text-3xl leading-none text-ink">
                  Estrategia
                  <br />
                  <span className="text-primary">que se ejecuta.</span>
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  Cada paso tiene dueño, entregable y métrica. Nada queda en ideas. Si no se mide y no
                  tiene ritual, no existe.
                </p>
                <div className="hidden lg:block pt-4">
                  <div className="h-px w-full bg-line" aria-hidden />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white border border-line rounded-xl p-3">
                      <p className="font-display text-xl leading-none text-primary">01—06</p>
                      <p className="text-[11px] tracking-widest text-muted mt-1">PASOS</p>
                    </div>
                    <div className="bg-white border border-line rounded-xl p-3">
                      <p className="font-display text-xl leading-none text-ink">90d</p>
                      <p className="text-[11px] tracking-widest text-muted mt-1">ROADMAP</p>
                    </div>
                    <div className="bg-white border border-line rounded-xl p-3">
                      <p className="font-display text-xl leading-none text-ink">∞</p>
                      <p className="text-[11px] tracking-widest text-muted mt-1">SEGUIMIENTO</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/contacto"
                  className="hidden lg:inline-flex mt-6 items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Empezar por Diagnóstico <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-8">
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-[19px] md:left-[23px] top-4 bottom-4 w-px bg-line hidden sm:block" aria-hidden />
                <div className="space-y-6">
                  {steps.map((s) => (
                    <div
                      key={s.n}
                      className="relative bg-white border border-line rounded-2xl p-6 md:p-7 flex flex-col gap-4 hover:shadow-sm hover:border-ink/10 transition-all"
                    >
                      {/* number badge */}
                      <div className="absolute -left-3 top-7 hidden sm:flex w-10 h-10 rounded-full bg-primary text-white items-center justify-center text-xs font-bold tracking-widest border-4 border-paper shadow-sm">
                        {s.n}
                      </div>
                      <div className="flex items-start justify-between gap-4 sm:pl-8">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="sm:hidden inline-flex w-9 h-9 rounded-full bg-primary text-white items-center justify-center text-xs font-bold">
                              {s.n}
                            </span>
                            <p className="text-[11px] tracking-[0.16em] font-medium text-primary">{s.subtitle.toUpperCase()}</p>
                            <span className="h-px w-8 bg-primary/30 hidden sm:block" aria-hidden />
                            <span className="text-xs text-muted hidden sm:inline">{s.duracion}</span>
                          </div>
                          <h3 className="font-display text-2xl leading-none mt-2 text-ink">{s.title}</h3>
                          <p className="text-sm text-muted leading-relaxed mt-2 max-w-xl">{s.desc}</p>
                        </div>
                        <span className="hidden md:block font-display text-5xl leading-none text-primary/15 select-none">
                          {s.n}
                        </span>
                      </div>
                      <div className="sm:pl-8">
                        <div className="h-px w-full bg-line/60" aria-hidden />
                        <div className="mt-4 flex flex-wrap gap-2">
                          {s.entregables.map((e) => (
                            <span
                              key={e}
                              className="inline-flex items-center gap-1.5 bg-paper border border-line rounded-full px-3 py-1.5 text-xs text-ink"
                            >
                              <span className="w-5 h-5 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
                                <Check size={12} strokeWidth={2.5} />
                              </span>
                              {e}
                            </span>
                          ))}
                        </div>
                        <p className="sm:hidden text-xs text-muted mt-3">{s.duracion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <blockquote className="mt-8 bg-ink text-white rounded-2xl p-6 md:p-8 relative overflow-hidden border border-white/10">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden />
                <Quote size={22} className="text-primary mb-3" />
                <p className="font-display text-lg md:text-xl leading-snug text-balance">
                  &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa
                  ejecute, mida y escale — incluso cuando vos no estés.&rdquo;
                </p>
                <footer className="mt-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">MB</span>
                  <span className="text-xs tracking-widest text-white/60">MARCOS BARBOSA — FUNDADOR</span>
                </footer>
              </blockquote>

              <div className="mt-8 bg-primary-soft border border-primary/15 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl leading-none text-ink">¿Listo para el Diagnóstico 01?</h3>
                  <p className="text-sm text-muted mt-1.5">Primera Reunión Estratégica — 45 min · Sin costo · Cupos limitados</p>
                </div>
                <Link
                  href="/contacto"
                  className="shrink-0 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
                >
                  Agendar Diagnóstico <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
