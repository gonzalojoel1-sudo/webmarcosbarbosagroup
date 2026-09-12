import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Ciberseguridad — Monitoreo y Protección | Servicios",
  description: "Monitoreo, protección de sistemas y respuesta ante incidentes digitales.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/ciberseguridad" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Ciberseguridad", slug: "/servicios/seguridad/ciberseguridad", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Ciber"
      italic="seguridad."
      intro="Tu empresa también se defiende en digital. Monitoreo, protección y respuesta para reducir el riesgo de un incidente."
      chips={["Monitoreo", "Protección", "Respuesta"]}
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Servicios", href: "/servicios" },
        { label: "Seguridad", href: "/servicios/seguridad" },
        { label: "Ciberseguridad" },
      ]}
      cta={{ href: "/contacto", label: "Evaluar mi riesgo" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="El riesgo que" italic="no se ve." />
        <BulletGrid
          items={[
            { title: "Monitoreo", desc: "Vigilancia de sistemas y alertas tempranas." },
            { title: "Protección", desc: "Buenas prácticas, accesos y respaldo de información." },
            { title: "Respuesta", desc: "Plan de acción ante incidentes digitales." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Alcance del monitoreo y herramientas utilizadas se definen según la infraestructura de cada empresa.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Sabés qué tan expuesta está tu empresa?" sub="Empezá con una evaluación de riesgo." label="Evaluar mi riesgo" />
    </ContentPage>
  )
}
