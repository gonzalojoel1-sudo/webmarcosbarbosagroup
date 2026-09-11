import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"

export function VerticalCard({
  title,
  description,
  href,
  icon: Icon,
  large = false,
}: {
  title: string
  description: string
  href: string
  icon: LucideIcon
  large?: boolean
}) {
  return (
    <Link
      href={href}
      className={`card-luxury rounded-2xl ${large ? "p-8 md:p-10" : "p-7"} group flex flex-col h-full`}
    >
      <span className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden />
      </span>
      <h3
        className={`mt-6 font-display tracking-tight text-fg ${
          large ? "text-2xl md:text-3xl" : "text-xl"
        }`}
      >
        {title}
      </h3>
      <p className="mt-2 text-fg-muted text-sm leading-relaxed">{description}</p>
      <span className="mt-auto pt-6 flex items-center gap-1.5 text-xs font-semibold text-fg-muted group-hover:text-primary transition-colors">
        <span className="h-px w-6 bg-primary" aria-hidden />
        Entrar
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
          aria-hidden
        />
      </span>
    </Link>
  )
}
