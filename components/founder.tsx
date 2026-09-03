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
    <section className="relative bg-paper-2 border-t border-line py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            De fuerzas especiales <span className="text-gradient-accent">a formar líderes.</span>
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-muted max-w-xl font-light">
            Más de 15 años transformando empresarios en líderes y negocios en organizaciones que
            crecen sin depender de una persona. Disciplina táctica aplicada a la empresa real.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {bullets.map((b) => (
              <div key={b.title} className="card-luxury rounded-xl p-4 flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-0.5">
                  <Check size={14} strokeWidth={2.5} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">{b.title}</p>
                  <p className="text-xs leading-relaxed text-muted mt-1.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="border-l-2 border-primary pl-4 py-1 italic text-zinc-700 dark:text-zinc-300 text-base font-light">
            &ldquo;La estrategia sin ejecución es solo una ilusión. Mi trabajo es que tu empresa
            ejecute, mida y escale — incluso cuando vos no estés.&rdquo;
          </blockquote>

          <div className="flex items-center gap-4 pt-2">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-tr from-zinc-800 to-black border border-white/15 flex items-center justify-center font-serif-brand font-bold text-base text-white">
              MB
            </span>
            <span>
              <span className="block font-bold text-foreground text-sm">Marcos Barbosa</span>
              <span className="block text-xs text-muted font-mono-tech">
                Fuerzas Especiales → Consultor de Líderes
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/sobre-marcos"
              className="btn-high-ticket inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold tracking-wide"
            >
              Conocer a Marcos
            </Link>
            <Link
              href="/contacto"
              className="btn-ghost-lux inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold tracking-wide"
            >
              Agendar Reunión Estratégica
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="relative">
            {/* glow ambiental del retrato */}
            <div
              aria-hidden
              className="absolute -inset-4 bg-gradient-to-tr from-primary/25 to-transparent rounded-3xl blur-2xl -z-10 opacity-70"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line dark:border-white/[0.12] bg-[#09090C] shadow-2xl shadow-black/10 dark:shadow-black/60">
              <Image
                src="/images/marcos-hero.jpg"
                alt="Marcos Barbosa — Fundador"
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-700 dark:mix-blend-luminosity dark:opacity-85"
                sizes="(max-width:1024px) 100vw, 33vw"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#040405] via-transparent to-transparent opacity-0 dark:opacity-100 pointer-events-none"
              />
            </div>
          </div>
          <div className="mt-6 card-luxury rounded-2xl p-5 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-success pulse-dot shrink-0" aria-hidden />
            <p className="text-[11px] font-mono-tech text-muted uppercase tracking-wider">
              Cupos limitados por mes
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
