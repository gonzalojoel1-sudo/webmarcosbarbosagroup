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
  // Gate: solo funciona en dev/test, NUNCA en producción
  if (process.env.NODE_ENV === "production") {
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

  const cookieValue = encryptPayload(payload)

  return NextResponse.json(
    { ok: true, cookie: cookieValue },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}