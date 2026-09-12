import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { verify } from "@/lib/auth/password"
import {
  encryptPayload,
  type SessionPayload,
} from "@/lib/auth/session"
import {
  IDLE_TIMEOUT_MS,
  ABSOLUTE_TIMEOUT_MS,
} from "@/lib/auth/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(200),
})

export async function POST(req: NextRequest) {
  // Gate: bloqueado en producción salvo opt-in explícito para integration tests.
  // Por qué el opt-in: `next start` corre el router-server con
  // `process.env.NODE_ENV = "production"` hardcodeado (incluso si NODE_ENV=test
  // se setea en el shell). El escape hatch `ENABLE_PASTOR_LOGIN_TEST=1` permite
  // a scripts/check-confessions-api.ts obtener un cookie firmado cuando se corre
  // contra `npm start`. En Dokploy esta env var NUNCA debe estar presente.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_PASTOR_LOGIN_TEST !== "1"
  ) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 })
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 })
  }

  if (!verify(parsed.data.password)) {
    return NextResponse.json({ ok: false, error: "Credenciales inválidas" }, { status: 401 })
  }

  const now = Date.now()
  const payload: SessionPayload = {
    v: 1,
    sub: "pastor",
    iat: now,
    exp_idle: now + IDLE_TIMEOUT_MS,
    exp_absolute: now + ABSOLUTE_TIMEOUT_MS,
  }

  const cookieValue = await encryptPayload(payload)

  return NextResponse.json(
    { ok: true, cookie: cookieValue },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}