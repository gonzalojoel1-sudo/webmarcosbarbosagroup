import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Rompiendo Barreras — Formación Integral | Formate con Nosotros",
  description: "Rompiendo Barreras: formación integral en hábitos, mentalidad, liderazgo y propósito.",
  alternates: { canonical: "https://marcosbarbosagroup.com/formate/rompiendo-barreras" },
}

export default function Page() {
  const vertical = getVertical("formate")!
  const child = vertical.children.find((c) => c.slug.endsWith("/rompiendo-barreras"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Rompiendo"
      italic="Barreras."
      intro="Una formación integral para romper los límites que te frenan: hábitos, mentalidad, liderazgo y propósito, con trabajo práctico."
      chips={["Hábitos", "Mentalidad", "Liderazgo", "Propósito"]}
      cta={{ href: "/contacto", label: "Quiero anotarme" }}
    >
      <SectionShell>
        <SectionHead kicker="Qué trabajás" title="Las barreras" italic="que se rompen." />
        <BulletGrid
          items={[
            { title: "Mentalidad", desc: "Cambiar la forma de mirar los problemas." },
            { title: "Hábitos", desc: "Rutinas que sostienen el cambio en el tiempo." },
            { title: "Liderazgo", desc: "Conducirte y conducir a otros con propósito." },
            { title: "Propósito", desc: "Claridad sobre hacia dónde vas y por qué." },
            { title: "Comunicación", desc: "Expresarte con claridad y seguridad." },
            { title: "Acción", desc: "Pasar de la idea al hecho, con método." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Duración, modalidad y dinámica de la formación se definen
              con el equipo. Escribinos para conocer la próxima camada.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Listo para romper tus barreras?" sub="Sumate a la próxima formación." label="Quiero anotarme" />
    </ContentPage>
  )
}
