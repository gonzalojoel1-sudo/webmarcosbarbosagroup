# Admin Login — Sesión propia con cookie firmada — Design

**Fecha:** 2026-09-12
**Ruta nueva:** `/admin/login`
**Stack:** Next.js 14.2.35 App Router · TypeScript · Server Actions · AES-256-GCM (built-in `node:crypto`, reusando `lib/confessions/crypto.ts`) · scrypt (built-in `node:crypto`) · sin librería nueva
**Reemplaza:** middleware Basic Auth (`middleware.ts:1-60`) y matcher `/admin/:path*` + `/api/admin/:path*`
**Estado:** diseño aprobado · pendiente plan de implementación

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
| Estética | Consistente con el sitio: serif display, `#fe4100`, logo MB, editorial |
| Cookie | Firmada **y** cifrada (AES-256-GCM, mismo primitivo que confesionario) |
| Storage creds | `ADMIN_PASS` env var, scrypt-hash al boot, comparación timing-safe |
| Expiración | Idle 8h, absoluta 14d |
| Migración | Hard cut (sin overlap Basic Auth) |
| Brute-force | 5/15min/IP-hash, sin allowlist en v1 |
| Logs | `safeLog` only (eventos `admin.login.ok/fail`, `admin.logout`, `admin.session.expired`) |
| Forgot-password | Link `mailto:` en la página de login (single-admin, sin self-service) |
| Theme toggle | Sin toggle en `/login` (siempre light, editorial) |

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
- 2FA: fuera de alcance v1 (single-admin).

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
- `lib/confessions/log.ts:safeLog` se reusa para `admin.*` events.
- `lib/confessions/ip-hash.ts:ipHash` se reusa (mismo `CONFESSIONS_IP_SALT` o nuevo `ADMIN_IP_SALT` — **decisión**: reusar el mismo, no necesitamos dos salts distintos para el rate-limit, y simplifica operatividad).

### 3.2 Rutas

| Ruta | Método | Auth | Propósito |
|---|---|---|---|
| `/admin/login` | GET | pública | Página de login (server-rendered). |
| `loginAdmin` | server action | pública | Verifica credenciales, setea cookie, redirige a `/admin?tab=jobs`. |
| `logoutAdmin` | server action | sesión | Limpia cookie, redirige a `/admin/login`. |
| `/admin/*` | GET | sesión | Antes: Basic Auth. Ahora: middleware valida cookie. |
| `/api/admin/*` | GET | sesión | Igual que arriba. Tests existentes deben obtener cookie primero. |

### 3.3 Diagrama de flujo

```
[Browser]
  │
  ├─ GET /admin/*  (sin cookie o cookie vencida)
  │     ↓
  │  [Middleware]
  │     ├─ Lee cookie __Host-admin_session
  │     ├─ Si falta o falla decrypt/verify → 302 a /admin/login?next=<original-path>
  │     └─ Si OK → NextResponse.next()
  │
  └─ GET /admin/login
        ↓
       Página server-rendered con form
        ↓
       [Server Action loginAdmin]
        ├─ Rate-limit check (5/15min/ipHash)
        ├─ Honeypot (campo oculto, silent fail)
        ├─ scrypt verify contra hash del env var ADMIN_PASS
        ├─ Si OK: encrypt({sub,iat,exp_idle,exp_absolute}) → cookie __Host-admin_session
        └─ Redirect a ?next o /admin?tab=jobs

[Server Action logoutAdmin]
  └─ Cookie cleared (Set-Cookie con Max-Age=0)
        ↓
       Redirect /admin/login
```

---

## 4. Modelo de datos

### 4.1 Cookie session (`__Host-admin_session`)

**Formato:** `0x01|base64(iv[12]||tag[16]||ciphertext)` — idéntico al primitivo de `lib/confessions/crypto.ts`. Reutilizamos `encrypt()` y `decrypt()` pero con la nueva key `ADMIN_SESSION_KEY`.

**Payload JSON (cifrado dentro del blob):**

```ts
type SessionPayload = {
  v: 1                            // schema version
  sub: "admin"                    // subject — fijo, single-admin
  iat: number                     // issued-at (ms epoch)
  exp_idle: number                // idle expiry (ms epoch, iat + 8h)
  exp_absolute: number            // absolute expiry (ms epoch, iat + 14d)
}
```

**Flags del cookie:**

