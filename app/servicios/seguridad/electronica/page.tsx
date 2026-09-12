import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Seguridad Electrónica — Instalación de Cámaras | Servicios",
  description: "Instalación de cámaras de seguridad, alarmas y sistemas de monitoreo.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/electronica" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Seguridad Electrónica", slug: "/servicios/seguridad/electronica", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Seguridad"
      italic="electrónica."
      intro="Instalación de cámaras y sistemas de alarma. Ves lo que pasa, lo registrás y lo revisás cuando lo necesitás."
      chips={["Cámaras", "Alarmas", "Instalación"]}
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Servicios", href: "/servicios" },
        { label: "Seguridad", href: "/servicios/seguridad" },
        { label: "Seguridad Electrónica" },
      ]}
      cta={{ href: "/contacto", label: "Pedir instalación" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="Ojos y oídos" italic="en tu objetivo." />
        <BulletGrid
          items={[
            { title: "Cámaras de seguridad", desc: "Instalación y configuración de CCTV." },
            { title: "Alarmas", desc: "Sensores y avisos ante intrusión o emergencia." },
            { title: "Visualización remota", desc: "Acceso desde el celular o la computadora." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Cantidad de cámaras, marcas y presupuesto se definen tras el relevamiento del sitio.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Querés ver todo desde el celular?" sub="Relevamos el sitio y te pasamos una propuesta." label="Pedir instalación" />
    </ContentPage>
  )
}
