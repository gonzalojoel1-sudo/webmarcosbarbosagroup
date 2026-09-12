# Confesionario — Buzón privado cifrado — Design

**Fecha:** 2026-09-12
**Ruta:** `/cuerpo-de-cristo/confesionario`
**Stack:** Next.js 14.2.35 App Router · TypeScript · route handlers + server actions · `node:sqlite` (WAL) · AES-256-GCM (built-in `node:crypto`) · Basic Auth para admin (existente)
**Estado:** diseño aprobado · pendiente plan de implementación

---

## 1. Contexto y objetivo

Hoy `/cuerpo-de-cristo/confesionario` es una página informativa con un CTA que apunta a `/contacto` ("Pedir un encuentro privado"). El usuario quiere que sea un **buzón real**: la persona escribe su confesión/carga, queda guardada cifrada, y Marcos la lee cuando entra al panel interno.

El confesionario trabaja con **datos espirituales sensibles** (potencialmente revelaciones de culpa, trauma, situaciones familiares). El diseño debe tratar el contenido con un estándar de privacidad más alto que el resto del sitio (bolsa, ofrendas), sin caer en complejidad operacional innecesaria para v1.

**Decisiones tomadas con el usuario:**

| Tema | Decisión |
|---|---|
| Producto | Buzón privado real (no solo solicitud de encuentro) |
| Identidad | Anónimo por defecto + canal de respuesta opcional (email o WhatsApp) |
| Retención | Conservar siempre; marcar como leído; borrado manual desde admin |
| Cifrado | AES-256-GCM en reposo con clave del servidor (env var) |
| Admin workflow | Leer + nota pastoral privada (cifrada) |
| Arquitectura | Reutilizar `BoardStore` (`board.db`) + nueva pestaña en `/admin` |

**Fuera de alcance (recordatorio):** E2E encryption, notificaciones al admin, respuesta automática al remitente, categorización, export masivo, CAPTCHA, bulk delete, rotación de clave, multi-replica.

---

## 2. Threat model

**Defendemos contra:**

1. **Robo del volumen o dump de `board.db`** → AES-256-GCM con clave fuera del volumen. Mensaje + contacto + nota pastoral cifrados en reposo.
2. **Abuso automatizado (spam)** → rate-limit (5/hora/IP-hash) + honeypot + longitudes min/max.
3. **Identificación accidental** → pseudonym warning ("no pongas tu nombre real") + cifrado del canal de contacto.
4. **Click duplicado / doble submit** → botón deshabilitado al primer click + form limpio al éxito.
5. **PII en logs** → wrapper `safeLog` con allowlist (id corto, status, latencia, código de error). Nunca mensaje, contacto, pseudonym, IP, user-agent.

**No defendemos contra (asumido / fuera de alcance):**

- Compromiso del proceso Node con la clave en memoria.
- Admin malicioso (Marcos es el único lector; modelo single-tenant).
- Análisis de tráfico / timing attacks sobre el endpoint público.
- Rotación de clave con versiones múltiples (sin key ID en v1).
- Disco lleno (sin limpieza automática; bulk delete fuera de alcance).

---

## 3. Arquitectura

### 3.1 Módulos nuevos

```
lib/confessions/
├── crypto.ts         AES-256-GCM + serialización canónica (0x01|base64(iv|tag|ct))
├── ip-hash.ts        SHA-256(salt + IP)
├── rate-limit.ts     in-memory, 5/hora/ipHash, ventana móvil
├── schema.ts         Zod + constantes (POLICY_VERSION, LÍMITES, POLICY_VERSION)
├── policy.ts         copy estática + versionado de política
└── store.ts          extiende BoardStore con tabla `confessions` (misma board.db)
```

### 3.2 Rutas

| Ruta | Método | Auth | Propósito |
|---|---|---|---|
| `/api/confessions` | POST | pública | Submit. Rate-limit + honeypot + Zod + cifrado. |
| `/admin?tab=confesionario` | GET | Basic Auth | Server-rendered, lista + detalle expandido inline. |
| `markConfessionRead` | server action | Basic Auth | Marca leído (idempotente). |
| `setPastoralNote` | server action | Basic Auth | Cifra y guarda nota pastoral. |
| `deleteConfession` | server action | Basic Auth | Borrado físico (confirmación doble). |

