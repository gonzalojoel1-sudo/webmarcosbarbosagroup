import { scryptSync, timingSafeEqual } from "node:crypto"

// Salt fijo en código — single-pastor, no es necesario per-user.
// Si en el futuro hay multi-usuario, mover a tabla users con salt per-user.
const FIXED_SALT = Buffer.from(
  "marcosbarbosagroup-pastor-salt-2026-fixed-v1",
  "utf8"
)

let cachedHash: Buffer | null = null

export function bootHash(): Buffer {
  if (cachedHash) return cachedHash
  const raw = process.env.ADMIN_PASS
  if (!raw) {
    throw new Error("ADMIN_PASS ausente")
  }
  cachedHash = scryptSync(raw, FIXED_SALT, 64)
  return cachedHash
}

export function verify(submitted: string): boolean {
  if (!submitted) return false
  const expected = bootHash()
  let candidate: Buffer
  try {
    candidate = scryptSync(submitted, FIXED_SALT, 64)
  } catch {
    return false
  }
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(expected, candidate)
}

export function __resetForTests(): void {
  cachedHash = null
}
