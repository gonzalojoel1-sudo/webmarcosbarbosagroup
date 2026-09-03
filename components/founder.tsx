import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"

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
    <section className="relative bg-surface border-t border-hairline py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-fg leading-tight">
            De fuerzas especiales <span className="italic text-primary">a formar líderes.</span>
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-fg-muted max-w-xl">
            Más de 15 años transformando empresarios en líderes y negocios en organizaciones que
            crecen sin depender de una persona. Disciplina táctica aplicada a la empresa real.
          </p>

          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {bullets.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                  <Check size={14} strokeWidth={2.5} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg leading-snug">{b.title}</p>
                  <p className="text-sm leading-relaxed text-fg-muted mt-1">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <blockquote className="border-l-2 border-primary pl-5 py-1 font-display italic text-xl md:text-2xl tracking-tight text-fg leading-snug">
            &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa
            ejecute, mida y escale — incluso cuando vos no estés.&rdquo;
          </blockquote>

          <div className="flex items-center gap-4 pt-2">
            <span className="w-12 h-12 rounded-full bg-surface-2 border border-hairline flex items-center justify-center font-display font-semibold text-base text-fg">
              MB
            </span>
            <span>
              <span className="block font-semibold text-fg text-sm">Marcos Barbosa</span>
              <span className="block text-xs text-fg-muted">
                Fuerzas Especiales → Consultor de Líderes
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/sobre-marcos"
              className="btn-primary inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide"
            >
              Conocer a Marcos
            </Link>
            <Link
              href="/contacto"
              className="btn-secondary inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide"
            >
              Agendar Reunión Estratégica
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hairline bg-surface-2 shadow-[0_24px_60px_-24px_rgba(12,12,14,0.35)]">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa — Fundador"
              fill
              className="photo-bw object-cover object-top"
              sizes="(max-width:1024px) 100vw, 33vw"
            />
          </div>
          <div className="mt-4 flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-1.5 text-xs text-fg-muted">
              <span className="h-2 w-2 rounded-full bg-success pulse-dot shrink-0" aria-hidden />
              Cupos limitados por mes
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
