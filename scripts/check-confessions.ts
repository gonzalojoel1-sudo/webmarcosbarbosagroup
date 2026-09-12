import assert from "node:assert/strict"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const tmp = mkdtempSync(join(tmpdir(), "conf-check-"))
process.env.DATA_DIR = tmp
process.env.CONFESSIONS_ENCRYPTION_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
process.env.CONFESSIONS_IP_SALT = "00112233445566778899aabbccddeeff"

let passed = 0
export const ok = (name: string, fn: () => void | Promise<void>) => {
  return Promise.resolve().then(fn).then(() => {
    passed++
    console.log(`PASS  ${name}`)
  })
}

export function done() {
  console.log(`\nOK: ${passed} verificaciones del confesionario`)
}

export function fail(err: unknown) {
  console.error("FAIL:", err instanceof Error ? err.message : err)
  process.exit(1)
}

async function main() {
const ipHash = (await import("../lib/confessions/ip-hash.ts")).ipHash

await ok("misma IP produce mismo hash", () => {
  const a = ipHash("203.0.113.5")
  const b = ipHash("203.0.113.5")
  assert.equal(a, b)
})
await ok("distinta IP produce distinto hash", () => {
  assert.notEqual(ipHash("203.0.113.5"), ipHash("203.0.113.6"))
})
await ok("hash tiene 64 hex chars", () => {
  const h = ipHash("203.0.113.5")
  assert.equal(h.length, 64)
  assert.match(h, /^[0-9a-f]{64}$/)
})
await ok("hash difiere sin/ con espacios", () => {
  assert.notEqual(ipHash("203.0.113.5"), ipHash(" 203.0.113.5 "))
})

const cryptoMod = await import("../lib/confessions/crypto.ts")
const { encrypt, decrypt, DecryptionError, getEncryptionKey } = cryptoMod

await ok("encrypt + decrypt round-trip", () => {
  const ct = encrypt("Hola, esto es un mensaje privado.")
  const pt = decrypt(ct)
  assert.equal(pt, "Hola, esto es un mensaje privado.")
})
await ok("dos encrypts del mismo texto producen ciphertext distinto (IV aleatorio)", () => {
  const a = encrypt("mismo texto")
  const b = encrypt("mismo texto")
  assert.notEqual(a, b)
})
await ok("decrypt con key distinta tira DecryptionError", () => {
  const ct = encrypt("secreto")
  const original = process.env.CONFESSIONS_ENCRYPTION_KEY
  process.env.CONFESSIONS_ENCRYPTION_KEY = "ZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmQ="
  try {
    let threw = false
    try {
      decrypt(ct)
    } catch (e) {
      threw = e instanceof DecryptionError
    }
    assert.equal(threw, true)
  } finally {
    process.env.CONFESSIONS_ENCRYPTION_KEY = original
  }
})
await ok("byte de versión desconocido tira DecryptionError", () => {
  const forged = "0x02" + Buffer.from("cualquiercosa").toString("base64")
  let threw = false
  try {
    decrypt(forged)
  } catch (e) {
    threw = e instanceof DecryptionError
  }
  assert.equal(threw, true)
})
await ok("getEncryptionKey devuelve Buffer de 32 bytes", () => {
  const k = getEncryptionKey()
  assert.ok(Buffer.isBuffer(k))
  assert.equal(k.length, 32)
})
await ok("ciphertext empieza con 0x01 literal", () => {
  const ct = encrypt("x")
  assert.ok(ct.startsWith("0x01"))
})

const { confessionSchema, MIN_MESSAGE, MAX_MESSAGE, MAX_PSEUDONYM } = await import(
  "../lib/confessions/schema.ts"
)

const validPayload = {
  message: "Hace dos años que cargo con esto y no puedo soltarlo.",
  pseudonym: "",
  wantsResponse: false,
  contactMethod: undefined,
  contactValue: undefined,
  consent: true,
  policyVersion: "2026-09-12-v1",
  honeypot: "",
}

await ok("constantes correctas", () => {
  assert.equal(MIN_MESSAGE, 20)
  assert.equal(MAX_MESSAGE, 4000)
  assert.equal(MAX_PSEUDONYM, 60)
})

await ok("payload válido parsea", () => {
  const r = confessionSchema.safeParse(validPayload)
  assert.equal(r.success, true)
})

await ok("mensaje < 20 falla", () => {
  const r = confessionSchema.safeParse({ ...validPayload, message: "corto" })
  assert.equal(r.success, false)
})

await ok("mensaje > 4000 falla", () => {
  const r = confessionSchema.safeParse({ ...validPayload, message: "x".repeat(4001) })
  assert.equal(r.success, false)
})

await ok("wantsResponse=true sin contactMethod/Value falla", () => {
  const r = confessionSchema.safeParse({ ...validPayload, wantsResponse: true })
  assert.equal(r.success, false)
})

await ok("wantsResponse=true con email inválido falla", () => {
  const r = confessionSchema.safeParse({
    ...validPayload,
    wantsResponse: true,
    contactMethod: "email",
    contactValue: "no-es-email",
  })
  assert.equal(r.success, false)
})

await ok("wantsResponse=true con email válido pasa", () => {
  const r = confessionSchema.safeParse({
    ...validPayload,
    wantsResponse: true,
    contactMethod: "email",
    contactValue: "persona@ejemplo.com",
  })
  assert.equal(r.success, true)
})

await ok("whatsApp válido acepta +54 9 351 1234567", () => {
  const r = confessionSchema.safeParse({
    ...validPayload,
    wantsResponse: true,
    contactMethod: "whatsapp",
    contactValue: "+54 9 351 1234567",
  })
  assert.equal(r.success, true)
})

await ok("whatsApp inválido falla", () => {
  const r = confessionSchema.safeParse({
    ...validPayload,
    wantsResponse: true,
    contactMethod: "whatsapp",
    contactValue: "abc",
  })
  assert.equal(r.success, false)
})

await ok("consent=false falla", () => {
  const r = confessionSchema.safeParse({ ...validPayload, consent: false })
  assert.equal(r.success, false)
})

await ok("policyVersion incorrecta falla", () => {
  const r = confessionSchema.safeParse({ ...validPayload, policyVersion: "2020-01" })
  assert.equal(r.success, false)
})

await ok("honeypot poblado parsea OK (la política es a nivel handler)", () => {
  const r = confessionSchema.safeParse({ ...validPayload, honeypot: "spam-bot" })
  assert.equal(r.success, true)
})

await ok("honeypot whitespace-only NO se trimea (debe disparar silent-200)", () => {
  const r = confessionSchema.safeParse({ ...validPayload, honeypot: "   " })
  assert.equal(r.success, true)
  if (r.success) {
    assert.equal(r.data.honeypot, "   ")
    assert.ok(r.data.honeypot.length > 0, "whitespace-only debe llegar no-vacío al handler")
  }
})

await ok("pseudonym > 60 falla", () => {
  const r = confessionSchema.safeParse({ ...validPayload, pseudonym: "x".repeat(61) })
  assert.equal(r.success, false)
})

const { RateLimiter } = await import("../lib/confessions/rate-limit.ts")

await ok("5 hits OK, 6º → blocked", () => {
  const rl = new RateLimiter(5, 60 * 60 * 1000)
  const ip = "h1"
  for (let i = 0; i < 5; i++) {
    assert.equal(rl.check(ip).allowed, true)
  }
  assert.equal(rl.check(ip).allowed, false)
})

await ok("IP distinta no se afecta por IP saturada", () => {
  const rl = new RateLimiter(5, 60 * 60 * 1000)
  for (let i = 0; i < 6; i++) rl.check("a")
  assert.equal(rl.check("b").allowed, true)
})

await ok("ventana expira tras windowMs (con mock de tiempo)", () => {
  const rl = new RateLimiter(5, 60 * 60 * 1000)
  let now = 1_000_000
  for (let i = 0; i < 5; i++) {
    assert.equal(rl.check("ip", now).allowed, true)
    now += 1_000
  }
  assert.equal(rl.check("ip", now).allowed, false)
  now += 60 * 60 * 1000
  assert.equal(rl.check("ip", now).allowed, true)
})

await ok("remaining decrece", () => {
  const rl = new RateLimiter(3, 60_000)
  assert.equal(rl.check("k").remaining, 2)
  assert.equal(rl.check("k").remaining, 1)
  assert.equal(rl.check("k").remaining, 0)
})

const { safeLog } = await import("../lib/confessions/log.ts")

await ok("safeLog emite evento con allowlist", () => {
  const captured: string[] = []
  const orig = console.log
  console.log = (msg: string) => {
    captured.push(msg)
  }
  try {
    safeLog("confession.create", {
      id: "abcdef12-3456-7890-abcd-ef1234567890",
      status: 200,
      ms: 42,
    })
    assert.equal(captured.length, 1)
    const line = captured[0]
    assert.ok(line.includes("confession.create"))
    assert.ok(line.includes("id=abcdef12"))
    assert.ok(!line.includes("3456-7890"))
  } finally {
    console.log = orig
  }
})

await ok("safeLog descarta campos fuera de allowlist", () => {
  const captured: string[] = []
  const orig = console.log
  console.log = (msg: string) => {
    captured.push(msg)
  }
  try {
    safeLog("confession.create", {
      message: "secreto que no debe filtrarse",
      contactValue: "persona@ejemplo.com",
      ipHash: "0123456789abcdef".repeat(4),
      userAgent: "Mozilla/5.0 (full UA string)",
      pseudonym: "anónimo",
      status: 200,
    })
    const line = captured[0]
    assert.ok(!line.includes("secreto"))
    assert.ok(!line.includes("persona@"))
    assert.ok(!line.includes("abcdef"))
    assert.ok(!line.includes("Mozilla"))
    assert.ok(!line.includes("anónimo"))
  } finally {
    console.log = orig
  }
})

const { createSqliteConfessions } = await import("../lib/confessions/store.ts")

await ok("createConfession persiste ciphertext (no plaintext)", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "conf-store-"))
  const store = createSqliteConfessions(join(tmpDir, "b.db"))
  const id = store.createConfession({
    messageEncrypted: "0x01" + Buffer.from("iv|tag|ct").toString("base64"),
    pseudonym: "peregrino",
    wantsResponse: 1,
    contactMethod: "email",
    contactValueEncrypted: "0x01" + Buffer.from("iv|tag|ct2").toString("base64"),
    consent: 1,
    consentAt: new Date().toISOString(),
    policyVersion: "2026-09-12-v1",
    ipHash: "0".repeat(64),
    userAgent: "Mozilla",
    honeypot: "",
  })
  const rec = store.getConfession(id)
  assert.ok(rec)
  assert.ok(!JSON.stringify(rec).includes("plaintext"))
  assert.equal(rec?.status, "new")
  assert.equal(rec?.pseudonym, "peregrino")
})

