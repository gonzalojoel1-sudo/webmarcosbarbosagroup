import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Recursos para tu Empresa — Libros, Archivos y Automatizaciones | Consultora",
  description:
    "Comprá recursos para tu empresa: libros, archivos y automatizaciones listas para usar.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/recursos" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/recursos"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Recursos para"
      italic="pasar a la acción."
      intro="Materiales seleccionados para que tu equipo no arranque de cero: libros, archivos y automatizaciones listas para usar."
      chips={["Libros", "Archivos", "Automatizaciones"]}
      cta={{ href: "/contacto", label: "Quiero ver los recursos" }}
    >
      <SectionShell>
        <SectionHead kicker="Qué incluye" title="Para leer," italic="para bajar y para automatizar." />
        <BulletGrid
          items={[
            { title: "Libros", desc: "Selección de lectura sobre estrategia, liderazgo y gestión." },
            { title: "Archivos", desc: "Plantillas, tableros y documentos listos para usar." },
            { title: "Automatizaciones", desc: "Procesos y flujos automatizados para tu operación." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] El catálogo y su forma de compra (tienda online / link de
              pago) se definen en la próxima fase. Por ahora escribinos y te
              contamos qué recursos están disponibles.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Buscás un recurso puntual?" sub="Escribinos y te decimos qué hay disponible." label="Consultar recursos" />
    </ContentPage>
  )
}
