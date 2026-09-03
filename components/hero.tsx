"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

const EASE = [0.23, 1, 0.32, 1] as const

const METRICS = [
  { value: "15+", label: "Años de experiencia" },
  { value: "4", label: "Frentes de intervención" },
  { value: "Internacional", label: "Latinoamérica y Europa" },
] as const

export function Hero() {
  const reduce = useReducedMotion()

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.05 } },
  }
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  }

  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-40 md:pb-28">
      {/* radial estático sutil detrás del lado de la foto */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[40rem] h-[40rem] translate-x-1/3 -translate-y-1/4"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--primary-rgb) / 0.06), transparent)",
        }}
      />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-7"
        >
          <motion.p
            variants={item}
            className="font-body text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            Consultoría Estratégica Internacional
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-fg text-balance"
          >
            Estrategia, liderazgo y tecnología para{" "}
            <span className="italic text-primary">trascender</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-fg-muted"
          >
            Transformamos empresarios en líderes, negocios en empresas y
            empresas en organizaciones listas para crecer y automatizarse.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="btn-primary px-7 py-3.5 text-sm font-medium inline-flex items-center"
            >
              Agendar Reunión Estratégica
            </Link>
            <Link
              href="/planes"
              className="btn-secondary px-7 py-3.5 text-sm font-medium inline-flex items-center"
            >
              Ver Planes
            </Link>
          </motion.div>
          <motion.div
            variants={item}
            className="mt-12 pt-8 border-t border-hairline flex flex-wrap gap-x-12 gap-y-6"
          >
            {METRICS.map((m) => (
              <div key={m.label}>
                <p className="font-display text-2xl sm:text-3xl tracking-tight leading-none text-fg">
                  {m.value}
                </p>
                <p className="mt-1.5 text-xs text-fg-muted">{m.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: EASE }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_24px_60px_-24px_rgba(12,12,14,0.35)]">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa — Consultor de Líderes y Negocios"
              fill
              priority
              className="photo-bw object-cover object-top"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
          </div>
          <div className="mt-4 flex justify-center lg:justify-start">
            <span className="inline-flex items-center rounded-full border border-hairline bg-surface px-4 py-1.5 text-xs text-fg-muted">
              Marcos Barbosa · Fuerzas Especiales → Consultor
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
