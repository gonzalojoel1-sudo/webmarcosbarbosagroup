import { Logo } from "@/components/logo"
import { LoginForm } from "./login-form"
import Link from "next/link"

export const dynamic = "force-dynamic"

type SP = { error?: string; next?: string; expired?: string }

export default function PastorLoginPage({
  searchParams,
}: {
  searchParams: SP
}) {
  const defaultUsername = process.env.ADMIN_USER || "admin"
  const error =
    searchParams.error === "ratelimit"
      ? "ratelimit"
      : searchParams.error === "invalid"
      ? "invalid"
      : null
  const expired = searchParams.expired === "1"
  const next = searchParams.next

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Logo className="h-10" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-tight text-fg">
            Panel interno
          </h1>
          <p className="text-sm text-fg-muted mt-2">
            Acceso reservado al administrador.
          </p>
        </div>

        {expired && (
          <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            Tu sesión expiró. Ingresá de nuevo.
          </div>
        )}

        <div className="card-luxury rounded-2xl p-8">
          <LoginForm defaultUsername={defaultUsername} error={error} next={next} />
        </div>

        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-fg-muted">
            ¿Olvidaste tu contraseña? Escribinos a{" "}
            <a
              href="mailto:consultora.marcosbarbosa@gmail.com"
              className="underline"
            >
              consultora.marcosbarbosa@gmail.com
            </a>{" "}
            y la reseteamos en 72 hs hábiles.
          </p>
          <p className="text-xs text-fg-muted">
            <Link href="/" className="underline">
              Volver al sitio
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}