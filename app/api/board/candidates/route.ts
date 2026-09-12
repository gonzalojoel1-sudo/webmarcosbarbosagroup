import { NextRequest, NextResponse } from "next/server"
import { writeFile, rename, unlink } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import path from "node:path"
import { candidateSchema, MAX_CV_BYTES } from "@/lib/board/schema"
import { getBoard, cvsDir } from "@/lib/board/store"
import { sniffCvExt, safeOriginalName } from "@/lib/board/file"
import { clientIp } from "@/lib/http/client-ip"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY = MAX_CV_BYTES + 1_000_000

const hits = new Map<string, { count: number; ts: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60_000
  const max = 8
  for (const [key, entry] of Array.from(hits.entries())) {
    if (now - entry.ts > windowMs) hits.delete(key)
  }
  const h = hits.get(ip)
  if (!h || now - h.ts > windowMs) {
    hits.set(ip, { count: 1, ts: now })
    return false
  }
  h.count += 1
  return h.count > max
}

export async function POST(req: NextRequest) {
  const declared = Number(req.headers.get("content-length") || 0)
  if (declared && declared > MAX_BODY) {
    return NextResponse.json({ ok: false, error: "El CV supera los 5 MB." }, { status: 413 })
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ ok: false, error: "Demasiados envíos. Probá en un minuto." }, { status: 429 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: "Formulario inválido" }, { status: 400 })
  }

  const field = (key: string) => {
    const value = form.get(key)
    return typeof value === "string" ? value.trim() : ""
  }

  const raw = {
    name: field("name"),
    email: field("email"),
    phone: field("phone"),
    desiredRole: field("desiredRole"),
    experience: field("experience"),
    consent: field("consent") === "true" || field("consent") === "on",
    honeypot: field("honeypot"),
  }

  const parsed = candidateSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Revisá los datos del formulario.",
        details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      { status: 400 }
    )
  }
  const data = parsed.data
  if (data.honeypot) {
    return NextResponse.json({ ok: true })
  }

  const file = form.get("cv")
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Adjuntá tu CV." }, { status: 400 })
  }
  if (file.size > MAX_CV_BYTES) {
    return NextResponse.json({ ok: false, error: "El CV supera los 5 MB." }, { status: 413 })
  }

  let bytes: Buffer
  try {
    bytes = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ ok: false, error: "No pudimos leer el archivo." }, { status: 400 })
  }
  if (bytes.length > MAX_CV_BYTES) {
    return NextResponse.json({ ok: false, error: "El CV supera los 5 MB." }, { status: 413 })
  }

  const ext = sniffCvExt(bytes)
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Formato no permitido. Subí PDF, DOC o DOCX." },
      { status: 400 }
    )
  }

  const storedName = `${randomUUID()}.${ext}`
  const finalPath = path.join(cvsDir(), storedName)
  const tmpPath = `${finalPath}.tmp`
  try {
    await writeFile(tmpPath, bytes)
    await rename(tmpPath, finalPath)
  } catch {
    await unlink(tmpPath).catch(() => {})
    console.error("[board/candidates] cv write failed")
    return NextResponse.json({ ok: false, error: "No pudimos guardar tu CV. Probá de nuevo." }, { status: 500 })
  }

  try {
    getBoard().createCandidate({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      desired_role: data.desiredRole || null,
      experience: data.experience || null,
      cv_original_name: safeOriginalName(file.name),
      cv_file: storedName,
      cv_size: bytes.length,
      cv_mime: file.type || null,
      consent: 1,
      consent_at: new Date().toISOString(),
      policy_version: "2026-09",
    })
  } catch {
    await unlink(finalPath).catch(() => {})
    console.error("[board/candidates] db insert failed")
    return NextResponse.json({ ok: false, error: "No pudimos guardar tu postulación. Probá de nuevo." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
