import { getBoard } from "@/lib/board/store"
import { getConfessions } from "@/lib/confessions/store"
import { getEncryptionKey } from "@/lib/confessions/crypto"
import { setJobStatus, setCandidateStatus } from "./actions"
import { ConfessionRow } from "@/components/admin/confession-row"

export const dynamic = "force-dynamic"

function StatusForm({
  id,
  status,
  action,
}: {
  id: string
  status: string
  action: (formData: FormData) => Promise<void>
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="bg-surface border border-hairline rounded-lg px-3 py-1.5 text-xs text-fg"
      >
        <option value="new">Nueva</option>
        <option value="contacted">Contactado</option>
        <option value="closed">Cerrado</option>
      </select>
      <button
        type="submit"
        className="btn-secondary px-3 py-1.5 text-xs font-medium"
      >
        Guardar
      </button>
    </form>
  )
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })

type Tab = "jobs" | "confesionario"

export default function AdminPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab: Tab = searchParams.tab === "confesionario" ? "confesionario" : "jobs"
  const board = getBoard()
  const confessions = getConfessions()

  let keyOk = true
  try {
    getEncryptionKey()
  } catch {
    keyOk = false
  }

  const jobs = board.listJobs(500)
  const candidates = board.listCandidates(500)
  const confessionList = confessions.listConfessions(500)
  const newCount = confessions.countNew()

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            Los 1000 Socios · Panel
          </p>
          <h1 className="font-display text-3xl tracking-tight text-fg mt-2">
            Búsquedas, postulaciones y confesionario
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <a href="/api/admin/export?type=jobs&format=csv" className="btn-secondary px-3 py-2">Export búsquedas CSV</a>
          <a href="/api/admin/export?type=candidates&format=csv" className="btn-secondary px-3 py-2">Export candidatos CSV</a>
          <a href="/api/admin/export?type=jobs&format=json" className="btn-secondary px-3 py-2">JSON</a>
        </div>
      </div>

      <nav className="mb-8 flex gap-1 border-b border-hairline">
        <a
          href="/admin?tab=jobs"
          aria-current={tab === "jobs" ? "page" : undefined}
          className={
            tab === "jobs"
              ? "px-4 py-2 text-sm font-medium border-b-2 border-primary text-fg"
              : "px-4 py-2 text-sm text-fg-muted hover:text-fg"
          }
        >
          Búsquedas y candidatos ({jobs.length + candidates.length})
        </a>
        <a
          href="/admin?tab=confesionario"
          aria-current={tab === "confesionario" ? "page" : undefined}
          className={
            tab === "confesionario"
              ? "px-4 py-2 text-sm font-medium border-b-2 border-primary text-fg"
              : "px-4 py-2 text-sm text-fg-muted hover:text-fg"
          }
        >
          Confesionario ({newCount} nuevos)
        </a>
      </nav>

      {tab === "jobs" && (
        <>
          <section className="mb-14">
            <h2 className="font-display text-xl tracking-tight text-fg mb-4">
              Búsquedas ({jobs.length})
            </h2>
            {jobs.length === 0 ? (
              <p className="text-sm text-fg-muted">Todavía no hay búsquedas cargadas.</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((j) => (
                  <article key={j.id} className="card-luxury rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-fg">
                          {j.title} · <span className="text-fg-muted">{j.company}</span>
                        </h3>
                        <p className="text-xs text-fg-muted mt-1">
                          {[j.location, j.modality, j.salary_range].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                      <StatusForm id={j.id} status={j.status} action={setJobStatus} />
                    </div>
                    <p className="text-sm text-fg-muted mt-3 whitespace-pre-wrap">{j.description}</p>
                    <p className="text-xs text-fg-muted mt-3 border-t border-hairline pt-3">
                      {j.contact_name} · {j.contact_email}
                      {j.contact_phone ? ` · ${j.contact_phone}` : ""} · {fmtDate(j.created_at)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-fg mb-4">
              Candidatos ({candidates.length})
            </h2>
            {candidates.length === 0 ? (
              <p className="text-sm text-fg-muted">Todavía no hay postulaciones.</p>
            ) : (
              <div className="space-y-4">
                {candidates.map((c) => (
                  <article key={c.id} className="card-luxury rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-fg">
                          {c.name}
                          {c.desired_role ? (
                            <span className="text-fg-muted"> · {c.desired_role}</span>
                          ) : null}
                        </h3>
                        <p className="text-xs text-fg-muted mt-1">
                          {c.email}
                          {c.phone ? ` · ${c.phone}` : ""} · {fmtDate(c.created_at)}
                        </p>
                      </div>
                      <StatusForm id={c.id} status={c.status} action={setCandidateStatus} />
                    </div>
                    {c.experience ? (
                      <p className="text-sm text-fg-muted mt-3 whitespace-pre-wrap">{c.experience}</p>
                    ) : null}
                    <div className="mt-3 border-t border-hairline pt-3 flex flex-wrap items-center gap-3 text-xs">
                      {c.cv_file ? (
                        <a
                          href={`/api/admin/cv/${c.id}`}
                          className="btn-primary px-3 py-2 text-xs font-medium"
                        >
                          Descargar CV
                        </a>
                      ) : (
                        <span className="text-fg-muted">Sin CV</span>
                      )}
                      <span className="text-fg-muted">
                        {c.cv_original_name ?? ""}
                        {c.cv_size ? ` · ${Math.round(c.cv_size / 1024)} KB` : ""}
                      </span>
                      <span className="text-fg-muted">
                        Consentimiento: {c.consent ? "sí" : "no"}
                        {c.consent_at ? ` (${fmtDate(c.consent_at)})` : ""} · política {c.policy_version ?? "—"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {tab === "confesionario" && (
        <section>
          {!keyOk && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
            >
              <strong>Configuración requerida:</strong>{" "}
              <code>CONFESSIONS_ENCRYPTION_KEY</code> ausente o inválida. Los
              mensajes no se pueden descifrar. Generar con{" "}
              <code>openssl rand -base64 32</code> y setear en Dokploy.
            </div>
          )}
          <h2 className="font-display text-xl tracking-tight text-fg mb-4">
            Confesionario ({confessionList.length})
          </h2>
          {confessionList.length === 0 ? (
            <p className="text-sm text-fg-muted">
              No hay mensajes en el buzón todavía.
            </p>
          ) : (
            <div className="space-y-4">
              {confessionList.map((c) => (
                <ConfessionRow key={c.id} c={c} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  )
}
