"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Clock, AlertCircle, Loader2, MessageCircle } from "lucide-react"

type State = "verifying" | "approved" | "pending" | "rejected" | "unknown" | "error"

export function DonationStatus() {
  const params = useSearchParams()
  const externalReference = params.get("external_reference")
  const redirectStatus = params.get("status")
  const [state, setState] = useState<State>("verifying")

  useEffect(() => {
    if (!externalReference) {
      setState(redirectStatus === "pending" ? "pending" : "unknown")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/donations/mercadopago/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ externalReference }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        const status = data?.status as string | undefined
        if (status === "approved") setState("approved")
        else if (status === "pending" || status === "in_process") setState("pending")
        else if (status === "rejected" || status === "cancelled") setState("rejected")
        else setState("unknown")
      } catch {
        if (!cancelled) setState("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [externalReference, redirectStatus])

  const box =
    "card-luxury rounded-2xl p-8 text-center flex flex-col items-center gap-4"

  return (
    <div className={box}>
      {state === "verifying" ? (
        <>
          <Loader2 className="w-10 h-10 text-primary animate-spin" aria-hidden />
          <h1 className="font-display text-2xl text-fg">Verificando tu ofrenda…</h1>
          <p className="text-sm text-fg-muted">
            Estamos confirmando el pago con Mercado Pago. No cierres esta página.
          </p>
        </>
      ) : null}

      {state === "approved" ? (
        <>
          <CheckCircle2 className="w-12 h-12 text-success" aria-hidden />
          <h1 className="font-display text-2xl text-fg">¡Gracias por tu ofrenda!</h1>
          <p className="text-sm text-fg-muted">
            Tu pago fue acreditado. Que Dios multiplique lo que sembrás.
          </p>
        </>
      ) : null}

      {state === "pending" ? (
        <>
          <Clock className="w-12 h-12 text-primary" aria-hidden />
          <h1 className="font-display text-2xl text-fg">Pago pendiente</h1>
          <p className="text-sm text-fg-muted">
            Tu ofrenda está pendiente de acreditación. Te vamos a confirmar cuando
            se acredite.
          </p>
        </>
      ) : null}

      {state === "rejected" ? (
        <>
          <AlertCircle className="w-12 h-12 text-red-500" aria-hidden />
          <h1 className="font-display text-2xl text-fg">El pago no se completó</h1>
          <p className="text-sm text-fg-muted">
            No se realizó el cobro. Podés intentarlo otra vez.
          </p>
        </>
      ) : null}

      {state === "unknown" || state === "error" ? (
        <>
          <AlertCircle className="w-12 h-12 text-fg-muted" aria-hidden />
          <h1 className="font-display text-2xl text-fg">
            No pudimos verificar el pago
          </h1>
          <p className="text-sm text-fg-muted">
            Si el pago se hizo, se te va a acreditar igual. Escribinos por WhatsApp
            y lo revisamos.
          </p>
        </>
      ) : null}

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link href="/cuerpo-de-cristo/ofrenda" className="btn-secondary px-5 py-2.5 text-sm font-medium">
          Volver a ofrendar
        </Link>
        <a
          href="https://wa.me/5493517334040?text=Hola%2C%20hice%20una%20ofrenda%20y%20quiero%20confirmarla"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
        >
          <MessageCircle size={16} aria-hidden /> Escribirnos
        </a>
      </div>
    </div>
  )
}
