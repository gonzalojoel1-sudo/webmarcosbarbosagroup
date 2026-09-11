import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Capacitaciones — Conducción, Ventas, Oratoria y PNL | Consultora",
  description:
    "Herramientas de conducción y liderazgo, estrategia y técnicas de ventas, oratoria y expresión eficaz, PNL aplicada, inteligencia y gestión de emociones.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/capacitaciones" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/capacitaciones"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Equipos que"
      italic="aprenden y aplican."
      intro="Capacitaciones para empresas: no teoría suelta, herramientas que el equipo usa al día siguiente."
      chips={["Liderazgo", "Ventas", "Oratoria", "PNL", "Emociones"]}
      cta={{ href: "/contacto", label: "Pedir una capacitación" }}
    >
      <SectionShell>
        <SectionHead kicker="Programas" title="Herramientas" italic="de conducción y liderazgo." />
        <BulletGrid
          items={[
            { title: "Conducción y Liderazgo", desc: "Cómo conducir personas, no solo tareas." },
            { title: "Estrategia y Técnicas de Ventas", desc: "Proceso comercial y cierre con método." },
            { title: "Oratoria y Expresión Eficaz", desc: "Comunicar con claridad y presencia." },
            { title: "PNL Aplicada", desc: "Patrones de pensamiento y conducta en el trabajo." },
            { title: "Inteligencia y Gestión de Emociones", desc: "Autocontrol y trato bajo presión." },
            { title: "Y más", desc: "Programas a medida según tu equipo y objetivos." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Duración, modalidad (presencial/online) y valores se
              definen según la cantidad de participantes y la profundidad del
              programa.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Tu equipo necesita esto?" sub="Armamos un programa a medida." label="Pedir propuesta" />
    </ContentPage>
  )
}
