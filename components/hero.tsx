"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="bg-paper pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7"
        >
          <p className="text-xs tracking-[0.2em] text-muted mb-4">
            CONSULTORÍA ESTRATÉGICA INTERNACIONAL
          </p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[0.9] text-ink">
            Estrategia
            <span className="underline decoration-primary decoration-4 underline-offset-4">
              , liderazgo
            </span>{" "}
            y tecnología para trascender
          </h1>
          <p className="mt-6 text-muted max-w-xl leading-relaxed">
            Transformamos empresarios en líderes, negocios en empresas y empresas
            en organizaciones listas para crecer y automatizarse.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="bg-primary text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-[#e03a00] transition-colors inline-flex items-center"
            >
              Agendar Reunión Estratégica
            </Link>
            <Link
              href="/planes"
              className="border border-line bg-white/60 px-7 py-3 rounded-full text-sm font-medium text-ink hover:bg-white hover:border-ink/20 transition-colors inline-flex items-center"
            >
              Ver Planes
            </Link>
          </div>
          <div className="mt-8 flex gap-6 text-sm text-ink">
            <span>
              <b className="font-semibold">15+</b> <span className="text-muted">años</span>
            </span>
            <span>
              <b className="font-semibold">4</b> <span className="text-muted">planes</span>
            </span>
            <span className="text-muted">Internacional</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-paper-2">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa"
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 ring-2 ring-primary/20 rounded-2xl pointer-events-none" />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white border border-line rounded-xl px-4 py-3 shadow-sm text-xs">
            <p className="font-semibold text-ink">Marcos Barbosa</p>
            <p className="text-muted">Fuerzas Especiales → Consultor</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
