"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Loader2, Upload } from "lucide-react"

type Status = "idle" | "loading" | "ok" | "error"

const input =
  "w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
const label = "block text-sm font-medium text-fg mb-1.5"

export function CandidateForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    if (!/^(true|on)$/.test(String(fd.get("consent")))) {
      // ensure checkbox value is a literal the API accepts
      fd.set("consent", "false")
    } else {
      fd.set("consent", "true")
    }

    setStatus("loading")
    try {
      const res = await fetch("/api/board/candidates", { method: "POST", body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || "No pudimos enviar tu postulación. Probá de nuevo.")
        setStatus("error")
        return
      }
      setStatus("ok")
      formEl.reset()
      setFileName("")
    } catch {
      setError("Error de red. Verificá tu conexión.")
      setStatus("error")
    }
  }

  const busy = status === "loading" || status === "ok"

  if (status === "ok") {
    return (
      <div className="card-luxury rounded-2xl p-6 flex items-start gap-3" role="status">
        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-fg">¡CV recibido!</p>
          <p className="text-sm text-fg-muted mt-1">
            Te contactamos cuando aparezca una búsqueda que encaje con tu perfil.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="cand-name" className={label}>
            Nombre <span className="text-primary">*</span>
          </label>
          <input id="cand-name" name="name" required disabled={busy} className={input} placeholder="Nombre y apellido" />
        </div>
        <div>
          <label htmlFor="cand-email" className={label}>
            Email <span className="text-primary">*</span>
          </label>
          <input id="cand-email" name="email" type="email" required disabled={busy} className={input} placeholder="tu@email.com" />
        </div>
        <div>
          <label htmlFor="cand-phone" className={label}>
            WhatsApp
          </label>
          <input id="cand-phone" name="phone" disabled={busy} className={input} placeholder="+54 9 351 …" />
        </div>
        <div>
          <label htmlFor="cand-role" className={label}>
            Puesto que buscás
          </label>
          <input id="cand-role" name="desiredRole" disabled={busy} className={input} placeholder="Ej. Administración, ventas…" />
        </div>
      </div>

      <div>
        <label htmlFor="cand-exp" className={label}>
          Resumen de experiencia
        </label>
        <textarea
          id="cand-exp"
          name="experience"
          rows={4}
          disabled={busy}
          className={`${input} resize-y min-h-[96px]`}
          placeholder="Contanos brevemente tu experiencia (opcional)."
        />
      </div>

      <div>
        <label htmlFor="cand-cv" className={label}>
          Tu CV (PDF, DOC o DOCX, máx. 5 MB) <span className="text-primary">*</span>
        </label>
        <label
          htmlFor="cand-cv"
          className="flex items-center gap-3 card-luxury rounded-xl px-4 py-3 cursor-pointer text-sm text-fg-muted"
        >
          <Upload size={18} className="text-primary shrink-0" aria-hidden />
          <span>{fileName || "Elegir archivo…"}</span>
        </label>
        <input
          id="cand-cv"
          name="cv"
          type="file"
          required
          disabled={busy}
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          className="sr-only"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-fg-muted">
        <input id="cand-consent" name="consent" type="checkbox" value="true" required disabled={busy} className="mt-1" />
        <span>
          Autorizo el tratamiento de mis datos y CV para la conexión laboral de Los
          1000 Socios. Ver{" "}
          <a href="/privacidad" className="text-primary hover:underline">
            privacidad
          </a>
          .
        </span>
      </label>

      <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden /> {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="btn-primary px-7 py-3.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden /> Enviando…
          </>
        ) : (
          "Enviar postulación"
        )}
      </button>
    </form>
  )
}