### 3.3 Diagrama de flujo

```
[Browser]──POST /api/confessions──→[Next route handler]
                                       │
                              ├─ rate-limit(ipHash)──429 si excede
                              ├─ honeypot check ───── silent200 si lleno (NO persistir)
                              ├─ Zod parse ─────────── 400 si falla
                              ├─ encrypt(message, contact)  ← CONFESSIONS_ENCRYPTION_KEY
                              └─ store.createConfession(…) → board.db (WAL)

[Middleware BasicAuth]
                                                          ↓
[Browser Admin]──GET /admin?tab=confesionario──→[server component]
                                                          │
                                                  list/get (encrypted blobs)
                                                          ↓
                                                  decrypt on render
                                                          ↓
[Server Action]──PATCH admin/confesiones/[id]──→[markRead | setNote | delete]
```

---

## 4. Modelo de datos

### 4.1 Tabla `confessions` (en `board.db`)

```sql
CREATE TABLE IF NOT EXISTS confessions (
  id                     TEXT PRIMARY KEY,
  message_encrypted      TEXT NOT NULL,        -- 0x01|base64(iv12|tag16|ct)
  pseudonym              TEXT,                 -- plaintext, máx 60
  wants_response         INTEGER NOT NULL DEFAULT 0,
  contact_method         TEXT,                 -- 'email' | 'whatsapp' | NULL
  contact_value_encrypted TEXT,                -- NULL si !wants_response
  consent                INTEGER NOT NULL,
  consent_at             TEXT NOT NULL,
  policy_version         TEXT NOT NULL,
  ip_hash                TEXT NOT NULL,
  user_agent             TEXT,
  honeypot               TEXT NOT NULL DEFAULT '',
  status                 TEXT NOT NULL DEFAULT 'new',  -- 'new' | 'read'
  read_at                TEXT,
  note_updated_at        TEXT,
  pastoral_note_encrypted TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS ix_confessions_status_created
  ON confessions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_confessions_ip_hash_created
  ON confessions(ip_hash, created_at DESC);
```

**Notas:**
- `honeypot` se guarda siempre (forense) **solo si está vacío** (path normal). Si llega poblado, **no se persiste nada** y se responde 200 silencioso.
- `read_at` se setea **solo** por la acción explícita `markConfessionRead` (admin hace click en "Marcar leído"). Abrir el detalle **no** marca como leído — previene marcado accidental.
- `note_updated_at` se setea cuando se guarda la nota pastoral. `read_at` y `note_updated_at` pueden divergir (admin puede leer sin guardar nota, o guardar nota sin marcar leído).
- `status` no se cambia al guardar nota — leer ≠ respondido.

### 4.2 Cipher — `lib/confessions/crypto.ts`

- **Algoritmo:** AES-256-GCM (built-in `node:crypto`).
- **Serialización canónica:** `0x01 || base64( iv(12) || authTag(16) || ciphertext )`.
- El byte `0x01` es la versión del esquema. Futuras rotaciones usarán `0x02+` con key ID embebido (fuera de alcance v1).
- **IV aleatorio por escritura** (`crypto.randomBytes(12)`). Nunca reutilizar (key, IV).
- API:
  ```ts
  encrypt(plaintext: string): string   // throws si key no configurada
  decrypt(ciphertext: string): string  // throws DecryptionError si falla
  ```
- `DecryptionError` es una clase tipada para que el admin UI la detecte y muestre mensaje claro (ver §6.2).

### 4.3 Schema Zod — `lib/confessions/schema.ts`

