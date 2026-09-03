import Image from "next/image"
import Link from "next/link"
import { Check, Quote } from "lucide-react"

const bullets = [
  {
    title: "Visión Integral",
    desc: "Une estrategia, personas y tecnología. Ve el sistema completo, no solo la parte.",
  },
  {
    title: "Experiencia Internacional",
    desc: "15+ años acompañando pymes y grupos en Latinoamérica y Europa.",
  },
  {
    title: "Enfoque en Resultados",
    desc: "Obsesión por la ejecución. Tableros, métricas y seguimiento semanal.",
  },
  {
    title: "Compromiso Real",
    desc: "Acompañamiento directo. No delega tu crecimiento — lo camina con vos.",
  },
] as const

export function Founder() {
  return (
    <section className="bg-paper py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl shadow-black/10">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa — Fundador"
              fill
              className="object-cover object-top"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
            <div
              className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none"
              aria-hidden
            />
            {/* badge glass */}
            <div className="absolute bottom-4 left-4 right-4 bg-surface/75 backdrop-blur-md border border-line rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-black/10">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-fg flex items-center justify-center font-display text-sm shrink-0">
                MB
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none text-foreground">Marcos Barbosa</p>
                <p className="text-xs text-muted leading-none mt-1">
                  Fuerzas Especiales → Consultor de Líderes
                </p>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-success shrink-0" aria-hidden />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[0.95] text-foreground">
            De fuerzas especiales
            <br />
            <span className="text-primary">a formar líderes.</span>
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-muted mt-5 max-w-xl">
            Más de 15 años transformando empresarios en líderes y negocios en organizaciones que
            crecen sin depender de una persona. Disciplina táctica aplicada a la empresa real.
          </p>

          <div className="mt-9 grid sm:grid-cols-2 gap-4">
            {bullets.map((b) => (
              <div
                key={b.title}
                className="bg-surface border border-line rounded-xl p-4 flex gap-3 hover:border-primary/30 transition-colors duration-200"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary-soft border border-primary/15 flex items-center justify-center text-primary mt-0.5">
                  <Check size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">{b.title}</p>
                  <p className="text-xs leading-relaxed text-muted mt-1.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="mt-10 bg-ink-soft text-white rounded-2xl p-7 md:p-9 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden />
            <Quote size={26} className="text-primary mb-4" strokeWidth={1.5} />
            <p className="font-display text-2xl md:text-3xl leading-[1.15] tracking-tight text-balance">
              &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa
              ejecute, mida y escale — incluso cuando vos no estés.&rdquo;
            </p>
            <footer className="mt-5 text-xs tracking-widest text-white/60">— MARCOS BARBOSA</footer>
          </blockquote>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/sobre-marcos"
              className="inline-flex items-center justify-center bg-primary text-primary-fg px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Conocer a Marcos
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center border border-line bg-surface px-6 py-3 rounded-full text-sm font-semibold text-foreground hover:border-foreground/25 transition-colors"
            >
              Agendar Reunión Estratégica
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