| Flag | Valor | Por qué |
|---|---|---|
| `Name` | `__Host-admin_session` | `__Host-` prefix fuerza Secure + Path=/ + sin Domain (defense in depth contra subdomain attacks) |
| `HttpOnly` | true | Sin acceso JS |
| `Secure` | true | Solo HTTPS (Dokploy lo sirve via Traefik) |
| `SameSite` | `Lax` | Suficiente para admin (no hay links cross-site al panel) |
| `Path` | `/` | Accesible para todo `/admin/*` y `/api/admin/*` |
| `Max-Age` | sin Max-Age | La expiración real vive en `exp_absolute` del payload cifrado; el cookie se borra cuando expira el browser session o vía logout |

**Por qué `__Host-`:** si alguien compromete un subdomain (`crm.marcosbarbosagroup.com` por ejemplo) NO puede setear una cookie con `Domain=.marcosbarbosagroup.com` que el admin acepte. El browser rechaza cookies `__Host-` si vienen de otro host o si les ponen `Domain` o `Path` distinto de `/`.

### 4.2 Password storage

**No** hasheamos `ADMIN_PASS` en disco. Se hashea **en memoria al boot** y se cachea para todas las verificaciones de la vida del proceso:

```ts
// lib/auth/password.ts
const HASH_CACHE: Buffer | null = null  // scrypt hash de ADMIN_PASS al boot

function bootHash() {
  const raw = process.env.ADMIN_PASS
  if (!raw) throw new Error("ADMIN_PASS ausente")
  return scryptSync(raw, FIXED_SALT, 64)  // FIXED_SALT constante del código
}

function verify(submitted: string): boolean {
  const hash = bootHash()  // cached internamente
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

## 5. UX pública — `/admin/login`

### 5.1 Estructura visual

Sin theme toggle. Siempre light. Mantiene la identidad editorial del sitio.

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
│   │ │                                      │   │   │
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

- Logo MB: `components/logo.tsx` (existente), versión monocroma (sin fondo de color).
- Tipografía: `font-display` para título, `Inter` para form.
- Acento: borde focus `#fe4100`, botón primario con bg `#fe4100`.
- Layout: centrado vertical (min-h-screen flexbox), max-w-md.
- Sin asteriscos rojos agresivos: errores en gris con línea bajo el campo.
- Honeypot: `<input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />` (mismo patrón que confesionario).
- Submit deshabilitado al primer click + muestra "Ingresando…" (idempotencia cliente, igual que confesionario).
- Si 429 / brute-force: *"Demasiados intentos. Probá en 15 minutos."* — sin distinguir "password incorrecto" de "usuario no existe" (defensa contra user enumeration).
- `?next=/admin?tab=confesionario`: tras login OK redirige al path original. Validación que `next` empieza con `/admin` (prevenir open redirect).

### 5.2 Estado post-error

Re-render con mensaje genérico arriba del form:
> *"No pudimos verificar tus credenciales. Verificá e intentá de nuevo."*

No distingue usuario inexistente vs password incorrecto.

### 5.3 Acceso denegado (sesión vencida)

Si el middleware detecta cookie vencida al pedir `/admin/*`, redirige a `/admin/login?next=<path>` con banner sutil:
> *"Tu sesión expiró. Ingresá de nuevo."*

Esto se renderiza solo si hay un query param `expired=1`.

---

## 6. UX admin (post-login)

### 6.1 Header del panel (cambio mínimo)

Agregar al header de `app/admin/layout.tsx` un botón "Cerrar sesión" (esquina superior derecha). Es un `<form action={logoutAdmin}>` con un solo botón.

### 6.2 Sin cambios estructurales

- Tabs, lista, decrypt, todo igual.
- Server actions siguen funcionando (Next.js valida Origin + cookie).
- `app/api/admin/*` sigue gateado por middleware (ahora cookie-based).

---

## 7. Seguridad operativa