await ok("list/get devuelven ciphertext (no se filtra plaintext)", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "conf-store-"))
  const store = createSqliteConfessions(join(tmpDir, "b.db"))
  store.createConfession({
    messageEncrypted: "CIPHERTEXT_BLOB",
    pseudonym: null,
    wantsResponse: 0,
    contactMethod: null,
    contactValueEncrypted: null,
    consent: 1,
    consentAt: new Date().toISOString(),
    policyVersion: "2026-09-12-v1",
    ipHash: "1".repeat(64),
    userAgent: null,
    honeypot: "",
  })
  const list = store.listConfessions()
  assert.equal(list.length, 1)
  assert.equal(list[0].message_encrypted, "CIPHERTEXT_BLOB")
  assert.equal(list[0].pseudonym, null)
})

await ok("markRead es idempotente", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "conf-store-"))
  const store = createSqliteConfessions(join(tmpDir, "b.db"))
  const id = store.createConfession({
    messageEncrypted: "C",
    pseudonym: null,
    wantsResponse: 0,
    contactMethod: null,
    contactValueEncrypted: null,
    consent: 1,
    consentAt: new Date().toISOString(),
    policyVersion: "2026-09-12-v1",
    ipHash: "2".repeat(64),
    userAgent: null,
    honeypot: "",
  })
  assert.equal(store.markRead(id), true)
  assert.equal(store.markRead(id), false)
  assert.equal(store.getConfession(id)?.status, "read")
  assert.ok(store.getConfession(id)?.read_at)
})

