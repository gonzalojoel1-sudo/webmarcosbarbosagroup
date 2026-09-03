"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
      const h = document.documentElement
      const scrolledPx = h.scrollTop
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? scrolledPx / max : 0)
    }
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
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-white/90 backdrop-blur-md border-b border-line shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* progress bar #fe4100 */}
      <div
        className="absolute top-0 left-0 h-[2px] w-full bg-primary origin-left"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          MARCOS BARBOSA
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink">
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
        <div className="hidden md:block">
          <Link
            href="/contacto"
            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#e03a00] transition-colors inline-flex items-center"
          >
            Agendar Reunión
          </Link>
        </div>
        <button
          className="md:hidden p-2 -mr-2 text-ink"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {/* mobile drawer */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-line shadow-lg">
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
              className="mt-4 bg-primary text-white px-5 py-3 rounded-full text-center text-sm font-medium hover:bg-[#e03a00] transition-colors"
            >
              Agendar Reunión
            </Link>
            <div className="mt-4 pt-4 border-t border-line flex flex-col gap-2 text-sm text-muted">
              <a
                href="https://wa.me/5493517334040"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="hover:text-ink break-all"
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