| Capa | Implementación |
|---|---|
| Cookie cifrada | AES-256-GCM, IV 12 random per issue, tag 16, byte version `0x01` (mismo primitivo que confesionario). |
| Cookie flags | `__Host-` prefix, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. |
| Password hashing | scrypt N=2^15, salt fijo en código (single-admin). Cache en memoria al boot. |
| Password compare | `crypto.timingSafeEqual` (longitud fija de scrypt output). |
| Session expiry | Idle 8h (renueva en cada request válido), absoluta 14d (forza re-login). |
| Brute-force | 5 intentos / 15 min / IP-hash, ventana móvil. 6º → 429 + backoff implícito. |
| CSRF | Server Actions de Next.js 14 (Origin + headers). No doble-submit cookie manual. |
| Session fixation | Cookie fresca al login OK (nuevo IV). No se reusa cookie entrante. |
| Open redirect | `next` param validado: debe empezar con `/admin` y no contener `//` ni protocolo. |
| `no-store` | `Cache-Control: no-store` en `/admin/login` y responses de middleware. |
| Logging | `safeLog` con allowlist. Events: `admin.login.ok`, `admin.login.fail`, `admin.login.ratelimit`, `admin.logout`, `admin.session.expired`, `admin.session.invalid`. Sin PII. |
| Error responses | Genéricos al cliente (`"No pudimos verificar tus credenciales"`). Detalles técnicos solo a `safeLog`. |
| Fail closed | Si `ADMIN_PASS` o `ADMIN_SESSION_KEY` faltan al boot → la app no arranca, log explícito. |

---

## 8. Variables de entorno

Agregar a `.env.example`:

```bash

# Admin Login — sesión propia
# ⚠ Sesión propia del panel interno. NO compartir con CONFESSIONS_ENCRYPTION_KEY.
# Generar con: openssl rand -base64 32
ADMIN_SESSION_KEY=
# Contraseña del administrador único. Hasheada en memoria al boot con scrypt.
# Cambiar acá y redeploy para rotar.
ADMIN_PASS=
```

| Variable | Requerida | Generar con | Notas |
|---|---|---|---|
| `ADMIN_SESSION_KEY` | sí | `openssl rand -base64 32` | 32 bytes base64. Backupear aparte (1Password / Bitwarden). Si se pierde, todas las sesiones se invalidan — no es catastrophe (re-login), pero las activas se caen. |
| `ADMIN_PASS` | sí | a elección (16+ chars recomendado) | La única credencial del admin. Rotar cambiando el env var + redeploy. |

**`ADMIN_SESSION_KEY` separada de `CONFESSIONS_ENCRYPTION_KEY`:** rotar admin no debe afectar confesiones, y comprometer admin no debe descifrar confesiones. Dos keys, dos propósitos.

**Eliminar `ADMIN_USER` del runtime** (mantener `ADMIN_USER` solo si se quiere mostrar el username esperado en el form, pero el login acepta CUALQUIER username — la verificación es solo por `ADMIN_PASS` para simplificar). **Decisión:** mostrar un campo "Usuario" pre-llenado con `ADMIN_USER` (default `"admin"`), pero aceptar cualquier string — single-admin, la verificación es por password. Documentar que es defensivo (UX, no security).

---

## 9. Tests

Patrón del repo: `scripts/check-X.ts` con `node --experimental-strip-types`.

### 9.1 `scripts/check-admin.ts` — unit + integración sin red

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

- Hacer POST a `/admin/login` (server action via form multipart) con credenciales → obtener cookie `__Host-admin_session`.
- Usar esa cookie en todos los GETs posteriores (`Cookie: __Host-admin_session=<value>`).
- Si la server action no es invocable directamente (mismo gap que confesionario), agregar helper que use Playwright headless para hacer login UI y extraer cookie del browser context.

Alternativa más simple: **exponer un endpoint de test** `POST /api/admin/login-test` que solo funciona cuando `NODE_ENV !== 'production'` y devuelve la cookie. **Decisión:** agregar este endpoint solo para tests, gateado por `NODE_ENV !== 'production'`. Más simple que Playwright.

### 9.3 Pre-PR

