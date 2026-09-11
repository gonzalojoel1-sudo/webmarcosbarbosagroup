import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Auditoría de Seguridad | Servicios",
  description: "Auditoría de seguridad: diagnóstico de vulnerabilidades y riesgos en tus instalaciones y sistemas.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/auditoria" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Auditoría", slug: "/servicios/seguridad/auditoria", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Auditoría"
      italic="de seguridad."
      intro="Antes de contratar más seguridad, entendé dónde están las grietas. Diagnosticamos vulnerabilidades y priorizamos lo urgente."
      chips={["Diagnóstico", "Vulnerabilidades", "Plan"]}
      cta={{ href: "/contacto", label: "Pedir una auditoría" }}
    >
      <SectionShell>
        <SectionHead kicker="El proceso" title="Mirar con" italic="ojos de riesgo." />
        <BulletGrid
          items={[
            { title: "Relevamiento", desc: "Instalaciones, accesos, procesos y sistemas." },
            { title: "Diagnóstico", desc: "Vulnerabilidades y puntos ciegos detectados." },
            { title: "Plan priorizado", desc: "Qué resolver primero y cómo." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Alcance y entregables de la auditoría se definen según el tamaño del objetivo.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Cuándo fue tu última auditoría?" sub="Relevamos y te damos un plan claro." label="Pedir auditoría" />
    </ContentPage>
  )
}
