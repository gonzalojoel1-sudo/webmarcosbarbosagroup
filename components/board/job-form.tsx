"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type Status = "idle" | "loading" | "ok" | "error"

const input =
  "w-full bg-surface border border-hairline rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
const label = "block text-sm font-medium text-fg mb-1.5"

export function JobForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    const payload = Object.fromEntries(
      Array.from(fd.entries()).map(([k, v]) => [k, String(v).trim()])
    )

    setStatus("loading")
    try {
      const res = await fetch("/api/board/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || "No pudimos enviar la búsqueda. Probá de nuevo.")
        setStatus("error")
        return
      }
      setStatus("ok")
      formEl.reset()
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
          <p className="text-sm font-semibold text-fg">¡Búsqueda recibida!</p>
          <p className="text-sm text-fg-muted mt-1">
            Revisamos la propuesta y te contactamos para hacer la conexión con los
            candidatos de la red.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="job-company" className={label}>
            Empresa <span className="text-primary">*</span>
          </label>
          <input id="job-company" name="company" required disabled={busy} className={input} placeholder="Nombre de la empresa" />
        </div>
        <div>
          <label htmlFor="job-title" className={label}>
            Puesto <span className="text-primary">*</span>
          </label>
          <input id="job-title" name="title" required disabled={busy} className={input} placeholder="Ej. Jefe de ventas" />
        </div>
        <div>
          <label htmlFor="job-location" className={label}>
            Ubicación
          </label>
          <input id="job-location" name="location" disabled={busy} className={input} placeholder="Ej. Córdoba" />
        </div>
        <div>
          <label htmlFor="job-modality" className={label}>
            Modalidad
          </label>
          <select id="job-modality" name="modality" disabled={busy} className={input} defaultValue="">
            <option value="">Elegir…</option>
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrido</option>
            <option value="remoto">Remoto</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="job-salary" className={label}>
            Rango salarial (opcional)
          </label>
          <input id="job-salary" name="salaryRange" disabled={busy} className={input} placeholder="Ej. $1.200.000 a $1.600.000" />
        </div>
      </div>

      <div>
        <label htmlFor="job-description" className={label}>
          Perfil y condiciones <span className="text-primary">*</span>
        </label>
        <textarea
          id="job-description"
          name="description"
          required
          rows={5}
          disabled={busy}
          className={`${input} resize-y min-h-[120px]`}
          placeholder="Contá el rol, responsabilidades y qué perfil buscás (mínimo 20 caracteres)."
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="job-contact-name" className={label}>
            Contacto <span className="text-primary">*</span>
          </label>
          <input id="job-contact-name" name="contactName" required disabled={busy} className={input} placeholder="Nombre y apellido" />
        </div>
        <div>
          <label htmlFor="job-contact-email" className={label}>
            Email <span className="text-primary">*</span>
          </label>
          <input id="job-contact-email" name="contactEmail" type="email" required disabled={busy} className={input} placeholder="tu@empresa.com" />
        </div>
        <div>
          <label htmlFor="job-contact-phone" className={label}>
            WhatsApp
          </label>
          <input id="job-contact-phone" name="contactPhone" disabled={busy} className={input} placeholder="+54 9 351 …" />
        </div>
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

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
          "Publicar búsqueda"
        )}
      </button>

      <p className="text-xs text-fg-muted">
        Usamos estos datos solo para la conexión laboral. Ver{" "}
        <a href="/privacidad" className="text-primary hover:underline">
          privacidad
        </a>
        .
      </p>
    </form>
  )
}
