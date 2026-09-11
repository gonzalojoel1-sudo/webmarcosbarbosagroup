"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { VerticalChild } from "@/config/verticals"

export function SubNav({ items }: { items: VerticalChild[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Secciones" className="border-b border-hairline bg-bg">
      <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto scroll-snap-x">
        {items.map((c) => {
          const active = pathname === c.slug
          return (
            <Link
              key={c.slug}
              href={c.slug}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 px-4 py-4 text-sm border-b-2 transition-colors ${
                active
                  ? "border-primary text-fg"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              {c.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
