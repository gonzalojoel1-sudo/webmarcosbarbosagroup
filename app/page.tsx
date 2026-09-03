export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-xs tracking-[0.2em] text-muted mb-4">
          CONSULTORÍA ESTRATÉGICA INTERNACIONAL
        </p>
        <h1 className="font-display text-5xl leading-[0.9] text-ink">
          Estrategia, <span className="underline decoration-primary decoration-4 underline-offset-4">liderazgo</span> y tecnología para trascender
        </h1>
        <p className="mt-6 text-muted max-w-xl">
          Scaffold base OK — tokens #fe4100 activos. Hero con foto principal en Task 3.
        </p>
        <div className="mt-8 flex gap-3">
          <span className="bg-primary text-white px-6 py-3 rounded-full text-sm">
            Agendar Reunión Estratégica
          </span>
          <span className="border border-line px-6 py-3 rounded-full text-sm">
            Ver Planes
          </span>
        </div>
      </div>
    </main>
  )
}
