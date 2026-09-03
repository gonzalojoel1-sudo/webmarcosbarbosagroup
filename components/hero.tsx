"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const reduce = useReducedMotion()

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 } },
  }
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  }

  return (
    <section className="relative overflow-hidden bg-paper pt-24 pb-16 md:pb-20">
      {/* gradient mesh sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42rem 30rem at 85% -10%, rgb(var(--primary-rgb) / 0.10), transparent 65%), radial-gradient(30rem 24rem at -10% 110%, rgb(var(--primary-rgb) / 0.06), transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-7"
        >
          <motion.p
            variants={item}
            className="text-xs tracking-[0.2em] text-muted mb-5"
          >
            CONSULTORÍA ESTRATÉGICA INTERNACIONAL
          </motion.p>
          <motion.h1
            variants={item}
            className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[0.95] text-foreground text-balance"
          >
            Estrategia
            <span className="underline decoration-primary decoration-[3px] underline-offset-[6px]">
              , liderazgo
            </span>{" "}
            y tecnología para trascender
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 text-muted max-w-xl leading-relaxed text-base md:text-lg"
          >
            Transformamos empresarios en líderes, negocios en empresas y empresas
            en organizaciones listas para crecer y automatizarse.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="bg-primary text-primary-fg px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors inline-flex items-center"
            >
              Agendar Reunión Estratégica
            </Link>
            <Link
              href="/planes"
              className="border border-line bg-surface/70 px-7 py-3.5 rounded-full text-sm font-semibold text-foreground hover:bg-surface hover:border-foreground/25 transition-colors inline-flex items-center backdrop-blur-sm"
            >
              Ver Planes
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line shadow-xl shadow-black/10">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa — Consultor de Líderes y Negocios"
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
            <div
              className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none"
              aria-hidden
            />
          </div>
          {/* badge glass */}
          <div className="absolute -bottom-4 left-4 md:-left-4 bg-surface/75 border border-line rounded-xl px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-md text-xs">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Marcos Barbosa
            </p>
            <p className="text-muted mt-0.5">Fuerzas Especiales → Consultor</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
