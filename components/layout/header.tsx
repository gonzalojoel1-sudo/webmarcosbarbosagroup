"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useSpring } from "framer-motion"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV_LINKS = [
  { href: "/metodologia", label: "Metodología" },
  { href: "/planes", label: "Planes" },
  { href: "/sobre-marcos", label: "Sobre Marcos" },
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header className="fixed top-5 inset-x-0 z-50 px-4">
      <nav className="relative max-w-6xl mx-auto glass-nav rounded-full px-6 py-3 flex items-center justify-between shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/80 overflow-hidden">
        {/* progress bar #fe4100 */}
        <motion.div
          className="absolute top-0 left-0 h-[2px] w-full bg-primary origin-left"
          style={{ scaleX: progress }}
          aria-hidden
        />
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={() => setOpen(false)}
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/15 flex items-center justify-center font-serif-brand font-bold text-sm tracking-wider text-white group-hover:border-primary/60 transition-colors">
            MB
          </span>
          <span className="font-bold tracking-tight text-sm text-foreground group-hover:text-muted transition-colors">
            MARCOS BARBOSA
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide uppercase text-muted">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-foreground transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/contacto"
            className="btn-high-ticket px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            Agendar Reunión <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 -mr-2 text-foreground"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      {/* mobile drawer */}
      {open && (
        <div className="md:hidden absolute top-[calc(100%+8px)] left-4 right-4 glass-nav rounded-2xl shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/80">
          <div className="px-6 py-6 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium uppercase tracking-wide border-b border-line/60 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="mt-4 btn-high-ticket px-5 py-3 rounded-full text-center text-xs font-bold uppercase tracking-wider"
            >
              Agendar Reunión
            </Link>
            <div className="mt-4 pt-4 border-t border-line flex flex-col gap-2 text-xs font-mono-tech text-muted">
              <a
                href="https://wa.me/5493517334040"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="hover:text-foreground transition-colors break-all"
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
