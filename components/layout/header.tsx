"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useSpring } from "framer-motion"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV_LINKS = [
  { href: "/metodologia", label: "Metodología" },
  { href: "/planes", label: "Planes" },
  { href: "/sobre-marcos", label: "Sobre Marcos" },
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* progreso de scroll */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] w-full bg-primary origin-left"
        style={{ scaleX: progress }}
        aria-hidden
      />
      <div
        className={`bg-white/60 dark:bg-[#0C0C0E]/70 backdrop-blur-[20px] backdrop-saturate-[1.8] border-b transition-colors duration-200 ${
          scrolled ? "border-hairline" : "border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
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
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-fg-muted hover:text-fg transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/contacto"
              className="btn-primary px-5 py-2 text-sm font-medium inline-flex items-center"
            >
              Agendar Reunión
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
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
      {/* mobile drawer */}
      {open && (
        <div className="md:hidden drawer-enter bg-white/60 dark:bg-[#0C0C0E]/70 backdrop-blur-[20px] backdrop-saturate-[1.8] border-b border-hairline">
          <div className="px-6 py-6 flex flex-col">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-fg border-b border-hairline last:border-b-0 hover:text-primary transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="mt-4 btn-primary px-5 py-3 text-center text-sm font-medium"
            >
              Agendar Reunión
            </Link>
            <div className="mt-4 pt-4 border-t border-hairline flex flex-col gap-2 text-sm text-fg-muted">
              <a
                href="https://wa.me/5493517334040"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg transition-colors"
              >
                WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="hover:text-fg transition-colors break-all"
              >
                consultora.marcosbarbosa@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
