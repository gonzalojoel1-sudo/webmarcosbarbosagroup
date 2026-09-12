import { mkdirSync } from "node:fs"
import path from "node:path"
import { randomUUID, randomBytes } from "node:crypto"
import { DatabaseSync } from "node:sqlite"

export type ConfessionRecord = {
  id: string
  message_encrypted: string
  pseudonym: string | null
  wants_response: number
  contact_method: string | null
  contact_value_encrypted: string | null
  consent: number
  consent_at: string
  policy_version: string
  ip_hash: string
  user_agent: string | null
  honeypot: string
  status: string
  read_at: string | null
  note_updated_at: string | null
  pastoral_note_encrypted: string | null
  created_at: string
  updated_at: string
}

export type CreateConfessionInput = {
  messageEncrypted: string
  pseudonym: string | null
  wantsResponse: number
  contactMethod: string | null
  contactValueEncrypted: string | null
  consent: number
  consentAt: string
  policyVersion: string
  ipHash: string
  userAgent: string | null
  honeypot: string
}

export interface ConfessionStore {
  createConfession(input: CreateConfessionInput): string
  listConfessions(limit?: number): ConfessionRecord[]
  getConfession(id: string): ConfessionRecord | undefined
  countNew(): number
  markRead(id: string): boolean
  setPastoralNote(id: string, encryptedNote: string): boolean
  deleteConfession(id: string): boolean
}

function newId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12) + randomBytes(4).toString("hex")
}

export function createSqliteConfessions(dbPath: string): ConfessionStore {
  mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new DatabaseSync(dbPath)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS confessions (
      id                       TEXT PRIMARY KEY,
      message_encrypted        TEXT NOT NULL,
      pseudonym                TEXT,
      wants_response           INTEGER NOT NULL DEFAULT 0,
      contact_method           TEXT,
      contact_value_encrypted  TEXT,
      consent                  INTEGER NOT NULL,
      consent_at               TEXT NOT NULL,
      policy_version           TEXT NOT NULL,
      ip_hash                  TEXT NOT NULL,
      user_agent               TEXT,
      honeypot                 TEXT NOT NULL DEFAULT '',
      status                   TEXT NOT NULL DEFAULT 'new',
      read_at                  TEXT,
      note_updated_at          TEXT,
      pastoral_note_encrypted  TEXT,
      created_at               TEXT NOT NULL,
      updated_at               TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS ix_confessions_status_created
      ON confessions(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS ix_confessions_ip_hash_created
      ON confessions(ip_hash, created_at DESC);
  `)

  // Migración idempotente: tabla creada antes del spec §4.1 tenía consent_at NULL.
  // DEFAULT '' mantiene válidos los rows existentes; SQLite no permite cambiar nullability con ALTER.
  for (const sql of [
    "ALTER TABLE confessions ADD COLUMN consent_at TEXT NOT NULL DEFAULT ''",
  ]) {
    try {
      db.exec(sql)
    } catch {
      /* column already exists or already NOT NULL */
    }
  }

  const insert = db.prepare(
    `INSERT INTO confessions
      (id, message_encrypted, pseudonym, wants_response, contact_method,
       contact_value_encrypted, consent, consent_at, policy_version,
       ip_hash, user_agent, honeypot, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`
  )
  const listStmt = db.prepare(
    `SELECT * FROM confessions ORDER BY created_at DESC LIMIT ?`
  )
  const getStmt = db.prepare(`SELECT * FROM confessions WHERE id = ?`)
  const countNewStmt = db.prepare(
    `SELECT COUNT(*) AS c FROM confessions WHERE status = 'new'`
  )
  const markReadStmt = db.prepare(
    `UPDATE confessions SET status = 'read', read_at = ?, updated_at = ?
     WHERE id = ? AND status = 'new'`
  )
  const setNoteStmt = db.prepare(
    `UPDATE confessions SET pastoral_note_encrypted = ?, note_updated_at = ?, updated_at = ?
     WHERE id = ?`
  )
  const deleteStmt = db.prepare(`DELETE FROM confessions WHERE id = ?`)

  return {
    createConfession(input) {
      const id = newId()
      const now = new Date().toISOString()
      insert.run(
        id,
        input.messageEncrypted,
        input.pseudonym,
        input.wantsResponse,
        input.contactMethod,
        input.contactValueEncrypted,
        input.consent,
        input.consentAt,
        input.policyVersion,
        input.ipHash,
        input.userAgent,
        input.honeypot,
        now,
        now
      )
      return id
    },
    listConfessions(limit = 100) {
      return listStmt.all(limit) as ConfessionRecord[]
    },
    getConfession(id) {
      return getStmt.get(id) as ConfessionRecord | undefined
    },
    countNew() {
      const row = countNewStmt.get() as { c: number }
      return Number(row.c)
    },
    markRead(id) {
      const now = new Date().toISOString()
      const res = markReadStmt.run(now, now, id)
      return Number(res.changes) > 0
    },
    setPastoralNote(id, encryptedNote) {
      const now = new Date().toISOString()
      const res = setNoteStmt.run(encryptedNote, now, now, id)
      return Number(res.changes) > 0
    },
    deleteConfession(id) {
      const res = deleteStmt.run(id)
      return Number(res.changes) > 0
    },
  }
}

let cached: ConfessionStore | null = null

export function getConfessions(): ConfessionStore {
  if (cached) return cached
  const dir =
    process.env.DATA_DIR ||
    process.env.DONATIONS_DATA_DIR ||
    path.join(process.cwd(), "data")
  cached = createSqliteConfessions(path.join(dir, "board.db"))
  return cached
}