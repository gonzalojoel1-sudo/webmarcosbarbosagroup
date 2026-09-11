import type { Metadata } from "next"
import Link from "next/link"
import { getVertical } from "@/config/verticals"
import { PageHero } from "@/components/site/page-hero"
import { SubNav } from "@/components/site/sub-nav"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, CtaBand } from "@/components/site/blocks"
import { ShieldCheck, Camera, Lock, SearchCheck, Building2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Seguridad — Física, Electrónica, Ciber y Auditoría | Servicios",
  description:
    "Seguridad física (guardias y custodia), electrónica (cámaras), ciberseguridad (monitoreo) y auditoría. Sobre nosotros: habilitaciones y trayectoria.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad" },
}

const areas = [
  { label: "Seguridad Física", desc: "Guardias, custodia y control de accesos.", href: "/servicios/seguridad/fisica", icon: ShieldCheck },
  { label: "Seguridad Electrónica", desc: "Instalación de cámaras y sistemas de alarma.", href: "/servicios/seguridad/electronica", icon: Camera },
  { label: "Ciberseguridad", desc: "Monitoreo y protección de tus sistemas.", href: "/servicios/seguridad/ciberseguridad", icon: Lock },
  { label: "Auditoría", desc: "Diagnóstico de vulnerabilidades y riesgos.", href: "/servicios/seguridad/auditoria", icon: SearchCheck },
  { label: "Sobre Nosotros", desc: "Habilitaciones, documentación, historia y visión.", href: "/servicios/seguridad/nosotros", icon: Building2 },
] as const

export default function Page() {
  const vertical = getVertical("servicios")!
  return (
    <main>
      <PageHero
        eyebrow="Servicios / Seguridad"
        title="Seguridad"
        italic="integral."
        intro="Una sola división cubre lo físico, lo electrónico, lo digital y la auditoría. Menos proveedores, más control."
        chips={["Guardias", "Cámaras", "Monitoreo", "Auditoría"]}
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/servicios" },
          { label: "Seguridad" },
        ]}
        primary={{ href: "/contacto", label: "Solicitar cobertura" }}
      />
      <SubNav items={vertical.children} />
      <SectionShell>
        <SectionHead kicker="Áreas" title="Cuatro frentes de" italic="seguridad." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(({ label, desc, href, icon: Icon }) => (
            <Link key={href} href={href} className="card-luxury rounded-2xl p-6 group flex flex-col">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl tracking-tight text-fg">{label}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás cubrir un objetivo?" sub="Contanos qué hay que proteger y armamos el esquema." label="Solicitar cobertura" />
    </main>
  )
}
