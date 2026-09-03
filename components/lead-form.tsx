"use client"

import { useState } from "react"
import { z } from "zod"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre requerido (mín. 2 caracteres)")
    .max(80, "Nombre demasiado largo"),
  email: z.string().email("Email inválido").max(120, "Email demasiado largo"),
  phone: z
    .string()
    .max(30, "WhatsApp demasiado largo")
    .optional()
    .or(z.literal("")),
  plan: z.enum(
    [
      "Plan 1 Consultor",
      "Plan 2 Consejero",
      "Plan 3 Director Externo",
      "Plan 4 Corporativo",
    ],
    { errorMap: () => ({ message: "Seleccioná un plan" }) }
  ),
  mensaje: z.string().max(2000, "Mensaje demasiado largo").optional().or(z.literal("")),
})

export type LeadInput = z.infer<typeof leadSchema>

type Status = "idle" | "loading" | "ok" | "error"

const PLAN_OPTIONS = [
  "Plan 1 Consultor",
  "Plan 2 Consejero",
  "Plan 3 Director Externo",
  "Plan 4 Corporativo",
] as const

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setServerError(null)

    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    const raw = Object.fromEntries(fd.entries())

    // normalizar strings (trim)
    const normalized = {
      name: String(raw.name ?? "").trim(),
      email: String(raw.email ?? "").trim(),
      phone: String(raw.phone ?? "").trim(),
      plan: String(raw.plan ?? "").trim(),
      mensaje: String(raw.mensaje ?? "").trim(),
    }

    const parsed = leadSchema.safeParse(normalized)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form")
        if (!errs[key]) errs[key] = issue.message
      }
      setFieldErrors(errs)
      setStatus("idle")
      return
    }

    setStatus("loading")
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data?.errors) {
          // zod errors from server
          const errs: Record<string, string> = {}
          for (const err of data.errors as Array<{ path: string[]; message: string }>) {
            const key = err.path[0] ?? "form"
            errs[key] = err.message
          }
          setFieldErrors(errs)
        }
        setServerError(data?.error ?? "No pudimos enviar tu consulta. Intentá de nuevo.")
        setStatus("error")
        return
      }

      setStatus("ok")
      formEl.reset()
    } catch {
      setServerError("Error de red. Verificá tu conexión e intentá de nuevo.")
      setStatus("error")
    }
  }

  const isLoading = status === "loading"
  const isOk = status === "ok"

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="lead-name" className="block text-sm font-medium text-fg mb-1.5">
          Nombre <span className="text-primary">*</span>
        </label>
        <input
          id="lead-name"
          name="name"
          placeholder="Nombre y apellido"
          autoComplete="name"
          required
          disabled={isLoading || isOk}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "err-name" : undefined}
          className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {fieldErrors.name && (
          <p id="err-name" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} /> {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="lead-email" className="block text-sm font-medium text-fg mb-1.5">
          Email <span className="text-primary">*</span>
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          placeholder="tu@empresa.com"
          autoComplete="email"
          required
          disabled={isLoading || isOk}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "err-email" : undefined}
          className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {fieldErrors.email && (
          <p id="err-email" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} /> {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="lead-phone" className="block text-sm font-medium text-fg mb-1.5">
          WhatsApp
        </label>
        <input
          id="lead-phone"
          name="phone"
          placeholder="+54 9 351 ... (opcional)"
          autoComplete="tel"
          disabled={isLoading || isOk}
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
          className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {fieldErrors.phone && (
          <p id="err-phone" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} /> {fieldErrors.phone}
          </p>
        )}
      </div>

      {/* Plan */}
      <div>
        <label htmlFor="lead-plan" className="block text-sm font-medium text-fg mb-1.5">
          Plan de interés
        </label>
        <select
          id="lead-plan"
          name="plan"
          defaultValue="Plan 3 Director Externo"
          disabled={isLoading || isOk}
          aria-invalid={!!fieldErrors.plan}
          aria-describedby={fieldErrors.plan ? "err-plan" : undefined}
          className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {PLAN_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {fieldErrors.plan && (
          <p id="err-plan" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} /> {fieldErrors.plan}
          </p>
        )}
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="lead-mensaje" className="block text-sm font-medium text-fg mb-1.5">
          Desafío actual
        </label>
        <textarea
          id="lead-mensaje"
          name="mensaje"
          placeholder="Contanos en 2-3 líneas qué te frena hoy (opcional)"
          rows={4}
          disabled={isLoading || isOk}
          aria-invalid={!!fieldErrors.mensaje}
          aria-describedby={fieldErrors.mensaje ? "err-mensaje" : undefined}
          className="w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-y min-h-[96px] disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {fieldErrors.mensaje && (
          <p id="err-mensaje" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} /> {fieldErrors.mensaje}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || isOk}
        className="w-full btn-primary py-3.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Enviando...
          </>
        ) : isOk ? (
          <>
            <CheckCircle2 size={18} /> Enviado
          </>
        ) : (
          "Agendar Reunión"
        )}
      </button>

      {isOk && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-3 flex items-start gap-2"
        >
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-success" />
          <span>
            ¡Recibido! Te escribimos por WhatsApp en las próximas horas. Revisá también tu email
            (revisá spam).
          </span>
        </p>
      )}

      {status === "error" && serverError && (
        <p
          role="alert"
          className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-4 py-3 flex items-start gap-2"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </p>
      )}

      <p className="text-xs text-fg-muted text-center leading-relaxed">
        Al enviar aceptás ser contactado por WhatsApp/email. Sin spam.
      </p>
    </form>
  )
}
