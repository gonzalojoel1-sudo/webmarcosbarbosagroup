import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Seguridad Física — Guardias y Custodia | Servicios",
  description: "Guardias de seguridad, custodia y control de accesos con personal capacitado.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/fisica" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Seguridad Física", slug: "/servicios/seguridad/fisica", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Seguridad"
      italic="física."
      intro="Guardias de seguridad y custodia para empresas, consorcios y eventos. Presencia, protocolo y personal capacitado."
      chips={["Guardias", "Custodia", "Control de accesos"]}
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Servicios", href: "/servicios" },
        { label: "Seguridad", href: "/servicios/seguridad" },
        { label: "Seguridad Física" },
      ]}
      cta={{ href: "/contacto", label: "Solicitar personal" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="Presencia que" italic="disuade y protege." />
        <BulletGrid
          items={[
            { title: "Guardias de seguridad", desc: "Cobertura fija o rotativa según el objetivo." },
            { title: "Custodia", desc: "Traslado y protección de personas y bienes." },
            { title: "Control de accesos", desc: "Registro, acreditación y circulación ordenada." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Horarios, dotación mínima y valores se definen según el objetivo a cubrir.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás guardias?" sub="Definimos el esquema de cobertura juntos." label="Solicitar personal" />
    </ContentPage>
  )
}
