import assert from "node:assert/strict"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

async function main() {
  const tmp = mkdtempSync(join(tmpdir(), "board-check-"))
  process.env.DATA_DIR = tmp

  const schema = await import("../lib/board/schema.ts")
  const store = await import("../lib/board/store.ts")

  let passed = 0
  const ok = (name: string, fn: () => void) => {
    fn()
    passed++
    console.log(`PASS  ${name}`)
  }

  ok("job válido parsea", () => {
    const r = schema.jobSchema.safeParse({
      company: "Acme SA",
      title: "Jefe de ventas",
      description: "Buscamos un líder comercial con experiencia en equipos.",
      contactName: "Ana Pérez",
      contactEmail: "ana@acme.com",
    })
    assert.equal(r.success, true)
  })
  ok("job sin descripción suficiente falla", () => {
    const r = schema.jobSchema.safeParse({
      company: "Acme",
      title: "Ventas",
      description: "corto",
      contactName: "Ana",
      contactEmail: "ana@acme.com",
    })
    assert.equal(r.success, false)
  })
  ok("email inválido falla", () => {
    const r = schema.jobSchema.safeParse({
      company: "Acme",
      title: "Ventas",
      description: "Descripción suficientemente larga para pasar.",
      contactName: "Ana",
      contactEmail: "no-es-email",
    })
    assert.equal(r.success, false)
  })
  ok("candidato requiere consentimiento", () => {
    const r = schema.candidateSchema.safeParse({
      name: "Juan",
      email: "juan@mail.com",
      consent: false,
    })
    assert.equal(r.success, false)
  })
  ok("candidato válido parsea", () => {
    const r = schema.candidateSchema.safeParse({
      name: "Juan",
      email: "juan@mail.com",
      consent: true,
    })
    assert.equal(r.success, true)
  })

  const board = store.createSqliteBoard(join(tmp, "board.db"))
  ok("guardar y listar búsqueda", () => {
    const id = board.createJob({
      company: "Acme SA",
      title: "Jefe de ventas",
      location: "Córdoba",
      modality: "hibrido",
      salary_range: null,
      description: "Buscamos un líder comercial con experiencia en equipos.",
      contact_name: "Ana Pérez",
      contact_email: "ana@acme.com",
      contact_phone: null,
    })
    assert.ok(id)
    const jobs = board.listJobs()
    assert.equal(jobs.length, 1)
    assert.equal(jobs[0].title, "Jefe de ventas")
  })
  ok("guardar y listar candidato", () => {
    const id = board.createCandidate({
      name: "Juan",
      email: "juan@mail.com",
      phone: null,
      desired_role: "Administración",
      experience: "5 años",
      cv_original_name: "cv.pdf",
      cv_file: "abc.pdf",
      cv_size: 1234,
      cv_mime: "application/pdf",
      consent: 1,
      consent_at: new Date().toISOString(),
      policy_version: "2026-09",
    })
    assert.ok(id)
    const c = board.listCandidates()
    assert.equal(c.length, 1)
    assert.equal(c[0].cv_file, "abc.pdf")
  })

  console.log(`\nOK: ${passed} verificaciones de la bolsa`)
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err)
  process.exit(1)
})
