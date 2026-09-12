import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, CtaBand } from "@/components/site/blocks"
import { CandidateForm } from "@/components/board/candidate-form"

export const metadata: Metadata = {
  title: "Postulate — Dejá tu CV | Los 1000 Socios",
  description: "Dejá tu CV y postulate a las oportunidades de la red de Los 1000 Socios.",
  alternates: { canonical: "https://marcosbarbosagroup.com/1000-socios/postulate" },
}

export default function Page() {
  const vertical = getVertical("1000-socios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/postulate"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Dejá tu CV"
      italic="y postulate."
      intro="Si buscás trabajo o querés estar en la red para futuras oportunidades, dejá tu perfil. Te contactamos cuando aparezca algo para vos."
      chips={["Talento", "CV", "Oportunidades"]}
      cta={{ href: "#postular", label: "Enviar mi CV" }}
    >
      <SectionShell>
        <SectionHead kicker="Para candidatos" title="Tu perfil," italic="en la red." />
        <BulletGrid
          items={[
            { title: "Dejá tu CV", desc: "Contanos qué hacés y qué buscás." },
            { title: "Entramos en contacto", desc: "Te avisamos cuando haya una búsqueda que encaje." },
            { title: "Sin costo", desc: "Postularte y estar en la red no tiene costo." },
          ]}
        />
      </SectionShell>

      <SectionShell id="postular" className="border-t border-hairline">
        <SectionHead
          kicker="Postulate"
          title="Cargá tus datos"
          italic="y tu CV."
          sub="Subí tu CV (PDF, DOC o DOCX, hasta 5 MB) y quedás en la red."
        />
        <CandidateForm />
      </SectionShell>

      <CtaBand
        title="¿Preferís por WhatsApp?"
        sub="Escribinos y te ayudamos a postularte."
        label="Escribir por WhatsApp"
        href="https://wa.me/5493517334040?text=Hola%2C%20quiero%20postularme%20y%20enviar%20mi%20CV"
      />
    </ContentPage>
  )
}
