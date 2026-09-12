import { NextRequest, NextResponse } from "next/server"
import { confessionSchema } from "@/lib/confessions/schema"
import { encrypt, getEncryptionKey } from "@/lib/confessions/crypto"
import { ipHash } from "@/lib/confessions/ip-hash"
import { RateLimiter } from "@/lib/confessions/rate-limit"
import { getConfessions } from "@/lib/confessions/store"
import { safeLog } from "@/lib/confessions/log"
import { clientIp } from "@/lib/http/client-ip"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY = 64 * 1024

const limiter = new RateLimiter(5, 60 * 60 * 1000)

function failClosedKey(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "No pudimos procesar tu mensaje" },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    }
  )
}

export async function POST(req: NextRequest) {
  // Fail closed si falta o es inválida la clave
  try {
    getEncryptionKey()
  } catch {
    safeLog("confession.create", { code: "key_missing" })
    return failClosedKey()
  }

  const declared = Number(req.headers.get("content-length") || 0)
  if (declared && declared > MAX_BODY) {
    return NextResponse.json(
      { ok: false, error: "El envío es demasiado grande." },
      { status: 413, headers: { "Cache-Control": "no-store" } }
    )
  }

  const ip = clientIp(req)
  const hash = ipHash(ip)
  const rl = limiter.check(hash)
  if (!rl.allowed) {
    safeLog("confession.ratelimit", { status: 429 })
    return NextResponse.json(
      {
        ok: false,
        error:
          "Estás enviando mensajes muy seguido. Esperá un momento antes de volver a intentar.",
      },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos procesar tu mensaje" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    )
  }

  const parsed = confessionSchema.safeParse(json)
  if (!parsed.success) {
    safeLog("confession.create", { code: "schema" })
    return NextResponse.json(
      { ok: false, error: "Revisá los datos del formulario." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    )
  }

  const data = parsed.data

  // Honeypot: silencioso, NO persistir
  if (data.honeypot && data.honeypot.length > 0) {
    safeLog("confession.honeypot", { status: 200 })
    return NextResponse.json({ ok: true }, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    })
  }

  let messageEncrypted: string
  let contactEncrypted: string | null = null
  try {
    messageEncrypted = encrypt(data.message)
    if (data.wantsResponse && data.contactValue) {
      contactEncrypted = encrypt(data.contactValue)
    }
  } catch {
    safeLog("confession.create", { code: "encrypt_failed" })
    return failClosedKey()
  }

  const id = getConfessions().createConfession({
    messageEncrypted,
    pseudonym: data.pseudonym && data.pseudonym.length > 0 ? data.pseudonym : null,
    wantsResponse: data.wantsResponse ? 1 : 0,
    contactMethod: data.wantsResponse ? data.contactMethod ?? null : null,
    contactValueEncrypted: contactEncrypted,
    consent: 1,
    consentAt: new Date().toISOString(),
    policyVersion: data.policyVersion,
    ipHash: hash,
    userAgent: (req.headers.get("user-agent") || "").slice(0, 255) || null,
    honeypot: "",
  })

  safeLog("confession.create", { id, status: 200 })
  return NextResponse.json({ ok: true, id }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
