import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Cuerpo de Cristo — Consejería, Ministerio y Solidaridad | Marcos Barbosa Group",
  description:
    "Consejería cristiana, ministerio empresarial, confesionario, ofrenda y solidaridad. Fe que sirve y acompaña.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo" },
  openGraph: {
    title: "Cuerpo de Cristo | Marcos Barbosa Group",
    description: "Consejería, ministerio, confesionario, ofrenda y solidaridad.",
    url: "https://marcosbarbosagroup.com/cuerpo-de-cristo",
    type: "website",
    siteName: "Marcos Barbosa Group",
    locale: "es_AR",
    images: [{ url: "https://marcosbarbosagroup.com/images/marcos-hero.jpg", width: 1200, height: 630, alt: "Marcos Barbosa Group" }],
  },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Fe que sirve."
      italic="Un cuerpo, muchos dones."
      intro="Consejería, ministerio, solidaridad y un lugar reservado para soltar las cargas. La obra de Dios también se organiza, se acompaña y se sostiene."
      chips={["Consejería", "Ministerio", "Solidaridad", "Ofrenda"]}
    />
  )
}