```
npm run check:confessions
npm run check:admin          # nuevo
npm run check:confessions:api
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
| 5 | **Importante:** `ADMIN_USER` ya no se usa para verificar. Si lo dejaste seteado, no rompe nada pero es dead. Podés dejarlo o quitarlo. |
| 6 | Snapshot del volumen antes del primer deploy (defense in depth) |
| 7 | Deploy |
| 8 | Verificar `GET /api/health` sigue 200 |
| 9 | Hard cut: cualquier curl/Basic Auth viejo al admin → 302 a `/admin/login` (no 401 con prompt feo) |
| 10 | Smoke: login UI → entra → ve `/admin?tab=jobs` → tab confesionario descifra → logout → re-login |

**Down-time esperado:** cero si Dokploy hace rolling. El "down-time" es solo que el viejo Basic Auth ya no funciona — pero al primer reload con la sesión cookie, todo fluye.

**Comunicación:** avisar a cualquier script externo (si hay) que use Basic Auth al admin — van a tener que actualizar a cookie-based.

---

## 11. Riesgos operacionales

| Riesgo | Mitigación | Residual |
|---|---|---|
| Pérdida de `ADMIN_SESSION_KEY` | Backup obligatorio fuera del volumen | Sesiones se invalidan (re-login, no catastrophe) |
| Pérdida de `ADMIN_PASS` | Reset via env var + redeploy | Outage hasta redeploy |
| Restart container | Rate-limit se resetea (in-memory) | Aceptable v1 single-replica |
| Multi-replica futuro | Stateless cookie permite múltiples replicas; rate-limit necesita store distribuido | Documentado, defer |
| Sesión robada via XSS | httpOnly + Secure + SameSite=Lax + CSP (si existiera) | XSS sigue siendo riesgo independiente |
| Compromiso del proceso con keys en memoria | Asumido (out of scope por spec de confesionario también) | Out of scope |
| Disco lleno | No aplica (sesiones son stateless) | N/A |
| Confusión con `ADMIN_USER` | Se mantiene como UX pre-fill, no se verifica | Documentado |
| Tests rotos que asumían Basic Auth | Adaptar `check-confessions-api.ts` para usar login endpoint | Parte del plan |

---

## 12. Documentación a actualizar

| Archivo | Cambio |
|---|---|
| `docs/superpowers/specs/2026-09-12-admin-login-design.md` | Este spec |
| `docs/PENDING.md` | Quitar mención de admin ugly auth (si estaba); agregar item para login UI como done |
| `docs/spec.md` §14 | Agregar `lib/auth/` al árbol |
| `.env.example` | Agregar `ADMIN_SESSION_KEY` y `ADMIN_PASS` (sin el viejo `ADMIN_USER` que ya no verifica — o mantenerlo como UX hint) |
| `README.md` | Sección "Generar claves del Admin Login" (similar a confesionario) |
| `middleware.ts` | Reescrito para validar cookie |
| `app/admin/layout.tsx` | Agregar botón "Cerrar sesión" |

---

## 13. Alcance y fuera de alcance (resumen final)

**Incluye (v1):**
- Página `/admin/login` server-rendered, brand-consistent.
- Server action `loginAdmin` con rate-limit, honeypot, scrypt verify, cookie encrypt.
- Server action `logoutAdmin` que limpia cookie.
- Middleware reescrito: cookie-based auth en lugar de Basic Auth.
- AES-256-GCM session cookie con `__Host-` prefix.
- Idle 8h + absolute 14d.
- Brute-force 5/15min/IP-hash.
- Adaptar tests existentes para usar cookie.
- Endpoint de test `POST /api/admin/login-test` (solo `NODE_ENV !== 'production'`).
- `safeLog` con allowlist.
- Documentación + .env.example + README.

**Excluye (v1):**
- 2FA, magic-link email login, "recordarme", reset-password UI.
- Multi-usuario.
- Audit log UI (los logs van a stdout via `safeLog`).
- Sesión persistente a DB.
- Soporte cross-subdomain (`crm.marcosbarbosagroup.com` no comparte sesión).
- Migración gradual / overlap con Basic Auth.
- Throttle distribuido (Upstash / Redis).
- Soporte para invitaciones de admin secundarios.

---

## 14. Plan de implementación (siguiente fase: writing-plans)

Estimación: 8-10 tasks, ~4-5 horas con TDD.

- Task 1: env vars + config constants (`lib/auth/config.ts`)
- Task 2: `password.ts` (scrypt + verify) + tests
- Task 3: `session.ts` (encrypt/decrypt payload, cookie helpers) + tests
- Task 4: `rate-limit.ts` (5/15min) + tests
- Task 5: server actions `loginAdmin` + `logoutAdmin` + tests
- Task 6: `lib/auth/log.ts` (o reusar confesionario safeLog con allowlist extendido) + tests
- Task 7: middleware reescrito (cookie-based)
- Task 8: página `/admin/login` + form client component
- Task 9: endpoint de test `POST /api/admin/login-test`
- Task 10: adaptar tests existentes + verificación final

Aprobado: implementación tras spec.