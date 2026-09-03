/**
 * Capas fijas de fondo (referencia exacta):
 * 1. Glow ambiental naranja 1000×450, blur-3xl, top-center
 * 2. Grid táctico 40px con máscara radial
 */
export function Backdrop() {
  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-primary/15 via-transparent to-transparent blur-[140px] pointer-events-none -z-10"
      />
      <div
        aria-hidden
        className="fixed inset-0 bg-grid-tactical radial-mask pointer-events-none -z-10 opacity-70"
      />
    </>
  )
}
