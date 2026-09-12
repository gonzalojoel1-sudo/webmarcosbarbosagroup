import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import path from "node:path"
import { candidateSchema, ALLOWED_CV, MAX_CV_BYTES } from "@/lib/board/schema"
import { getBoard, cvsDir } from "@/lib/board/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiados envíos. Probá en un minuto." }, { status: 429 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: "Formulario inválido" }, { status: 400 })
  }

  const raw = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    phone: String(form.get("phone") ?? "").trim(),
    desiredRole: String(form.get("desiredRole") ?? "").trim(),
    experience: String(form.get("experience") ?? "").trim(),
    consent: form.get("consent") === "true" || form.get("consent") === "on",
    honeypot: String(form.get("honeypot") ?? ""),
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
  const ext = ALLOWED_CV[file.type]
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Formato no permitido. Subí PDF, DOC o DOCX." },
      { status: 400 }
    )
  }

  const storedName = `${randomUUID()}.${ext}`
  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(cvsDir(), storedName), bytes)
  } catch {
    console.error("[board/candidates] cv write failed")
    return NextResponse.json({ ok: false, error: "No pudimos guardar tu CV. Probá de nuevo." }, { status: 500 })
  }

  getBoard().createCandidate({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    desired_role: data.desiredRole || null,
    experience: data.experience || null,
    cv_original_name: file.name,
    cv_file: storedName,
    cv_size: file.size,
    cv_mime: file.type,
  })

  return NextResponse.json({ ok: true })
}