```ts
POLICY_VERSION = "2026-09-12-v1"
MIN_MESSAGE = 20
MAX_MESSAGE = 4000
MAX_PSEUDONYM = 60

confessionSchema = z.object({
  message: z.string().trim().min(20).max(4000),
  pseudonym: z.string().trim().max(60).optional().or(z.literal("")),
  wantsResponse: z.boolean(),
  contactMethod: z.enum(["email", "whatsapp"]).optional(),
  contactValue: z.string().trim().optional(),
  consent: z.literal(true),
  policyVersion: z.literal(POLICY_VERSION),
  honeypot: z.string().max(255).optional().or(z.literal("")),
}).superRefine((val, ctx) => {
  if (val.wantsResponse && (!val.contactMethod || !val.contactValue)) {
    ctx.addIssue({ code: "custom", message: "Falta canal de contacto", path: ["contactValue"] })
  }
  if (val.contactMethod === "email" && val.contactValue && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val.contactValue)) {
    ctx.addIssue({ code: "custom", message: "Email inválido", path: ["contactValue"] })
  }
  if (val.contactMethod === "whatsapp" && val.contactValue && !/^\+?[\d\s\-()]{8,16}$/.test(val.contactValue)) {
    ctx.addIssue({ code: "custom", message: "WhatsApp inválido", path: ["contactValue"] })
  }
})
```

### 4.4 Rate limit — `lib/confessions/rate-limit.ts`

- In-memory `Map<ipHash, number[]>` (timestamps).
- Ventana móvil: **5 POST / hora / ipHash**. Sexto → 429.
- Single-replica (atado al pendiente crítico de Dokploy en `docs/PENDING.md` §1).
- En restart del container el counter se resetea (aceptable, documentado).
- Limpieza: cada hit poda timestamps >1h.

### 4.5 IP hash — `lib/confessions/ip-hash.ts`

- `SHA-256(CONFESSIONS_IP_SALT + IP)`.
- Hex lowercase, longitud fija (64 chars).
- No se guarda IP cruda. Solo se usa el hash para rate-limit + dedupe básico.

---

## 5. UX pública

### 5.1 Página `/cuerpo-de-cristo/confesionario`

Mantener el hero actual ("Un lugar para librarte de tus cargas", chips `[Confidencial] [Sin juicio] [Escucha]`). Reemplazar el contenido de "Cómo funciona" por el formulario. **Estética pastoral**: textarea en `font-display` (serif), generoso spacing vertical, sin asteriscos rojos agresivos. Reutilizar `ContentPage` + `SectionShell` para no romper el sistema.

```
┌─ BUZÓN PRIVADO ─────────────────────────────────────┐
│ Un espacio reservado para escribir lo que te pesa. │
│ Se guarda cifrado, solo Marcos lo lee.              │
│                                                     │
│ Tu mensaje                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ (serif, min 6 líneas, sin max visible)           │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│ 20–4000 caracteres · sin formato · sin adjuntos     │
│                                                     │
│ Seudónimo (opcional)                                │
│ ┌─────────────────────────────────────────────────┐ │
│ └─────────────────────────────────────────────────┘ │
│ Solo para que Marcos pueda referenciar si volvés.   │
│ No se cifra: no pongas tu nombre real.              │
│                                                     │
│ ☐ Quiero que me contacten                           │
│   ◯ Email  ◯ WhatsApp                               │
│   ┌─────────────────────────────────────────────┐   │
│   │ tu@email.com / +54 9 351 ...                  │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│ ☐ Entiendo que este mensaje queda guardado cifrado │
│   hasta que Marcos lo lea y decida borrarlo. No se │
│   publica ni se comparte. Ver política.             │
│                                                     │
│              [ Enviar al buzón ]                     │
└─────────────────────────────────────────────────────┘
```

**Detalles:**
- Checkbox "Quiero que me contacten" empieza destildada; radios + input aparecen con transición suave cuando se tilda.
- Botón se deshabilita en el primer click + muestra `Enviando…` (idempotencia cliente).
- Honeypot: `<input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />`.
- Si 429: *"Estás enviando mensajes muy seguido. Esperá un momento antes de volver a intentar."*
- Errores genéricos al cliente (nunca eco técnico: `{"error": "No pudimos procesar tu mensaje"}`).

### 5.2 Estado post-envío

Reemplaza el form sin echo del mensaje:

> *"Tu mensaje fue recibido. Está cifrado y solo Marcos lo va a leer. Si pediste contacto, lo hará desde su canal personal, no automático."*
> Botón `Enviar otro` (resetea form).

---

## 6. UX admin

### 6.1 Lista en `/admin?tab=confesionario`

