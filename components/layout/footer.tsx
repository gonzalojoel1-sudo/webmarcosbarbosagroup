import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <p className="font-display text-xl leading-none tracking-tight">MARCOS BARBOSA</p>
            <p className="text-xs tracking-[0.2em] text-white/60 mt-1">GROUP</p>
            <p className="text-sm text-white/60 mt-4 leading-relaxed">
              Consultoría Estratégica Internacional. Estrategia, liderazgo y tecnología para
              empresas que buscan trascender.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-4">Navegación</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/metodologia" className="hover:text-primary transition-colors">
                  Metodología
                </Link>
              </li>
              <li>
                <Link href="/planes" className="hover:text-primary transition-colors">
                  Planes
                </Link>
              </li>
              <li>
                <Link href="/sobre-marcos" className="hover:text-primary transition-colors">
                  Sobre Marcos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-4">Contacto</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a
                  href="https://wa.me/5493517334040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp +54 9 351 733 4040
                </a>
              </li>
              <li>
                <a
                  href="mailto:consultora.marcosbarbosa@gmail.com"
                  className="hover:text-primary transition-colors break-all"
                >
                  consultora.marcosbarbosa@gmail.com
                </a>
              </li>
              <li className="text-white/50">Córdoba, Argentina</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-4">Redes</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
            <Link
              href="/contacto"
              className="mt-6 inline-flex bg-primary hover:bg-primary-hover text-primary-fg px-5 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Agendar Reunión
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Marcos Barbosa Group. Todos los derechos reservados.</p>
          <p>Córdoba · Internacional</p>
        </div>
      </div>
    </footer>
  )
}
