import type { Metadata } from "next"
import { Suspense } from "react"
import { DonationStatus } from "@/components/donations/donation-status"

export const metadata: Metadata = {
  title: "Gracias por tu ofrenda | Cuerpo de Cristo",
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <main className="pt-32 md:pt-40 pb-24 px-6">
      <div className="max-w-xl mx-auto">
        <Suspense
          fallback={<p className="text-center text-fg-muted">Cargando…</p>}
        >
          <DonationStatus />
        </Suspense>
      </div>
    </main>
  )
}
