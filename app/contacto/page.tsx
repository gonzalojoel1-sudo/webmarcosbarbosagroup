import type { Metadata } from "next"
import Link from "next/link"
import { LeadForm } from "@/components/lead-form"
import { MessageCircle, Mail, MapPin, Clock, ShieldCheck, ArrowRight, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto — Agendar Primera Reunión Estratégica | Marcos Barbosa Group",
  description:
    "Agendá tu Primera Reunión Estratégica con Marcos Barbosa. Diagnóstico 360° para tu empresa. WhatsApp +54 9 351 733 4040 · Córdoba, Argentina · Respuesta en 24h.",
  openGraph: {
    title: "Contacto — Marcos Barbosa Group",
    description: "Primera Reunión Estratégica · 4 planes · Seguimiento táctico",
  },
}

const trustBullets = [
  "Respuesta en <24h por WhatsApp",
  "Diagnóstico 360° sin compromiso",
  "Propuesta a medida tras reunión",
] as const

export default function ContactoPage() {
  return (
    <main>
      {/* Header spacing + hero intro */}
      <section className="pt-32 md:pt-40 pb-10 border-b border-line bg-paper-2">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono-tech text-xs tracking-widest text-primary uppercase font-semibold">
            [ CONTACTO ]
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mt-3 text-foreground">
            Agendá tu <span className="text-gradient-accent">Primera Reunión</span> Estratégica
          </h1>
          <p className="mt-4 text-muted max-w-2xl leading-relaxed font-light">
            Diagnóstico 360° de tu negocio. En 45 minutos definimos qué te frena y el camino a una
            empresa que crece sin depender de vos. Cupos limitados por mes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {trustBullets.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 glass-nav rounded-full px-3 py-1.5 text-foreground"
              >
                <span className="w-5 h-5 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
                  <Check size={12} strokeWidth={2.5} aria-hidden />
                </span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
          {/* Form card */}
          <div className="lg:col-span-7">
            <div className="card-luxury rounded-2xl p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Contanos tu desafío
                  </h2>
                  <p className="text-sm text-muted mt-2">
                    Completá el formulario y te contactamos por WhatsApp. O escribinos directo.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-mono-tech uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" aria-hidden />
                  Cupos abiertos
                </span>
              </div>

              <LeadForm />

              <div className="mt-6 pt-6 border-t border-line/60 dark:border-white/[0.06] flex flex-col sm:flex-row gap-3 text-[11px] font-mono-tech text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-success" aria-hidden /> Datos protegidos · Sin spam
                </span>
                <span className="hidden sm:inline text-line" aria-hidden>
                  •
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} aria-hidden /> Respuesta en 24h hábiles
                </span>
              </div>
            </div>

            {/* Confianza strip debajo form */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <div className="card-luxury rounded-xl p-4">
                <p className="text-[10px] font-mono-tech tracking-widest text-muted uppercase">
                  Experiencia
                </p>
                <p className="font-mono-tech text-xl font-bold leading-none mt-1 text-foreground">
                  15+ años
                </p>
                <p className="text-xs text-muted mt-1">Empresas en LATAM y Europa</p>
                <div className="mt-3 h-1 w-full bg-primary rounded-full" aria-hidden />
              </div>
              <div className="card-luxury rounded-xl p-4">
                <p className="text-[10px] font-mono-tech tracking-widest text-muted uppercase">
                  Método
                </p>
                <p className="font-mono-tech text-xl font-bold leading-none mt-1 text-foreground">
                  6 pasos
                </p>
                <p className="text-xs text-muted mt-1">De Diagnóstico a Escalamiento</p>
                <Link
                  href="/metodologia"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                >
                  Ver metodología <ArrowRight size={12} aria-hidden />
                </Link>
              </div>
              <div className="card-luxury rounded-xl p-4">
                <p className="text-[10px] font-mono-tech tracking-widest text-muted uppercase">
                  Planes
                </p>
                <p className="font-mono-tech text-xl font-bold leading-none mt-1 text-foreground">
                  1 — 4
                </p>
                <p className="text-xs text-muted mt-1">Desde Consultor a Board</p>
                <Link
                  href="/planes"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                >
                  Comparar planes <ArrowRight size={12} aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-5 space-y-5">
            {/* WhatsApp direct */}
            <div className="card-luxury card-accent rounded-2xl p-6 relative overflow-hidden">
              <p className="text-[11px] font-mono-tech tracking-widest text-primary uppercase font-semibold">
                [ CONTACTO DIRECTO ]
              </p>
              <h3 className="text-xl font-bold tracking-tight mt-2 text-foreground">
                ¿Preferís WhatsApp?
              </h3>
              <p className="text-sm text-muted leading-relaxed mt-2">
                Escribinos directo y agendamos tu reunión sin formulario. Atención personal de Marcos.
              </p>
              <a
                href="https://wa.me/5493517334040?text=Hola%20Marcos%2C%20quiero%20agendar%20mi%20Primera%20Reuni%C3%B3n%20Estrat%C3%A9gica"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 btn-high-ticket rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider"
              >
                <MessageCircle size={18} aria-hidden /> WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 btn-ghost-lux rounded-xl px-5 py-3 text-xs font-semibold"
              >
                <Mail size={18} aria-hidden /> consultora.marcosbarbosa@gmail.com
              </a>
              <p className="mt-3 text-[11px] font-mono-tech text-muted text-center">
                Córdoba, Argentina · Respuesta en 24h
              </p>
            </div>

            {/* Calendly embed placeholder */}
            <div className="card-luxury rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Clock size={16} aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-none">
                    Reservá en calendario
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Elegí día y hora · 45 min · Meet/Presencial</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-line dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] overflow-hidden">
                {/* Calendly inline embed — src parametrizable */}
                <div className="aspect-[4/3] md:aspect-[16/11] w-full flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-sm font-medium text-foreground">Calendly Embed</p>
                  <p className="text-xs text-muted mt-1 max-w-sm">
                    Reemplazá este bloque por el embed real de Calendly/Cal.com cuando tengas el link
                    (iframe). Por ahora usá el formulario o WhatsApp arriba.
                  </p>
                  <div className="mt-4 w-full rounded-lg border border-dashed border-line dark:border-white/15 bg-surface/60 dark:bg-white/[0.04] p-3 text-xs text-muted font-mono break-all">
                    {"<iframe src=\"https://calendly.com/...\" />"}
                  </div>
                  <Link
                    href="https://wa.me/5493517334040"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary-hover"
                  >
                    Agendar por WhatsApp <ArrowRight size={14} aria-hidden />
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted leading-relaxed">
                Si el calendario no carga, escribinos por WhatsApp y coordinamos manual.
              </p>
            </div>

            {/* Mapa Córdoba */}
            <div className="card-luxury rounded-2xl overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center text-foreground">
                    <MapPin size={16} aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground leading-none">
                      Córdoba · Internacional
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Base Córdoba, trabajo híbrido y en territorio
                    </p>
                  </div>
                </div>
              </div>
              <div className="aspect-[16/10] w-full bg-black/[0.02] dark:bg-white/[0.03] border-y border-line dark:border-white/[0.06] overflow-hidden">
                <iframe
                  title="Mapa Córdoba"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-64.25%2C-31.5%2C-64.05%2C-31.35&layer=mapnik&marker=-31.4201%2C-64.1888"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-4">
                <p className="text-xs text-muted leading-relaxed">
                  Atención en Córdoba y toda LATAM. Acompañamiento en territorio según plan.
                </p>
                <a
                  href="https://www.openstreetmap.org/?mlat=-31.4201&mlon=-64.1888#map=14/-31.42/-64.18"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1"
                >
                  Ver mapa <ArrowRight size={12} aria-hidden />
                </a>
              </div>
            </div>

            {/* FAQ corto */}
            <div className="card-luxury rounded-2xl p-6">
              <h3 className="text-lg font-bold tracking-tight text-foreground">Antes de agendar</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-foreground">¿Qué pasa en la Primera Reunión?</dt>
                  <dd className="text-muted leading-relaxed mt-1">
                    45 min de diagnóstico. Entendemos tu momento, equipo y números. Salís con claridad
                    y propuesta a medida (no genérica).
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">¿Tiene costo?</dt>
                  <dd className="text-muted leading-relaxed mt-1">
                    La primera reunión es estratégica y sin costo. Luego definimos plan y alcance según
                    diagnóstico.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">¿Y si el CRM falla?</dt>
                  <dd className="text-muted leading-relaxed mt-1">
                    Tu lead se guarda local seguro (sin pérdida) y te contactamos igual por WhatsApp.
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
