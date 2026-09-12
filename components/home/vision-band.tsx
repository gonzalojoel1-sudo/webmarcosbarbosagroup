import { SectionShell } from "@/components/site/section-shell"

export function VisionBand() {
  return (
    <SectionShell className="bg-surface border-t border-hairline">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            Una visión, siete frentes
          </p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl tracking-tight leading-tight text-fg">
            Lo que nos une es más fuerte
            <br />
            <span className="italic text-primary">que lo que nos separa.</span>
          </h2>
        </div>
        <div className="lg:col-span-5">
          <blockquote className="border-l-2 border-primary pl-5 py-1 font-display italic text-xl md:text-2xl tracking-tight text-fg leading-snug">
            &ldquo;Un hombre y una empresa crecen cuando se ordenan por dentro y
            sirven por fuera. Eso conecta la fe, el negocio y el servicio: son
            la misma persona.&rdquo;
            <footer className="mt-3 not-italic font-body text-[11px] tracking-[0.18em] text-fg-muted uppercase">
              — Marcos Barbosa · Fundador
            </footer>
          </blockquote>
        </div>
      </div>
    </SectionShell>
  )
}
