import { verticals } from "@/config/verticals"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead } from "@/components/site/blocks"
import { VerticalCard } from "@/components/site/vertical-card"

export function VerticalsGrid() {
  const featured = verticals.find((v) => v.featured) ?? verticals[0]
  const rest = verticals.filter((v) => v.id !== featured.id)

  return (
    <SectionShell id="secciones" className="border-t border-hairline">
      <SectionHead
        kicker="Las 7 verticales"
        title="Un grupo."
        italic="Siete frentes."
        sub="Cada vertical resuelve algo distinto. Entrá a la que necesitás hoy."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="sm:col-span-2">
          <VerticalCard
            title={featured.title}
            description={featured.description}
            href={featured.slug}
            icon={featured.icon}
            large
          />
        </div>
        {rest.map((v) => (
          <VerticalCard
            key={v.id}
            title={v.title}
            description={v.description}
            href={v.slug}
            icon={v.icon}
          />
        ))}
      </div>
    </SectionShell>
  )
}
