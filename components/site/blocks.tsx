import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SectionShell } from "./section-shell"

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-fg-muted leading-relaxed max-w-2xl [&_strong]:text-fg [&_strong]:font-medium">
      {children}
    </div>
  )
}

export function BulletGrid({
  items,
}: {
  items: { title: string; desc: string }[]
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.title} className="card-luxury rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden />
            <p className="text-sm font-semibold text-fg">{it.title}</p>
          </div>
          <p className="mt-2 text-sm text-fg-muted leading-relaxed">{it.desc}</p>
        </div>
      ))}
    </div>
  )
}

export function SectionHead({
  kicker,
  title,
  italic,
  sub,
}: {
  kicker?: string
  title: string
  italic?: string
  sub?: string
}) {
  return (
    <div className="max-w-2xl mb-10">
      {kicker ? (
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          {kicker}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight leading-tight text-fg">
        {title}
        {italic ? (
          <>
            {" "}
            <span className="italic text-primary">{italic}</span>
          </>
        ) : null}
      </h2>
      {sub ? <p className="mt-3 text-sm text-fg-muted leading-relaxed">{sub}</p> : null}
    </div>
  )
}

export function CtaBand({
  title,
  sub,
  href = "/contacto",
  label = "Agendar Reunión",
}: {
  title: string
  sub?: string
  href?: string
  label?: string
}) {
  return (
    <SectionShell>
      <div className="card-luxury card-accent rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl md:text-2xl tracking-tight text-fg">
            {title}
          </h3>
          {sub ? <p className="text-sm text-fg-muted mt-1.5">{sub}</p> : null}
        </div>
        <Link
          href={href}
          className="shrink-0 btn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
        >
          {label} <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </SectionShell>
  )
}
