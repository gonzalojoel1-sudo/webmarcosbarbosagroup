import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Solidaridad — Obra social que visita familias | Cuerpo de Cristo",
  description:
    "Obra social: visitamos familias, llevamos alimento y acompañamos. Sumate como voluntario o colaborá.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/solidaridad" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/solidaridad"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Una obra social"
      italic="con los pies en la calle."
      intro="Visitamos familias, llevamos alimento y acompañamos a quien está pasando un momento difícil. La fe se demuestra con hechos."
      chips={["Visitas", "Alimento", "Voluntariado"]}
      cta={{ href: "/contacto", label: "Sumarme como voluntario" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Qué hacemos"
          title="Ir"
          italic="a donde hace falta."
          sub="Nos movemos en territorio, con discreción y respeto por cada familia."
        />
        <BulletGrid
          items={[
            { title: "Visitas a familias", desc: "Acompañamiento presencial a quienes lo necesitan." },
            { title: "Alimento y ropa", desc: "Relevamiento y entrega de lo urgente." },
            { title: "Voluntariado", desc: "Sumate con tiempo, recursos o manos." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Zonas de trabajo, calendario de visitas y forma de
              colaborar se coordinan con el equipo. Escribinos si querés sumarte.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="La fe se demuestra con hechos" sub="Sumate como voluntario o colaborá con la obra social." label="Quiero ayudar" />
    </ContentPage>
  )
}
