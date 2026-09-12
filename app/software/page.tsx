import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { PageHero } from "@/components/site/page-hero"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Software a Medida para Empresas | Marcos Barbosa Group",
  description:
    "Software a medida: webs, sistemas, CRMs, tableros y automatizaciones que se adaptan a tu operación.",
  alternates: { canonical: "https://marcosbarbosagroup.com/software" },
  openGraph: {
    title: "Software a Medida para Empresas | Marcos Barbosa Group",
    description: "Webs, sistemas, CRMs, tableros y automatizaciones hechas a medida.",
    url: "https://marcosbarbosagroup.com/software",
    type: "website",
    siteName: "Marcos Barbosa Group",
    locale: "es_AR",
    images: [{ url: "https://marcosbarbosagroup.com/images/marcos-hero.jpg", width: 1200, height: 630, alt: "Marcos Barbosa Group" }],
  },
}

export default function Page() {
  const vertical = getVertical("software")!
  return (
    <main>
      <PageHero
        eyebrow={vertical.title}
        title="Software que se adapta"
        italic="a tu empresa."
        intro="No adaptes tu operación a un sistema genérico. Construimos el software que tu negocio necesita: webs, sistemas internos, CRMs, tableros y automatizaciones."
        chips={["A medida", "Web y sistemas", "Automatización"]}
        primary={{ href: "/contacto", label: "Contar mi proyecto" }}
      />
      <SectionShell>
        <SectionHead
          kicker="Qué construimos"
          title="Herramientas"
          italic="que se usan de verdad."
          sub="Del relevamiento a la entrega, pensado para tu forma de trabajar."
        />
        <BulletGrid
          items={[
            { title: "Webs y plataformas", desc: "Sitios y aplicaciones hechas para tu negocio." },
            { title: "Sistemas internos", desc: "Gestión, stock, ventas y procesos a medida." },
            { title: "CRMs y tableros", desc: "Datos ordenados para decidir con claridad." },
            { title: "Automatizaciones", desc: "Tareas repetitivas que corren solas." },
            { title: "Integraciones", desc: "Tus herramientas conectadas entre sí." },
            { title: "Soporte y evolución", desc: "El sistema crece junto con la empresa." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              Trabajamos por etapas: primero entendemos el proceso, después
              construimos y medimos. Sin cajas negras ni dependencia de un
              proveedor que no explica lo que hace.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Tenés un proceso que pide sistema?" sub="Contanos y te decimos cómo lo resolvemos." label="Contar mi proyecto" />
    </main>
  )
}
