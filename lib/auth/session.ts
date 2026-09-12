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

export function getSessionKey(): Uint8Array {
  const raw = process.env.ADMIN_SESSION_KEY
  if (!raw) {
    throw new Error("ADMIN_SESSION_KEY ausente")
  }
  let bytes: Uint8Array
  try {
    const binary = atob(raw)
    bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
  } catch {
    throw new Error("ADMIN_SESSION_KEY no es base64 válido")
  }
  if (bytes.length !== 32) {
    throw new SessionError(
      `ADMIN_SESSION_KEY debe ser 32 bytes base64 (recibido ${bytes.length})`
    )
  }
  return bytes
}

async function importKey(): Promise<CryptoKey> {
  const keyBytes = getSessionKey()
  return crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  )
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function encryptPayload(p: SessionPayload): Promise<string> {
  const key = await importKey()
  const iv = new Uint8Array(IV_LEN)
  crypto.getRandomValues(iv)
  const pt = new TextEncoder().encode(JSON.stringify(p))
  const ctWithTag = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource, tagLength: TAG_LEN * 8 },
      key,
      pt as BufferSource
    )
  )
  const ctLength = ctWithTag.length - TAG_LEN
  const tag = ctWithTag.subarray(ctLength)
  const ct = ctWithTag.subarray(0, ctLength)
  const blob = new Uint8Array(IV_LEN + TAG_LEN + ctLength)
  blob.set(iv, 0)
  blob.set(tag, IV_LEN)
  blob.set(ct, IV_LEN + TAG_LEN)
  return VERSION_PREFIX + bytesToBase64(blob)
}

export async function decryptPayload(s: string): Promise<SessionPayload> {
  if (!s.startsWith(VERSION_PREFIX)) {
    throw new SessionError("Versión de cifrado desconocida")
  }
  const key = await importKey()
  const blob = base64ToBytes(s.slice(VERSION_PREFIX.length))
  if (blob.length < IV_LEN + TAG_LEN) {
    throw new SessionError("Payload demasiado corto")
  }
  const iv = blob.subarray(0, IV_LEN)
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const ct = blob.subarray(IV_LEN + TAG_LEN)
  const ctWithTag = new Uint8Array(ct.length + tag.length)
  ctWithTag.set(ct, 0)
  ctWithTag.set(tag, ct.length)
  let pt: Uint8Array
  try {
    pt = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource, tagLength: TAG_LEN * 8 },
        key,
        ctWithTag as BufferSource
      )
    )
  } catch {
    throw new SessionError("Fallo de autenticación GCM")
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder().decode(pt))
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

export async function issueCookie(payload: SessionPayload): Promise<string> {
  const value = await encryptPayload(payload)
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

export async function validateAndParse(
  cookieValue: string | undefined
): Promise<SessionPayload | null> {
  if (!cookieValue) return null
  let payload: SessionPayload
  try {
    payload = await decryptPayload(cookieValue)
  } catch {
    return null
  }
  return payload
}