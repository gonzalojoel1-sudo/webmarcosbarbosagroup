import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

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
      cta={{ href: "/contacto", label: "Cargar una búsqueda" }}
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
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] En esta etapa las búsquedas se reciben por contacto
              directo (WhatsApp/email); el formulario de carga y el panel de la
              bolsa se suman en la próxima fase.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Buscás incorporar talento?" sub="Contanos el puesto y lo difundimos en la red." label="Cargar búsqueda" />
    </ContentPage>
  )
}
