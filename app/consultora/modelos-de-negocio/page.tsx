import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Modelos de Negocio | Consultora — Marcos Barbosa Group",
  description:
    "Diseño y rediseño de modelos de negocio que sostienen el crecimiento: propuesta, márgenes, canales y escalabilidad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/modelos-de-negocio" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/modelos-de-negocio"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="El modelo"
      italic="antes que la táctica."
      intro="Si el modelo no cierra, ninguna campaña lo salva. Diseñamos y rediseñamos la forma en que tu empresa genera y captura valor."
      chips={["Propuesta de valor", "Márgenes", "Escalabilidad"]}
      cta={{ href: "/contacto", label: "Revisar mi modelo" }}
    >
      <SectionShell>
        <SectionHead kicker="Qué trabajamos" title="Las piezas que" italic="hacen sostenible el crecimiento." />
        <BulletGrid
          items={[
            { title: "Propuesta de valor", desc: "Qué ofrecés, a quién y por qué te eligen." },
            { title: "Márgenes y precios", desc: "Estructura de costos y política de precios sana." },
            { title: "Canales y demanda", desc: "Cómo llegás al cliente y cómo lo retenés." },
            { title: "Escalabilidad", desc: "Qué limita crecer sin caos y cómo destrabarlo." },
            { title: "Ingresos recurrentes", desc: "De ventas sueltas a flujo previsible." },
            { title: "Riesgos", desc: "Dependencias peligrosas y cómo reducirlas." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              El modelo se revisa con números sobre la mesa, no con supuestos.
              Salís con las decisiones priorizadas y un plan para sostenerlas.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Tu modelo aguanta el próximo salto?" sub="Lo miramos juntos en el Diagnóstico." label="Agendar Reunión" />
    </ContentPage>
  )
}
