import { mkdirSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"

export type DonationStatus =
  | "pending"
  | "in_process"
  | "authorized"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | "in_mediation"

export type DonationRecord = {
  id: string
  provider: string
  provider_payment_id: string | null
  amount_cents: number
  currency: string
  status: DonationStatus
  status_detail: string | null
  external_reference: string
  donor_email: string | null
  created_at: string
  updated_at: string
  approved_at: string | null
}

export type IntentInput = {
  id: string
  provider: string
  amountCents: number
  currency: string
  externalReference: string
  donorEmail?: string
}

const STATUS_RANK: Record<string, number> = {
  pending: 0,
  in_process: 1,
  authorized: 1,
  rejected: 1,
  cancelled: 1,
  approved: 2,
  refunded: 3,
  in_mediation: 3,
  charged_back: 4,
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && /UNIQUE constraint failed/i.test(err.message)
}

export interface LedgerStore {
  hasWebhookEvent(provider: string, eventId: string): boolean
  recordWebhookEvent(provider: string, eventId: string): boolean
  upsertIntent(intent: IntentInput): void
  getByExternalReference(ref: string): DonationRecord | undefined
  applyProviderPayment(input: {
    externalReference: string
    providerPaymentId: string | number
    status: string
    statusDetail?: string
    rawJson?: string
  }): void
  list(limit?: number): DonationRecord[]
}

export function createSqliteLedger(dbPath: string): LedgerStore {
  mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new DatabaseSync(dbPath)

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS donations (
      id                   TEXT PRIMARY KEY,
      provider             TEXT NOT NULL,
      provider_payment_id  TEXT,
      amount_cents         INTEGER NOT NULL,
      currency             TEXT NOT NULL DEFAULT 'ARS',
      status               TEXT NOT NULL,
      status_detail        TEXT,
      external_reference   TEXT NOT NULL,
      donor_email          TEXT,
      created_at           TEXT NOT NULL,
      updated_at           TEXT NOT NULL,
      approved_at          TEXT,
      raw_json             TEXT
    ) STRICT;

    CREATE UNIQUE INDEX IF NOT EXISTS ux_donations_provider_payment
      ON donations(provider, provider_payment_id) WHERE provider_payment_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS ux_donations_external_ref
      ON donations(external_reference);

    CREATE TABLE IF NOT EXISTS webhook_events (
      provider     TEXT NOT NULL,
      event_id     TEXT NOT NULL,
      received_at  TEXT NOT NULL,
      PRIMARY KEY (provider, event_id)
    ) STRICT;
  `)

  const selectEvent = db.prepare(
    `SELECT 1 FROM webhook_events WHERE provider = ? AND event_id = ?`
  )
  const insertEvent = db.prepare(
    `INSERT OR IGNORE INTO webhook_events (provider, event_id, received_at) VALUES (?, ?, ?)`
  )
  const insertIntent = db.prepare(
    `INSERT INTO donations
      (id, provider, amount_cents, currency, status, external_reference, donor_email, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       amount_cents = excluded.amount_cents,
       currency = excluded.currency,
       donor_email = COALESCE(excluded.donor_email, donations.donor_email),
       updated_at = excluded.updated_at
     WHERE donations.status = 'pending' AND donations.provider_payment_id IS NULL`
  )
  const selectRef = db.prepare(
    `SELECT * FROM donations WHERE external_reference = ?`
  )
  const updatePayment = db.prepare(
    `UPDATE donations
       SET provider_payment_id = COALESCE(provider_payment_id, ?),
           status = ?,
           status_detail = ?,
           updated_at = ?,
           approved_at = CASE WHEN ? = 'approved' THEN COALESCE(approved_at, ?) ELSE approved_at END,
           raw_json = ?
     WHERE external_reference = ?`
  )
  const listStmt = db.prepare(
    `SELECT * FROM donations ORDER BY created_at DESC LIMIT ?`
  )

  return {
    hasWebhookEvent(provider, eventId) {
      return Boolean(selectEvent.get(provider, eventId))
    },

    recordWebhookEvent(provider, eventId) {
      const res = insertEvent.run(provider, eventId, new Date().toISOString())
      return Number(res.changes) > 0
    },

    upsertIntent(intent) {
      const now = new Date().toISOString()
      try {
        insertIntent.run(
          intent.id,
          intent.provider,
          intent.amountCents,
          intent.currency,
          intent.externalReference,
          intent.donorEmail ?? null,
          now,
          now
        )
      } catch (err) {
        if (!isUniqueViolation(err)) throw err
      }
    },

    getByExternalReference(ref) {
      return selectRef.get(ref) as DonationRecord | undefined
    },

    applyProviderPayment({ externalReference, providerPaymentId, status, statusDetail, rawJson }) {
      const current = selectRef.get(externalReference) as DonationRecord | undefined
      if (!current) return
      const now = new Date().toISOString()
      const currentRank = STATUS_RANK[current.status] ?? 0
      const nextRank = STATUS_RANK[status] ?? 0
      const advance = nextRank > currentRank
      const writeStatus = advance ? status : current.status
      const writeDetail = advance ? statusDetail ?? null : current.status_detail
      updatePayment.run(
        String(providerPaymentId),
        writeStatus,
        writeDetail,
        now,
        writeStatus,
        now,
        rawJson ?? null,
        externalReference
      )
    },

    list(limit = 100) {
      return listStmt.all(limit) as DonationRecord[]
    },
  }
}

let cached: LedgerStore | null = null

export function getLedger(): LedgerStore {
  if (cached) return cached
  const dir = process.env.DONATIONS_DATA_DIR || path.join(process.cwd(), "data")
  cached = createSqliteLedger(path.join(dir, "donations.db"))
  return cached
}
