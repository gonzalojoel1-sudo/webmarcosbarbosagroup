import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Check, ArrowRight, Shield, Globe, Award, Users } from "lucide-react"

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
    <main>
      {/* Hero editorial */}
      <section className="pt-32 md:pt-40 pb-12 border-b border-hairline bg-surface">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hairline bg-surface-2 shadow-[0_24px_60px_-24px_rgba(12,12,14,0.35)]">
              <Image
                src="/images/marcos-hero.jpg"
                alt="Marcos Barbosa — Fundador, Marcos Barbosa Group"
                fill
                className="photo-bw object-cover object-top"
                sizes="(max-width:1024px) 100vw, 40vw"
                priority
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="card-luxury rounded-2xl p-3 text-center">
                <p className="font-mono text-lg leading-none font-semibold text-fg">15+</p>
                <p className="text-[10px] tracking-[0.18em] text-fg-muted mt-1 uppercase">Años</p>
              </div>
              <div className="card-luxury rounded-2xl p-3 text-center">
                <p className="font-mono text-lg leading-none font-semibold text-primary">01—06</p>
                <p className="text-[10px] tracking-[0.18em] text-fg-muted mt-1 uppercase">Método</p>
              </div>
              <div className="card-luxury rounded-2xl p-3 text-center">
                <p className="font-mono text-lg leading-none font-semibold text-fg">4</p>
                <p className="text-[10px] tracking-[0.18em] text-fg-muted mt-1 uppercase">Planes</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">Sobre Marcos</p>
            <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-fg">
              De fuerzas especiales <span className="italic text-primary">a formar líderes.</span>
            </h1>
            <p className="text-sm leading-relaxed text-fg-muted mt-4 max-w-xl">
              Más de 15 años transformando empresarios en líderes y negocios en
              organizaciones que crecen sin depender de una persona. Disciplina táctica aplicada a la empresa
              real. Base Córdoba, trabajo internacional.
            </p>

            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {bullets.map((b) => (
                <li key={b.title} className="flex gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <b.Icon size={16} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-fg leading-snug">{b.title}</p>
                    <p className="text-sm leading-relaxed text-fg-muted mt-1">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <blockquote className="mt-10 border-l-2 border-primary pl-5 py-1 font-display italic text-xl md:text-2xl tracking-tight text-fg leading-snug">
              &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa ejecute,
              mida y escale — incluso cuando vos no estés.&rdquo;
              <footer className="mt-3 not-italic font-body text-[11px] tracking-[0.18em] text-fg-muted uppercase">
                — Marcos Barbosa
              </footer>
            </blockquote>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contacto"
                className="btn-primary inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide gap-2"
              >
                Agendar Reunión Estratégica <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/metodologia"
                className="btn-secondary inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide"
              >
                Ver metodología
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight text-fg">
              Táctica. Experiencia. <span className="italic text-primary">Método.</span>
            </h2>
            <p className="text-sm text-fg-muted leading-relaxed mt-3">
              Operaciones especiales → empresa real. Cada paso validado en campo, no en teoría.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {timeline.map((t, i) => (
              <div key={t.year} className="card-luxury rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xl text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-fg-muted">
                    {t.year}
                  </span>
                </div>
                <h3 className="font-display text-lg tracking-tight leading-tight mb-2 text-fg">
                  {t.title}
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed flex-1">{t.desc}</p>
                <p className="mt-4 text-[11px] text-fg-muted border-t border-hairline pt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
                  {t.year.split("—")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares + Conferencias */}
      <section className="relative bg-surface border-t border-hairline py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl tracking-tight leading-tight text-fg">
              Interviene donde <span className="italic text-primary">más tracciona.</span>
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { k: "Estrategia", d: "Rumbo, prioridades y tableros." },
                { k: "Liderazgo", d: "Cultura y equipo que ejecuta." },
                { k: "Automatización", d: "Procesos que corren solos." },
                { k: "Software y Web", d: "Webs, CRMs y tableros que miden." },
              ].map((p) => (
                <div key={p.k} className="card-luxury rounded-2xl p-4 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-fg leading-none">{p.k}</p>
                    <p className="text-xs text-fg-muted mt-1">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-fg-muted leading-relaxed">
              6 áreas: Dirección y Estrategia · Gestión y Operaciones · Liderazgo y Personas · Riesgos y
              Transformación · Comercial y Ventas · Gobierno y Escalamiento.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="card-luxury card-accent rounded-2xl p-6">
              <h3 className="font-display text-xl tracking-tight text-fg">
                Inspiración que mueve.
              </h3>
              <p className="text-sm text-fg-muted leading-relaxed mt-2">
                Charlas para equipos y eventos: Motivación, Liderazgo, Trabajo en Equipo y Ventas. Con
                historias de operaciones reales y herramientas aplicables al día siguiente.
              </p>
              <ul className="mt-4 space-y-2">
                {["Motivación táctica", "Liderazgo bajo presión", "Trabajo en Equipo", "Ventas con disciplina"].map(
                  (c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-fg">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Check size={10} strokeWidth={2.5} aria-hidden />
                      </span>
                      {c}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/contacto"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 btn-primary px-5 py-3 text-xs font-bold uppercase tracking-wider"
              >
                Consultar conferencias <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative border-t border-hairline py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight text-fg leading-tight">
            Hablemos de tu empresa.
          </h2>
          <p className="text-fg-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            45 min de diagnóstico. Salís con claridad y propuesta a medida. Cupos limitados por mes.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              href="/contacto"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-medium tracking-wide"
            >
              Agendar Reunión <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <p className="pt-4 text-[11px] font-mono text-fg-muted">
            Córdoba, Argentina · Internacional · WhatsApp +54 9 351 733 4040
          </p>
        </div>
      </section>
    </main>
  )
}
