import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"

const BASE = process.env.CHECK_API_BASE || "http://127.0.0.1:3000"
const ADMIN_USER = process.env.ADMIN_USER || ""
const ADMIN_PASS = process.env.ADMIN_PASS || ""

let passed = 0
const ok = async (name: string, fn: () => void | Promise<void>) => {
  await Promise.resolve().then(fn).then(() => {
    passed++
    console.log(`PASS  ${name}`)
  })
}

const auth = () =>
  "Basic " + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString("base64")

async function postJSON(path: string, body: unknown) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validPayload = () => ({
  message: "Hace dos años que cargo con esto y necesito dejarlo.",
  pseudonym: "",
  wantsResponse: false,
  contactMethod: undefined,
  contactValue: undefined,
  consent: true,
  policyVersion: "2026-09-12-v1",
  honeypot: "",
})

async function main() {
  // 1. POST válido → 200
  await ok("POST /api/confessions válido → 200 + id", async () => {
    const res = await postJSON("/api/confessions", validPayload())
    assert.equal(res.status, 200)
    const body = (await res.json()) as { ok: boolean; id?: string }
    assert.equal(body.ok, true)
    assert.ok(body.id)
  })

  // 2. POST con honeypot → 200, no persiste
  await ok("POST con honeypot → 200 silencioso (no persiste)", async () => {
    const before = await fetch(`${BASE}/api/admin/confessions?limit=500`, {
      headers: { authorization: auth() },
    })
    const beforeList = (await before.json()) as unknown[]
    const res = await postJSON("/api/confessions", {
      ...validPayload(),
      honeypot: "i-am-a-bot",
    })
    assert.equal(res.status, 200)
    const after = await fetch(`${BASE}/api/admin/confessions?limit=500`, {
      headers: { authorization: auth() },
    })
    const afterList = (await after.json()) as unknown[]
    assert.equal(afterList.length, beforeList.length)
  })

  // 3. POST sin consent → 400
  await ok("POST sin consent → 400", async () => {
    const res = await postJSON("/api/confessions", {
      ...validPayload(),
      consent: false,
    })
    assert.equal(res.status, 400)
  })

  // 4. POST 6 veces misma IP → la 6ª es 429
  // (separar IPs vía header X-Real-IP; el hash incluye IP, así que usamos misma IP)
  await ok("POST 6 veces misma IP → 6ª = 429", async () => {
    let lastStatus = 200
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${BASE}/api/confessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Real-IP": "192.0.2.99",
        },
        body: JSON.stringify(validPayload()),
      })
      lastStatus = res.status
    }
    assert.equal(lastStatus, 429)
  })

  // 5. GET /api/admin/confessions sin auth → 401
  await ok("GET admin sin auth → 401", async () => {
    const res = await fetch(`${BASE}/api/admin/confessions`)
    assert.equal(res.status, 401)
  })

  // 6. GET /api/admin/confessions con auth → 200 + lista
  await ok("GET admin con auth → 200 + lista", async () => {
    const res = await fetch(`${BASE}/api/admin/confessions`, {
      headers: { authorization: auth() },
    })
    assert.equal(res.status, 200)
    const list = (await res.json()) as Array<{ id: string }>
    assert.ok(Array.isArray(list))
    assert.ok(list.every((c) => typeof c.id === "string"))
  })

  // 7. /api/health sigue 200
  await ok("/api/health sigue 200", async () => {
    const res = await fetch(`${BASE}/api/health`)
    assert.equal(res.status, 200)
  })

  console.log(`\nOK: ${passed} verificaciones de la API del confesionario`)
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err)
  process.exit(1)
})
