"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { verify } from "@/lib/auth/password"
import { RateLimiter } from "@/lib/auth/rate-limit"
import {
  encryptPayload,
  type SessionPayload,
} from "@/lib/auth/session"
import {
  COOKIE_NAME,
  IDLE_TIMEOUT_MS,
  ABSOLUTE_TIMEOUT_MS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "@/lib/auth/config"
import { ipHash } from "@/lib/confessions/ip-hash"
import { safeLog } from "@/lib/confessions/log"

const limiter = new RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)

function safeNext(next: string | null): string {
  if (!next) return "/pastor/inbox"
  if (!next.startsWith("/pastor")) return "/pastor/inbox"
  if (next.includes("//")) return "/pastor/inbox"
  if (next.includes(":")) return "/pastor/inbox"
  return next
}

export async function loginPastor(formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const honeypot = String(formData.get("website") ?? "")
  const next = String(formData.get("next") ?? "")

  if (honeypot && honeypot.length > 0) {
    redirect("/pastor/inbox")
  }

  const h = headers()
  const realIp =
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",").pop()?.trim() ||
    "unknown"

  const hash = ipHash(realIp)
  const rl = limiter.check(hash)
  if (!rl.allowed) {
    safeLog("pastor.login.ratelimit", { status: 429 })
    redirect("/pastor?error=ratelimit&" + (next ? `next=${encodeURIComponent(next)}` : ""))
  }

  if (!verify(password)) {
    safeLog("pastor.login.fail", { status: 401 })
    redirect("/pastor?error=invalid&" + (next ? `next=${encodeURIComponent(next)}` : ""))
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
  ;(await cookies()).set({
    name: COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })

  safeLog("pastor.login.ok", { status: 200 })
  redirect(safeNext(next))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function logoutPastor(formData: FormData) {
  ;(await cookies()).set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  })
  safeLog("pastor.logout", { status: 200 })
  revalidatePath("/pastor")
  redirect("/pastor")
}