Agregar segmented control al tope de `app/admin/page.tsx`. Sin librería nueva: dos links con query param (`tab=jobs`, `tab=confesionario`) para server-rendering sin JS.

```
Panel interno — Marcos Barbosa Group

[Búsquedas y candidatos (4)]  [Confesionario (3 nuevos)]

Confesionario
─────────────
2026-09-12 14:32 · peregrino  · ⌗ contactar · NUEVO   ▾
2026-09-12 09:15 · anónimo    · — contactar · LEÍDO    ▸
2026-09-11 22:08 · hijo88     · ⌗ contactar · LEÍDO    ▸
```

- Badge `(N nuevos)` con `count(status='new')`.
- Cada item colapsable. Click → expande panel inline.
- Empty state: *"No hay mensajes en el buzón todavía."*

### 6.2 Detalle expandido

```
───────────────────────────────────────────────────────
Mensaje (descifrado):
"Hace dos años que no puedo perdonarme por ..."

Seudónimo: peregrino
Quiere contacto: ✓ WhatsApp +54 9 351 733 ...
Recibido: 2026-09-12 14:32  ·  IP-hash: 8a3f... (no raw IP)
Política: 2026-09-12-v1

Nota pastoral:
┌─────────────────────────────────────────────────────┐
│ (editable, se cifra al guardar)                     │
└─────────────────────────────────────────────────────┘

[Marcar leído]  [Guardar nota]  [Borrar]
───────────────────────────────────────────────────────
```

**Detalles:**
- **Borrar**: confirmación doble. Modal inline pide escribir literalmente `BORRAR` antes de habilitar el botón (defensa contra click accidental).
- **Marcar leído**: solo visible si `status='new'`. Un solo uso (idempotente).
- **Guardar nota**: actualiza `note_updated_at`. La nota se cifra con la misma key antes de persistir.
- **Decrypt failure**: si `decrypt()` tira `DecryptionError`, mostrar:
  > *"No se pudo descifrar este mensaje. La clave de cifrado puede haber cambiado o el dato está corrupto. ID: `{shortId}` · creado: `{created_at}`."*
  Panel sigue funcional para borrar (escape hatch); mensaje y nota no se muestran.
- **Banner admin**: si `CONFESSIONS_ENCRYPTION_KEY` falta o no tiene 32 bytes, `app/admin/page.tsx` muestra un banner persistente en la pestaña Confesionario: *"Configuración requerida: `CONFESSIONS_ENCRYPTION_KEY` ausente o inválida. Los mensajes no se pueden descifrar."* Las demás pestañas no se ven afectadas. `noindex` heredado del layout. `Cache-Control: no-store` en headers.

---

## 7. Seguridad operativa

| Capa | Implementación |
|---|---|
| Idempotencia cliente | `disabled={busy}` en el botón al primer click + `setStatus('loading')`. Sin doble POST. |
| Rate limit | 5 POST/hora/ipHash. 429 → mensaje claro. |
| Honeypot | `name="website"`. Si poblado → no persistir + 200 silencioso. |
| Validación server-side | Zod + `superRefine` (wantsResponse ↔ contactMethod). |
| Consentimiento | `consent === true` requerido. Sin consentimiento → 400. |
| IP privada | SHA-256(salt + IP). Sin raw. |
| Encryption at rest | AES-256-GCM, IV nuevo por escritura, byte de versión. |
| Fail closed (key) | Si falta o key inválida → 503 al POST + admin muestra banner "Configuración requerida". `/api/health` sigue 200. |
| `no-store` | `Cache-Control: no-store` en POST + GET admin confesionario. |
| Logging | Disciplina estricta: nunca loguear message, contactValue, pseudonym, ipHash completo, user-agent completo. Sí: id corto, status, latencia, counts, código de error. Wrapper `safeLog` con allowlist. |
| CSRF | Endpoint público: sin cookies ni sesión → CSRF no aplica. Admin (server actions): same-origin + protección built-in de Next.js. |
| Error responses | Cuerpos genéricos al cliente público. Detalles técnicos solo a admin (auth). |

---

## 8. Privacidad y derechos del usuario

Agregar nueva sección en `app/privacidad/page.tsx` (anchor `#confesionario`):

