import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#0C0C0E] text-[#F2F0EB]/80 border-t border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center font-display font-semibold text-[13px] tracking-wide text-[#F2F0EB]">
                MB
              </span>
              <p className="text-sm font-semibold text-[#F2F0EB]">
                Marcos Barbosa Group
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#F2F0EB]/60">
              Consultoría Estratégica Internacional. Estrategia, liderazgo y
              tecnología para empresas que buscan trascender.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/40 mb-4">
              Navegación
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/metodologia" className="hover:text-primary transition-colors duration-200">
                  Metodología
                </Link>
              </li>
              <li>
                <Link href="/planes" className="hover:text-primary transition-colors duration-200">
                  Planes
                </Link>
              </li>
              <li>
                <Link href="/sobre-marcos" className="hover:text-primary transition-colors duration-200">
                  Sobre Marcos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-primary transition-colors duration-200">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/40 mb-4">
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
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/40 mb-4">
              Redes
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  YouTube
                </a>
              </li>
            </ul>
            <Link
              href="/contacto"
              className="mt-6 inline-flex btn-primary px-5 py-2.5 text-sm font-medium"
            >
              Agendar Reunión
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#F2F0EB]/60">
          <p>© {new Date().getFullYear()} Marcos Barbosa Group. Todos los derechos reservados.</p>
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
