import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Los 1000 Socios — Bolsa de Trabajo y Talento | Marcos Barbosa Group",
  description:
    "Una red de empresarios y talento: bolsa de trabajo para empresas y postulación para candidatos.",
  alternates: { canonical: "https://marcosbarbosagroup.com/1000-socios" },
  openGraph: {
    title: "Los 1000 Socios | Marcos Barbosa Group",
    description: "Bolsa de trabajo para empresas y postulación de talento.",
    url: "https://marcosbarbosagroup.com/1000-socios",
    type: "website",
  },
}

export default function Page() {
  const vertical = getVertical("1000-socios")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Una red que"
      italic="conecta."
      intro="Mil socios, un objetivo: que la oportunidad y el talento se encuentren. Las empresas cargan sus búsquedas y nosotros hacemos la conexión."
      chips={["Empresas", "Talento", "Conexión"]}
    />
  )
}
