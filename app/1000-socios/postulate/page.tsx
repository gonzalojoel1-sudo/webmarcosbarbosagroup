import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

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
      cta={{ href: "/contacto", label: "Enviar mi CV" }}
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
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] En esta etapa el CV se recibe por WhatsApp/email; la carga
              con archivo y el matching automático se suman en la próxima fase.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Listo para el próximo paso?" sub="Enviá tu CV y quedás en la red." label="Enviar mi CV" />
    </ContentPage>
  )
}
