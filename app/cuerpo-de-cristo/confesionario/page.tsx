import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Confesionario — Un lugar para librarte de tus cargas | Cuerpo de Cristo",
  description:
    "Un lugar reservado y confidencial para librarte de tus cargas. Escucha, confesión y descanso, con total privacidad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/confesionario" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/confesionario"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Un lugar para"
      italic="librarte de tus cargas."
      intro="Hay cosas que pesan y no se cuentan en cualquier lado. Este es un espacio reservado, confidencial y sin juicio, para hablar y soltar."
      chips={["Confidencial", "Sin juicio", "Escucha"]}
      cta={{ href: "/contacto", label: "Pedir un encuentro privado" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Cómo funciona"
          title="Privacidad"
          italic="antes que nada."
          sub="En esta etapa el encuentro se coordina de forma directa y personal. No hay formularios públicos ni datos que se guarden solos."
        />
        <BulletGrid
          items={[
            { title: "Confidencial", desc: "Lo que se habla queda entre vos y quien te escucha." },
            { title: "Sin juicio", desc: "Un espacio de escucha y misericordia, no de condena." },
            { title: "Encuentro privado", desc: "Se coordina personalmente para cuidar tu privacidad." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              Para pedir un encuentro, escribinos por WhatsApp o desde la página
              de contacto y lo coordinamos de forma privada. No compartas
              información sensible por formularios.
            </p>
          </Prose>
        </div>
      </SectionShell>
    </ContentPage>
  )
}