> **Confesionario**
>
> El Confesionario es un buzón privado donde podés escribir lo que te pesa sin identificarte.
>
> **Qué guardamos.** Por defecto, anónimo. Si optás por dejar un canal de contacto (email o WhatsApp), ese dato se guarda cifrado. Tu mensaje se cifra antes de guardarse. No guardamos tu IP (solo un hash irreversible usado para evitar abuso).
>
> **Qué NO hacemos.** No publicamos nada, no compartimos con terceros, no enviamos marketing, no usamos tu mensaje para entrenar modelos.
>
> **Retención.** Indefinida, hasta que vos o Marcos decidan eliminarlo.
>
> **Tus derechos (Ley 25.326).** Para acceder, rectificar o eliminar un mensaje que enviaste, escribinos a `consultora.marcosbarbosa@gmail.com` indicando el seudónimo que usaste. Atendemos en 72 horas hábiles.

**Grandfathering de política:** las confesiones existentes mantienen `policy_version` original al momento de envío. Cambios futuros en `/privacidad` solo aplican a nuevos envíos. Documentado en `lib/confessions/policy.ts`.

---

## 9. Variables de entorno

Agregar a `.env.example`:

```bash
# Confesionario — cifrado en reposo
# ⚠ BACKUPEAR aparte. Si se pierde, los mensajes son irrecuperables.
# Generar con: openssl rand -base64 32
CONFESSIONS_ENCRYPTION_KEY=
# Generar con: openssl rand -hex 16
CONFESSIONS_IP_SALT=
```

| Variable | Requerida | Generar con | Notas |
|---|---|---|---|
| `CONFESSIONS_ENCRYPTION_KEY` | sí | `openssl rand -base64 32` | 32 bytes base64. Falla cerrado si falta o no tiene 32 bytes. **Backupear aparte** (1Password / Bitwarden), nunca junto al volumen. |
| `CONFESSIONS_IP_SALT` | sí | `openssl rand -hex 16` | Rotación segura: solo invalida rate-limit, no datos. |

Documentar en `README.md` sección **"Generar claves del Confesionario"**.

---

## 10. Tests

Patrón existente del repo: `scripts/check-board.ts`, `scripts/check-donations.ts`. Dos scripts nuevos, sin vitest.

### 10.1 `scripts/check-confessions.ts` — unit + integración sin red

`node --experimental-strip-types scripts/check-confessions.ts`. Usa `mkdtempSync` para `DATA_DIR` temporal + keys fake.

```
crypto
  - encrypt + decrypt round-trip
  - ciphertext distintos en 2 calls (IV aleatorio)
  - decrypt con key distinta → DecryptionError
  - byte de versión desconocido → DecryptionError

schema
  - mensaje <20 falla · >4000 falla
  - wantsResponse=true sin contactMethod/Value falla
  - email inválido falla · WhatsApp inválido falla
  - email válido pasa · WhatsApp válido pasa
  - consent=false falla
  - honeypot poblado parsea OK (la política es a nivel handler, no schema)

store
  - createConfession persiste ciphertext (no plaintext)
  - list/get devuelven ciphertext (no se filtra plaintext)
  - markRead es idempotente
  - setPastoralNote encripta (get devuelve ciphertext)
  - deleteConfession borra realmente

rate-limit
  - 5 hits OK, 6º → 429
  - IP distinta no se afecta por IP saturada
  - ventana expira tras 1h (con mock de tiempo)

ip-hash
  - misma IP → mismo hash
  - distintas → distintos
  - longitud fija (64 hex)
```

### 10.2 `scripts/check-confessions-api.ts` — integración con servidor local

`npm run build && npm start &`, después `node --experimental-strip-types scripts/check-confessions-api.ts`. Hace `fetch` al servidor.

```
- POST /api/confessions con payload válido → 200, id retornado
- POST con honeypot → 200, NO se persiste (verificar count después)
- POST sin consent → 400
- POST sin CONFESSIONS_ENCRYPTION_KEY configurada → 503
- POST 6 veces misma IP → la 6ª es 429
- GET /api/admin/confessions sin auth → 401
- GET /api/admin/confessions con auth → lista
- Server action `markConfessionRead` → status pasa a 'read', `read_at` se setea; idempotente (segunda llamada no cambia nada)
- Server action `deleteConfession` → fila eliminada; siguiente GET no la incluye
```

