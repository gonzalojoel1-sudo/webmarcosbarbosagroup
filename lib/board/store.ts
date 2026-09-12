import { mkdirSync } from "node:fs"
import { randomUUID } from "node:crypto"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"

export type JobPost = {
  id: string
  company: string
  title: string
  location: string | null
  modality: string | null
  salary_range: string | null
  description: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  status: string
  created_at: string
}

export type Candidate = {
  id: string
  name: string
  email: string
  phone: string | null
  desired_role: string | null
  experience: string | null
  cv_original_name: string | null
  cv_file: string | null
  cv_size: number | null
  cv_mime: string | null
  status: string
  created_at: string
}

export function dataDir(): string {
  return (
    process.env.DATA_DIR ||
    process.env.DONATIONS_DATA_DIR ||
    path.join(process.cwd(), "data")
  )
}

export function cvsDir(): string {
  const dir = path.join(dataDir(), "cvs")
  mkdirSync(dir, { recursive: true })
  return dir
}

export interface BoardStore {
  createJob(job: Omit<JobPost, "id" | "status" | "created_at">): string
  createCandidate(
    candidate: Omit<Candidate, "id" | "status" | "created_at">
  ): string
  listJobs(limit?: number): JobPost[]
  listCandidates(limit?: number): Candidate[]
}

export function createSqliteBoard(dbPath: string): BoardStore {
  mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new DatabaseSync(dbPath)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS job_posts (
      id             TEXT PRIMARY KEY,
      company        TEXT NOT NULL,
      title          TEXT NOT NULL,
      location       TEXT,
      modality       TEXT,
      salary_range   TEXT,
      description    TEXT NOT NULL,
      contact_name   TEXT NOT NULL,
      contact_email  TEXT NOT NULL,
      contact_phone  TEXT,
      status         TEXT NOT NULL DEFAULT 'new',
      created_at     TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS candidates (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      email            TEXT NOT NULL,
      phone            TEXT,
      desired_role     TEXT,
      experience     TEXT,
      cv_original_name TEXT,
      cv_file        TEXT,
      cv_size        INTEGER,
      cv_mime          TEXT,
      status           TEXT NOT NULL DEFAULT 'new',
      created_at       TEXT NOT NULL
    ) STRICT;
  `)

  const insertJob = db.prepare(
    `INSERT INTO job_posts
      (id, company, title, location, modality, salary_range, description, contact_name, contact_email, contact_phone, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const insertCandidate = db.prepare(
    `INSERT INTO candidates
      (id, name, email, phone, desired_role, experience, cv_original_name, cv_file, cv_size, cv_mime, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const listJobsStmt = db.prepare(
    `SELECT * FROM job_posts ORDER BY created_at DESC LIMIT ?`
  )
  const listCandidatesStmt = db.prepare(
    `SELECT * FROM candidates ORDER BY created_at DESC LIMIT ?`
  )

  return {
    createJob(job) {
      const id = randomUUID()
      insertJob.run(
        id,
        job.company,
        job.title,
        job.location ?? null,
        job.modality ?? null,
        job.salary_range ?? null,
        job.description,
        job.contact_name,
        job.contact_email,
        job.contact_phone ?? null,
        new Date().toISOString()
      )
      return id
    },
    createCandidate(candidate) {
      const id = randomUUID()
      insertCandidate.run(
        id,
        candidate.name,
        candidate.email,
        candidate.phone ?? null,
        candidate.desired_role ?? null,
        candidate.experience ?? null,
        candidate.cv_original_name ?? null,
        candidate.cv_file ?? null,
        candidate.cv_size ?? null,
        candidate.cv_mime ?? null,
        new Date().toISOString()
      )
      return id
    },
    listJobs(limit = 100) {
      return listJobsStmt.all(limit) as JobPost[]
    },
    listCandidates(limit = 100) {
      return listCandidatesStmt.all(limit) as Candidate[]
    },
  }
}

let cached: BoardStore | null = null

export function getBoard(): BoardStore {
  if (cached) return cached
  cached = createSqliteBoard(path.join(dataDir(), "board.db"))
  return cached
}
