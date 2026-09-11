import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Casos de Éxito | Consultora — Marcos Barbosa Group",
  description:
    "Empresas reales que ordenaron, ejecutaron y escalaron con la metodología 01—06.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/casos-de-exito" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/casos-de-exito"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Resultados,"
      italic="no powerpoints."
      intro="Lo que importa no es el plan: es lo que pasa en la empresa después. Estos son los frentes donde más se nota el método."
      chips={["Orden", "Ejecución", "Escalamiento"]}
      cta={{ href: "/contacto", label: "Quiero resultados así" }}
    >
      <SectionShell>
        <SectionHead kicker="Dónde se nota" title="Transformaciones" italic="concretas." />
        <BulletGrid
          items={[
            { title: "Orden y prioridades", desc: "Dueños que dejaron de apagar incendios y recuperaron foco." },
            { title: "Equipos que ejecutan", desc: "Roles, rituales y cultura que no dependen del dueño." },
            { title: "Escalamiento", desc: "Empresas que crecieron con sistema y gobierno, sin perder control." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Los casos nominales (empresa, rubro y métrica) se publican
              solo con autorización del cliente. Completar con los casos
              habilitados.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Tu empresa puede ser el próximo caso?" sub="Empezá por el Diagnóstico 01." label="Agendar Reunión" />
    </ContentPage>
  )
}
