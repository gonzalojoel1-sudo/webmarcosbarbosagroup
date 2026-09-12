# Pastor Login — Sesión propia con cookie firmada — Design

**Fecha:** 2026-09-12
**Ruta nueva (login):** `/pastor`
**Ruta panel post-login:** `/pastor/inbox`
**Ruta API:** `/api/pastor/*`
**Stack:** Next.js 14.2.35 App Router · TypeScript · Server Actions · AES-256-GCM (built-in `node:crypto`, reusando `lib/confessions/crypto.ts`) · scrypt (built-in `node:crypto`) · sin librería nueva
**Reemplaza:** middleware Basic Auth (`middleware.ts:1-60`) — protege `/pastor/inbox/*` y `/api/pastor/*` (antes: `/admin/*` y `/api/admin/*`)
**Estado:** diseño aprobado · pendiente plan de implementación

---

## 0. Decisión de naming

- **Por qué `/pastor`:** URL memorable, no le dice "admin" a quien la descubra, conecta con la identidad pastoral del sitio (Cuerpo de Cristo, confesionario).
- **Por qué `/pastor/inbox` post-login:** un solo segmento memorable para login + un segmento específico para el panel. Evita un layout dinámico en `/pastor` (cookie-check branching).
- **Sin link público:** ningún punto de la web pública enlaza a `/pastor`. Es discoverable solo por URL directa o redirect del middleware.
- **Cookie name:** `__Host-pastor_session` (visible en dev tools — coherente con URL pública).
- **Env vars internas:** siguen siendo `ADMIN_PASS` / `ADMIN_SESSION_KEY` / `ADMIN_USER` — el namespace "admin" en código/env es independiente de la URL. No se renombran para minimizar churn.

---

## 1. Contexto y objetivo

Hoy `/admin` está protegido con HTTP Basic Auth vía `middleware.ts`. El navegador muestra su diálogo nativo feo ("Acceder" — usuario/contraseña) que:

- **Rompe la marca**: no se puede estilizar (es UI del browser, no del sitio).
- **No soporta sesiones**: cada navegación re-pide credenciales (según el browser).
- **UX inconsistente**: el resto del sitio tiene flujo cuidado (header, footer, paleta, serif); el admin se siente un callejón.
- **Cierra la puerta a features futuras**: 2FA, "recordarme", expiración de sesión, audit log propio.

**Decisión:** reemplazar Basic Auth por un login propio con cookie de sesión firmada + cifrada. Misma estética editorial del sitio (serif `Instrument Serif`, acento `#fe4100`, logo MB), misma disciplina de seguridad que el confesionario (cifrado, allowlist en logs, fail-closed).

**Decisiones tomadas con el usuario:**

| Tema | Decisión |
|---|---|
| Producto | Login propio con sesión (no magic-link, no 2FA en v1) |
| URL pública | `/pastor` (login), `/pastor/inbox` (panel) — **nada público apunta ahí** |
| Estética | Consistente con el sitio: serif display, `#fe4100`, logo MB, editorial |
| Cookie | Firmada **y** cifrada (AES-256-GCM, mismo primitivo que confesionario) |
| Storage creds | `ADMIN_PASS` env var, scrypt-hash al boot, comparación timing-safe |
| Expiración | Idle 8h, absoluta 14d |
| Migración | Hard cut (sin overlap Basic Auth) |
| Brute-force | 5/15min/IP-hash, sin allowlist en v1 |
| Logs | `safeLog` only (eventos `pastor.login.*`, `pastor.logout`, `pastor.session.*`) |
| Forgot-password | Link `mailto:` en la página de login (single-pastor, sin self-service) |
| Theme toggle | Sin toggle en `/pastor` (siempre light, editorial) |

**Fuera de alcance (recordatorio):** 2FA, magic-link email, "recordarme", reset-password UI, multi-usuario, audit log UI, sesión persistente a DB, soporte cross-subdomain (`crm.marcosbarbosagroup.com` no comparte sesión).

---

## 2. Threat model

**Defendemos contra:**

