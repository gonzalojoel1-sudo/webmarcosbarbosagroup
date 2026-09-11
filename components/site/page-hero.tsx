import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Breadcrumb } from "./breadcrumb"

type CTA = { href: string; label: string }

export function PageHero({
  eyebrow,
  title,
  italic,
  intro,
  chips,
  primary,
  secondary,
  breadcrumb,
}: {
  eyebrow: string
  title: string
  italic?: string
  intro: string
  chips?: string[]
  primary?: CTA
  secondary?: CTA
  breadcrumb?: { label: string; href?: string }[]
}) {
  return (
    <section className="pt-32 md:pt-40 pb-12 border-b border-hairline bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted mt-4">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-fg max-w-3xl">
          {title}
          {italic ? (
            <>
              <br />
              <span className="italic text-primary">{italic}</span>
            </>
          ) : null}
        </h1>
        <p className="mt-5 text-fg-muted max-w-2xl leading-relaxed">{intro}</p>
        {chips && chips.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {chips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-fg"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
        {primary || secondary ? (
          <div className="mt-8 flex flex-wrap gap-4">
            {primary ? (
              <Link
                href={primary.href}
                className="btn-primary px-6 py-3 text-sm font-medium tracking-wide inline-flex items-center gap-2"
              >
                {primary.label} <ArrowRight size={16} aria-hidden />
              </Link>
            ) : null}
            {secondary ? (
              <Link
                href={secondary.href}
                className="btn-secondary px-6 py-3 text-sm font-medium tracking-wide inline-flex items-center gap-2"
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
