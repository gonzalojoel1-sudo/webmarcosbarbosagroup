import assert from "node:assert/strict"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const tmp = mkdtempSync(join(tmpdir(), "auth-check-"))
process.env.DATA_DIR = tmp
process.env.ADMIN_SESSION_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
process.env.ADMIN_PASS = "test-password-12345"

let passed = 0
export const ok = (name: string, fn: () => void | Promise<void>) => {
  return Promise.resolve().then(fn).then(() => {
    passed++
    console.log(`PASS  ${name}`)
  })
}

export function done() {
  console.log(`\nOK: ${passed} verificaciones del pastor login`)
}

export function fail(err: unknown) {
  console.error("FAIL:", err instanceof Error ? err.message : err)
  process.exit(1)
}

async function main() {
  const password = await import("../lib/auth/password.ts")
  const { bootHash, verify, __resetForTests } = password

  await ok("bootHash devuelve Buffer de longitud fija (64 bytes scrypt)", () => {
    const h = bootHash()
    assert.ok(Buffer.isBuffer(h))
    assert.equal(h.length, 64)
  })

  await ok("bootHash es determinístico (misma password → mismo hash)", () => {
    const a = bootHash()
    const b = bootHash()
    assert.deepEqual(a, b)
  })

  await ok("verify OK con password correcta", () => {
    assert.equal(verify("test-password-12345"), true)
  })

  await ok("verify FAIL con password incorrecta", () => {
    assert.equal(verify("wrong-password"), false)
  })

  await ok("verify FAIL con string vacío", () => {
    assert.equal(verify(""), false)
  })

  await ok("bootHash throws si ADMIN_PASS ausente", () => {
    const original = process.env.ADMIN_PASS
    __resetForTests()
    delete process.env.ADMIN_PASS
    let threw = false
    try {
      bootHash()
    } catch {
      threw = true
    } finally {
      process.env.ADMIN_PASS = original
      __resetForTests()
    }
    assert.equal(threw, true)
  })

  const session = await import("../lib/auth/session.ts")
  const {
    SessionError,
    encryptPayload,
    decryptPayload,
    issueCookie,
    clearCookie,
    validateAndParse,
    readCookieFromHeaders,
  } = session

  const samplePayload = {
    v: 1 as const,
    sub: "pastor" as const,
    iat: Date.now(),
    exp_idle: Date.now() + 8 * 60 * 60 * 1000,
    exp_absolute: Date.now() + 14 * 24 * 60 * 60 * 1000,
  }

  await ok("encryptPayload + decryptPayload round-trip", () => {
    const ct = encryptPayload(samplePayload)
    const pt = decryptPayload(ct)
    assert.deepEqual(pt, samplePayload)
  })

  await ok("dos encrypts del mismo payload producen ciphertext distinto (IV aleatorio)", () => {
    const a = encryptPayload(samplePayload)
    const b = encryptPayload(samplePayload)
    assert.notEqual(a, b)
  })

  await ok("decryptPayload con key distinta tira SessionError", () => {
    const ct = encryptPayload(samplePayload)
    const original = process.env.ADMIN_SESSION_KEY
    process.env.ADMIN_SESSION_KEY = "ZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmRzZmQ="
    try {
      let threw = false
      try {
        decryptPayload(ct)
      } catch (e) {
        threw = e instanceof SessionError
      }
      assert.equal(threw, true)
    } finally {
      process.env.ADMIN_SESSION_KEY = original
    }
  })

  await ok("byte de versión desconocido tira SessionError", () => {
    const forged = "0x02" + Buffer.from("cualquiercosa").toString("base64")
    let threw = false
    try {
      decryptPayload(forged)
    } catch (e) {
      threw = e instanceof SessionError
    }
    assert.equal(threw, true)
  })

  await ok("decryptPayload tira SessionError si exp_idle vencido", () => {
    const expired = {
      ...samplePayload,
      iat: Date.now() - 9 * 60 * 60 * 1000,
      exp_idle: Date.now() - 1 * 60 * 60 * 1000,
      exp_absolute: Date.now() + 5 * 24 * 60 * 60 * 1000,
    }
    const ct = encryptPayload(expired)
    let threw = false
    try {
      decryptPayload(ct)
    } catch (e) {
      threw = e instanceof SessionError
    }
    assert.equal(threw, true)
  })

  await ok("decryptPayload tira SessionError si exp_absolute vencido", () => {
    const expired = {
      ...samplePayload,
      iat: Date.now() - 15 * 24 * 60 * 60 * 1000,
      exp_idle: Date.now() - 1,
      exp_absolute: Date.now() - 1,
    }
    const ct = encryptPayload(expired)
    let threw = false
    try {
      decryptPayload(ct)
    } catch (e) {
      threw = e instanceof SessionError
    }
    assert.equal(threw, true)
  })

  await ok("getSessionKey throws si ADMIN_SESSION_KEY ausente", () => {
    const original = process.env.ADMIN_SESSION_KEY
    delete process.env.ADMIN_SESSION_KEY
    let threw = false
    try {
      session.getSessionKey()
    } catch {
      threw = true
    } finally {
      process.env.ADMIN_SESSION_KEY = original
    }
    assert.equal(threw, true)
  })

  await ok("getSessionKey throws si ADMIN_SESSION_KEY no tiene 32 bytes", () => {
    const original = process.env.ADMIN_SESSION_KEY
    process.env.ADMIN_SESSION_KEY = "corto"
    let threw = false
    try {
      session.getSessionKey()
    } catch {
      threw = true
    } finally {
      process.env.ADMIN_SESSION_KEY = original
    }
    assert.equal(threw, true)
  })

  await ok("issueCookie retorna Set-Cookie header con flags correctos", () => {
    const cookie = issueCookie(samplePayload)
    assert.match(cookie, /^__Host-pastor_session=/)
    assert.ok(cookie.includes("HttpOnly"))
    assert.ok(cookie.includes("Secure"))
    assert.ok(cookie.includes("SameSite=Lax"))
    assert.ok(cookie.includes("Path=/"))
  })

  await ok("clearCookie retorna Set-Cookie con Max-Age=0", () => {
    const cookie = clearCookie()
    assert.match(cookie, /^__Host-pastor_session=/)
    assert.ok(cookie.includes("Max-Age=0"))
    assert.ok(cookie.includes("Path=/"))
  })

  await ok("readCookieFromHeaders busca case-insensitive", () => {
    const headers = new Headers()
    const cookieValue = encryptPayload(samplePayload)
    headers.append("cookie", `__Host-pastor_session=${cookieValue}`)
    const value = readCookieFromHeaders(headers)
    assert.ok(value)
    assert.ok(value!.startsWith("0x01"))
  })

  await ok("validateAndParse retorna payload válido", () => {
    const cookie = issueCookie(samplePayload)
    // Extraer el valor (entre el primer = y el primer ;)
    const value = cookie.split(";")[0].split("=").slice(1).join("=")
    const parsed = validateAndParse(value)
    assert.ok(parsed)
    assert.equal(parsed!.sub, "pastor")
  })

  await ok("validateAndParse retorna null si cookie vencida", () => {
    const expired = {
      ...samplePayload,
      exp_idle: Date.now() - 1000,
      exp_absolute: Date.now() + 1000,
    }
    const ct = encryptPayload(expired)
    const parsed = validateAndParse(ct)
    assert.equal(parsed, null)
  })

  await ok("validateAndParse retorna null si cookie undefined", () => {
    assert.equal(validateAndParse(undefined), null)
  })

  await ok("validateAndParse retorna null si cookie corrupta", () => {
    assert.equal(validateAndParse("not-a-valid-cookie"), null)
  })

  const { RateLimiter } = await import("../lib/auth/rate-limit.ts")

  await ok("5 hits OK, 6º → blocked", () => {
    const rl = new RateLimiter(5, 15 * 60 * 1000)
    const ip = "h1"
    for (let i = 0; i < 5; i++) {
      assert.equal(rl.check(ip).allowed, true)
    }
    assert.equal(rl.check(ip).allowed, false)
  })

  await ok("IP distinta no se afecta por IP saturada", () => {
    const rl = new RateLimiter(5, 15 * 60 * 1000)
    for (let i = 0; i < 6; i++) rl.check("a")
    assert.equal(rl.check("b").allowed, true)
  })

  await ok("ventana expira tras windowMs (con mock de tiempo)", () => {
    const rl = new RateLimiter(5, 15 * 60 * 1000)
    let now = 1_000_000
    for (let i = 0; i < 5; i++) {
      assert.equal(rl.check("ip", now).allowed, true)
      now += 1_000
    }
    assert.equal(rl.check("ip", now).allowed, false)
    now += 15 * 60 * 1000
    assert.equal(rl.check("ip", now).allowed, true)
  })

  await ok("remaining decrece", () => {
    const rl = new RateLimiter(3, 60_000)
    assert.equal(rl.check("k").remaining, 2)
    assert.equal(rl.check("k").remaining, 1)
    assert.equal(rl.check("k").remaining, 0)
  })

  done()
}

main().catch(fail)
