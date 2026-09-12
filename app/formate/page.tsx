import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Formate con Nosotros — Rompiendo Barreras | Marcos Barbosa Group",
  description:
    "Formación integral para personas que quieren crecer: Rompiendo Barreras y próximas formaciones.",
  alternates: { canonical: "https://marcosbarbosagroup.com/formate" },
  openGraph: {
    title: "Formate con Nosotros | Marcos Barbosa Group",
    description: "Rompiendo Barreras y próximas formaciones.",
    url: "https://marcosbarbosagroup.com/formate",
    type: "website",
    siteName: "Marcos Barbosa Group",
    locale: "es_AR",
    images: [{ url: "https://marcosbarbosagroup.com/images/marcos-hero.jpg", width: 1200, height: 630, alt: "Marcos Barbosa Group" }],
  },
}

export default function Page() {
  const vertical = getVertical("formate")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Formate"
      italic="para romper barreras."
      intro="Formación integral para personas que quieren crecer de verdad: hábitos, mentalidad, liderazgo y propósito, con herramientas aplicables."
      chips={["Formación integral", "Rompiendo Barreras", "Próximas camadas"]}
    />
  )
}
