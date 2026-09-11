import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Limpieza Profesional para Empresas y Eventos | Servicios",
  description: "Limpieza profesional para empresas, consorcios y eventos. Personal capacitado y protocolos claros.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/limpieza" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/limpieza"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Limpieza"
      italic="profesional."
      intro="Espacios impecables, sin improvisar. Personal capacitado y protocolos para empresas, consorcios y eventos."
      chips={["Empresas", "Consorcios", "Eventos"]}
      cta={{ href: "/contacto", label: "Pedir presupuesto" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="Orden y limpieza" italic="como parte de la operación." />
        <BulletGrid
          items={[
            { title: "Oficinas y empresas", desc: "Limpieza diaria, semanal o por abono." },
            { title: "Consorcios", desc: "Espacios comunes, escaleras y cocheras." },
            { title: "Eventos", desc: "Limpieza previa, durante y posterior al evento." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Frecuencia, dotación y valores se definen según el tamaño y las necesidades del espacio.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás un esquema de limpieza?" sub="Relevamos el espacio y te pasamos presupuesto." label="Pedir presupuesto" />
    </ContentPage>
  )
}
