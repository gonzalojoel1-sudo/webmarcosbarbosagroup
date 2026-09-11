import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Próximas Fechas | Legendarios",
  description: "Encuentros, retiros y tracks de Legendarios en Argentina. Próximas fechas.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios/proximas-fechas" },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/proximas-fechas"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Próximas"
      italic="fechas."
      intro="Los próximos encuentros de Legendarios en Argentina. Guardá la fecha y sumate: cada TOP empieza por una decisión."
      chips={["Encuentros", "TOP", "Conferencias"]}
      cta={{ href: "/contacto", label: "Quiero anotarme" }}
    >
      <SectionShell>
        <SectionHead kicker="Calendario" title="Lo que" italic="viene." />
        <BulletGrid
          items={[
            { title: "[VALIDAR] Próximo TOP", desc: "[VALIDAR] Fecha, sede y horario del Track Outdoor de Potencial." },
            { title: "[VALIDAR] Encuentro de manada", desc: "[VALIDAR] Fecha y lugar del próximo encuentro." },
            { title: "[VALIDAR] Conferencia", desc: "[VALIDAR] Fecha, sede y orador." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Completar con las fechas reales confirmadas por el equipo
              de Legendarios Argentina. Si aún no hay calendario cerrado,
              reemplazar por &ldquo;Fechas en definición&rdquo; y ofrecer avisarte.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="No te la pierdas" sub="Dejanos tus datos y te avisamos de cada fecha." label="Avisarme" />
    </ContentPage>
  )
}
