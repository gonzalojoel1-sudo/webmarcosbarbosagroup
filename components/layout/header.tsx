"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useSpring } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { verticals } from "@/config/verticals"

export function Header() {
  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  })
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
    setOpenDropdown(null)
    setOpenAccordion(null)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null)
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const isActive = (slug: string) =>
    pathname === slug || pathname.startsWith(slug + "/")

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        className="absolute top-0 left-0 h-[2px] w-full bg-primary origin-left"
        style={{ scaleX: progress }}
        aria-hidden
      />
      <div
        className={`bg-white/60 dark:bg-[#0C0C0E]/70 backdrop-blur-[20px] backdrop-saturate-[1.8] border-b transition-colors duration-200 ${
          scrolled ? "border-hairline" : "border-transparent"
        }`}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            onClick={() => setOpen(false)}
          >
            <span className="w-8 h-8 rounded-lg border border-hairline bg-surface flex items-center justify-center font-display font-semibold text-[13px] tracking-wide text-fg">
              MB
            </span>
            <span className="text-sm font-medium tracking-tight text-fg">
              Marcos Barbosa
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Principal">
            {verticals.map((v) => {
              const active = isActive(v.slug)
              if (v.children.length === 0) {
                return (
                  <Link
                    key={v.id}
                    href={v.slug}
                    className={`text-sm transition-colors ${
                      active ? "text-primary" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    {v.label}
                  </Link>
                )
              }
              const ddOpen = openDropdown === v.id
              return (
                <div
                  key={v.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (closeTimer.current) clearTimeout(closeTimer.current)
                    setOpenDropdown(v.id)
                  }}
                  onMouseLeave={() => {
                    closeTimer.current = setTimeout(
                      () => setOpenDropdown((cur) => (cur === v.id ? null : cur)),
                      120
                    )
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={ddOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenDropdown((cur) => (cur === v.id ? null : v.id))}
                    className={`inline-flex items-center gap-1 text-sm transition-colors ${
                      active ? "text-primary" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    {v.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${ddOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {ddOpen ? (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[22rem]">
                      <div className="card-luxury rounded-2xl p-2 shadow-[0_24px_60px_-24px_rgba(12,12,14,0.35)]">
                        <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                          {v.title}
                        </p>
                        <ul className="py-1">
                          {v.children.map((c) => (
                            <li key={c.slug}>
                              <Link
                                href={c.slug}
                                className="block rounded-xl px-3 py-2 text-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={v.slug}
                          className="block rounded-xl px-3 py-2 text-sm font-medium text-primary hover:text-primary-hover"
                        >
                          Ver {v.label} →
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/contacto"
              className="btn-primary px-5 py-2 text-sm font-medium inline-flex items-center"
            >
              Agendar Reunión
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 -mr-2 text-fg"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden drawer-enter bg-white/95 dark:bg-[#0C0C0E]/95 backdrop-blur-[20px] border-b border-hairline max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 py-4">
            {verticals.map((v) => {
              const expanded = openAccordion === v.id
              return (
                <div key={v.id} className="border-b border-hairline last:border-b-0">
                  {v.children.length > 0 ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setOpenAccordion(expanded ? null : v.id)}
                        className="w-full flex items-center justify-between py-3 text-base text-fg"
                      >
                        <span className={isActive(v.slug) ? "text-primary" : ""}>
                          {v.title}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      </button>
                      {expanded ? (
                        <div className="pb-3 pl-2">
                          <Link
                            href={v.slug}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm font-medium text-primary"
                          >
                            Ver {v.label}
                          </Link>
                          {v.children.map((c) => (
                            <Link
                              key={c.slug}
                              href={c.slug}
                              onClick={() => setOpen(false)}
                              className="block py-2 text-sm text-fg-muted hover:text-fg"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <Link
                      href={v.slug}
                      onClick={() => setOpen(false)}
                      className="block py-3 text-base text-fg"
                    >
                      {v.title}
                    </Link>
                  )}
                </div>
              )
            })}
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="mt-5 btn-primary px-5 py-3 text-center text-sm font-medium block"
            >
              Agendar Reunión
            </Link>
            <div className="mt-4 pt-4 border-t border-hairline flex flex-col gap-2 text-sm text-fg-muted">
              <a
                href="https://wa.me/5493517334040"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg"
              >
                WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="hover:text-fg break-all"
              >
                consultora.marcosbarbosa@gmail.com
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