await ok("setPastoralNote encripta (ciphertext persiste)", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "conf-store-"))
  const store = createSqliteConfessions(join(tmpDir, "b.db"))
  const id = store.createConfession({
    messageEncrypted: "C",
    pseudonym: null,
    wantsResponse: 0,
    contactMethod: null,
    contactValueEncrypted: null,
    consent: 1,
    consentAt: new Date().toISOString(),
    policyVersion: "2026-09-12-v1",
    ipHash: "3".repeat(64),
    userAgent: null,
    honeypot: "",
  })
  assert.equal(store.setPastoralNote(id, "CIPHER_NOTE"), true)
  const rec = store.getConfession(id)
  assert.equal(rec?.pastoral_note_encrypted, "CIPHER_NOTE")
  assert.ok(rec?.note_updated_at)
})

await ok("deleteConfession borra realmente", () => {
  const tdir = mkdtempSync(join(tmpdir(), "conf-del-"))
  const store = createSqliteConfessions(join(tdir, "b.db"))
  const id = store.createConfession({
    messageEncrypted: "C",
    pseudonym: null,
    wantsResponse: 0,
    contactMethod: null,
    contactValueEncrypted: null,
    consent: 1,
    consentAt: new Date().toISOString(),
    policyVersion: "2026-09-12-v1",
    ipHash: "4".repeat(64),
    userAgent: null,
    honeypot: "",
  })
  assert.equal(store.deleteConfession(id), true)
  assert.equal(store.getConfession(id), undefined)
  assert.equal(store.deleteConfession(id), false)
})

await ok("countNew solo cuenta status='new'", () => {
  const tdir = mkdtempSync(join(tmpdir(), "conf-count-"))
  const store = createSqliteConfessions(join(tdir, "b.db"))
  const mk = (ip: string) =>
    store.createConfession({
      messageEncrypted: "C",
      pseudonym: null,
      wantsResponse: 0,
      contactMethod: null,
      contactValueEncrypted: null,
      consent: 1,
      consentAt: new Date().toISOString(),
      policyVersion: "2026-09-12-v1",
      ipHash: ip,
      userAgent: null,
      honeypot: "",
    })
  const a = mk("a".repeat(64))
  const b = mk("b".repeat(64))
  mk("c".repeat(64))
  assert.equal(store.countNew(), 3)
  store.markRead(a)
  store.markRead(b)
  assert.equal(store.countNew(), 1)
})

done()
}

main().catch(fail)
