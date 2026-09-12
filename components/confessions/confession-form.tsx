"use client"

import { useState } from "react"
import { POLICY_VERSION, CONFESSION_POLICY } from "@/lib/confessions/policy"

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "error"; message: string }

const initial = {
  message: "",
  pseudonym: "",
  wantsResponse: false,
  contactMethod: "email" as "email" | "whatsapp",
  contactValue: "",
  consent: false,
  honeypot: "",
}

export function ConfessionForm() {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  const update = <K extends keyof typeof initial>(
    key: K,
    value: (typeof initial)[K]
  ) => setForm((f) => ({ ...f, [key]: value }))

  const valid =
    form.message.trim().length >= 20 &&
    form.message.trim().length <= 4000 &&
    form.consent &&
    (!form.wantsResponse ||
      (form.contactMethod &&
        form.contactValue.trim().length > 0))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status.kind === "loading") return
    setStatus({ kind: "loading" })
    try {
      const res = await fetch("/api/confessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: form.message,
          pseudonym: form.pseudonym,
          wantsResponse: form.wantsResponse,
          contactMethod: form.wantsResponse ? form.contactMethod : undefined,
          contactValue: form.wantsResponse ? form.contactValue : undefined,
          consent: form.consent,
          policyVersion: POLICY_VERSION,
          honeypot: form.honeypot,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setStatus({
          kind: "error",
          message:
            body.error ??
            "No pudimos procesar tu mensaje. Probá de nuevo en unos minutos.",
        })
        return
      }
      setStatus({ kind: "ok" })
      setForm(initial)
    } catch {
      setStatus({
        kind: "error",
        message: "Sin conexión. Verificá tu internet y volvé a intentar.",
      })
    }
  }

  if (status.kind === "ok") {
    return (
      <div className="card-luxury rounded-2xl p-8 text-center space-y-5">
        <p className="font-display text-2xl tracking-tight text-fg">
          Tu mensaje fue recibido.
        </p>
        <p className="text-sm text-fg-muted leading-relaxed max-w-md mx-auto">
          Está cifrado y solo Marcos lo va a leer. Si pediste contacto, lo hará
          desde su canal personal, no automático.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="btn-secondary px-5 py-2.5 text-sm font-medium"
        >
          Enviar otro
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card-luxury rounded-2xl p-8 space-y-6">
      {/* Honeypot — invisible a usuarios, trampa para bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.honeypot}
        onChange={(e) => update("honeypot", e.target.value)}
        className="hidden"
      />

      <div>
        <label
          htmlFor="conf-message"
          className="block font-display text-lg tracking-tight text-fg mb-2"
        >
          Tu mensaje
        </label>
        <textarea
          id="conf-message"
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={8}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 font-display text-base text-fg leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Escribí libremente lo que te pesa. Sin formato, sin prisa."
        />
        <p className="text-xs text-fg-muted mt-1.5">
          20–4000 caracteres · sin formato · sin adjuntos
        </p>
      </div>

      <div>
        <label
          htmlFor="conf-pseudonym"
          className="block font-display text-lg tracking-tight text-fg mb-2"
        >
          Seudónimo <span className="text-fg-muted text-sm font-normal">(opcional)</span>
        </label>
        <input
          id="conf-pseudonym"
          name="pseudonym"
          type="text"
          maxLength={60}
          value={form.pseudonym}
          onChange={(e) => update("pseudonym", e.target.value)}
          className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Solo para que Marcos pueda referenciar si volvés"
        />
        <p className="text-xs text-fg-muted mt-1.5">
          No se cifra: no pongas tu nombre real.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.wantsResponse}
            onChange={(e) => update("wantsResponse", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
          />
          <span className="text-sm text-fg">
            Quiero que me contacten
          </span>
        </label>

        {form.wantsResponse && (
          <div className="space-y-3 pl-7">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={form.contactMethod === "email"}
                  onChange={() => update("contactMethod", "email")}
                  className="h-4 w-4 border-hairline text-primary focus:ring-primary"
                />
                Email
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="whatsapp"
                  checked={form.contactMethod === "whatsapp"}
                  onChange={() => update("contactMethod", "whatsapp")}
                  className="h-4 w-4 border-hairline text-primary focus:ring-primary"
                />
                WhatsApp
              </label>
            </div>
            <input
              type="text"
              required={form.wantsResponse}
              maxLength={160}
              value={form.contactValue}
              onChange={(e) => update("contactValue", e.target.value)}
              className="w-full rounded-xl border border-hairline bg-surface px-4 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder={
                form.contactMethod === "email"
                  ? "tu@email.com"
                  : "+54 9 351 1234567"
              }
            />
            <p className="text-xs text-fg-muted">
              Se guarda cifrado. Marcos te contacta desde su canal personal.
            </p>
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={form.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-hairline text-primary focus:ring-primary"
        />
        <span className="text-xs text-fg-muted leading-relaxed">
          {CONFESSION_POLICY.consentText} (política v{POLICY_VERSION}).
        </span>
      </label>

      {status.kind === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || status.kind === "loading"}
        className="btn-primary w-full px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status.kind === "loading" ? "Enviando…" : "Enviar al buzón"}
      </button>
    </form>
  )
}
