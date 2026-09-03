import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Check, Quote, ArrowRight, Shield, Globe, Award, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Sobre Marcos — De Fuerzas Especiales a Consultor de Líderes | Marcos Barbosa Group",
  description:
    "Marcos Barbosa: 15+ años, ex Fuerzas Especiales de Élite (G.O.A.T./E.T.E.R./G.E.-1), consultoría estratégica internacional. Visión integral, experiencia internacional, enfoque en resultados y compromiso real.",
  openGraph: {
    title: "Sobre Marcos Barbosa | Marcos Barbosa Group",
    description:
      "De Fuerzas Especiales a formar líderes. 15+ años transformando empresarios en líderes y negocios en organizaciones que escalan.",
    url: "https://marcosbarbosagroup.com/sobre-marcos",
    type: "profile",
  },
  alternates: { canonical: "https://marcosbarbosagroup.com/sobre-marcos" },
}

const bullets = [
  {
    title: "Visión Integral",
    desc: "Une estrategia, personas y tecnología. Ve el sistema completo, no solo la parte.",
    Icon: Globe,
  },
  {
    title: "Experiencia Internacional",
    desc: "15+ años acompañando pymes y grupos en Latinoamérica y Europa.",
    Icon: Award,
  },
  {
    title: "Enfoque en Resultados",
    desc: "Obsesión por la ejecución. Tableros, métricas y seguimiento semanal.",
    Icon: Shield,
  },
  {
    title: "Compromiso Real",
    desc: "Acompañamiento directo. No delega tu crecimiento — lo camina con vos.",
    Icon: Users,
  },
] as const

const timeline = [
  {
    year: "2008—2013",
    title: "Fuerzas Especiales de Élite",
    desc: "G.O.A.T. · E.T.E.R. · G.E.-1. Disciplina táctica, liderazgo bajo presión, toma de decisiones en incertidumbre. Base de la metodología 01—06.",
  },
  {
    year: "2013—2018",
    title: "Transición a empresa",
    desc: "De operativo a consultor. Primeros clientes pymes, validación de método en campo, foco en estrategia + personas.",
  },
  {
    year: "2018—Actualidad",
    title: "Consultoría Internacional",
    desc: "Marcos Barbosa Group. 4 pilares, 6 pasos, 4 planes. Acompañamiento a dueños y directorios en LATAM y Europa. Conferencias de liderazgo y ventas.",
  },
] as const

