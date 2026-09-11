import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Traslados | Legendarios",
  description: "Logística y traslados para llegar a los encuentros de Legendarios.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios/traslados" },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/traslados"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Traslados"
      italic="sin excusas."
      intro="Que no llegar sea el motivo para perdértelo. Organizamos traslados para los encuentros; sumate y viajamos juntos."
      chips={["Logística", "Salidas", "Cupos"]}
      cta={{ href: "/contacto", label: "Reservar mi lugar" }}
    >
      <SectionShell>
        <SectionHead kicker="Cómo funciona" title="Nos organizamos" italic="para llegar." />
        <BulletGrid
          items={[
            { title: "Puntos de salida", desc: "[VALIDAR] Ciudades y puntos de encuentro." },
            { title: "Horarios", desc: "[VALIDAR] Horarios de salida y regreso." },
            { title: "Cupos", desc: "[VALIDAR] Capacidad y forma de reservar." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Completar con la logística real de traslados por encuentro.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Viajás con nosotros?" sub="Reservá tu lugar y coordinamos la salida." label="Reservar lugar" />
    </ContentPage>
  )
}
