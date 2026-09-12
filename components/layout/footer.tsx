import Link from "next/link"
import { verticals, getVertical } from "@/config/verticals"
import { Logo } from "@/components/logo"

export function Footer() {
  const consultora = getVertical("consultora")

  return (
    <footer className="bg-[#0C0C0E] text-[#F2F0EB]/80 border-t border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={32} />
              <p className="text-sm font-semibold text-[#F2F0EB]">
                Marcos Barbosa Group
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#F2F0EB]/60">
              Fe, estrategia, servicio y tecnología. Siete frentes, una sola
              visión: que las personas y las empresas crezcan de verdad.
            </p>
            <Link
              href="/contacto"
              className="mt-6 inline-flex btn-primary px-5 py-2.5 text-sm font-medium"
            >
              Agendar Reunión
            </Link>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/50 mb-4">
              Verticales
            </p>
            <ul className="space-y-2.5 text-sm">
              {verticals.map((v) => (
                <li key={v.id}>
                  <Link
                    href={v.slug}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {v.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/50 mb-4">
              {consultora?.title ?? "Consultora"}
            </p>
            <ul className="space-y-2.5 text-sm">
              {consultora?.children.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.slug}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/50 mb-4">
              Contacto
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://wa.me/5493517334040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200"
                >
                  WhatsApp +54 9 351 733 4040
                </a>
              </li>
              <li>
                <a
                  href="mailto:consultora.marcosbarbosa@gmail.com"
                  className="hover:text-primary transition-colors duration-200 break-all"
                >
                  consultora.marcosbarbosa@gmail.com
                </a>
              </li>
              <li className="text-[#F2F0EB]/50">Córdoba, Argentina</li>
              <li>
                <Link
                  href="/sobre-marcos"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Sobre Marcos
                </Link>
              </li>
              <li className="flex gap-3 pt-1">
                <Link href="/privacidad" className="hover:text-primary transition-colors duration-200">
                  Privacidad
                </Link>
                <span className="text-[#F2F0EB]/30" aria-hidden>
                  ·
                </span>
                <Link href="/terminos" className="hover:text-primary transition-colors duration-200">
                  Términos
                </Link>
              </li>
              <li className="flex gap-3 pt-2 text-[#F2F0EB]/60">
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  LinkedIn
                </a>
                <span className="text-[#F2F0EB]/30" aria-hidden>
                  ·
                </span>
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  Instagram
                </a>
                <span className="text-[#F2F0EB]/30" aria-hidden>
                  ·
                </span>
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#F2F0EB]/60">
          <p>
            © {new Date().getFullYear()} Marcos Barbosa Group. Todos los derechos
            reservados.
          </p>
          <p>Córdoba · Internacional</p>
          <p className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" aria-hidden />
            Todos los sistemas operativos
          </p>
        </div>
      </div>
    </footer>
  )
}
