import type { ReactNode } from "react"
import type { Vertical } from "@/config/verticals"
import { PageHero } from "./page-hero"
import { SubNav } from "./sub-nav"
import { SectionShell } from "./section-shell"
import { VerticalCard } from "./vertical-card"

export function VerticalLanding({
  vertical,
  title,
  italic,
  intro,
  chips,
  children,
}: {
  vertical: Vertical
  title: string
  italic?: string
  intro: string
  chips?: string[]
  children?: ReactNode
}) {
  return (
    <main>
      <PageHero
        eyebrow={vertical.title}
        title={title}
        italic={italic}
        intro={intro}
        chips={chips}
        primary={{ href: "/contacto", label: "Agendar Reunión" }}
      />
      {vertical.children.length > 0 ? <SubNav items={vertical.children} /> : null}
      {vertical.children.length > 0 ? (
        <SectionShell>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vertical.children.map((c) => (
              <VerticalCard
                key={c.slug}
                title={c.label}
                description={c.description}
                href={c.slug}
                icon={vertical.icon}
              />
            ))}
          </div>
        </SectionShell>
      ) : null}
      {children}
    </main>
  )
}
