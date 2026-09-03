import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.08] text-zinc-500 text-xs font-mono-tech">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-zinc-900 border border-white/10 flex items-center justify-center font-serif-brand font-bold text-white text-[10px]">
                MB
              </span>
              <p className="text-zinc-300 font-sans font-bold">MARCOS BARBOSA GROUP</p>
            </div>
            <p className="mt-4 leading-relaxed text-zinc-500">
              Consultoría Estratégica Internacional. Estrategia, liderazgo y tecnología para
              empresas que buscan trascender.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-4">
              Navegación
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/metodologia" className="hover:text-white transition-colors">
                  Metodología
                </Link>
              </li>
              <li>
                <Link href="/planes" className="hover:text-white transition-colors">
                  Planes
                </Link>
              </li>
              <li>
                <Link href="/sobre-marcos" className="hover:text-white transition-colors">
                  Sobre Marcos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-4">
              Contacto
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://wa.me/5493517334040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp +54 9 351 733 4040
                </a>
              </li>
              <li>
                <a
                  href="mailto:consultora.marcosbarbosa@gmail.com"
                  className="hover:text-white transition-colors break-all"
                >
                  consultora.marcosbarbosa@gmail.com
                </a>
              </li>
              <li className="text-zinc-600">Córdoba, Argentina</li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-4">Redes</p>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
            <Link
              href="/contacto"
              className="mt-6 inline-flex btn-high-ticket px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Agendar Reunión
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Marcos Barbosa Group. Todos los derechos reservados.</p>
          <p className="text-zinc-600">Córdoba · Internacional</p>
          <p className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" aria-hidden />
            Todos los sistemas operativos
          </p>
        </div>
      </div>
    </footer>
  )
}
