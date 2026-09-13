import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid } from "@/components/site/blocks"
import { OfferingForm } from "@/components/donations/offering-form"
import { isMpCheckoutReady } from "@/lib/donations/mp"

export const metadata: Metadata = {
  title: "Ofrenda — Sostené la obra de Dios | Cuerpo de Cristo",
  description:
    "Ofrendá con alegría y propósito para sostener la obra: consejería, ministerio y solidaridad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/ofrenda" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/ofrenda"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Ofrendá"
      italic="con alegría."
      intro="Cada ofrenda sostiene la obra: consejería, ministerio, solidaridad y la ayuda concreta a las familias que visitamos."
      chips={["Propósito", "Transparencia", "Obra de Dios"]}
      cta={{ href: "#ofrendar", label: "Ofrendar ahora" }}
    >
      <SectionShell id="ofrendar">
        <SectionHead
          kicker="Ofrendar"
          title="Elegí tu monto"
          italic="y cómo ofrendar."
          sub="Ofrendá lo que sientas en tu corazón. Podés hacerlo con Mercado Pago (tarjeta, cuotas, efectivo) o por transferencia."
        />
        <OfferingForm mpReady={isMpCheckoutReady()} />
      </SectionShell>

      <SectionShell className="border-t border-hairline">
        <SectionHead
          kicker="A dónde va"
          title="Tu ofrenda"
          italic="se convierte en obra."
          sub="No se pierde en un pozo: se transforma en acompañamiento y ayuda concreta."
        />
        <BulletGrid
          items={[
            { title: "Consejería", desc: "Sostener el acompañamiento a personas y familias." },
            { title: "Ministerio", desc: "Encuentros, materiales y logística de la obra." },
            { title: "Solidaridad", desc: "Visitas, alimentos y ayuda a familias que lo necesitan." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              Las ofrendas se registran de forma segura para su rendición. Si
              preferís coordinar de otra manera, escribinos y lo vemos juntos.
            </p>
          </Prose>
        </div>
      </SectionShell>
    </ContentPage>
  )
}
