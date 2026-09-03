"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ShieldCheck, TrendingUp } from "lucide-react"

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
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 px-6">
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 space-y-8"
        >
          <motion.p
            variants={item}
            className="font-mono-tech text-xs tracking-widest text-primary uppercase font-semibold"
          >
            [ CONSULTORÍA ESTRATÉGICA INTERNACIONAL ]
          </motion.p>
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-foreground text-balance"
          >
            Estrategia, liderazgo y tecnología para{" "}
            <span className="text-gradient-accent">trascender</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="text-muted max-w-xl leading-relaxed font-light text-base sm:text-lg"
          >
            Transformamos empresarios en líderes, negocios en empresas y empresas
            en organizaciones listas para crecer y automatizarse.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Link
              href="/contacto"
              className="btn-high-ticket px-8 py-4 rounded-xl font-bold text-sm tracking-wide inline-flex items-center"
            >
              Agendar Reunión Estratégica
            </Link>
            <Link
              href="/planes"
              className="btn-ghost-lux px-7 py-4 rounded-xl font-semibold text-sm tracking-wide inline-flex items-center"
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
          {/* glow ambiental del retrato */}
          <div
            aria-hidden
            className="absolute -inset-4 bg-gradient-to-tr from-primary/25 to-transparent rounded-3xl blur-2xl -z-10 opacity-70"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line dark:border-white/[0.12] bg-[#09090C] shadow-2xl shadow-black/10 dark:shadow-black/60">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa — Consultor de Líderes y Negocios"
              fill
              priority
              className="object-cover object-top hover:scale-105 transition-transform duration-700 dark:mix-blend-luminosity dark:opacity-85"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
            {/* fade inferior hacia el fondo (solo dark) */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#040405] via-transparent to-transparent opacity-0 dark:opacity-100 pointer-events-none"
            />
          </div>
          {/* badges glass flotantes */}
          <div className="absolute top-6 right-6 glass-nav rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold text-foreground leading-tight">
                Marcos Barbosa
              </span>
              <span className="block text-[9px] font-mono-tech text-muted">
                Fuerzas Especiales → Consultor
              </span>
            </span>
          </div>
          <div className="absolute bottom-6 -left-3 glass-nav rounded-2xl px-4 py-2.5 shadow-xl items-center gap-3 hidden sm:flex">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold text-foreground leading-tight">
                Consultoría Estratégica
              </span>
              <span className="block text-[9px] font-mono-tech text-muted">Internacional</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
