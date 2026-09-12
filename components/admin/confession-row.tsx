import { decrypt, DecryptionError, getEncryptionKey } from "@/lib/confessions/crypto"
import {
  markConfessionRead,
  setPastoralNote,
  deleteConfession,
} from "@/app/pastor/inbox/actions"
import type { ConfessionRecord } from "@/lib/confessions/store"

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
    : "—"

const STATUS_LABEL = { new: "Nuevo", read: "Leído" } as const

export function ConfessionRow({ c }: { c: ConfessionRecord }) {
  let keyOk = true
  try {
    getEncryptionKey()
  } catch {
    keyOk = false
  }

  let message: string | null = null
  let contact: string | null = null
  let note: string | null = null
  let decryptFailed = false

  if (keyOk) {
    try {
      message = decrypt(c.message_encrypted)
    } catch (e) {
      if (e instanceof DecryptionError) decryptFailed = true
    }
    if (c.contact_value_encrypted) {
      try {
        contact = decrypt(c.contact_value_encrypted)
      } catch {
        /* ignorar, no bloqueante */
      }
    }
    if (c.pastoral_note_encrypted) {
      try {
        note = decrypt(c.pastoral_note_encrypted)
      } catch {
        /* ignorar */
      }
    }
  }

  const isNew = c.status === "new"
  const statusClass = isNew
    ? "inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
    : "inline-block rounded-full bg-fg-muted/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fg-muted"

  return (
    <article className="card-luxury rounded-2xl p-5">
      <details open={isNew} className="confession-disclosure group">
        <summary className="flex flex-wrap items-start justify-between gap-3 cursor-pointer list-none">
          <div>
            <p className="text-xs text-fg-muted">
              {fmt(c.created_at)} ·{" "}
              <span className="text-fg">{c.pseudonym ?? "anónimo"}</span>
              {c.wants_response ? (
                <>
                  {" · "}
                  <span className="text-primary">
                    ⌗ contactar ({c.contact_method})
                  </span>
                </>
              ) : (
                <> · — contactar</>
              )}
            </p>
            <p className="mt-1">
              <span className={statusClass}>{STATUS_LABEL[c.status as keyof typeof STATUS_LABEL] ?? c.status}</span>
            </p>
          </div>
          <span
            aria-hidden="true"
            className="select-none text-fg-muted text-sm leading-none"
          >
            <span className="confession-disclosure-marker-open">▾</span>
            <span className="confession-disclosure-marker-closed">▸</span>
          </span>
        </summary>

        <div className="mt-4 space-y-3 border-t border-hairline pt-4">
          {decryptFailed ? (
            <p className="text-sm text-fg-muted italic">
              No se pudo descifrar este mensaje. La clave de cifrado puede haber
              cambiado o el dato está corrupto. ID: <code>{c.id.slice(0, 8)}</code>{" "}
              · creado: {fmt(c.created_at)}.
            </p>
          ) : (
            <>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted mb-1">
                  Mensaje
                </p>
                <p className="text-sm text-fg whitespace-pre-wrap leading-relaxed">
                  {message}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-fg-muted">
                <dt>Seudónimo</dt>
                <dd className="text-fg">{c.pseudonym ?? "anónimo"}</dd>
                <dt>Quiere contacto</dt>
                <dd className="text-fg">
                  {c.wants_response ? `✓ ${c.contact_method} ${contact ?? ""}` : "no"}
                </dd>
                <dt>Recibido</dt>
                <dd className="text-fg">{fmt(c.created_at)}</dd>
                <dt>IP-hash</dt>
                <dd className="text-fg font-mono">{c.ip_hash.slice(0, 8)}…</dd>
                <dt>Política</dt>
                <dd className="text-fg">{c.policy_version}</dd>
              </dl>

              <form action={setPastoralNote} className="space-y-2">
                <input type="hidden" name="id" value={c.id} />
                <label
                  htmlFor={`note-${c.id}`}
                  className="block text-[11px] uppercase tracking-[0.18em] text-fg-muted"
                >
                  Nota pastoral
                </label>
                <textarea
                  id={`note-${c.id}`}
                  name="note"
                  defaultValue={note ?? ""}
                  rows={3}
                  className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Solo vos la ve. Se cifra al guardar."
                />
                <button
                  type="submit"
                  className="btn-secondary px-3 py-1.5 text-xs font-medium"
                >
                  Guardar nota
                </button>
              </form>
            </>
          )}
        </div>
      </details>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-hairline pt-3">
        {isNew && (
          <form action={markConfessionRead}>
            <input type="hidden" name="id" value={c.id} />
            <button
              type="submit"
              className="btn-secondary px-3 py-1.5 text-xs font-medium"
            >
              Marcar leído
            </button>
          </form>
        )}
        <DeleteForm id={c.id} />
      </div>
    </article>
  )
}

function DeleteForm({ id }: { id: string }) {
  return (
    <details className="relative">
      <summary className="btn-secondary px-3 py-1.5 text-xs font-medium cursor-pointer list-none">
        Borrar
      </summary>
      <form action={deleteConfession} className="mt-2 space-y-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
        <input type="hidden" name="id" value={id} />
        <p className="text-xs text-fg-muted">
          Escribí <code className="font-mono">BORRAR</code> para confirmar:
        </p>
        <input
          type="text"
          name="confirm"
          pattern="BORRAR"
          required
          className="w-full rounded border border-hairline bg-surface px-2 py-1 text-xs text-fg"
        />
        <button
          type="submit"
          className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Confirmar borrado
        </button>
      </form>
    </details>
  )
}