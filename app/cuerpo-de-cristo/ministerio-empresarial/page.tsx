import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Ministerio Empresarial | Cuerpo de Cristo — Marcos Barbosa Group",
  description:
    "Fe y empresa en la misma mesa: principios bíblicos aplicados a la conducción, la ética y la cultura de tu negocio.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/ministerio-empresarial" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/ministerio-empresarial"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Fe y empresa"
      italic="en la misma mesa."
      intro="Reunimos empresarios que quieren conducir con integridad. Principios bíblicos llevados a la operación, la cultura y las decisiones difíciles."
      chips={["Encuentros", "Principios", "Conducción"]}
      cta={{ href: "/contacto", label: "Quiero participar" }}
    >
      <SectionShell>
        <SectionHead
          kicker="La propuesta"
          title="Conducir bien"
          italic="también es un acto de fe."
          sub="Un espacio para compartir la presión real de liderar, con base y con hermanos que entienden."
        />
        <BulletGrid
          items={[
            { title: "Encuentros de empresarios", desc: "Reuniones periódicas para compartir y orar." },
            { title: "Principios aplicados", desc: "Ética, generosidad y mayordomía en el negocio." },
            { title: "Acompañamiento", desc: "Consejo para decisiones de conducción y familia." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Frecuencia, sede y modalidad de los encuentros se
              confirman con el equipo. Escribinos para sumarte a la próxima
              reunión.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="Sumate al próximo encuentro" sub="Dejanos tus datos y te avisamos." label="Quiero participar" />
    </ContentPage>
  )
}
