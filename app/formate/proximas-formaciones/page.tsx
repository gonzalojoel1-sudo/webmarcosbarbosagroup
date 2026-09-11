import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Próximas Formaciones | Formate con Nosotros",
  description: "Fechas, sedes y cupos de las próximas formaciones.",
  alternates: { canonical: "https://marcosbarbosagroup.com/formate/proximas-formaciones" },
}

export default function Page() {
  const vertical = getVertical("formate")!
  const child = vertical.children.find((c) => c.slug.endsWith("/proximas-formaciones"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Próximas"
      italic="formaciones."
      intro="Las fechas que vienen. Anotate temprano: los cupos son limitados."
      chips={["Fechas", "Sedes", "Cupos"]}
      cta={{ href: "/contacto", label: "Reservar mi lugar" }}
    >
      <SectionShell>
        <SectionHead kicker="Calendario" title="Lo que" italic="viene." />
        <BulletGrid
          items={[
            { title: "[VALIDAR] Formación 1", desc: "[VALIDAR] Fecha, sede y cupos." },
            { title: "[VALIDAR] Formación 2", desc: "[VALIDAR] Fecha, sede y cupos." },
            { title: "[VALIDAR] Formación 3", desc: "[VALIDAR] Fecha, sede y cupos." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Completar con las fechas reales. Si aún no están
              definidas, reemplazar por &ldquo;Fechas en definición&rdquo; y ofrecer avisarte.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="Reservá tu lugar" sub="Dejanos tus datos y te confirmamos la próxima camada." label="Reservar lugar" />
    </ContentPage>
  )
}
