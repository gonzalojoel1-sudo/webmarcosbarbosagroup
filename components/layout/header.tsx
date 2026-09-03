"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 10))

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-surface/90 backdrop-blur-md border-b border-line shadow-sm shadow-black/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* progress bar #fe4100 */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] w-full bg-primary origin-left"
        style={{ scaleX: progress }}
        aria-hidden
      />
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-foreground"
          onClick={() => setOpen(false)}
        >
          MARCOS BARBOSA
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground">
          <Link
            href="/metodologia"
            className="hover:text-primary transition-colors"
          >
            Metodología
          </Link>
          <Link href="/planes" className="hover:text-primary transition-colors">
            Planes
          </Link>
          <Link
            href="/sobre-marcos"
            className="hover:text-primary transition-colors"
          >
            Sobre Marcos
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/contacto"
            className="bg-primary text-primary-fg px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors inline-flex items-center"
          >
            Agendar Reunión
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
        <div className="md:hidden absolute top-16 left-0 w-full bg-surface border-b border-line shadow-lg">
          <div className="px-6 py-6 flex flex-col gap-1">
            <Link
              href="/metodologia"
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium border-b border-line/60 hover:text-primary"
            >
              Metodología
            </Link>
            <Link
              href="/planes"
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium border-b border-line/60 hover:text-primary"
            >
              Planes
            </Link>
            <Link
              href="/sobre-marcos"
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium border-b border-line/60 hover:text-primary"
            >
              Sobre Marcos
            </Link>
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="mt-4 bg-primary text-primary-fg px-5 py-3 rounded-full text-center text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Agendar Reunión
            </Link>
            <div className="mt-4 pt-4 border-t border-line flex flex-col gap-2 text-sm text-muted">
              <a
                href="https://wa.me/5493517334040"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="hover:text-foreground break-all"
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
