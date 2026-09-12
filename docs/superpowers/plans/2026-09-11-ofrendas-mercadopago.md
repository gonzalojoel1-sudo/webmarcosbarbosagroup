# Ofrendas online (Mercado Pago + Transferencia) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Ofrendas reales en `/cuerpo-de-cristo/ofrenda` con monto libre, Mercado Pago Checkout Pro y transferencia, con ledger idempotente y webhook firmado.

**Architecture:** Route handlers + `lib/donations/*` (amounts, ledger `node:sqlite`, signature, mp). UI client component. Node 22 base. Volumen persistente.

**Tech Stack:** Next 14 App Router · TypeScript · `mercadopago@3.6.1` · `node:sqlite` · zod · Playwright (E2E)

**Spec:** `docs/superpowers/specs/2026-09-11-ofrendas-mercadopago-design.md`

## Global Constraints
- Moneda ARS. Canon = centavos enteros. Monto server-side. Nunca confiar en el redirect.
- `node:sqlite`, Node 22. Solo server-side MP. Sin Stripe. `.env*` ignorado en git y docker.
- `runtime = "nodejs"`. Sin PII/tokens en logs. `robots: noindex` en `/gracias`.

---

### Task 1: Base Node 22, deps, ignore de secretos
- Modify: `Dockerfile` (node:20-alpine → node:22-alpine en las 3 etapas).
- Modify: `.gitignore` (`.env`, `.env.*`, `!.env.example`, `data/*.jsonl`).
- Modify: `.dockerignore` (`.env*`, `!.env.example`, `data/*.jsonl`).
- Modify: `package.json` (`mercadopago`: `3.6.1`, script `check:donations`).
- Create: `.env.example` con nombres de variables (sin valores).
- Verify: `git check-ignore .env` devuelve `.env`; `npm run build` OK.
- Commit.

### Task 2: `lib/donations/amounts.ts`
- Create. `PRESET_AR_S=[1000,5000,10000,20000,50000]`, `MIN_AR_S=100`, `SANITY_MAX_AR_S=50000000`.
- `resolveAmount(input)` → `{ cents }`; zod `{ presetId? , customArs? }`; entero, ≤2 decimales.
- Verify: incluido en `scripts/check-donations.ts` (Task 11).
- Commit.

### Task 3: `lib/donations/ledger.ts` (`node:sqlite`)
- Create: interfaz `LedgerStore` + `createSqliteLedger(dbPath)`.
- Schema SQL de la spec; WAL, busy_timeout.
- Métodos: `recordWebhookEvent` (bool, false=dup), `upsertIntent`, `applyPayment` (fold monótono + verificación de monto/currency en el caller), `getByExternalReference`, `markStatus`, `list`.
- Capturar violación UNIQUE → no-op.
- Commit.

### Task 4: `lib/donations/signature.ts`
- Create: `verifyMpSignature({xSignature,xRequestId,dataId})` usando `WebhookSignatureValidator.validate({..., secret, toleranceSeconds:300})`; `dataId` viene del query.
- Commit.

### Task 5: `lib/donations/mp.ts`
- Create: `createPreference({donationId,cents,email,siteUrl})` → `{initPoint,preferenceId}` con `MercadoPagoConfig` por request; items ARS `unit_price=cents/100`; `external_reference`; `back_urls`; `notification_url`; `auto_return:"approved"`; `requestOptions.idempotencyKey`.
- `getPayment(id)`, `searchApprovedByRef(ref)`.
- `isConfigured()`.
- Commit.

### Task 6: `POST /api/donations/mercadopago/route.ts`
- Valida (zod) → `resolveAmount` → `upsertIntent(pending)` → `createPreference` → `{init_point}`.
- 400 inválido; 503 sin token; 429 rate-limit básico.
- Commit.

### Task 7: `POST /api/donations/mercadopago/confirm/route.ts`
- Body `{ externalReference }` → intent → `searchApprovedByRef`/`getPayment` → assert ARS+monto → `applyPayment` → `{status}`.
- Commit.

### Task 8: `POST /api/webhooks/mercadopago/route.ts`
- `force-dynamic`, `nodejs`. `data.id` del query; verificar firma (401 mal); topic != payment → 200.
- `recordWebhookEvent` (dup → 200) → fetch pago → assert contra intent → fold → 200; `Cache-Control: no-store`.
- Commit.

### Task 9: `/cuerpo-de-cristo/ofrenda/gracias/page.tsx`
- Client: lee `external_reference`; llama confirm; estados verificando/approved/pending/rejected/desconocido; `robots: noindex` (metadata en un layout o export en page server). CTA WhatsApp.
- Commit.

### Task 10: `components/donations/offering-form.tsx` + actualizar ofrenda
- Client: `radiogroup` de monto (chips 1000/5000/10000/20000/50000 + "otro monto" input numérico min 100) + método (Mercado Pago / Transferencia).
- MP → POST → `window.location.assign(init_point)`; Transferencia → muestra alias/CVU/holder + WhatsApp.
- A11y (`role=radiogroup`, `aria-checked`, errores `aria-describedby`), botón disabled mientras carga, `attemptId` estable por intento.
- Actualizar `app/cuerpo-de-cristo/ofrenda/page.tsx`: insertar el formulario y quitar el `[VALIDAR]` de "por contacto directo".
- Commit.

### Task 11: `scripts/check-donations.ts` + E2E
- Script node: cantidad/presets/min/max/redondeo; firma válida/ inválida (HMAC con secreto fijo); ledger (intent, dedupe evento, fold, mismatch no aprueba).
- E2E Playwright: form (chips, custom, método, alias), API 400/503, webhook 401/200.
- Commit.

### Task 12: Cierre
- `npm run lint && npm run build && npm run check:routes && node scripts/check-donations.ts`.
- Documentar en README/spec las env vars y el volumen Dokploy.

## Self-review
- Rutas y env cubiertos por la spec. Sin Stripe. Idempotencia de dos claves. `node:sqlite` con constraints. `back_urls` desde `NEXT_PUBLIC_SITE_URL`. `[VALIDAR]` para alias/CVU reales.
