import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"
import { Pillars } from "@/components/pillars"
import { MethodologyPreview } from "@/components/methodology-preview"

export const metadata: Metadata = {
  title: "Consultora Estratégica — Estrategia, Liderazgo y Tecnología | Marcos Barbosa Group",
  description:
    "Consultoría estratégica internacional: metodología 01—06, planes 1—4, casos de éxito, modelos de negocio, capacitaciones y recursos.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora" },
  openGraph: {
    title: "Consultora Estratégica | Marcos Barbosa Group",
    description: "Metodología 01—06, planes 1—4, casos de éxito, modelos de negocio, capacitaciones y recursos.",
    url: "https://marcosbarbosagroup.com/consultora",
    type: "website",
    siteName: "Marcos Barbosa Group",
    locale: "es_AR",
    images: [{ url: "https://marcosbarbosagroup.com/images/marcos-hero.jpg", width: 1200, height: 630, alt: "Marcos Barbosa Group" }],
  },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Estrategia que"
      italic="se ejecuta."
      intro="Del Diagnóstico al Escalamiento. Estrategia, liderazgo y tecnología para empresas que buscan trascender, con método probado y sin improvisación."
      chips={["Metodología 01—06", "Planes 1—4", "Acompañamiento en territorio"]}
    >
      <Pillars />
      <MethodologyPreview />
    </VerticalLanding>
  )
}
