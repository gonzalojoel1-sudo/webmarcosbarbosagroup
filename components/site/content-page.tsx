import type { ReactNode } from "react"
import type { Vertical, VerticalChild } from "@/config/verticals"
import { PageHero } from "./page-hero"

export function ContentPage({
  vertical,
  child,
  eyebrow,
  title,
  italic,
  intro,
  chips,
  cta,
  breadcrumb,
  children,
}: {
  vertical: Vertical
  child: VerticalChild
  eyebrow?: string
  title: string
  italic?: string
  intro: string
  chips?: string[]
  cta?: { href: string; label: string }
  breadcrumb?: { label: string; href?: string }[]
  children: ReactNode
}) {
  return (
    <main>
      <PageHero
        eyebrow={eyebrow ?? vertical.title}
        title={title}
        italic={italic}
        intro={intro}
        chips={chips}
        breadcrumb={
          breadcrumb ?? [
            { label: "Inicio", href: "/" },
            { label: vertical.label, href: vertical.slug },
            { label: child.label },
          ]
        }
        primary={cta}
      />
      {children}
    </main>
  )
}
