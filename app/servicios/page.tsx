import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Servicios — Seguridad Integral y Limpieza Profesional | Marcos Barbosa Group",
  description:
    "Seguridad física, electrónica, ciberseguridad y auditoría, más limpieza profesional para empresas y eventos.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios" },
  openGraph: {
    title: "Servicios | Marcos Barbosa Group",
    description: "Seguridad integral (física, electrónica, ciber, auditoría) y limpieza profesional.",
    url: "https://marcosbarbosagroup.com/servicios",
    type: "website",
  },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Protegemos y"
      italic="cuidamos lo tuyo."
      intro="Seguridad integral y limpieza profesional. Personal capacitado, protocolos claros y cobertura para empresas, consorcios y eventos."
      chips={["Seguridad", "Limpieza", "Cobertura en territorio"]}
    />
  )
}
