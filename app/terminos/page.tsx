import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Términos del Servicio | Marcos Barbosa Group",
  description: "Condiciones de uso del sitio y contratación de servicios de consultoría.",
}

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="bg-bg pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05] mt-3">
            Términos del <span className="italic text-primary">Servicio</span>
          </h1>
          <p className="text-sm text-fg-muted mt-4">Última actualización: septiembre 2026</p>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-fg-muted [&_h2]:text-foreground [&_h2]:font-display [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3">
            <section>
              <h2>1. Objeto</h2>
              <p>
                Estos términos regulan el uso del sitio web marcosbarbosagroup.com y la
                contratación de los servicios de consultoría ofrecidos por Grupo Marcos Barbosa
                (planes de acompañamiento, conferencias y capacitaciones).
              </p>
            </section>
            <section>
              <h2>2. Primera reunión estratégica</h2>
              <p>
                La primera reunión tiene carácter diagnóstico, sin costo ni compromiso de
                contratación. A partir de ella se elabora una propuesta a medida con alcance,
                objetivos, modalidad e inversión.
              </p>
            </section>
            <section>
              <h2>3. Contratación de planes</h2>
              <p>
                Los planes de acompañamiento (Consultor Empresarial, Consejero Estratégico,
                Director Externo Estratégico y Director Corporativo) se formalizan mediante
                propuesta escrita aceptada por ambas partes, que prevalece sobre estos términos en
                lo no especificado.
              </p>
            </section>
            <section>
              <h2>4. Agenda y cancelaciones</h2>
              <p>
                Las reuniones se agendan según disponibilidad publicada. Requerimos aviso con al
                menos 24 horas de anticipación para reprogramar sin costo.
              </p>
            </section>
            <section>
              <h2>5. Propiedad intelectual</h2>
              <p>
                Los materiales, metodologías y entregables desarrollados durante el acompañamiento
                son de uso exclusivo del cliente y no pueden redistribuirse sin autorización
                escrita. La metodología y el contenido del sitio pertenecen a Grupo Marcos Barbosa.
              </p>
            </section>
            <section>
              <h2>6. Responsabilidad</h2>
              <p>
                La consultoría es un servicio de asesoramiento profesional; los resultados
                dependen también de la implementación del cliente. No garantizamos resultados
                económicos específicos.
              </p>
            </section>
            <section>
              <h2>7. Contacto</h2>
              <p>
                Para cualquier consulta sobre estos términos:
                consultora.marcosbarbosa@gmail.com · Córdoba, Argentina.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
