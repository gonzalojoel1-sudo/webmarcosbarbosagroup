# Persistencia del ledger de ofrendas — comparación decision-grade

**Fecha:** 2026-09-11 (research ejecutada 2026-09-12)
**Alcance:** store de ofrendas (pocas filas por día): `id`, `provider` (mercadopago), `provider_payment_id`, `amount` (ARS centavos), `status` (pending/approved/refunded/charged_back), timestamps, + dedupe de webhook-events.
**Stack actual:** Next.js 14.2.35 App Router, TypeScript, **solo route handlers**, Docker `standalone`, `node:20-alpine`, un VPS, Dokploy (Traefik). Contenedor no-root uid/gid **1001** (`nextjs:nodejs`). Ya existe patrón append-only JSONL para leads (`app/api/lead/route.ts` → `data/leads.jsonl`, efímero hoy).
**Restricciones dadas:** un solo contenedor; los módulos nativos son un riesgo real de deploy; "hacerlo bien a la primera"; idealmente sin servicio externo, pero se puede sumar uno si es claramente mejor.

> Documento hermano: `docs/research/2026-09-11-pagos-stripe-mercadopago.md` (integración MP/Stripe, webhooks, montos server-side). Este documento asume esas decisiones y se enfoca **solo en dónde y cómo persistir el ledger**.

---

## 0. Executive recommendation

**Pick: SQLite en un archivo (`/app/data/donations.db`) sobre un volumen persistente de Dokploy, implementado con `better-sqlite3` (pin `^12`) detrás de una interfaz de repositorio delgada.**
Razón única más fuerte: es la base de datos local estándar del ecosistema Node/Next (7,4 M descargas/semana), da **transacciones ACID reales y constraints `UNIQUE`** —que es *la* garantía de idempotencia para dinero— sin agregar ningún servicio externo ni red, y sobrevive redeploys con un volumen.

**Fallback (si el módulo nativo en alpine molesta): `node:sqlite` sobre `node:22-alpine`/`node:24-alpine`.**
Es SQLite **incorporado en Node** (sin `.node`, sin compilador, sin tracing frágil), con la misma API de archivo único y las mismas transacciones/constraints. Requiere subir la imagen base (Node 20 **ya está EOL** desde abril 2026 y no trae `node:sqlite`).

**Regla de decisión corta (consenso 2026):** *SQLite mientras **exactamente un** proceso escriba; Postgres en cuanto pueda haber un segundo escritor.* Este proyecto es un contenedor Next.js standalone = un proceso Node escritor → SQLite encaja. Si algún día hay réplicas múltiples o el VPS deja de ser el único lugar, el escape es Neon/Postgres (§5.6).

**Qué NO elegir ahora:** PGlite (Alpha, single-connection), sql.js (sin persistencia real), lowdb (sin constraints), RxDB/PouchDB (forma NoSQL equivocada), Upstash/KV como ledger (consistencia eventual), Neon/Supabase (red + cold start innecesarios para pocas filas/día en el mismo VPS).

---

## 1. Comparación (vista rápida)

| Opción | Cómo corre en `node:20-alpine` + Next standalone | Riesgo nativo | Transacciones / unicidad | Ops | Costo | Veredicto |
|---|---|---|---|---|---|---|
| **better-sqlite3** (archivo) | `apk add python3 make g++` en deps; `.node` debe quedar en standalone (incluir/copy) | **Medio** (native build / ABI) | **Sí**: ACID, `UNIQUE`, parciales, `STRICT` | Bajo (un archivo en volumen) | $0 | **PICK** |
| **node:sqlite** (built-in) | **No existe en Node 20**; subir a `node:22-alpine`+ | **Ninguno** (viene en el binario) | **Sí**: ACID, `UNIQUE`, `STRICT`, `backup()` | Bajo | $0 | **Fallback fuerte / pick si suben Node** |
| **libSQL `@libsql/client` (file)** | Auto-externalizado por Next, pero el archivo local usa binding nativo | Medio | Sí | Bajo | $0 | Equivalente a better-sqlite3, sin ventaja |
| **Turso (embedded replica)** | Archivo local + sync a la nube | Medio (binding) + red | Sí en local, writes al primary | Medio (cuenta/token, sync) | Free→$$ | Solo si quieren réplica offsite |
| **PGlite** (`@electric-sql/pglite`) | WASM, persiste con `NodeFS` a disco | **Ninguno** | Sí, pero **single user/connection** | Bajo | $0 | Alpha, no "a la primera" |
| **sql.js** (WASM) | Corre, pero **en memoria**; persistir = `export()` total a fs | Ninguno | Sí en memoria, **sin persistencia automática** | Manual y frágil | $0 | **No** |
| **Neon / Supabase / Vercel PG** | Driver HTTP/WS sin nativos | Ninguno | Sí | Medio (cuenta, secretos) | Free→$$ | Escape hatch multi-réplica |
| **Upstash Redis / Vercel KV** | Cliente HTTP | Ninguno | **Sin transacciones multi-clave ni constraints**; consistencia **eventual** | Bajo | Por request | **No** como ledger (sí para rate-limit) |
| **JSONL append-only** | Ya funciona (`/api/lead`) | Ninguno | **Sin transacciones/constraints** | Muy bajo | $0 | Solo audit trail, no ledger |
| **lowdb / RxDB / PouchDB** | JSON/NoSQL en proceso | Mixto | No apto para dinero | Bajo | $0 | **No** |

### El sub-problema real: ¿el `.node` viaja en el output `standalone`?

Respuesta verificada, con matices:

