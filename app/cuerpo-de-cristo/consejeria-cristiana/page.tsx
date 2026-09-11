import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Consejería Cristiana | Cuerpo de Cristo — Marcos Barbosa Group",
  description:
    "Acompañamiento espiritual y consejo bíblico para personas, familias y matrimonios. Un espacio de escucha y dirección.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/consejeria-cristiana" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/consejeria-cristiana"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Consejería"
      italic="cristiana."
      intro="Un espacio de escucha, dirección y acompañamiento. Consejo bíblico para personas, familias y matrimonios que necesitan claridad y contención."
      chips={["Confidencial", "Acompañamiento", "Dirección bíblica"]}
      cta={{ href: "/contacto", label: "Solicitar una consejería" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Para quién"
          title="Cuando la carga es pesada,"
          italic="no la llevés solo."
          sub="La consejería no es un consejo rápido: es un proceso de escucha y dirección."
        />
        <BulletGrid
          items={[
            { title: "Personas", desc: "Decisiones, duelos, hábitos y propósito de vida." },
            { title: "Matrimonios", desc: "Comunicación, acuerdos y reconstrucción del vínculo." },
            { title: "Familias", desc: "Crianza, límites y unidad familiar con base bíblica." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              Cada proceso empieza con una charla inicial sin costo. A partir de
              ahí definimos juntos la frecuencia y el enfoque. Todo lo que se
              habla queda entre vos y quien te acompaña.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand
        title="¿Querés empezar un proceso?"
        sub="Escribinos y coordinamos la primera charla."
        label="Solicitar consejería"
      />
    </ContentPage>
  )
}