export default function SobreMarcosPage() {
  return (
    <main className="bg-paper">
      {/* Hero editorial */}
      <section className="pt-28 pb-12 border-b border-line bg-paper-2">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl shadow-black/10">
              <Image
                src="/images/marcos-hero.jpg"
                alt="Marcos Barbosa — Fundador, Marcos Barbosa Group"
                fill
                className="object-cover object-top"
                sizes="(max-width:1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 ring-2 ring-primary/15 rounded-2xl pointer-events-none" aria-hidden />
              <div className="absolute bottom-4 left-4 right-4 bg-surface/75 backdrop-blur-md border border-line rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-black/10">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-fg flex items-center justify-center font-display text-sm shrink-0">
                  MB
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none text-foreground">Marcos Barbosa</p>
                  <p className="text-xs text-muted leading-none mt-1">Fuerzas Especiales → Consultor de Líderes</p>
                </div>
                <span className="ml-auto h-2 w-2 rounded-full bg-success shrink-0 animate-pulse" aria-hidden />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-ink-soft text-white rounded-xl p-3 text-center border border-white/10">
                <p className="font-display text-lg leading-none">15+</p>
                <p className="text-[11px] tracking-widest text-white/60 mt-1">AÑOS</p>
              </div>
              <div className="bg-surface border border-line rounded-xl p-3 text-center">
                <p className="font-display text-lg leading-none text-primary">01—06</p>
                <p className="text-[11px] tracking-widest text-muted mt-1">MÉTODO</p>
              </div>
              <div className="bg-surface border border-line rounded-xl p-3 text-center">
                <p className="font-display text-lg leading-none text-foreground">4</p>
                <p className="text-[11px] tracking-widest text-muted mt-1">PLANES</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-xs tracking-[0.2em] text-muted">SOBRE MARCOS</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[0.95] mt-3 text-foreground">
              De fuerzas especiales
              <br />
              <span className="text-primary">a formar líderes.</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted mt-4 max-w-xl">
              Del brochure p02 — Más de 15 años transformando empresarios en líderes y negocios en
              organizaciones que crecen sin depender de una persona. Disciplina táctica aplicada a la empresa
              real. Base Córdoba, trabajo internacional.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {bullets.map((b) => (
                <div key={b.title} className="bg-surface border border-line rounded-xl p-4 flex gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-primary-soft border border-primary/15 flex items-center justify-center text-primary mt-0.5">
                    <b.Icon size={16} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{b.title}</p>
                    <p className="text-xs leading-relaxed text-muted mt-1.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="mt-10 bg-ink-soft text-white rounded-xl p-7 md:p-9 relative overflow-hidden border border-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden />
              <Quote size={20} className="text-primary mb-3" />
              <p className="font-display text-2xl md:text-3xl leading-[1.15] tracking-tight text-balance">
                &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa ejecute,
                mida y escale — incluso cuando vos no estés.&rdquo;
              </p>
              <footer className="mt-3 text-xs tracking-widest text-white/60">— MARCOS BARBOSA</footer>
            </blockquote>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center bg-primary text-primary-fg px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors gap-2"
              >
                Agendar Reunión Estratégica <ArrowRight size={16} />
              </Link>
              <Link
                href="/metodologia"
                className="inline-flex items-center justify-center border border-line bg-surface px-6 py-3 rounded-full text-sm font-semibold text-foreground hover:border-foreground/25 transition-colors"
              >
                Ver metodología
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 md:py-16 bg-paper">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.2em] text-muted">TRAYECTORIA</p>
            <h2 className="font-display text-3xl tracking-tight leading-none mt-2 text-foreground">
              Táctica.
              <br />
              <span className="text-primary">Experiencia. Método.</span>
            </h2>
            <p className="text-sm text-muted leading-relaxed mt-3">
              Operaciones especiales → empresa real. Cada paso validado en campo, no en teoría.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {timeline.map((t) => (
              <div key={t.year} className="bg-surface border border-line rounded-2xl p-6 flex flex-col hover:border-primary/30 transition-colors duration-200">
                <p className="text-xs tracking-[0.16em] font-medium text-primary">{t.year}</p>
                <h3 className="font-display text-lg tracking-tight leading-tight mt-2 text-foreground">{t.title}</h3>
                <p className="text-sm text-muted leading-relaxed mt-2 flex-1">{t.desc}</p>
                <div className="mt-4 h-px w-full bg-primary/15" aria-hidden />
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden /> {t.year.split("—")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares + Conferencias */}
      <section className="bg-paper-2 border-y border-line py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl tracking-tight leading-none mt-2 text-foreground">
              Interviene donde
              <br />
              <span className="text-primary">más tracciona.</span>
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { k: "Estrategia", d: "Rumbo, prioridades y tableros." },
                { k: "Liderazgo", d: "Cultura y equipo que ejecuta." },
                { k: "Automatización", d: "Procesos que corren solos." },
                { k: "Software y Web", d: "Webs, CRMs y tableros que miden." },
              ].map((p) => (
                <div key={p.k} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{p.k}</p>
                    <p className="text-xs text-muted mt-1">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted leading-relaxed">
              6 áreas: Dirección y Estrategia · Gestión y Operaciones · Liderazgo y Personas · Riesgos y
              Transformación · Comercial y Ventas · Gobierno y Escalamiento.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-ink-soft text-white rounded-2xl p-6 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden />
              <p className="text-xs tracking-[0.16em] text-white/60">CONFERENCIAS</p>
              <h3 className="font-display text-xl leading-none mt-2">Inspiración que mueve.</h3>
              <p className="text-sm text-white/70 leading-relaxed mt-2">
                Charlas para equipos y eventos: Motivación, Liderazgo, Trabajo en Equipo y Ventas. Con
                historias de operaciones reales y herramientas aplicables al día siguiente.
              </p>
              <ul className="mt-4 space-y-2">
                {["Motivación táctica", "Liderazgo bajo presión", "Trabajo en Equipo", "Ventas con disciplina"].map(
                  (c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-white/90">
                      <span className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                        <Check size={10} strokeWidth={2.5} />
                      </span>
                      {c}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/contacto"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-3 text-sm font-medium transition-colors"
              >
                Consultar conferencias <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-12 md:py-16 bg-paper">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-primary rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-primary-fg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" aria-hidden />
            <div className="relative">
              <p className="text-xs tracking-[0.16em] text-primary-fg/75">PRIMERA REUNIÓN ESTRATÉGICA</p>
              <h2 className="font-display text-2xl md:text-3xl leading-none mt-2">Hablemos de tu empresa.</h2>
              <p className="text-sm text-primary-fg/75 mt-2 max-w-xl leading-relaxed">
                45 min de diagnóstico. Salís con claridad y propuesta a medida. Cupos limitados por mes.
              </p>
            </div>
            <Link
              href="/contacto"
              className="relative shrink-0 bg-ink-soft text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-ink transition-colors inline-flex items-center gap-2"
            >
              Agendar Reunión <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted text-center">
            Córdoba, Argentina · Internacional · WhatsApp +54 9 351 733 4040
          </p>
        </div>
      </section>
    </main>
  )
}
