import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Sobre Nosotros — Habilitaciones y Trayectoria | Seguridad",
  description: "Habilitaciones, documentación, historia y visión de la división de seguridad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/nosotros" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Sobre Nosotros", slug: "/servicios/seguridad/nosotros", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Quiénes"
      italic="somos."
      intro="Nuestra historia, visión y, sobre todo, la documentación que respalda cada servicio. En seguridad, la habilitación no es un detalle."
      chips={["Habilitaciones", "Documentación", "Trayectoria"]}
      cta={{ href: "/contacto", label: "Solicitar documentación" }}
    >
      <SectionShell>
        <SectionHead kicker="Respaldo" title="Papeles en orden," italic="servicio en serio." />
        <BulletGrid
          items={[
            { title: "Habilitaciones", desc: "Documentación vigente para operar y cubrir objetivos." },
            { title: "Nuestra historia", desc: "Cómo se construyó la división de seguridad." },
            { title: "Visión", desc: "Proteger personas y bienes con protocolo y respeto." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Números de habilitación, organismo, años de trayectoria y
              razón social deben completarse con los datos reales de la empresa
              antes de publicar.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás la documentación?" sub="Te compartimos habilitaciones y respaldos." label="Solicitar documentación" />
    </ContentPage>
  )
}
