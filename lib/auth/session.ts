import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto"
import {
  COOKIE_NAME,
  IV_LEN,
  TAG_LEN,
  VERSION_PREFIX,
} from "./config.ts"

export class SessionError extends Error {
  constructor(msg = "Session inválida") {
    super(msg)
    this.name = "SessionError"
  }
}

export type SessionPayload = {
  v: 1
  sub: "pastor"
  iat: number
  exp_idle: number
  exp_absolute: number
}

export function getSessionKey(): Buffer {
  const raw = process.env.ADMIN_SESSION_KEY
  if (!raw) {
    throw new Error("ADMIN_SESSION_KEY ausente")
  }
  let buf: Buffer
  try {
    buf = Buffer.from(raw, "base64")
  } catch {
    throw new Error("ADMIN_SESSION_KEY no es base64 válido")
  }
  if (buf.length !== 32) {
    throw new SessionError(
      `ADMIN_SESSION_KEY debe ser 32 bytes base64 (recibido ${buf.length})`
    )
  }
  return buf
}

export function encryptPayload(p: SessionPayload): string {
  const key = getSessionKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const pt = Buffer.from(JSON.stringify(p), "utf8")
  const ct = Buffer.concat([cipher.update(pt), cipher.final()])
  const tag = cipher.getAuthTag()
  return VERSION_PREFIX + Buffer.concat([iv, tag, ct]).toString("base64")
}

export function decryptPayload(s: string): SessionPayload {
  if (!s.startsWith(VERSION_PREFIX)) {
    throw new SessionError("Versión de cifrado desconocida")
  }
  const key = getSessionKey()
  const blob = Buffer.from(s.slice(VERSION_PREFIX.length), "base64")
  if (blob.length < IV_LEN + TAG_LEN) {
    throw new SessionError("Payload demasiado corto")
  }
  const iv = blob.subarray(0, IV_LEN)
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const ct = blob.subarray(IV_LEN + TAG_LEN)
  const decipher = createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)
  let pt: Buffer
  try {
    pt = Buffer.concat([decipher.update(ct), decipher.final()])
  } catch {
    throw new SessionError("Fallo de autenticación GCM")
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(pt.toString("utf8"))
  } catch {
    throw new SessionError("Payload no es JSON válido")
  }
  if (!isValidPayload(parsed)) {
    throw new SessionError("Estructura de payload inválida")
  }
  const now = Date.now()
  if (parsed.exp_idle <= now) {
    throw new SessionError("Sesión vencida (idle)")
  }
  if (parsed.exp_absolute <= now) {
    throw new SessionError("Sesión vencida (absolute)")
  }
  return parsed
}

function isValidPayload(p: unknown): p is SessionPayload {
  if (!p || typeof p !== "object") return false
  const o = p as Record<string, unknown>
  return (
    o.v === 1 &&
    o.sub === "pastor" &&
    typeof o.iat === "number" &&
    typeof o.exp_idle === "number" &&
    typeof o.exp_absolute === "number"
  )
}

export function issueCookie(payload: SessionPayload): string {
  const value = encryptPayload(payload)
  return [
    `${COOKIE_NAME}=${value}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
  ].join("; ")
}

export function clearCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}

export function readCookieFromHeaders(headers: Headers): string | undefined {
  // Headers de Next.js — get/set son case-insensitive
  const cookieHeader = headers.get("cookie")
  if (!cookieHeader) return undefined
  const parts = cookieHeader.split(";")
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=")
    if (name === COOKIE_NAME) {
      return rest.join("=")
    }
  }
  return undefined
}

export function validateAndParse(
  cookieValue: string | undefined
): SessionPayload | null {
  if (!cookieValue) return null
  let payload: SessionPayload
  try {
    payload = decryptPayload(cookieValue)
  } catch {
    return null
  }
  const now = Date.now()
  if (payload.exp_idle <= now) return null
  if (payload.exp_absolute <= now) return null
  return payload
}