1. **Robo de cookie** → cifrada con AES-256-GCM (mismo nivel que confesionario); `__Host-` prefix previene fijación de subdomain/Domain.
2. **Brute-force de password** → rate-limit 5/15min/IP-hash + comparación timing-safe (scrypt es memory-hard por diseño).
3. **CSRF en login** → Server Actions de Next.js 14 tienen CSRF protection built-in (verificación de Origin + headers). Suficiente para v1.
4. **Session fixation** → al login OK se setea cookie fresca (nuevo IV); no se reusa cookie entrante.
5. **Reutilización de cookie vencida** → payload incluye `exp_idle` y `exp_absolute`; verificación server-side en cada request.
6. **PII en logs** → `safeLog` allowlist (`event`, `status`, `code`, `id` corto); nunca password, username completo, IP, user-agent.
7. **Timing attack en compare de password** → `crypto.timingSafeEqual` sobre buffers de igual longitud (scrypt produce hash de longitud fija).

**No defendemos contra (asumido / fuera de alcance):**

- Compromiso del proceso Node con la clave en memoria.
- XSS en el resto del sitio robando la cookie: la cookie es `httpOnly` + `Secure` + `SameSite=Lax`. XSS sigue siendo riesgo independiente (mitigado por las reglas existentes de Tailwind/CSS, sin `dangerouslySetInnerHTML`).
- Ataques al endpoint de red / MITM: TLS en Dokploy (Traefik + Let's Encrypt) es la defensa.
- Robo físico del dispositivo con sesión activa: idle timeout 8h limita la ventana.
- Adversario con acceso al volumen persistente que reemplaza el código: out of scope.
- 2FA: fuera de alcance v1 (single-pastor).
- Descubrimiento de la URL `/pastor`: asunción single-user; no es secreto pero tampoco está linkeado.

---

## 3. Arquitectura

### 3.1 Módulos nuevos

```
lib/auth/
├── session.ts        AES-256-GCM sobre JSON payload + encode/__Host- cookie
├── password.ts       scrypt hash + verify (timing-safe)
├── rate-limit.ts     in-memory, 5/15min/ipHash, ventana móvil (mismo patrón que confesionario)
└── config.ts         IDLE_TIMEOUT_MS, ABSOLUTE_TIMEOUT_MS, COOKIE_NAME, POLICY_VERSION
```

**Reutilización explícita:**
- `lib/confessions/crypto.ts:getEncryptionKey()` se usa como referencia de patrón, **pero NO la key**. Nueva env var `ADMIN_SESSION_KEY`.
- `lib/confessions/log.ts:safeLog` se reusa para `pastor.*` events (mismo allowlist).
- `lib/confessions/ip-hash.ts:ipHash` se reusa (mismo `CONFESSIONS_IP_SALT` — simplifica operatividad).

### 3.2 Rutas

| Ruta | Método | Auth | Propósito |
|---|---|---|---|
| `/pastor` | GET | pública | Página de login (server-rendered). |
| `loginPastor` | server action | pública | Verifica credenciales, setea cookie, redirige a `/pastor/inbox` (o `next`). |
| `logoutPastor` | server action | sesión | Limpia cookie, redirige a `/pastor`. |
| `/pastor/inbox` | GET | sesión | Panel principal (tabs: bolsa/candidatos + confesionario). |
| `/pastor/inbox?tab=confesionario` | GET | sesión | Mismo panel, tab confesionario activo. |
| `/api/pastor/confessions` | GET | sesión | JSON con lista de confesiones (sin ciphertext). |
| `/api/pastor/export` | GET | sesión | Export CSV/JSON de bolsa/candidatos. |
| `/api/pastor/cv/[id]` | GET | sesión | Descarga de CV. |
| `/api/pastor/login-test` | POST | **solo `NODE_ENV !== 'production'`** | Helper para tests: login + set cookie sin pasar por la UI. |

### 3.3 Matcher del middleware

```ts
// middleware.ts
export const config = {
  matcher: ["/pastor/inbox/:path*", "/api/pastor/:path*"],
}
```

**Crítico:** `/pastor/:path*` NO matchea `/pastor` (Next.js requiere al menos un segmento después). Eso es exactamente lo que queremos:
- `/pastor` → público (login)
- `/pastor/inbox` y todo lo que esté abajo → requiere cookie
- `/api/pastor/*` → requiere cookie (excepto `/api/pastor/login-test`, que se gatea por `NODE_ENV`)

### 3.4 Diagrama de flujo

```
[Browser]
  │
  ├─ GET /pastor/inbox  (sin cookie o cookie vencida)
  │     ↓
  │  [Middleware]
  │     ├─ Lee cookie __Host-pastor_session
  │     ├─ Si falta o falla decrypt/verify → 302 a /pastor?next=/pastor/inbox
  │     └─ Si OK → NextResponse.next()
  │
  └─ GET /pastor
        ↓
       Página server-rendered con form
        ↓
       [Server Action loginPastor]
        ├─ Rate-limit check (5/15min/ipHash)
        ├─ Honeypot (campo oculto, silent fail)
        ├─ scrypt verify contra hash del env var ADMIN_PASS
        ├─ Si OK: encrypt({sub,iat,exp_idle,exp_absolute}) → cookie __Host-pastor_session
        └─ Redirect a ?next o /pastor/inbox

[Server Action logoutPastor]
  └─ Cookie cleared (Set-Cookie con Max-Age=0)
        ↓
       Redirect /pastor
```

---

## 4. Modelo de datos

### 4.1 Cookie session (`__Host-pastor_session`)

**Formato:** `0x01|base64(iv[12]||tag[16]||ciphertext)` — idéntico al primitivo de `lib/confessions/crypto.ts`. Reutilizamos `encrypt()` y `decrypt()` pero con la nueva key `ADMIN_SESSION_KEY`.

**Payload JSON (cifrado dentro del blob):**

```ts
type SessionPayload = {
  v: 1                            // schema version
  sub: "pastor"                    // subject — fijo, single-pastor
  iat: number                     // issued-at (ms epoch)
  exp_idle: number                // idle expiry (ms epoch, iat + 8h)
  exp_absolute: number            // absolute expiry (ms epoch, iat + 14d)
}
```

**Flags del cookie:**

| Flag | Valor | Por qué |
|---|---|---|
| `Name` | `__Host-pastor_session` | `__Host-` prefix fuerza Secure + Path=/ + sin Domain (defense in depth contra subdomain attacks) |
| `HttpOnly` | true | Sin acceso JS |
| `Secure` | true | Solo HTTPS (Dokploy lo sirve via Traefik) |
| `SameSite` | `Lax` | Suficiente para el panel (no hay links cross-site al inbox) |
| `Path` | `/` | Accesible para todo `/pastor/inbox/*` y `/api/pastor/*` |
| `Max-Age` | sin Max-Age | La expiración real vive en `exp_absolute` del payload cifrado; el cookie se borra cuando expira el browser session o vía logout |

**Por qué `__Host-`:** si alguien compromete un subdomain (`crm.marcosbarbosagroup.com` por ejemplo) NO puede setear una cookie con `Domain=.marcosbarbosagroup.com` que el inbox acepte. El browser rechaza cookies `__Host-` si vienen de otro host o si les ponen `Domain` o `Path` distinto de `/`.

### 4.2 Password storage

**No** hasheamos `ADMIN_PASS` en disco. Se hashea **en memoria al boot** y se cachea para todas las verificaciones de la vida del proceso:

```ts
// lib/auth/password.ts
function bootHash(): Buffer {
  const raw = process.env.ADMIN_PASS
  if (!raw) throw new Error("ADMIN_PASS ausente")
  return scryptSync(raw, FIXED_SALT, 64)  // FIXED_SALT constante del código
}

function verify(submitted: string): boolean {
  const hash = bootHash()  // cached internamente en variable módulo-level
  const candidate = scryptSync(submitted, FIXED_SALT, 64)
  return timingSafeEqual(hash, candidate)
}
```

**Por qué `FIXED_SALT` en código y no por env:** scrypt ya es memory-hard — el salt es para evitar rainbow tables contra el password. Como solo hay UN password y está en env var (no en una DB con miles), un salt fijo en código es suficiente. Si en el futuro hay multi-usuario, se mueve a `lib/auth/users.ts` con salt per-user.

**Costo:** scrypt N=2^15 (~30ms en hardware moderno). 5 intentos × 30ms = 150ms por IP-bloqueado — negligible. Rate-limit está antes (5/15min).

### 4.3 Rate limit — `lib/auth/rate-limit.ts`

- Mismo patrón que `lib/confessions/rate-limit.ts` (in-memory Map, sliding window).
- `LIMIT = 5`, `WINDOW_MS = 15 * 60 * 1000`.
- Sexto intento en 15 min → 429 (o 401 silencioso al login para no leak información — ver §6.2).
- Reset en restart del container (aceptable v1 single-replica, igual que confesionario).

---

## 5. UX pública — `/pastor`

### 5.1 Estructura visual

Sin theme toggle. Siempre light. Mantiene la identidad editorial del sitio. **Sin header ni footer del sitio** (es un momento de focus, no browsing — el visitante nunca llega acá).

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              [Logo MB — instrument serif]          │
│                                                    │
│           Panel interno                            │
│           Acceso reservado al administrador.       │
│                                                    │
│   ┌────────────────────────────────────────────┐   │
│   │ Usuario                                   │   │
│   │ ┌──────────────────────────────────────┐   │   │
│   │ │ admin                                │   │   │
│   │ └──────────────────────────────────────┘   │   │
│   │                                            │   │
│   │ Contraseña                                │   │
│   │ ┌──────────────────────────────────────┐   │   │
│   │ │ ••••••••                             │   │   │
│   │ └──────────────────────────────────────┘   │   │
│   │                                            │   │
│   │ ┌──────────────────────────────────────┐   │   │
│   │ │          Ingresar                    │   │   │
│   │ └──────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────┘   │
│                                                    │
│   ¿Olvidaste tu contraseña?                        │
│   Escribinos a consultora.marcosbarbosa@gmail.com  │
│   y la reseteamos en 72 hs hábiles.                │
│                                                    │
│   ─────────────────────────────────────────         │
│   Volver al sitio →                                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Detalles:**

- Logo MB: `components/logo.tsx` (existente), versión monocroma.
- Tipografía: `font-display` para título, `Inter` para form.
- Acento: borde focus `#fe4100`, botón primario con bg `#fe4100`.
- Layout: centrado vertical (min-h-screen flexbox), max-w-md.
- Sin asteriscos rojos agresivos: errores en gris con línea bajo el campo.
- Honeypot: `<input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />`.
- Submit deshabilitado al primer click + muestra "Ingresando…" (idempotencia cliente).
- Si 429 / brute-force: *"Demasiados intentos. Probá en 15 minutos."* — sin distinguir "password incorrecto" de "usuario no existe" (defensa contra user enumeration).
- `?next=/pastor/inbox`: tras login OK redirige al path original. Validación que `next` empieza con `/pastor` y no contiene `//` ni protocolo (prevenir open redirect).
- Link "Volver al sitio" abajo: apunta a `/` (la home pública).

### 5.2 Estado post-error

Re-render con mensaje genérico arriba del form:
> *"No pudimos verificar tus credenciales. Verificá e intentá de nuevo."*

No distingue usuario inexistente vs password incorrecto.

### 5.3 Acceso denegado (sesión vencida)

Si el middleware detecta cookie vencida al pedir `/pastor/inbox/*`, redirige a `/pastor?next=<path>` con query param `expired=1` y banner sutil:
> *"Tu sesión expiró. Ingresá de nuevo."*

Esto se renderiza solo si `?expired=1`.

---

## 6. UX admin (post-login) — `/pastor/inbox`

### 6.1 Header del panel

Agregar al header de `app/pastor/inbox/page.tsx` (raíz del panel) un botón "Cerrar sesión" (esquina superior derecha). Es un `<form action={logoutPastor}>` con un solo botón.

### 6.2 Sin cambios estructurales al panel

- Tabs (bolsa/candidatos + confesionario), decrypt, todo igual.
- Server actions siguen funcionando (Next.js valida Origin + cookie).
- `app/api/pastor/*` sigue gateado por middleware (cookie-based).

---

## 7. Seguridad operativa

| Capa | Implementación |
|---|---|
| Cookie cifrada | AES-256-GCM, IV 12 random per issue, tag 16, byte version `0x01` (mismo primitivo que confesionario). |
| Cookie flags | `__Host-` prefix, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. |
| Password hashing | scrypt N=2^15, salt fijo en código (single-pastor). Cache en memoria al boot. |
| Password compare | `crypto.timingSafeEqual` (longitud fija de scrypt output). |
| Session expiry | Idle 8h (renueva en cada request válido), absoluta 14d (forza re-login). |
| Brute-force | 5 intentos / 15 min / IP-hash, ventana móvil. 6º → 429 + backoff implícito. |
| CSRF | Server Actions de Next.js 14 (Origin + headers). No doble-submit cookie manual. |
| Session fixation | Cookie fresca al login OK (nuevo IV). No se reusa cookie entrante. |
| Open redirect | `next` param validado: debe empezar con `/pastor` y no contener `//` ni protocolo. |
| `no-store` | `Cache-Control: no-store` en `/pastor` y responses de middleware. |
| Logging | `safeLog` con allowlist. Events: `pastor.login.ok`, `pastor.login.fail`, `pastor.login.ratelimit`, `pastor.logout`, `pastor.session.expired`, `pastor.session.invalid`. Sin PII. |
| Error responses | Genéricos al cliente (`"No pudimos verificar tus credenciales"`). Detalles técnicos solo a `safeLog`. |
| Fail closed | Si `ADMIN_PASS` o `ADMIN_SESSION_KEY` faltan al boot → la app no arranca, log explícito. |

---

## 8. Variables de entorno

Agregar a `.env.example`:

```bash

# Pastor Login — sesión propia
# ⚠ Sesión propia del panel interno. NO compartir con CONFESSIONS_ENCRYPTION_KEY.
# Generar con: openssl rand -base64 32
ADMIN_SESSION_KEY=
# Contraseña del pastor/administrador único. Hasheada en memoria al boot con scrypt.
# Cambiar acá y redeploy para rotar.
ADMIN_PASS=
```

| Variable | Requerida | Generar con | Notas |
|---|---|---|---|
| `ADMIN_SESSION_KEY` | sí | `openssl rand -base64 32` | 32 bytes base64. Backupear aparte (1Password / Bitwarden). Si se pierde, todas las sesiones se invalidan — no es catastrophe (re-login), pero las activas se caen. |
| `ADMIN_PASS` | sí | a elección (16+ chars recomendado) | La única credencial. Rotar cambiando el env var + redeploy. |

**`ADMIN_SESSION_KEY` separada de `CONFESSIONS_ENCRYPTION_KEY`:** rotar admin no debe afectar confesiones, y comprometer admin no debe descifrar confesiones. Dos keys, dos propósitos.

**`ADMIN_USER`** se mantiene en `.env.example` como hint de UX (el form pre-llena el campo con ese valor) pero **no se verifica en el login** — la verificación es solo por password. Single-pastor, no se valida el username. Si `ADMIN_USER` no está seteado, default `"admin"`.

---

## 9. Tests

Patrón del repo: `scripts/check-X.ts` con `node --experimental-strip-types`.

### 9.1 `scripts/check-auth.ts` — unit + integración sin red

```
session
  - encrypt + decrypt round-trip
  - dos sessions del mismo payload → ciphertext distinto (IV aleatorio)
  - decrypt con key distinta → SessionError
  - byte de versión desconocido → SessionError
  - payload expirado idle → SessionError
  - payload expirado absolute → SessionError
  - payload válido pasa todas las validaciones

password
  - scrypt hash es determinístico (mismo input → mismo output)
  - verify OK con misma password
  - verify FAIL con password distinta
  - verify FAIL con string vacío
  - timingSafeEqual: comparación de igual-longitud OK, desigual → false

rate-limit
  - 5 hits OK, 6º → blocked
  - IP distinta no se afecta
  - ventana expira tras 15min (con mock de tiempo)
```

### 9.2 Adaptar tests existentes

`scripts/check-confessions-api.ts` hoy usa Basic Auth (env vars `ADMIN_USER`/`ADMIN_PASS`). Tras este cambio, **debe**:

- Hacer POST a `/api/pastor/login-test` con credenciales → obtener cookie `__Host-pastor_session`.
- Usar esa cookie en todos los GETs posteriores (`Cookie: __Host-pastor_session=<value>`).

`/api/pastor/login-test` solo funciona en `NODE_ENV !== 'production'` (gated). En CI y dev funciona; en prod (Dokploy) responde 404.

### 9.3 Pre-PR

```
npm run check:confessions
npm run check:auth              # nuevo
npm run check:confessions:api   # adaptado
npm run check:routes
npm run lint
npx tsc --noEmit
npm run build
```

---

## 10. Deploy (Dokploy)

| Paso | Acción |
|---|---|
| 1 | Generar `ADMIN_SESSION_KEY`: `openssl rand -base64 32` |
| 2 | Generar o elegir `ADMIN_PASS` (16+ chars) |
| 3 | Backupear ambos en bóveda cifrada (1Password / Bitwarden) **fuera** del volumen |
| 4 | Setear ambos en Dokploy → Variables |
| 5 | `ADMIN_USER` opcional (UX pre-fill); si no está, default "admin" |
| 6 | Snapshot del volumen antes del primer deploy (defense in depth) |
| 7 | Deploy |
| 8 | Verificar `GET /api/health` sigue 200 |
| 9 | **Hard cut**: cualquier curl/Basic Auth viejo al admin → 302 a `/pastor` (no 401 con prompt feo). Las rutas `/admin` y `/api/admin/*` se eliminan; sus equivalentes quedan en `/pastor/inbox` y `/api/pastor/*`. |
| 10 | Smoke: login UI en `/pastor` → entra a `/pastor/inbox?tab=jobs` → tab confesionario descifra → logout → re-login |

**Down-time esperado:** cero si Dokploy hace rolling. El "down-time" es solo que el viejo Basic Auth y los URLs `/admin` ya no funcionan — pero al primer reload, todo fluye en `/pastor`.

**Comunicación:** avisar a cualquier script externo (si hay) que use `/admin` o `/api/admin/*` — van a tener que actualizar a `/pastor/inbox` y `/api/pastor/*`.

---

## 11. Riesgos operacionales

| Riesgo | Mitigación | Residual |
|---|---|---|
| Pérdida de `ADMIN_SESSION_KEY` | Backup obligatorio fuera del volumen | Sesiones se invalidan (re-login, no catastrophe) |
| Pérdida de `ADMIN_PASS` | Reset via env var + redeploy | Outage hasta redeploy |
| Restart container | Rate-limit se resetea (in-memory) | Aceptable v1 single-replica |
| Multi-replica futuro | Stateless cookie permite múltiples replicas; rate-limit necesita store distribuido | Documentado, defer |
| Sesión robada via XSS | httpOnly + Secure + SameSite=Lax | XSS sigue siendo riesgo independiente |
| Compromiso del proceso con keys en memoria | Asumido (out of scope por spec de confesionario también) | Out of scope |
| Disco lleno | No aplica (sesiones son stateless) | N/A |
| Confusión con `ADMIN_USER` | Se mantiene como UX pre-fill, no se verifica | Documentado |
| Bookmarks externos a `/admin` | Aviso en release notes; sin 301 (admin hidden, no SEO impact) | Marcos puede actualizar su bookmark |
| Tests rotos que asumían Basic Auth | Adaptar `check-confessions-api.ts` para usar cookie via `/api/pastor/login-test` | Parte del plan |

---

## 12. Documentación a actualizar

| Archivo | Cambio |
|---|---|
| `docs/superpowers/specs/2026-09-12-pastor-login-design.md` | Este spec |
| `docs/PENDING.md` | Quitar mención de admin ugly auth; agregar item pastor login como done |
| `docs/spec.md` §14 | Agregar `lib/auth/` + rutas `/pastor/*` al árbol |
| `.env.example` | Agregar `ADMIN_SESSION_KEY` y `ADMIN_PASS` |
| `README.md` | Sección "Generar claves del Pastor Login" (similar a confesionario) |
| `middleware.ts` | Reescrito para validar cookie en `/pastor/inbox/*` y `/api/pastor/*` |

---

## 13. Archivos a crear / modificar / mover

**Crear (nuevo):**
- `lib/auth/config.ts` — constantes (timeouts, cookie name, etc.)
- `lib/auth/session.ts` — encrypt/decrypt payload + cookie helpers
- `lib/auth/password.ts` — scrypt hash + verify
- `lib/auth/rate-limit.ts` — RateLimiter (5/15min)
- `lib/auth/log.ts` — reusa `lib/confessions/log.ts` (no nuevo archivo, solo import)
- `app/pastor/layout.tsx` — minimal layout (sin header/footer del sitio)
- `app/pastor/page.tsx` — form de login (server component que renderiza client form)
- `app/pastor/login-form.tsx` — client component con honeypot + idempotencia
- `app/pastor/actions.ts` — server actions `loginPastor`, `logoutPastor`
- `app/api/pastor/login-test/route.ts` — endpoint test (gated NODE_ENV)
- `scripts/check-auth.ts` — unit tests

**Mover (rename) desde `/admin` y `/api/admin` a `/pastor` y `/api/pastor`:**
- `app/admin/layout.tsx` → `app/pastor/inbox/layout.tsx` (con metadata noindex)
- `app/admin/page.tsx` → `app/pastor/inbox/page.tsx` (panel con tabs)
- `app/admin/actions.ts` → `app/pastor/inbox/actions.ts` (markRead, setNote, delete, export)
- `app/api/admin/confessions/route.ts` → `app/api/pastor/confessions/route.ts`
- `app/api/admin/export/route.ts` → `app/api/pastor/export/route.ts`
- `app/api/admin/cv/[id]/route.ts` → `app/api/pastor/cv/[id]/route.ts`

**Modificar:**
- `middleware.ts` — matcher actualizado + validación cookie-based
- `app/admin/page.tsx` → eliminar (movido a `app/pastor/inbox/page.tsx`)
- `app/admin/layout.tsx` → eliminar (movido a `app/pastor/inbox/layout.tsx`)
- `app/admin/actions.ts` → eliminar (movido a `app/pastor/inbox/actions.ts`)
- `app/api/admin/*` → eliminar (movidos a `app/api/pastor/*`)
- `.env.example` — agregar nuevas env vars
- `README.md` — agregar sección
- `package.json` — agregar `check:auth` script
- `scripts/check-confessions-api.ts` — usar `/api/pastor/login-test`
- `docs/PENDING.md` — marcar item como done
- `docs/spec.md` §14 — actualizar árbol

---

## 14. Alcance y fuera de alcance (resumen final)

**Incluye (v1):**
- Página `/pastor` server-rendered, brand-consistent, sin header/footer del sitio.
- Server action `loginPastor` con rate-limit, honeypot, scrypt verify, cookie encrypt.
- Server action `logoutPastor` que limpia cookie.
- Middleware reescrito: cookie-based auth en `/pastor/inbox/*` y `/api/pastor/*`.
- AES-256-GCM session cookie con `__Host-` prefix.
- Idle 8h + absolute 14d.
- Brute-force 5/15min/IP-hash.
- Endpoint de test `POST /api/pastor/login-test` (solo `NODE_ENV !== 'production'`).
- Rename completo: `/admin/*` y `/api/admin/*` → `/pastor/inbox/*` y `/api/pastor/*`.
- `safeLog` con allowlist (eventos `pastor.*`).
- Documentación + .env.example + README.

**Excluye (v1):**
- 2FA, magic-link email login, "recordarme", reset-password UI.
- Multi-usuario.
- Audit log UI (los logs van a stdout via `safeLog`).
- Sesión persistente a DB.
- Soporte cross-subdomain (`crm.marcosbarbosagroup.com` no comparte sesión).
- Migración gradual / overlap con Basic Auth.
- 301 redirects desde `/admin` → `/pastor` (admin hidden, no SEO impact).
- Throttle distribuido (Upstash / Redis).
- Soporte para invitaciones de pastor/admin secundarios.

---

## 15. Plan de implementación (siguiente fase: writing-plans)

Estimación: 10-12 tasks, ~5-6 horas con TDD.

- Task 1: env vars + config constants (`lib/auth/config.ts`)
- Task 2: `password.ts` (scrypt + verify) + tests
- Task 3: `session.ts` (encrypt/decrypt payload, cookie helpers) + tests
- Task 4: `rate-limit.ts` (5/15min) + tests
- Task 5: server actions `loginPastor` + `logoutPastor` + tests
- Task 6: middleware reescrito (cookie-based, matcher actualizado)
- Task 7: página `/pastor` + form client component
- Task 8: rename `/admin/*` y `/api/admin/*` → `/pastor/inbox/*` y `/api/pastor/*`
- Task 9: endpoint de test `POST /api/pastor/login-test`
- Task 10: adaptar `scripts/check-confessions-api.ts` + verificación final

Aprobado: implementación tras rename del spec.