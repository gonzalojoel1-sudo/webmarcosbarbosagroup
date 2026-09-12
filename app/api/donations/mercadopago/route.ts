import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { donationIntentSchema, resolveAmountCents } from "@/lib/donations/amounts"
import { getLedger } from "@/lib/donations/ledger"
import { createPreference, isMpConfigured } from "@/lib/donations/mp"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://marcosbarbosagroup.com"

const hits = new Map<string, { count: number; ts: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60_000
  const max = 10
  const h = hits.get(ip)
  if (!h || now - h.ts > windowMs) {
    hits.set(ip, { count: 1, ts: now })
    return false
  }
  h.count += 1
  return h.count > max
}

export async function POST(req: NextRequest) {
  if (!isMpConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "MP_NOT_CONFIGURED",
        error:
          "El pago online no está disponible por el momento. Podés ofrendar por transferencia.",
      },
      { status: 503 }
    )
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados intentos. Probá en un minuto." },
      { status: 429 }
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 })
  }

  const parsed = donationIntentSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Datos inválidos",
        details: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }

  const data = parsed.data

  let cents: number
  try {
    cents = resolveAmountCents({ presetId: data.presetId, customArs: data.customArs })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Monto inválido" },
      { status: 400 }
    )
  }

  const donationId =
    data.attemptId && /^[0-9a-f-]{36}$/i.test(data.attemptId)
      ? data.attemptId
      : randomUUID()
  const donorEmail = data.donorEmail || undefined

  const ledger = getLedger()
  ledger.upsertIntent({
    id: donationId,
    provider: "mercadopago",
    amountCents: cents,
    currency: "ARS",
    externalReference: donationId,
    donorEmail,
  })

  try {
    const { initPoint } = await createPreference({
      donationId,
      cents,
      donorEmail,
      siteUrl: SITE_URL,
    })
    return NextResponse.json({ ok: true, init_point: initPoint, donation_id: donationId })
  } catch (err) {
    console.error(
      "[donations/mp] create preference failed:",
      err instanceof Error ? err.message : "error"
    )
    return NextResponse.json(
      { ok: false, error: "No pudimos iniciar el pago. Intentá de nuevo." },
      { status: 502 }
    )
  }
}
