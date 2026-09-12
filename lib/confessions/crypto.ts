import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const VERSION_BYTE = 0x01
const VERSION_PREFIX = "0x01"
const IV_LEN = 12
const TAG_LEN = 16

export class DecryptionError extends Error {
  constructor(msg = "No se pudo descifrar") {
    super(msg)
    this.name = "DecryptionError"
  }
}

export function getEncryptionKey(): Buffer {
  const raw = process.env.CONFESSIONS_ENCRYPTION_KEY
  if (!raw) {
    throw new Error("CONFESSIONS_ENCRYPTION_KEY ausente")
  }
  let buf: Buffer
  try {
    buf = Buffer.from(raw, "base64")
  } catch {
    throw new Error("CONFESSIONS_ENCRYPTION_KEY no es base64 válido")
  }
  if (buf.length !== 32) {
    throw new DecryptionError(
      `CONFESSIONS_ENCRYPTION_KEY debe ser 32 bytes base64 (recibido ${buf.length})`
    )
  }
  return buf
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  const blob = Buffer.concat([iv, tag, ct])
  return VERSION_PREFIX + blob.toString("base64")
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext.startsWith(VERSION_PREFIX)) {
    throw new DecryptionError("Versión de cifrado desconocida")
  }
  const key = getEncryptionKey()
  const blob = Buffer.from(ciphertext.slice(VERSION_PREFIX.length), "base64")
  if (blob.length < IV_LEN + TAG_LEN) {
    throw new DecryptionError("Ciphertext demasiado corto")
  }
  const iv = blob.subarray(0, IV_LEN)
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const ct = blob.subarray(IV_LEN + TAG_LEN)
  const decipher = createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)
  try {
    const pt = Buffer.concat([decipher.update(ct), decipher.final()])
    return pt.toString("utf8")
  } catch {
    throw new DecryptionError("Fallo de autenticación GCM")
  }
}