### 10.3 Scripts en `package.json`

```json
"check:confessions": "node --experimental-strip-types scripts/check-confessions.ts",
"check:confessions:api": "node --experimental-strip-types scripts/check-confessions-api.ts"
```

Pre-PR: `npm run check:confessions && npm run check:confessions:api && npm run build`.

---

## 11. Deploy (Dokploy)

| Paso | Acción |
|---|---|
| 1. Generar claves | `openssl rand -base64 32` y `openssl rand -hex 16` |
| 2. Backup de la clave | Guardar `CONFESSIONS_ENCRYPTION_KEY` en bóveda cifrada (1Password / Bitwarden) **fuera** del volumen |
| 3. Setear env vars | Dokploy → Variables → pegar ambas |
| 4. Backup del volumen | Snapshot de `/app/data` antes del primer deploy |
| 5. Deploy | Push a `main` (CI Dokploy) o manual |
| 6. Verificar migración | App arranca sin error; `CREATE TABLE IF NOT EXISTS` corre |
| 7. Smoke confesionario | Enviar 1 mensaje → ver en `/admin` → marcar leído → guardar nota → borrar |
| 8. Verificar health | `GET /api/health` sigue 200 |
| 9. Verificar banner admin | Banner "Configuración requerida" **NO** debe aparecer |

---

## 12. Riesgos operacionales

| Riesgo | Mitigación | Residual |
|---|---|---|
| Pérdida de `CONFESSIONS_ENCRYPTION_KEY` | Backup obligatorio fuera del volumen, documentado en README | Confía en disciplina humana |
| Rotación de la key | No soportado en v1; si rotás, mensajes viejos irrecuperables (no hay key ID en ciphertext) | Out of scope v1 |
| Rotación de `CONFESSIONS_IP_SALT` | Solo invalida rate-limit; mensajes intactos | Aceptable |
| Restart del container | Rate-limit se resetea (in-memory) | Aceptable para v1 (single-replica) |
| Drift de política de privacidad | `POLICY_VERSION` se setea al envío; cambios futuros solo aplican a nuevas confesiones | Documentado |
| Disco lleno | `board.db` crece sin limpieza | Out of scope; bulk delete sería solución |
| Compromiso de host | Asumimos Dokploy seguro (2FA, isolation) | Out of scope |
| Admin olvida password | Reset `ADMIN_PASS` + redeploy | Aceptable |

---

## 13. Documentación a actualizar

| Archivo | Cambio |
|---|---|
| `docs/superpowers/specs/2026-09-12-confesionario-design.md` | Este spec |
| `docs/PENDING.md` | Quitar punto 5; link al spec + fecha de implementación |
| `docs/spec.md` §14 | Agregar `lib/confessions/` + rutas confesionario al árbol |
| `.env.example` | Agregar `CONFESSIONS_ENCRYPTION_KEY` + `CONFESSIONS_IP_SALT` |
| `README.md` | Sección "Generar claves del Confesionario" |
| `app/privacidad/page.tsx` | Nueva sección `<h2 id="confesionario">Confesionario</h2>` con copy del §8 |

---

## 14. Alcance y fuera de alcance (resumen final)

**Incluye (v1):** formulario real (anónimo + canal opcional), cifrado AES-256-GCM en reposo, rate-limit, honeypot, IP-hash sin raw, Basic Auth admin, pestaña Confesionario en `/admin`, marcar leído, nota pastoral cifrada, borrado manual con doble confirmación, sección de privacidad en `/privacidad`, tests (`check-confessions` + `check-confessions-api`).

**Excluye (v1):** E2E encryption, notificaciones al admin, respuesta automática al remitente, categorización / tags / búsqueda, export CSV/JSON, límite duro de cantidad, multi-replica / rate-limit distribuido, CAPTCHA, bulk delete, rotación de clave con key ID, auditoría multi-admin, internacionalización (es-AR únicamente), rate-limit por pseudonym.