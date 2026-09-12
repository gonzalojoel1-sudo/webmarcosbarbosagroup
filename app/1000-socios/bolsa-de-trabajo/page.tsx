import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, CtaBand } from "@/components/site/blocks"
import { JobForm } from "@/components/board/job-form"

export const metadata: Metadata = {
  title: "Bolsa de Trabajo para Empresas | Los 1000 Socios",
  description:
    "Cargá tu búsqueda laboral y nosotros hacemos la conexión con los candidatos de la red.",
  alternates: { canonical: "https://marcosbarbosagroup.com/1000-socios/bolsa-de-trabajo" },
}

export default function Page() {
  const vertical = getVertical("1000-socios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/bolsa-de-trabajo"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Publicá tu"
      italic="búsqueda."
      intro="Cargá la propuesta laboral y nosotros hacemos la conexión con el talento de la red. Menos ruido, más candidatos alineados."
      chips={["Empresas", "Búsquedas", "Conexión"]}
      cta={{ href: "#publicar", label: "Cargar una búsqueda" }}
    >
      <SectionShell>
        <SectionHead kicker="Para empresas" title="Tu búsqueda," italic="nuestra red." />
        <BulletGrid
          items={[
            { title: "Cargás la propuesta", desc: "Puesto, perfil y condiciones en pocos pasos." },
            { title: "Hacemos la conexión", desc: "Filtramos y acercamos los perfiles de la red." },
            { title: "Menos fricción", desc: "Menos CVs al azar y más candidatos alineados." },
          ]}
        />
      </SectionShell>

      <SectionShell id="publicar" className="border-t border-hairline">
        <SectionHead
          kicker="Publicar búsqueda"
          title="Cargá los datos"
          italic="del puesto."
          sub="Completá la propuesta. El equipo la revisa y hace la conexión con la red."
        />
        <JobForm />
      </SectionShell>

      <CtaBand
        title="¿Preferís contarnos por WhatsApp?"
        sub="Escribinos y cargamos la búsqueda con vos."
        label="Escribir por WhatsApp"
        href="https://wa.me/5493517334040?text=Hola%2C%20quiero%20publicar%20una%20b%C3%BAsqueda%20laboral"
      />
    </ContentPage>
  )
}