1. **`serverComponentsExternalPackages`.** En Next 14.2 la clave es `experimental.serverComponentsExternalPackages` (renombrada a `serverExternalPackages` en Next 15). **`better-sqlite3` ya está en la lista de auto-externos por defecto de Next 14.2** (junto con `@libsql/client`, `libsql`, `sqlite3`, `pg`, `prisma`…), así que en teoría no hace falta declararlo. Declararlo igual es *belt-and-suspenders* y no rompe nada. ([Next 14 docs](https://nextjs.org/docs/14/app/api-reference/next-config-js/serverComponentsExternalPackages), [Next 15 docs](https://nextjs.org/docs/15/app/api-reference/config/next-config-js/serverExternalPackages))
2. **El tracer.** Next usa `@vercel/nft` para copiar solo lo necesario al `.next/standalone`. La propia doc advierte que *"Next.js might fail to include required files"* y ofrece `outputFileTracingIncludes`, con un bloque explícito de **"Common include patterns for native/runtime assets"** (`node_modules/sharp/**/*`, `node_modules/aws-crt/dist/bin/**/*`). Es decir: los binarios nativos **no están contractualmente garantizados** y la vía documentada es incluirlos. ([Next `output` docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/output))
3. **Evidencia de campo.** Hay casos donde Next **sí** copia el binario, pero a una ruta *hasheada* (`…/standalone/.next/node_modules/better-sqlite3-<hash>/build/Release/better_sqlite3.node`) y con **ABI equivocada**, causando `NODE_MODULE_VERSION mismatch` en runtime. ([OmniRoute #1497](https://github.com/diegosouzapw/OmniRoute/issues/1497), [OmniRoute #8915](https://github.com/diegosouzapw/OmniRoute/issues/8915))

**Conclusión operativa:** no confíes en que "viaja solo". Hacé las dos cosas (include **y** copy explícito) y **verificá en la imagen**.

### Receta concreta para el pick

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // En Next 14.2 el nombre incluye el prefijo experimental.
  // better-sqlite3 ya viene en la lista por defecto, pero lo dejamos explícito.
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    // Fuerza que el paquete nativo (incluido build/Release/*.node) entre al trace standalone.
    outputFileTracingIncludes: {
      "/*": ["./node_modules/better-sqlite3/**/*"],
    },
  },
  poweredByHeader: false,
  async redirects() { /* …sin cambios… */ },
};
export default nextConfig;
```

`Dockerfile` (cambios sobre el actual, marcados):
```dockerfile
# deps: dependencias de build para el caso "compilar desde fuente" de better-sqlite3
FROM base AS deps
RUN apk add --no-cache python3 make g++          # ← NUEVO (solo etapa deps, no engorda el runner)
COPY package.json package-lock.json* ./
RUN npm ci

# … builder igual …

# runner
# Opción A (belt-and-suspenders): copiar el paquete nativo completo
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3   # ← NUEVO
# (ya tenés)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
```
> Nota: `outputFileTracingIncludes` y el `COPY` explícito son redundantes a propósito. Si el tracer cambia de comportamiento entre versiones de Next, el `COPY` te salva; si el `require` se resuelve a la copia hasheada, el trace te salva.

**Verificación obligatoria antes de confiar en el deploy** (agregar al pipeline o correr una vez):
```bash
docker build -t webmb . && docker run --rm webmb node -e "require('better-sqlite3'); console.log('sqlite ok')"
```
o mejor, un chequeo de arranque que abra la DB (`lib/donations/ledger.ts` init) y falle ruidoso si no puede.

**Pin de versión (importante):** `better-sqlite3@^12` en `node:20-alpine`. La v13 (primer release **N-API**, prebuilds incluidas en el tarball) apunta a Node soportado; Node 20 está EOL y el propio maintainer recomienda `^12` como techo para Node 20. Si igual querés v13, subí la base a Node 22/24. ([better-sqlite3 releases](https://github.com/WiseLibs/better-sqlite3/releases), [cavemem #66](https://github.com/JuliusBrussee/cavemem/issues/66))

**Esquema sugerido (SQLite):**
```sql
PRAGMA journal_mode = WAL;      -- lecturas concurrentes; requiere tratar -wal/-shm en backups
PRAGMA busy_timeout = 5000;     -- espera el lock en vez de fallar instantáneo
PRAGMA foreign_keys = ON;

CREATE TABLE donations (
  id                   TEXT PRIMARY KEY,          -- uuid nuestro (external_reference de MP)
  provider             TEXT NOT NULL,             -- 'mercadopago'
  provider_payment_id  TEXT,                      -- null hasta que MP crea el pago
  amount_cents         INTEGER NOT NULL,          -- centavos ARS, entero
  currency             TEXT NOT NULL DEFAULT 'ARS',
  status               TEXT NOT NULL,             -- pending|approved|refunded|charged_back
  external_reference   TEXT NOT NULL,
  donor_email          TEXT,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL,
  approved_at          TEXT,
  raw_json             TEXT
) STRICT;

CREATE UNIQUE INDEX ux_donations_provider_payment
  ON donations(provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;          -- índice único parcial

CREATE UNIQUE INDEX ux_donations_external_ref
  ON donations(external_reference);

CREATE TABLE webhook_events (
  provider     TEXT NOT NULL,
  event_id     TEXT NOT NULL,
  received_at  TEXT NOT NULL,
  payload_hash TEXT,
  PRIMARY KEY (provider, event_id)
) STRICT;
```
El `UNIQUE` es la garantía real de idempotencia; el código debe **capturar la violación de constraint y tratarla como no-op** (ver §7).

---

## 2. better-sqlite3 (SQLite nativo)

**Qué es.** Binding síncrono de SQLite para Node, el más usado del ecosistema. Versión actual **13.0.3**; soporta transacciones, user-defined functions, WAL, `STRICT`, índices parciales, worker threads. ([npm](https://www.npmjs.com/package/better-sqlite3), [README](https://github.com/WiseLibs/better-sqlite3))

**Cómo corre en este stack.** `npm ci` en `node:20-alpine` intenta (a) bajar un **prebuild** o (b) compilar con `node-gyp`. Históricamente **no había prebuilds musl** y alpine obligaba a compilar (`apk add python3 make g++`). Reportes recientes de 2026 indican que **v12 ya publica prebuilds para musl y glibc (x64/arm64)**, pero esto no es una garantía contractual del README y conviene asumir que puede compilar. ([better-sqlite3 #387](https://github.com/WiseLibs/better-sqlite3/issues/387), [mem0 #3882](https://github.com/mem0ai/mem0/issues/3882), [mem0 #3882 comentario sobre musl/glibc])

**Riesgo nativo.** Es exactamente el riesgo que preocupa: ABI mismatch (`NODE_MODULE_VERSION`), dependencia de toolchain, y tracer de Next que puede omitir o copiar mal el `.node`. Con v12 (prebuild-install) en alpine el build-from-source es el caso frecuente; con v13 (N-API) se vuelve más portable, pero v13 pide Node ≥22 en la práctica.

**Transacciones/unicidad.** Completas y sincrónicas: `db.transaction()`, `INSERT … ON CONFLICT`, índices únicos (incluso parciales), `STRICT` desde SQLite 3.37. Es la opción con **mejor garantía de constraint por línea de código**.

**Ops.** Un archivo + volumen. Backup = `VACUUM INTO` o `.backup`. WAL agrega `-wal`/`-shm` (los maneja el backup correcto). Litestream opcional para replicación continua.

**Costo.** $0.

**Cuándo elegirlo.** Ahora: pocas filas/día, un solo escritor, querés constraints fuertes y cero servicios externos. Es el default del ecosistema y el que ya recomendaba el doc hermano.

---

## 3. `node:sqlite` (built-in de Node)

**Qué es.** Módulo SQLite **incorporado en Node** (`node:sqlite`, `DatabaseSync`), síncrono, con prepared statements, transacciones, `STRICT`, constraints, y `sqlite.backup()` (desde v22.16). No es un paquete npm: viene con el binario de Node. ([Node 22 docs](https://nodejs.org/docs/latest-v22.x/api/sqlite.html), [Node 24 docs](https://nodejs.org/api/sqlite.html))

**Historia de estabilidad (exacta):**
- `v22.5.0` — agregado, detrás de `--experimental-sqlite`.
- `v22.13.0` — ya no requiere el flag, **sigue experimental**.
- `v24.2.0` — **"No longer experimental"**.
- `v24.15.0` — **"release candidate"**. ([Node sqlite docs, tabla de cambios](https://nodejs.org/api/sqlite.html))

**Disponibilidad en Node 20: NO.** El módulo no existe antes de v22.5. Por lo tanto **no es usable en `node:20-alpine`**. Para usarlo hay que cambiar la base a `node:22-alpine` (≥22.13, mejor ≥22.16 por `sqlite.backup()`) o `node:24-alpine`. Dado que **Node 20 está EOL desde 2026-04-30**, ese upgrade es recomendable igual.

**Cómo corre en el stack.** Tras subir la imagen: `import { DatabaseSync } from "node:sqlite"` en un route handler con `export const runtime = "nodejs"`. **Cero dependencias npm, cero `.node`, cero toolchain, cero tracing de binarios.** El `node:sqlite` vive en el binario, así que el `standalone` no puede "perderlo".

**Riesgo nativo.** Ninguno. Esta es su ventaja principal frente a better-sqlite3.

**Transacciones/unicidad.** Equivalentes a SQLite (misma librería): ACID, `UNIQUE`, `STRICT` (Node trae SQLite moderno). `sqlite.backup(source, dest)` da backup consistente en caliente.

**Ops/Costo.** Iguales que SQLite; $0. El único costo es la migración de versión de Node y que la API es más nueva (RC, no GA) — aunque es del propio equipo de Node y ya es estable en la práctica.

**Cuándo elegirlo.** Si querés **eliminar por completo la clase de riesgo de módulos nativos** y estás dispuesto a subir la base a Node 22/24. Es, honestamente, el mejor *trade-off* riesgo/beneficio si el upgrade de Node no es un problema.

---

## 4. libSQL / `@libsql/client` (local) y Turso (hosted)

**local file (`@libsql/client`, `url: "file:…"`):** SQLite-compatible (fork de SQLite), Drizzle/Prisma lo soportan, y Next lo auto-externaliza (`@libsql/client` y `libsql` están en la lista default de Next 14.2). **Pero** para un archivo local el cliente usa un binding nativo; el riesgo nativo es el mismo que better-sqlite3, sin ganar nada para un solo contenedor. La propia doc de Turso recomienda `@tursodatabase/database` para uso local/embebido y `@libsql/client` para remoto/ORM. ([Turso TS reference](https://docs.turso.tech/sdk/ts/reference), [@libsql/client npm](https://www.npmjs.com/package/@libsql/client))

**Turso embedded replicas:** archivo local que se sincroniza con un primary en la nube. Reads locales (microsegundos), writes al primary y se reflejan. "Fully supported in production". Requiere cuenta, `syncUrl` + `authToken`, y `syncInterval`. Útil si querés **réplica offsite sin Litestream** o si el VPS puede perder el disco. Pero agrega una dependencia externa paga y una capa de sync justo donde menos querés sorpresas (dinero). ([Turso Embedded Replicas](https://docs.turso.tech/features/embedded-replicas/introduction))

**Contexto 2026:** Turso está empujando una reescritura nueva ("Turso Database"); libSQL es "where we started… production-ready". Para un archivo local, seguí con SQLite puro (better-sqlite3/node:sqlite). ([docs.turso.tech/libsql](http://docs.turso.tech/libsql))

**Cuándo elegirlo.** Si y solo si querés replicación gestionada al cloud sin operar Litestream, o si ya vas a usar Drizzle y querés un path de migración a Turso remoto.

---

## 5. PGlite — y los demás candidatos

### 5.1 PGlite (`@electric-sql/pglite`) — Postgres en WASM

- **Qué es:** build WASM de Postgres en una lib TS, corre en Node/Bun/Deno/browser, <3 MB gzip. Persiste a disco en Node vía `NodeFS` (`new PGlite('./pgdata')`) o a IndexedDB en browser. ([pglite.dev/docs](https://pglite.dev/docs), [GitHub](https://github.com/electric-sql/pglite))
- **Cómo corre en el stack:** sin binarios nativos; bundleás el `.wasm`. Funciona en Docker/standalone.
- **Límite duro:** **single user / single connection**. Postgres compilado en single-user mode, sin fork. Para un contenedor Next con posibles peticiones concurrentes, hay que serializar accesos.
- **Madurez:** el repo se auto-declara **Alpha**. Excelente para tests/CI/local-first; para un ledger de dinero en producción serías early adopter. ([GitHub README, badge Alpha](https://github.com/electric-sql/pglite))
- **Ojo, no confundir:** existe un repo distinto `pglite/pglite` ("PostgresLite", nativo, sin WASM). El de ElectricSQL es `electric-sql/pglite` / npm `@electric-sql/pglite`.
- **Veredicto:** **No** ahora. Mitad de la madurez de SQLite con la mitad de la garantía, por cero beneficio para este caso.

### 5.2 sql.js — **No**

SQLite en WASM **en memoria**; la doc es explícita: *"uses a virtual database file stored in memory, and thus doesn't persist the changes"*. Para persistir hay que llamar `db.export()` (serializa **toda** la DB a `Uint8Array`) y escribirla vos mismo en cada cambio — bloqueante, O(DB), y con riesgo de perder escrituras si el proceso muere. El build oficial `sqlite-wasm` dice *"Node.js is currently only supported for in-memory databases without persistence."* Un ledger no puede depender de "acordate de exportar". ([sql.js README](https://github.com/sql-js/sql.js), [sqlite-wasm #104](https://github.com/sqlite/sqlite-wasm/issues/104))

### 5.3 Neon Postgres / Supabase / Vercel Postgres

- Postgres serverless; constraints y transacciones reales; Drizzle/Prisma lo soportan; sin binarios nativos.
- **Costo de red:** la DB deja de estar en el mismo VPS. Neon free **auto-suspende a los 5 min** de inactividad y el cold wake agrega *"a few hundred milliseconds"*; los planes pagos permiten desactivar el auto-suspend. Para pocas filas/día, pagarías latencia + un servicio externo + secretos, por cero beneficio frente a un archivo local. ([Neon benchmarking latency](https://neon.com/docs/guides/benchmarking-latency))
- **Vercel Postgres es Neon por dentro.** ([Neon blog](https://neon.com/blog/neon-postgres-on-vercel))
- **Cuándo:** es el **escape hatch** si aparecen múltiples réplicas, o si querés durabilidad offsite gestionada. No ahora.

### 5.4 Upstash Redis / Vercel KV — **No como ledger**

Upstash tiene "durable storage" (memoria + block storage, se recarga tras crash) y su FAQ dice "Can I use Upstash as a database? Definitely yes". **Pero** su doc de consistencia declara que **deprecaron el modo Strong Consistency** y hoy ofrecen **Eventual Consistency** (CRDT/anti-entropy, Last-Writer-Wins). Además, un KV no tiene constraints únicos relacionales ni transacciones multi-clave. Para dinero necesitás que *el constraint sea la garantía*, algo que KV no da. **Usalo para rate-limiting** (que el doc hermano ya propone para el endpoint de crear preferencia), no para el ledger. ([Upstash durability](https://upstash.com/docs/redis/features/durability), [Upstash consistency](https://upstash.com/docs/redis/features/consistency), [Upstash compare](https://upstash.com/docs/redis/overall/compare))

### 5.5 JSONL append-only (patrón actual del repo)

Ya está implementado (`app/api/lead/route.ts` → `data/leads.jsonl`). Ventajas: cero deps, cero nativos, auditable. Límites para dinero: sin transacciones, sin constraints (dedupe imposible de garantizar), sin queries, y **riesgo de corrupción con escrituras concurrentes** (aunque `fs.appendFile` es atómico a nivel de línea en la práctica para líneas chicas, no hay locking). Es un excelente **audit trail/event log complementario**, pero **no** el ledger de verdad. Mantenelo en paralelo, no como fuente de verdad.

### 5.6 lowdb / RxDB / PouchDB — **No**

- **lowdb:** JSON en memoria, reescribe el archivo completo en cada save, sin índices ni constraints; crece mal y no sirve para concurrencia. ([RxDB: "LowDB falls short"](https://rxdb.info/articles/alternatives/lowdb-alternative.html))
- **RxDB:** base NoSQL reactiva local-first; en server se apoya en un storage (SQLite), reactive queries, replicación. Correcto para apps offline-first; sobredimensionado y de forma equivocada para un ledger. ([RxDB alternatives](https://github.com/pubkey/rxdb/blob/master/docs-src/docs/alternatives.md))
- **PouchDB:** API CouchDB con árbol de revisiones; bloat de almacenamiento y performance pobre; browser-first. ([RxDB PouchDB alternative](https://rxdb.info/articles/alternatives/pouchdb-alternative.html))
- **Ninguno de los tres impone constraints de dinero de forma natural.** Descartados.

---

## 6. Consenso de la comunidad (2025–2026)

1. **Self-host Next.js + Docker + SQLite es un patrón mainstream.** El hilo más citado de r/nextjs (ene-2026), *"You don't need Vercel. Hosting Next.js 15 with Docker and SQLite"*, describe exactamente este stack: *"I swapped managed Postgres (Supabase/Neon) for SQLite. Persistence: I use Docker volumes for the DB file and Litestream for streaming backups to S3. This solves the 'ephemeral file system' problem."* ([Reddit r/nextjs](https://www.reddit.com/r/nextjs/comments/1qdcxf8/you_dont_need_vercel_hosting_nextjs_15_with))
2. **La regla SQLite vs Postgres es "un escritor vs varios", no "tamaño".** *"Pick SQLite when exactly one process writes the database. Pick PostgreSQL the moment a second one might."* Y documentan que SQLite serializa writes (con `busy_timeout` se encolan en vez de fallar). Un contenedor Next standalone = un proceso escritor. ([heatware, Postgres vs SQLite 2026](https://www.heatware.net/postgresql/postgres-vs-sqlite))
3. **better-sqlite3 es el driver local por defecto.** Está en la lista de `serverComponentsExternalPackages` de Next, en los ejemplos de Drizzle/Prisma/Knex, y es el que la gente usa en Docker a pesar del paso de build nativo (el fix estándar reportado: *"install better-sqlite3 inside Dockerfile as it is a native node.js module & remove it from package.json"*). ([StackOverflow](https://stackoverflow.com/questions/50997956/error-could-not-locate-the-bindings-file-better-sqlite3-node))
4. **Los que self-hostean suelen preferir Postgres *en el mismo servidor* si les importa cero latencia**, pero para pocas filas/día SQLite gana por simplicidad. Otra alternativa citada: SQLite + Litestream en lugar de un Postgres gestionado. ([Reddit r/nextjs, comentarios del mismo hilo](https://www.reddit.com/r/nextjs/comments/1qdcxf8/you_dont_need_vercel_hosting_nextjs_15_with))
5. **Guía oficial de Next para native/runtime assets.** Next 14/15/16 documentan `outputFileTracingIncludes` con ejemplos de binarios nativos — confirma que el `.node` no viaja "por magia". ([Next output docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/output))
6. **Para dinero/idempotencia, la comunidad converge en el constraint de DB.** Varias fuentes autoradas (no solo tutoriales) repiten la misma arquitectura:
   - *"The database unique constraint is the real guarantee… Treat Redis as an optimization, not the source of truth."* ([Ajit Singh, Payment System Design: Ledger, Idempotency, Settlement, 2026](https://singhajit.com/payment-system-design))
   - Regla IDE-1/IDE-4 de un rulebook fintech: *"Payment webhook handlers must dedupe by processed-event-id before running side effects"* y el `UNIQUE` es el backstop. ([fintech-roast](https://github.com/DylanMerigaud/fintech-roast/blob/main/rules/idempotency-and-concurrency.md))
   - AWS Builder Center: *"Let the Database Enforce the Rule… event_id UNIQUE… Even if multiple workers race to insert the same event ID, only one can win."* ([AWS Builder](https://builder.aws.com/content/3Ha5j6sGC9QBSCLWFtTSz8bQLS7/idempotency-the-bug-you-dont-notice-until-production))
   - Asaas (proveedor de pagos LATAM) recomienda exactamente lo mismo: unique index por event id. ([Asaas docs](https://docs.asaas.com/docs/how-to-implement-idempotence-in-webhooks))
   Esto valida directamente el esquema de §1 y el doc hermano.

---

## 7. Idempotencia para dinero (patrón a implementar)

Base citable y práctica (las cuatro reglas aparecen en todas las fuentes del §6):

1. **Escribí la clave antes del trabajo**, no después. Si cobrás y guardás la clave después, un crash entre medio pierde el registro y el retry vuelve a cobrar.
2. **El `UNIQUE` de la DB es la garantía.** El chequeo en app (`if already_processed`) puede correr en paralelo y perder la carrera; el constraint decide.
3. **Dedupe de webhooks por `event_id` del proveedor** en una tabla propia con PK/`UNIQUE`, en su **propia transacción**. Si perdés la carrera, el insert viola el constraint → tratás como duplicado y **devolvés 200** (nunca 4xx/5xx, porque el proveedor reintenta por cualquier no-2xx e infla el loop).
4. **Aplicá el efecto al estado como upsert/valor absoluto** (`status = 'approved'`), no como incremento; así replayar converge al mismo estado.

Patrón SQLite:
```sql
BEGIN IMMEDIATE;
  INSERT INTO webhook_events(provider, event_id, received_at) VALUES (?, ?, ?);
  -- si esto viola PK → ROLLBACK y return 200 (duplicado)
  INSERT INTO donations(id, provider, provider_payment_id, amount_cents, currency,
                        status, external_reference, created_at, updated_at, approved_at)
  VALUES (?, 'mercadopago', ?, ?, 'ARS', 'approved', ?, ?, ?, ?)
  ON CONFLICT(provider, provider_payment_id) DO UPDATE SET
    status = excluded.status,
    updated_at = excluded.updated_at,
    approved_at = COALESCE(donations.approved_at, excluded.approved_at);
COMMIT;
```
Notas: en `better-sqlite3` la violación llega como `SqliteError` con `code === 'SQLITE_CONSTRAINT_PRIMARYKEY'` (o `…UNIQUE`); en `node:sqlite` capturás la excepción del `run`. En ambos: `ROLLBACK` y `200`.

---

## 8. Dokploy: volumen persistente + gotcha de `chown` a uid 1001

Hoy el contenedor crea `/app/data` y lo chowna a `nextjs:nodejs` (Dockerfile línea 38), pero **sin volumen `/app/data` es efímero**: se pierde en cada redeploy. Hay que montar almacenamiento persistente.

**Tipos de mount que ofrece Dokploy** (Applications → Advanced → Volumes/Mounts):
- **Bind Mount:** `Host Path` (host) → `Mount Path` (contenedor).
- **Volume Mount:** `Volume Name` (volumen gestionado por Docker) → `Mount Path`.
- **File Mount:** un archivo único con contenido inline (Dokploy lo guarda en `files/`). ([Dokploy Advanced docs](https://docs.dokploy.com/docs/core/applications/advanced))

**El gotcha (documentado en el propio repo de Dokploy):** los volúmenes Docker **se crean propiedad de `root:root` (0:0, 755)**, así que un contenedor no-root (acá uid/gid **1001**) **no puede escribir** hasta cambiar dueño. Dokploy **todavía no expone campos de UID/GID/permisos** en el creador de mounts; el issue sigue **abierto** y hay un PR abierto (sin mergear a dic-2025). El workaround documentado por el propio autor es por SSH:

```bash
# Volumen NOMBRADO (Docker-managed):
ssh root@vps
chown -R 1001:1001 /var/lib/docker/volumes/<nombre-del-volumen>/_data

# Bind mount (carpeta del host):
mkdir -p /opt/dokploy-data/webmb/donations
chown -R 1001:1001 /opt/dokploy-data/webmb/donations
```
Fuente: [Dokploy issue #497 "Add customizable unix permissions…"](https://github.com/Dokploy/dokploy/issues/497) (abierto, actualizado 2025-12-01; caso textual: *"You can't really deploy an app with a persistent SQLite database as it doesn't allow any write access to the Volume Mount because the mounted directory is owned by root"*).

**Receta recomendada (en orden de preferencia):**

1. **Usá un Volume Mount nombrado en `/app/data`.** Al montar un volumen **vacío** sobre un directorio que ya existe en la imagen, Docker **copia el contenido y los permisos de la imagen** al volumen (copy-up). Como tu Dockerfile ya hace `chown nextjs:nodejs /app/data`, el volumen nuevo puede heredar uid 1001. **Verificalo** escribiendo un archivo de prueba al arrancar y logueando `errno`/`EACCES`.
2. **Si usás Bind Mount,** creá la carpeta en el host y `chown -R 1001:1001` **antes** de montar. Ojo: en Swarm preferí volume bind/NFS antes que "mount bind" (el path absoluto debe existir; montajes inválidos hacen que Swarm no arranque el servicio silenciosamente). ([Dokploy troubleshooting](https://docs.dokploy.com/docs/core/troubleshooting/volumes-mounts), [Dokploy #2052](https://github.com/Dokploy/dokploy/issues/2052))
3. **Si el write falla con EACCES,** `chown` al `_data` del volumen como arriba y redeploy.
4. **No** dependas de "Run Command" de Dokploy para hacer `chown`: corre dentro del contenedor y, con `USER nextjs`, no tiene permiso.
5. **Un solo replica.** En Dokploy (Cluster settings → Replicas) dejá **1**. SQLite con dos réplicas peleando por el mismo archivo en WAL/NFS = locks y corrupción. Esto es crítico si algún día escalan. ([Grafana forum: "sqlite on docker with NFS backed volumes… leads to a lot of locks"](https://community.grafana.com/t/advantage-s-of-switching-from-sqlite-to-postgres-mysql-backend/16518))

**Nota de versión de layout del volumen:** el path `_data` es de host (Docker moderno, `/var/lib/docker/volumes/<name>/_data`). En Docker Desktop/otros drivers puede variar; en un VPS Linux estándar es ese.

---

## 9. Backups (simple, por opción)

**SQLite (el pick) — backup consistente en caliente:**
```bash
# Snapshot de un solo archivo, consistente aunque haya WAL. SQLite ≥ 3.27.
sqlite3 /app/data/donations.db "VACUUM INTO '/backups/donations-$(date +%F).db'"
# Alternativa nativa SQLite:
sqlite3 /app/data/donations.db ".backup '/backups/donations-$(date +%F).db'"
```
- **No** copies a mano `donations.db` con WAL activo sin incluir `-wal`/`-shm` o sin un checkpoint: podés obtener una copia inconsistente. `VACUUM INTO`/`.backup` lo resuelven.
- **Litestream** (recomendado si querés offsite barato): replica incremental continua a S3-compatible. En Docker, la guía oficial pide **mismo SO host/contenedor** (no macOS→Linux), **volumen nombrado local** (no bind NFS) y `busy_timeout`. Corre en **el mismo contenedor** o en sidecar con acceso al mismo volumen. ([Litestream Docker guide](https://litestream.io/guides/docker), [Litestream S3 guide](https://litestream.io/guides/s3), [GitHub](https://github.com/benbjohnson/litestream))
- **Dokploy Volume Backups:** Dokploy tiene una feature de backups de volúmenes (S3 destinations) que puede snapshotear el volumen; combinable con lo anterior. ([Dokploy Volume Backups](https://docs.dokploy.com/docs/core/volume-backups))
- **Prueba de restore** periódica: restaurá a un path temporal y corré `PRAGMA integrity_check; SELECT COUNT(*) FROM donations;`. Un backup no probado no es un backup.

**Postgres (si algún día migran):**
```bash
pg_dump "$DATABASE_URL" -Fc -f /backups/donations-$(date +%F).dump   # restore: pg_restore
```

**JSONL (audit trail):** copiar `donations.jsonl` (idealmente después de `fsync`, o con rotación diaria).

---

## 10. Camino de migración sin reescribir la capa de datos

**Frontera de abstracción recomendada:** un módulo `lib/donations/ledger.ts` que exporta una interfaz, y **toda** la SQL vive detrás de ella. Los route handlers (`app/api/webhooks/mercadopago/route.ts`, `…/confirm/route.ts`) dependen de la interfaz, nunca de `better-sqlite3` directamente.

```ts
// lib/donations/ledger.ts  (contrato estable)
export interface LedgerStore {
  recordWebhookEvent(provider: string, eventId: string, payloadHash?: string): boolean; // false = duplicado
  upsertDonation(d: DonationUpsert): void;
  getByExternalReference(ref: string): Donation | undefined;
  markStatus(provider: string, providerPaymentId: string, status: DonationStatus): void;
  list(limit?: number): Donation[];
}

// lib/donations/ledger.sqlite.ts  (implementación actual: better-sqlite3 o node:sqlite)
export function createSqliteLedger(dbPath: string): LedgerStore { /* … */ }
// lib/donations/ledger.pg.ts      (futuro: Neon/Supabase, misma interfaz)
// lib/donations/ledger.jsonl.ts   (audit trail complementario, no fuente de verdad)
```

**Por qué esto permite migrar sin reescribir:**
- El schema es SQL estándar salvo detalles menores; `STRICT`, `ON CONFLICT`, `UNIQUE` parcial existen en SQLite y Postgres (`ON CONFLICT` sí, índice único parcial sí; `STRICT` no — usá tipos explícitos en PG).
- Cambiar de `better-sqlite3` a `node:sqlite` es cambiar una implementación (~50 líneas) sin tocar rutas ni tests.
- **Escalera de escalado:** `better-sqlite3` → `node:sqlite` (quita nativos) → `libSQL/Turso` (réplica offsite) → `Neon Postgres` (multi-réplica). Cada salto reimplementa la misma interfaz.
- **Drizzle ORM (opcional)** soporta los cuatro backends (better-sqlite3, libsql, node:sqlite, Postgres) y es el atajo si el esquema crece. Para pocas filas, un repo delgado con SQL a mano es más simple y evita interacciones del ORM con el tracing de Next. Recomendación: empezar delgado, migrar a Drizzle solo si el esquema se vuelve grande. ([Drizzle SQLite](https://orm.drizzle.team/docs/get-started-sqlite))
- **Mantené el JSONL en paralelo** como event log crudo (cada webhook y cada cambio), separado del ledger. Si un día el ledger se corrompe, tenés el historial crudo para reconstruir.

---

## 11. Incertidumbre / preguntas abiertas

1. **Prebuilds musl de better-sqlite3:** reportes 2026 dicen que v12 publica musl/glibc (x64/arm64), pero no está en el README como contrato. Mantené `apk add python3 make g++` en la etapa `deps` como red de seguridad (no afecta la imagen final). **Verificá en tu build.**
2. **¿El `.node` viaja solo?** No confiar. Hacé include **y** copy, y verificá con `docker run … node -e "require('better-sqlite3')"`. Hay reportes de copia hasheada con ABI equivocada.
3. **Node 20 EOL (2026-04-30).** Conviene subir a Node 22 (LTS) o 24 (LTS). Hacerlo además habilita `node:sqlite`, que elimina el punto 1 y 2 por completo.
4. **`node:sqlite` es RC, no GA.** API estable en la práctica y del propio equipo de Node, pero si el equipo exige "GA o nada", el pick es better-sqlite3.
5. **Dokploy no expone UID/GID en mounts (issue abierto).** El chown es por SSH o vía herencia del named volume. Probar en un entorno real, no asumir.
6. **El chart de `node:20-alpine` + Next 14.2 + better-sqlite3 no fue verificado end-to-end en este VPS.** La doc deja claro que ningún test corrió la imagen; el pipeline debería agregar la verificación de §1.
7. **Multi-réplica rompe SQLite.** Confirmar replicas=1 en Dokploy; si no, saltar directo a Neon.
8. **WAL y backups:** cualquier backup casero debe manejar `-wal`/`-shm`; usar `VACUUM INTO`/`.backup`/Litestream.

---

## 12. Fuentes (accedidas 2026-09-12)

**Next.js**
- `output` / output file tracing + `outputFileTracingIncludes` (native/runtime assets): https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- `serverComponentsExternalPackages` (Next 14.2; lista default incluye better-sqlite3, @libsql/client, libsql): https://nextjs.org/docs/14/app/api-reference/next-config-js/serverComponentsExternalPackages
- `serverExternalPackages` (Next 15, renombrado): https://nextjs.org/docs/15/app/api-reference/config/next-config-js/serverExternalPackages
- Docker/standalone docs: https://docs.docker.com/guides/nextjs
- Next self-hosting: https://nextjs.org/docs/15/app/guides/self-hosting

**better-sqlite3**
- npm: https://www.npmjs.com/package/better-sqlite3
- Releases (v13.0.0 = primer N-API; prebuilds en el tarball): https://github.com/WiseLibs/better-sqlite3/releases
- Issue #387 (sin prebuilds musl/alpine histórico): https://github.com/WiseLibs/better-sqlite3/issues/387
- ABI mismatch Node 21/22/24: https://github.com/WiseLibs/better-sqlite3/issues/1437 , https://github.com/WiseLibs/better-sqlite3/issues/1384
- Evidencia de copia hasheada/ABI en Next standalone: https://github.com/diegosouzapw/OmniRoute/issues/1497 , https://github.com/diegosouzapw/OmniRoute/issues/8915
- `^12` recomendado para Node 20 (EOL): https://github.com/JuliusBrussee/cavemem/issues/66

**Node.js `node:sqlite`**
- https://nodejs.org/docs/latest-v22.x/api/sqlite.html (añadido v22.5.0; flag fuera v22.13.0)
- https://nodejs.org/api/sqlite.html (no experimental v24.2.0; RC v24.15.0)
- Node release schedule (Node 20 EOL 2026-04-30): https://nodejs.org/en/about/previous-releases

**SQLite / libSQL / Turso**
- libSQL repo (fork, embedded replicas): https://github.com/tursodatabase/libsql
- Turso embedded replicas: https://docs.turso.tech/features/embedded-replicas/introduction
- Turso TS reference (local vs remote, libsql vs Turso Database): https://docs.turso.tech/sdk/ts/reference
- `@libsql/client` npm: https://www.npmjs.com/package/@libsql/client
- SQLite vs Postgres (un escritor vs varios, busy_timeout): https://www.heatware.net/postgresql/postgres-vs-sqlite

**PGlite / sql.js / lowdb / RxDB / PouchDB**
- PGlite docs (persistencia NodeFS, single connection): https://pglite.dev/docs , https://github.com/electric-sql/pglite (badge Alpha)
- PGlite filesystems: https://pglite.dev/docs/filesystems
- sql.js (sin persistencia): https://github.com/sql-js/sql.js
- sqlite-wasm Node persistence issue: https://github.com/sqlite/sqlite-wasm/issues/104
- lowdb alternatives (reescribe JSON completo, sin constraints): https://rxdb.info/articles/alternatives/lowdb-alternative.html
- RxDB alternatives (PouchDB overhead): https://github.com/pubkey/rxdb/blob/master/docs-src/docs/alternatives.md

**Postgres serverless / KV**
- Neon cold vs hot / auto-suspend 5 min: https://neon.com/docs/guides/benchmarking-latency
- Vercel Postgres = Neon: https://neon.com/blog/neon-postgres-on-vercel
- Upstash durability: https://upstash.com/docs/redis/features/durability
- Upstash consistency (Strong deprecado → Eventual): https://upstash.com/docs/redis/features/consistency

**Dokploy**
- Advanced / Volumes & Mounts (bind/volume/file): https://docs.dokploy.com/docs/core/applications/advanced
- Troubleshooting Volumes & Mounts: https://docs.dokploy.com/docs/core/troubleshooting/volumes-mounts
- Issue #497 ownership/chown uid no-root (abierto): https://github.com/Dokploy/dokploy/issues/497
- Issue #2052 (swarm mount bind path absoluto): https://github.com/Dokploy/dokploy/issues/2052
- Volume Backups: https://docs.dokploy.com/docs/core/volume-backups

**Backups / Litestream**
- Litestream Docker guide (mismo SO, volumen local, busy_timeout): https://litestream.io/guides/docker
- Litestream S3: https://litestream.io/guides/s3
- Litestream repo: https://github.com/benbjohnson/litestream

**Idempotencia para dinero**
- Payment System Design: Ledger, Idempotency, Settlement (2026): https://singhajit.com/payment-system-design
- fintech-roast rulebook (IDE-1/IDE-4): https://github.com/DylanMerigaud/fintech-roast/blob/main/rules/idempotency-and-concurrency.md
- AWS Builder Center: https://builder.aws.com/content/3Ha5j6sGC9QBSCLWFtTSz8bQLS7/idempotency-the-bug-you-dont-notice-until-production
- Asaas webhook idempotency: https://docs.asaas.com/docs/how-to-implement-idempotence-in-webhooks

**Consenso self-hosted**
- Reddit r/nextjs, "You don't need Vercel. Hosting Next.js 15 with Docker and SQLite" (ene-2026): https://www.reddit.com/r/nextjs/comments/1qdcxf8/you_dont_need_vercel_hosting_nextjs_15_with
- Grafana forum (SQLite sobre NFS = locks): https://community.grafana.com/t/advantage-s-of-switching-from-sqlite-to-postgres-mysql-backend/16518
- StackOverflow (path sqlite en Docker + volumen): https://stackoverflow.com/questions/79952789/deciding-between-sqlite-and-postgresql-for-small-project

**Contexto local (leído, no modificado)**
- `Dockerfile`, `next.config.mjs`, `app/api/lead/route.ts`, `package.json`
- `docs/research/2026-09-11-pagos-stripe-mercadopago.md`
