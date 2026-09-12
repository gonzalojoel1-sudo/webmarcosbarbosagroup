import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Legendarios — Movimiento Global de Hombres | Marcos Barbosa Group",
  description:
    "Legendarios: un movimiento global de transformación de hombres, con presencia en Argentina. Conocé qué es, las próximas fechas y los traslados.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios" },
  openGraph: {
    title: "Legendarios — Movimiento Global de Hombres | Marcos Barbosa Group",
    description: "Qué es el movimiento, próximas fechas y traslados en Argentina.",
    url: "https://marcosbarbosagroup.com/legendarios",
    type: "website",
    siteName: "Marcos Barbosa Group",
    locale: "es_AR",
    images: [{ url: "https://marcosbarbosagroup.com/images/marcos-hero.jpg", width: 1200, height: 630, alt: "Marcos Barbosa Group" }],
  },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Hombres que"
      italic="se levantan."
      intro="Legendarios es un movimiento global que busca transformar hombres, familias y comunidades. En Argentina está creciendo, y queremos que seas parte."
      chips={["Movimiento global", "Argentina", "Encuentros"]}
    />
  )
}
