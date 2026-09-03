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
    <main className="bg-paper">
      {/* Header spacing + hero intro */}
      <section className="pt-28 pb-10 border-b border-line bg-paper-2">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-[0.2em] text-muted">CONTACTO</p>
          <h1 className="font-display text-4xl md:text-5xl leading-[0.9] mt-3 text-ink">
            Agendá tu
            <span className="underline decoration-primary decoration-4 underline-offset-4">
              {" "}
              Primera Reunión
            </span>{" "}
            Estratégica
          </h1>
          <p className="mt-4 text-muted max-w-2xl leading-relaxed">
            Diagnóstico 360° de tu negocio. En 45 minutos definimos qué te frena y el camino a una
            empresa que crece sin depender de vos. Cupos limitados por mes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {trustBullets.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 bg-white border border-line rounded-full px-3 py-1.5 text-ink"
              >
                <span className="w-5 h-5 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8 items-start">
          {/* Form card */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-line rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl leading-none text-ink">Contanos tu desafío</h2>
                  <p className="text-sm text-muted mt-2">
                    Completá el formulario y te contactamos por WhatsApp. O escribinos directo.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-2 text-xs font-medium tracking-widest text-primary bg-primary-soft border border-primary/15 rounded-full px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden />
                  CUPOS ABIERTOS
                </span>
              </div>

              <LeadForm />

              <div className="mt-6 pt-6 border-t border-line flex flex-col sm:flex-row gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-success" /> Datos protegidos · Sin spam
                </span>
                <span className="hidden sm:inline text-line" aria-hidden>
                  •
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> Respuesta en 24h hábiles
                </span>
              </div>
            </div>

            {/* Confianza strip debajo form */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <div className="bg-ink text-white rounded-xl p-4 border border-white/10">
                <p className="text-xs tracking-widest text-white/60">EXPERIENCIA</p>
                <p className="font-display text-xl leading-none mt-1">15+ años</p>
                <p className="text-xs text-white/60 mt-1">Empresas en LATAM y Europa</p>
                <div className="mt-3 h-1 w-full bg-primary rounded-full" aria-hidden />
              </div>
              <div className="bg-white border border-line rounded-xl p-4">
                <p className="text-xs tracking-widest text-muted">MÉTODO</p>
                <p className="font-display text-xl leading-none mt-1 text-ink">6 pasos</p>
                <p className="text-xs text-muted mt-1">De Diagnóstico a Escalamiento</p>
                <Link
                  href="/metodologia"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                >
                  Ver metodología <ArrowRight size={12} />
                </Link>
              </div>
              <div className="bg-white border border-line rounded-xl p-4">
                <p className="text-xs tracking-widest text-muted">PLANES</p>
                <p className="font-display text-xl leading-none mt-1 text-ink">1 — 4</p>
                <p className="text-xs text-muted mt-1">Desde Consultor a Board</p>
                <Link
                  href="/planes"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                >
                  Comparar planes <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-5 space-y-5">
            {/* WhatsApp direct */}
            <div className="bg-ink text-white rounded-2xl p-6 relative overflow-hidden border border-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden />
              <p className="text-xs tracking-[0.16em] text-white/60">CONTACTO DIRECTO</p>
              <h3 className="font-display text-xl leading-none mt-2">¿Preferís WhatsApp?</h3>
              <p className="text-sm text-white/70 leading-relaxed mt-2">
                Escribinos directo y agendamos tu reunión sin formulario. Atención personal de Marcos.
              </p>
              <a
                href="https://wa.me/5493517334040?text=Hola%20Marcos%2C%20quiero%20agendar%20mi%20Primera%20Reuni%C3%B3n%20Estrat%C3%A9gica"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-5 py-3 text-sm font-medium transition-colors"
              >
                <MessageCircle size={18} /> WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-full px-5 py-3 text-sm font-medium transition-colors"
              >
                <Mail size={18} /> consultora.marcosbarbosa@gmail.com
              </a>
              <p className="mt-3 text-xs text-white/50 text-center">Córdoba, Argentina · Respuesta en 24h</p>
            </div>

            {/* Calendly embed placeholder */}
            <div className="bg-white border border-line rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-soft border border-primary/15 flex items-center justify-center text-primary">
                  <Clock size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink leading-none">Reservá en calendario</h3>
                  <p className="text-xs text-muted mt-0.5">Elegí día y hora · 45 min · Meet/Presencial</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-line bg-paper overflow-hidden">
                {/* Calendly inline embed — src parametrizable */}
                <div className="aspect-[4/3] md:aspect-[16/11] w-full bg-paper-2 flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-sm font-medium text-ink">Calendly Embed</p>
                  <p className="text-xs text-muted mt-1 max-w-sm">
                    Reemplazá este bloque por el embed real de Calendly/Cal.com cuando tengas el link
                    (iframe). Por ahora usá el formulario o WhatsApp arriba.
                  </p>
                  <div className="mt-4 w-full rounded-lg border border-dashed border-line bg-white p-3 text-xs text-muted font-mono break-all">
                    {"<iframe src=\"https://calendly.com/...\" />"}
                  </div>
                  <Link
                    href="https://wa.me/5493517334040"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary-hover"
                  >
                    Agendar por WhatsApp <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted leading-relaxed">
                Si el calendario no carga, escribinos por WhatsApp y coordinamos manual.
              </p>
            </div>

            {/* Mapa Córdoba */}
            <div className="bg-white border border-line rounded-2xl overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-paper border border-line flex items-center justify-center text-ink">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink leading-none">Córdoba · Internacional</h3>
                    <p className="text-xs text-muted mt-0.5">Base Córdoba, trabajo híbrido y en territorio</p>
                  </div>
                </div>
              </div>
              <div className="aspect-[16/10] w-full bg-paper-2 border-y border-line overflow-hidden">
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
                  Ver mapa <ArrowRight size={12} />
                </a>
              </div>
            </div>

            {/* FAQ corto */}
            <div className="bg-paper-2 border border-line rounded-2xl p-6">
              <h3 className="font-display text-lg leading-none text-ink">Antes de agendar</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-ink">¿Qué pasa en la Primera Reunión?</dt>
                  <dd className="text-muted leading-relaxed mt-1">
                    45 min de diagnóstico. Entendemos tu momento, equipo y números. Salís con claridad
                    y propuesta a medida (no genérica).
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">¿Tiene costo?</dt>
                  <dd className="text-muted leading-relaxed mt-1">
                    La primera reunión es estratégica y sin costo. Luego definimos plan y alcance según
                    diagnóstico.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">¿Y si el CRM falla?</dt>
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
