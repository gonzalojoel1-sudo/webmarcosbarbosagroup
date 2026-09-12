import { createHash } from "node:crypto"

function getSalt(): string {
  const salt = process.env.CONFESSIONS_IP_SALT
  if (!salt || salt.length < 16) {
    throw new Error("CONFESSIONS_IP_SALT ausente o muy corto (mínimo 16 chars)")
  }
  return salt
}

export function ipHash(ip: string): string {
  const h = createHash("sha256")
  h.update(getSalt())
  h.update("\x00")
  h.update(ip)
  return h.digest("hex")
}