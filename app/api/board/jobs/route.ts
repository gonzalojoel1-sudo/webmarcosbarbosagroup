import { NextRequest, NextResponse } from "next/server"
import { jobSchema } from "@/lib/board/schema"
import { getBoard } from "@/lib/board/store"
import { clientIp } from "@/lib/http/client-ip"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY = 128 * 1024

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
    return NextResponse.json({ ok: false, error: "El envío es demasiado grande." }, { status: 413 })
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ ok: false, error: "Demasiados envíos. Probá en un minuto." }, { status: 429 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 })
  }

  const parsed = jobSchema.safeParse(json)
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

  try {
    getBoard().createJob({
      company: data.company,
      title: data.title,
      location: data.location || null,
      modality: data.modality || null,
      salary_range: data.salaryRange || null,
      description: data.description,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone || null,
    })
  } catch {
    console.error("[board/jobs] insert failed")
    return NextResponse.json({ ok: false, error: "No pudimos guardar la búsqueda. Probá de nuevo." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
