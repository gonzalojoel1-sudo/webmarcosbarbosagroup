"use client"

import { useState } from "react"
import { loginPastor } from "./actions"

type Status =
  | { kind: "idle" }
  | { kind: "loading" }

const initial = {
  username: "admin",
  password: "",
  honeypot: "",
}

export function LoginForm({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultUsername,
  error,
  next,
}: {
  defaultUsername: string
  error?: "invalid" | "ratelimit" | null
  next?: string
}) {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  const update = <K extends keyof typeof initial>(
    key: K,
    value: (typeof initial)[K]
  ) => setForm((f) => ({ ...f, [key]: value }))

  const valid = form.password.length > 0

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status.kind === "loading") return
    setStatus({ kind: "loading" })
    const fd = new FormData()
    fd.set("username", form.username)
    fd.set("password", form.password)
    fd.set("website", form.honeypot)
    if (next) fd.set("next", next)
    await loginPastor(fd)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          htmlFor="login-username"
          className="block text-xs uppercase tracking-[0.18em] text-fg-muted mb-2"
        >
          Usuario
        </label>
        <input
          id="login-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-xs uppercase tracking-[0.18em] text-fg-muted mb-2"
        >
          Contraseña
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {error === "ratelimit" && (
        <p className="text-sm text-fg-muted" role="alert">
          Demasiados intentos. Probá en 15 minutos.
        </p>
      )}
      {error === "invalid" && (
        <p className="text-sm text-fg-muted" role="alert">
          No pudimos verificar tus credenciales. Verificá e intentá de nuevo.
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || status.kind === "loading"}
        className="btn-primary w-full px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status.kind === "loading" ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  )
}