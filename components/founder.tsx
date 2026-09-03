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
    <section className="bg-paper py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-white">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa — Fundador"
              fill
              className="object-cover object-top"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 ring-2 ring-primary/15 rounded-2xl pointer-events-none" aria-hidden />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur border border-line rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-display text-sm shrink-0">
                MB
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none text-ink">Marcos Barbosa</p>
                <p className="text-xs text-muted leading-none mt-1">Fuerzas Especiales → Consultor de Líderes</p>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-success shrink-0" aria-hidden />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="text-xs tracking-[0.2em] text-muted">FUNDADOR</p>
          <h2 className="font-display text-3xl md:text-[2.2rem] leading-[0.95] mt-2 text-ink">
            De fuerzas especiales
            <br />
            <span className="text-primary">a formar líderes.</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted mt-4 max-w-xl">
            Del brochure p02 — Más de 15 años transformando empresarios en líderes y negocios en organizaciones que crecen
            sin depender de una persona. Disciplina táctica aplicada a la empresa real.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {bullets.map((b) => (
              <div key={b.title} className="bg-white border border-line rounded-xl p-4 flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary-soft border border-primary/15 flex items-center justify-center text-primary mt-0.5">
                  <Check size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink leading-none">{b.title}</p>
                  <p className="text-xs leading-relaxed text-muted mt-1.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="mt-8 bg-ink text-white rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden />
            <Quote size={22} className="text-primary mb-3" />
            <p className="font-display text-lg md:text-xl leading-snug text-balance">
              &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa ejecute, mida y escale
              — incluso cuando vos no estés.&rdquo;
            </p>
            <footer className="mt-3 text-xs tracking-widest text-white/60">— MARCOS BARBOSA</footer>
          </blockquote>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sobre-marcos"
              className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Conocer a Marcos
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center border border-line bg-white px-6 py-3 rounded-full text-sm font-medium text-ink hover:border-ink/20 transition-colors"
            >
              Agendar Reunión Estratégica
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
