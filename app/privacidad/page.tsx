import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Política de Privacidad | Marcos Barbosa Group",
  description: "Cómo tratamos los datos personales de nuestros clientes y visitantes.",
}

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="bg-bg pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-6 prose-neutral">
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05] mt-3">
            Política de <span className="italic text-primary">Privacidad</span>
          </h1>
          <p className="text-sm text-fg-muted mt-4">Última actualización: septiembre 2026</p>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-fg-muted [&_h2]:text-foreground [&_h2]:font-display [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3">
            <section>
              <h2>Quiénes somos</h2>
              <p>
                Grupo Marcos Barbosa (&quot;nosotros&quot;) ofrece servicios de consultoría estratégica
                internacional, liderazgo y tecnología. Sitio web: marcosbarbosagroup.com.
                Contacto: consultora.marcosbarbosa@gmail.com.
              </p>
            </section>
            <section>
              <h2>Qué datos recopilamos</h2>
              <p>
                Cuando completás nuestro formulario de contacto o agendás una reunión, recopilamos:
                nombre, correo electrónico, número de teléfono, el plan de interés y el mensaje que
                nos enviás. Si agendás una reunión mediante Google Calendar, recibimos los datos que
                Google comparte de la reserva (nombre, email, fecha y hora).
              </p>
            </section>
            <section>
              <h2>Para qué los usamos</h2>
              <p>
                Única y exclusivamente para responder tu consulta, coordinar la reunión estratégica
                y dar seguimiento a la relación comercial. No enviamos publicidad masiva ni cedemos
                tus datos a terceros para marketing.
              </p>
            </section>
            <section>
              <h2>Dónde se almacenan</h2>
              <p>
                En servidores propios administrados por la consultora (infraestructura Hetzner,
                Unión Europea), así como en Google Calendar y Google Drive asociados a la
                consultora. Los accesos están restringidos al equipo autorizado.
              </p>
            </section>
            <section>
              <h2>Tus derechos</h2>
              <p>
                Podés pedirnos en cualquier momento, escribiendo a
                consultora.marcosbarbosa@gmail.com, acceder a tus datos, corregirlos o eliminarlos
                de nuestros sistemas. Atendemos estas solicitudes dentro de las 72 horas hábiles.
              </p>
            </section>
            <section>
              <h2>Cookies y analítica</h2>
              <p>
                Este sitio no utiliza cookies de seguimiento publicitarias. Las herramientas de
                medición, si se activaran a futuro, se informarán en esta misma sección.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
