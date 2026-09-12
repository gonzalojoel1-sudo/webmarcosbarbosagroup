import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"

// Cobertura vs spec §10.2:
//   - Server action markConfessionRead / deleteConfession NO se testean acá:
//     las server actions de Next 14 se invocan vía POST a la página renderizada
//     con header Next-Action + action-id estable del build (RSC internals).
//     Reproducir eso desde un script es frágil y depende de la versión de Next.
//     Alternativa asumida: los tests de store cubren los invariantes
//     (markRead idempotente, deleteConfession borra realmente) y la cobertura
//     E2E de Phase 5 ejercita el flujo admin completo (markRead + delete con
//     doble confirmación BORRAR).
//   - El resto de §10.2 está cubierto abajo (POST, GET admin, honeypot,
//     consent, rate-limit, auth, health).
//   - Auth: el script usa /api/pastor/login-test (gated por NODE_ENV !==
//     "production") para obtener un cookie firmado y luego enviarlo como
//     `Cookie: __Host-pastor_session=<cookie>`. Reemplaza el HTTP Basic Auth
//     histórico.

const BASE = process.env.CHECK_API_BASE || "http://127.0.0.1:3000"

let passed = 0
const ok = async (name: string, fn: () => void | Promise<void>) => {
  await Promise.resolve().then(fn).then(() => {
    passed++
    console.log(`PASS  ${name}`)
  })
}

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
  // Login via test endpoint para obtener cookie firmado.
  // El endpoint está gated por NODE_ENV !== "production"; el integrador
  // debe setear NODE_ENV=test (o development) antes de `npm start`.
  const loginRes = await fetch(`${BASE}/api/pastor/login-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.ADMIN_USER || "tester",
      password: process.env.ADMIN_PASS || "tester123",
    }),
  })
  if (loginRes.status !== 200) {
    throw new Error(`Login test falló: ${loginRes.status}`)
  }
  const { cookie } = (await loginRes.json()) as { cookie: string }
  const cookieHeader = `__Host-pastor_session=${cookie}`

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
    const before = await fetch(`${BASE}/api/pastor/confessions?limit=500`, {
      headers: { Cookie: cookieHeader },
    })
    const beforeList = (await before.json()) as unknown[]
    const res = await postJSON("/api/confessions", {
      ...validPayload(),
      honeypot: "i-am-a-bot",
    })
    assert.equal(res.status, 200)
    const after = await fetch(`${BASE}/api/pastor/confessions?limit=500`, {
      headers: { Cookie: cookieHeader },
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

  // 5. GET /api/pastor/confessions sin auth → 302 (middleware redirige a /pastor).
  // Usamos redirect: "manual" para no seguir el redirect y poder inspeccionar el 302.
  await ok("GET admin sin auth → 302 redirect a /pastor", async () => {
    const res = await fetch(`${BASE}/api/pastor/confessions`, {
      redirect: "manual",
    })
    assert.equal(res.status, 302)
    const location = res.headers.get("location") ?? ""
    assert.ok(location.startsWith("/pastor"))
  })

  // 6. GET /api/pastor/confessions con cookie → 200 + lista
  await ok("GET admin con auth → 200 + lista", async () => {
    const res = await fetch(`${BASE}/api/pastor/confessions`, {
      headers: { Cookie: cookieHeader },
    })
    assert.equal(res.status, 200)
    const list = (await res.json()) as Array<{ id: string; status: string; read_at: string | null }>
    assert.ok(Array.isArray(list))
    assert.ok(list.every((c) => typeof c.id === "string"))
    // invariante adicional: ítems recién creados (no leídos vía action) tienen
    // status='new' y read_at=null; cubre el caso de regresión donde un GET
    // accidentalmente marcara como leído.
    for (const item of list) {
      if (item.status === "new") {
        assert.equal(item.read_at, null)
      }
    }
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