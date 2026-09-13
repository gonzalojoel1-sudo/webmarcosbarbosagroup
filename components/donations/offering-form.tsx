"use client"

import { useRef, useState } from "react"
import { Check, Copy, Loader2, MessageCircle, ArrowRight } from "lucide-react"

const PRESETS = [1000, 5000, 10000, 20000, 50000] as const
const MIN = 100

const TRANSFER = {
  alias: process.env.NEXT_PUBLIC_TRANSFER_ALIAS || "",
  cvu: process.env.NEXT_PUBLIC_TRANSFER_CVU || "",
  holder: process.env.NEXT_PUBLIC_TRANSFER_HOLDER || "",
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n)

type Method = "mercadopago" | "transferencia"

import { defaultMethod } from "@/lib/donations/method"

export function OfferingForm({ mpReady }: { mpReady: boolean }) {
  const [presetIndex, setPresetIndex] = useState<number | null>(null)
  const [customArs, setCustomArs] = useState("")
  const [method, setMethod] = useState<Method>(defaultMethod(mpReady))
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const attemptRef = useRef<string>("")

  const usesPreset = presetIndex !== null && customArs.trim() === ""
  const customNumber = customArs.trim() === "" ? null : Number(customArs)
  const customValid =
    customNumber === null ||
    (Number.isInteger(customNumber) && customNumber >= MIN)

  const amountReady = usesPreset || (customNumber !== null && customValid)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!amountReady) {
      setError(
        `Elegí un monto o ingresá uno mayor o igual a ${fmt(MIN)}.`
      )
      return
    }

    if (method === "transferencia") return

    if (!attemptRef.current) attemptRef.current = crypto.randomUUID()
    setLoading(true)
    try {
      const res = await fetch("/api/donations/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "mercadopago",
          ...(usesPreset ? { presetId: presetIndex } : { customArs: customNumber }),
          donorEmail: email.trim() || undefined,
          attemptId: attemptRef.current,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.init_point) {
        setError(
          data?.error ||
            "No pudimos iniciar el pago. Probá de nuevo o usá transferencia."
        )
        setLoading(false)
        return
      }
      window.location.assign(data.init_point as string)
    } catch {
      setError("Error de red. Probá de nuevo.")
      setLoading(false)
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {/* Monto */}
      <fieldset>
        <legend className="text-sm font-semibold text-fg">
          Elegí el monto <span className="text-primary">*</span>
        </legend>
        <p className="text-xs text-fg-muted mt-1">
          Ofrendá lo que sientas en tu corazón.
        </p>
        <div
          role="radiogroup"
          aria-label="Monto de la ofrenda"
          className="mt-4 flex flex-wrap gap-2"
        >
          {PRESETS.map((value, i) => {
            const checked = usesPreset && presetIndex === i
            return (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                  checked
                    ? "border-primary bg-primary text-white"
                    : "border-hairline bg-surface text-fg hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="monto"
                  className="sr-only"
                  checked={checked}
                  onChange={() => {
                    setPresetIndex(i)
                    setCustomArs("")
                  }}
                />
                {fmt(value)}
              </label>
            )
          })}
        </div>

        <div className="mt-4">
          <label htmlFor="custom-amount" className="block text-xs text-fg-muted mb-1.5">
            Otro monto (ARS)
          </label>
          <input
            id="custom-amount"
            type="number"
            inputMode="numeric"
            min={MIN}
            step={1}
            placeholder={`Ej. 3000 (mín. ${MIN})`}
            value={customArs}
            onChange={(e) => {
              setCustomArs(e.target.value)
              if (presetIndex !== null) setPresetIndex(null)
            }}
            aria-invalid={!customValid}
            aria-describedby={!customValid ? "err-amount" : undefined}
            className="w-full max-w-xs bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {!customValid ? (
            <p id="err-amount" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              El monto mínimo es {fmt(MIN)}.
            </p>
          ) : null}
        </div>
      </fieldset>

      {/* Método */}
      <fieldset>
        <legend className="text-sm font-semibold text-fg">¿Cómo querés ofrendar?</legend>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <label
            className={`cursor-pointer card-luxury rounded-2xl p-4 flex items-start gap-3 ${
              method === "mercadopago" ? "card-accent-strong" : ""
            }`}
          >
            <input
              type="radio"
              name="metodo"
              className="mt-1"
              checked={method === "mercadopago"}
              onChange={() => setMethod("mercadopago")}
            />
            <span>
              <span className="block text-sm font-semibold text-fg">Mercado Pago</span>
              <span className="block text-xs text-fg-muted mt-1">
                Tarjeta de crédito/débito, cuotas, dinero en cuenta y efectivo.
                Pago seguro en el sitio de Mercado Pago.
              </span>
            </span>
          </label>

          <label
            className={`cursor-pointer card-luxury rounded-2xl p-4 flex items-start gap-3 ${
              method === "transferencia" ? "card-accent-strong" : ""
            }`}
          >
            <input
              type="radio"
              name="metodo"
              className="mt-1"
              checked={method === "transferencia"}
              onChange={() => setMethod("transferencia")}
            />
            <span>
              <span className="block text-sm font-semibold text-fg">Transferencia</span>
              <span className="block text-xs text-fg-muted mt-1">
                Sin comisión. Transferís a nuestra cuenta y nos avisás.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {method === "mercadopago" ? (
        <div>
          <label htmlFor="donor-email" className="block text-xs text-fg-muted mb-1.5">
            Tu email (opcional, para el comprobante)
          </label>
          <input
            id="donor-email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-sm bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-4 py-3"
        >
          {error}
        </p>
      ) : null}

      {method === "mercadopago" ? (
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-7 py-3.5 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Iniciando…
            </>
          ) : (
            <>
              Ofrendar con Mercado Pago <ArrowRight size={16} aria-hidden />
            </>
          )}
        </button>
      ) : (
        <div className="card-luxury rounded-2xl p-6 space-y-3">
          <p className="text-sm font-semibold text-fg">Datos para transferir</p>
          {TRANSFER.alias || TRANSFER.cvu ? (
            <ul className="space-y-1.5 text-sm">
              {TRANSFER.holder ? (
                <li className="text-fg-muted">
                  Titular: <span className="text-fg">{TRANSFER.holder}</span>
                </li>
              ) : null}
              {TRANSFER.alias ? (
                <li className="text-fg-muted">
                  Alias: <span className="text-fg font-mono">{TRANSFER.alias}</span>
                </li>
              ) : null}
              {TRANSFER.cvu ? (
                <li className="text-fg-muted">
                  CVU: <span className="text-fg font-mono">{TRANSFER.cvu}</span>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">
              Escribinos por WhatsApp y te pasamos los datos de transferencia.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {TRANSFER.alias ? (
              <button
                type="button"
                onClick={() => copy(TRANSFER.alias)}
                className="btn-secondary px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
              >
                {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                {copied ? "Copiado" : "Copiar alias"}
              </button>
            ) : null}
            <a
              href="https://wa.me/5493517334040?text=Hola%2C%20quiero%20ofrendar%20por%20transferencia"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
            >
              <MessageCircle size={16} aria-hidden /> Avisar por WhatsApp
            </a>
          </div>
          <p className="text-xs text-fg-muted">
            [VALIDAR] Completá el alias/CVU/titular reales en las variables de
            entorno para mostrarlos acá.
          </p>
        </div>
      )}

      <p className="text-xs text-fg-muted">
        El pago se procesa en el sitio seguro de Mercado Pago. No guardamos datos
        de tu tarjeta. Al ofrendar aceptás nuestra{" "}
        <a href="/privacidad" className="text-primary hover:underline">
          política de privacidad
        </a>
        .
      </p>
    </form>
  )
}
