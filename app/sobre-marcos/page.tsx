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
      <section className="pt-32 md:pt-40 pb-12 border-b border-line bg-paper-2">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="relative">
              {/* glow ambiental del retrato */}
              <div
                aria-hidden
                className="absolute -inset-4 bg-gradient-to-tr from-primary/25 to-transparent rounded-3xl blur-2xl -z-10 opacity-70"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line dark:border-white/[0.12] bg-[#09090C] shadow-2xl shadow-black/10 dark:shadow-black/60">
                <Image
                  src="/images/marcos-hero.jpg"
                  alt="Marcos Barbosa — Fundador, Marcos Barbosa Group"
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-700 dark:mix-blend-luminosity dark:opacity-85"
                  sizes="(max-width:1024px) 100vw, 40vw"
                  priority
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[#040405] via-transparent to-transparent opacity-0 dark:opacity-100 pointer-events-none"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="card-luxury rounded-xl p-3 text-center">
                <p className="font-mono-tech text-lg leading-none font-bold text-foreground">15+</p>
                <p className="text-[10px] font-mono-tech tracking-widest text-muted mt-1 uppercase">
                  Años
                </p>
              </div>
              <div className="card-luxury rounded-xl p-3 text-center">
                <p className="font-mono-tech text-lg leading-none font-bold text-primary">01—06</p>
                <p className="text-[10px] font-mono-tech tracking-widest text-muted mt-1 uppercase">
                  Método
                </p>
              </div>
              <div className="card-luxury rounded-xl p-3 text-center">
                <p className="font-mono-tech text-lg leading-none font-bold text-foreground">4</p>
                <p className="text-[10px] font-mono-tech tracking-widest text-muted mt-1 uppercase">
                  Planes
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="font-mono-tech text-xs tracking-widest text-primary uppercase font-semibold">
              [ SOBRE MARCOS ]
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mt-3 text-foreground">
              De fuerzas especiales <span className="text-gradient-accent">a formar líderes.</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted mt-4 max-w-xl font-light">
              Más de 15 años transformando empresarios en líderes y negocios en
              organizaciones que crecen sin depender de una persona. Disciplina táctica aplicada a la empresa
              real. Base Córdoba, trabajo internacional.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {bullets.map((b) => (
                <div key={b.title} className="card-luxury rounded-xl p-4 flex gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-0.5">
                    <b.Icon size={16} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{b.title}</p>
                    <p className="text-xs leading-relaxed text-muted mt-1.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="mt-10 border-l-2 border-primary pl-4 py-1 italic text-zinc-700 dark:text-zinc-300 text-base font-light">
              &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa ejecute,
              mida y escale — incluso cuando vos no estés.&rdquo;
              <footer className="mt-3 not-italic text-[11px] font-mono-tech tracking-widest text-muted uppercase">
                — Marcos Barbosa
              </footer>
            </blockquote>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contacto"
                className="btn-high-ticket inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold tracking-wide gap-2"
              >
                Agendar Reunión Estratégica <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/metodologia"
                className="btn-ghost-lux inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold tracking-wide"
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
            <p className="font-mono-tech text-xs tracking-widest text-primary uppercase font-semibold">
              [ TRAYECTORIA ]
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mt-2 text-foreground">
              Táctica. Experiencia. <span className="text-gradient-accent">Método.</span>
            </h2>
            <p className="text-sm text-muted leading-relaxed mt-3">
              Operaciones especiales → empresa real. Cada paso validado en campo, no en teoría.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {timeline.map((t, i) => (
              <div
                key={t.year}
                className={`card-luxury rounded-2xl p-6 flex flex-col ${i === 2 ? "card-accent" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`font-mono-tech text-xl font-bold tracking-tight ${
                      i === 2 ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-mono-tech uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    {t.year}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2 text-foreground">{t.title}</h3>
                <p className="text-muted text-xs leading-relaxed flex-1">{t.desc}</p>
                <p className="mt-4 text-[11px] font-mono-tech text-muted border-t border-line/60 dark:border-white/[0.06] pt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
                  {t.year.split("—")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares + Conferencias */}
      <section className="relative bg-paper-2 border-t border-line py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-foreground">
              Interviene donde <span className="text-gradient-accent">más tracciona.</span>
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { k: "Estrategia", d: "Rumbo, prioridades y tableros." },
                { k: "Liderazgo", d: "Cultura y equipo que ejecuta." },
                { k: "Automatización", d: "Procesos que corren solos." },
                { k: "Software y Web", d: "Webs, CRMs y tableros que miden." },
              ].map((p) => (
                <div key={p.k} className="card-luxury rounded-xl p-4 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{p.k}</p>
                    <p className="text-xs text-muted mt-1">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] font-mono-tech text-muted leading-relaxed">
              6 áreas: Dirección y Estrategia · Gestión y Operaciones · Liderazgo y Personas · Riesgos y
              Transformación · Comercial y Ventas · Gobierno y Escalamiento.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="card-luxury card-accent rounded-2xl p-6 relative overflow-hidden">
              <p className="text-[11px] font-mono-tech tracking-widest text-primary uppercase font-semibold">
                [ CONFERENCIAS ]
              </p>
              <h3 className="text-xl font-bold tracking-tight mt-2 text-foreground">
                Inspiración que mueve.
              </h3>
              <p className="text-sm text-muted leading-relaxed mt-2">
                Charlas para equipos y eventos: Motivación, Liderazgo, Trabajo en Equipo y Ventas. Con
                historias de operaciones reales y herramientas aplicables al día siguiente.
              </p>
              <ul className="mt-4 space-y-2">
                {["Motivación táctica", "Liderazgo bajo presión", "Trabajo en Equipo", "Ventas con disciplina"].map(
                  (c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Check size={10} strokeWidth={2.5} aria-hidden />
                      </span>
                      {c}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/contacto"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 btn-high-ticket rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider"
              >
                Consultar conferencias <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative border-t border-line py-24 px-6 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"
        />
        <div className="relative max-w-3xl mx-auto text-center space-y-8">
          <p className="font-mono-tech text-xs tracking-widest text-primary uppercase font-semibold">
            [ PRIMERA REUNIÓN ESTRATÉGICA ]
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Hablemos de tu empresa.
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-light">
            45 min de diagnóstico. Salís con claridad y propuesta a medida. Cupos limitados por mes.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              href="/contacto"
              className="btn-high-ticket inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold tracking-wider"
            >
              Agendar Reunión <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <p className="pt-4 text-[11px] font-mono-tech text-muted">
            Córdoba, Argentina · Internacional · WhatsApp +54 9 351 733 4040
          </p>
        </div>
      </section>
    </main>
  )
}
