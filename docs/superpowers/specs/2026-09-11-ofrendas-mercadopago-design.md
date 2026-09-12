# Ofrendas online — Mercado Pago + Transferencia (Design)

**Fecha:** 2026-09-11
**Ruta:** `/cuerpo-de-cristo/ofrenda`
**Stack:** Next.js 14.2.35 App Router · TypeScript · route handlers only · Docker `standalone` · Dokploy · moneda ARS

---

## 1. Objetivo y decisiones

Reemplazar el CTA "[VALIDAR] ofrendas por contacto directo" por un flujo real de ofrendas: el donante elige un **monto libre** (con chips sugeridos) y un **método**, y paga.

Decisiones tomadas con el usuario:
- **Métodos:** Mercado Pago (Checkout Pro) activo + **Transferencia/alias** (sin comisión, confirmación manual). **Sin Stripe** (Stripe no opera para entidades argentinas; ver investigación).
- **Monto:** libre + chips sugeridos `[1000, 5000, 10000, 20000, 50000]` ARS; piso técnico interno; sin máximo práctico (con tope de sanidad).
- **Persistencia:** SQLite vía **`node:sqlite`** (built-in), base Docker **`node:22-alpine`**, archivo en volumen persistente.
- **Stripe:** descartado por completo (no UI, no código).

Fundamento y verificación previa: `docs/research/2026-09-11-pagos-stripe-mercadopago.md`, `docs/research/2026-09-11-persistencia-ledger.md`, y la auditoría adversarial que corrigió 5 defectos del diseño inicial (abajo, §7).

---

## 2. Arquitectura

**Superficie de rutas**

| Ruta | Método | Propósito |
|---|---|---|
| `app/api/donations/mercadopago/route.ts` | POST | Valida monto/email → persiste intención `pending` → crea preference → `{ init_point }` |
| `app/api/donations/mercadopago/confirm/route.ts` | POST | Verifica server-side por `external_reference` (nunca confía en el redirect) |
| `app/api/webhooks/mercadopago/route.ts` | POST | Firma HMAC validada → trae pago → compara con la intención → fold de estado |
| `app/cuerpo-de-cristo/ofrenda/gracias/page.tsx` | GET | Página de retorno: verificando / approved / pending / rejected / desconocido. `robots: noindex` |
| `app/cuerpo-de-cristo/ofrenda/page.tsx` | GET | Página con el formulario (monto + método) |

**Lógica compartida (`lib/donations/`)**
- `amounts.ts` — fuente única: presets, piso, tope de sanidad, resolución a **centavos enteros**.
- `mp.ts` — cliente `mercadopago@3.6.1` (por request), build de preference.
- `signature.ts` — wrapper sobre `WebhookSignatureValidator` de `mercadopago` (`toleranceSeconds: 300`).
- `ledger.ts` — interfaz `LedgerStore` + implementación `node:sqlite`.

**Frontera de abstracción:** los route handlers dependen de `LedgerStore`, nunca de `node:sqlite` directo → migrar a Postgres después no toca las rutas.

---

## 3. Modelo de datos (`node:sqlite`, WAL)

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS donations (
  id                   TEXT PRIMARY KEY,          -- donation_id = external_reference = idempotency key
  provider             TEXT NOT NULL,             -- 'mercadopago'
  provider_payment_id  TEXT,
  amount_cents         INTEGER NOT NULL,          -- centavos ARS enteros
  currency             TEXT NOT NULL DEFAULT 'ARS',
  status               TEXT NOT NULL,             -- pending|approved|in_process|rejected|cancelled|refunded|charged_back
  status_detail        TEXT,
  external_reference   TEXT NOT NULL,
  donor_email          TEXT,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL,
  approved_at          TEXT,
  raw_json             TEXT
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_donations_provider_payment
  ON donations(provider, provider_payment_id) WHERE provider_payment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_donations_external_ref
  ON donations(external_reference);

CREATE TABLE IF NOT EXISTS webhook_events (
  provider     TEXT NOT NULL,
  event_id     TEXT NOT NULL,
  received_at  TEXT NOT NULL,
  PRIMARY KEY (provider, event_id)
) STRICT;
```

**Reglas de idempotencia (correcciones de la auditoría):**
- **Dos claves distintas:** dedupe de eventos por `(provider, event_id)`; entidad por `(provider, provider_payment_id)`.
- **Fold monótono:** `pending → approved/in_process → refunded/charged_back`; nunca retroceder (ignorar transiciones regresivas o fuera de orden).
- La violación de `UNIQUE` se captura y se trata como **no-op → 200**.

---

## 4. Reglas de monto (`amounts.ts`)

- Canon único: **centavos ARS enteros**.
- `PRESET_AR_S = [1000, 5000, 10000, 20000, 50000]`.
- El cliente envía `{ presetId }` **o** `{ customArs }`; el servidor recalcula (nunca confía en un precio).
- `MIN_AR_S = 100` (piso técnico); `SANITY_MAX_AR_S = 50_000_000` (tope anti-abuso, no un "máximo" de negocio).
- Rechazar no-enteros o `>2` decimales. `mpUnitPrice = cents / 100`.

---

## 5. Seguridad y ops

- **Nunca se toca la tarjeta:** Checkout Pro es redirect hospedado → **PCI SAQ A**.
- Firma MP verificada **antes** de cualquier efecto; `data.id` **desde el query string**; `toleranceSeconds: 300`.
- Monto decidido server-side; intención `pending` persistida **antes** de devolver `init_point`; al verificar, `Math.round(payment.transaction_amount*100) === amount_cents` y `currency_id === "ARS"`.
- Sin tokens/PII en logs; `donor_email` opcional (Ley 25.326) → se guarda solo si el donante lo deja; enlace a `/privacidad`.
- `.gitignore` **y** `.dockerignore`: ignorar `.env`, `.env.*` (salvo `.env.example`) y `data/*.jsonl` — **antes** de cargar claves.
- Rate-limit básico por IP en el endpoint de creación (defensa en profundidad; documentar single-replica).
- **Dokploy:** volumen persistente en `/app/data`, `chown` a uid 1001, **replicas=1**.
- Errores: `503` si falta `MP_ACCESS_TOKEN`; estados honestos en `/gracias` (nunca "éxito" por el redirect).

**Variables de entorno** (Dokploy): `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_ENV` (`production|sandbox`), `NEXT_PUBLIC_SITE_URL`, `DONATIONS_DATA_DIR` (default `/app/data`), `NEXT_PUBLIC_TRANSFER_ALIAS`, `NEXT_PUBLIC_TRANSFER_CVU`, `NEXT_PUBLIC_TRANSFER_HOLDER`.

---

## 6. Alcance

**Incluye:** formulario (monto libre + chips + método), MP Checkout Pro, transferencia (muestra alias/CVU + WhatsApp), ledger idempotente, webhook con firma, página de gracias, verificación automática (script) + E2E.

**Fuera de alcance:** emails de agradecimiento, factura AFIP/ARCA, panel admin, reembolsos por UI (se registran si el proveedor los informa), Stripe.

---

## 7. Correcciones obligatorias (de la auditoría adversarial)

1. Persistir la **intención pendiente** antes de crear la preference.
2. **Dos** claves de idempotencia (evento vs entidad) + fold monótono.
3. **Unicidad real** (SQLite con constraints) + volumen montado.
4. `.gitignore` **y** `.dockerignore` para `.env*`.
5. Usar el **`WebhookSignatureValidator` oficial** (sin lowercase hand-rolled) con `toleranceSeconds`.
6. Unidades: centavos enteros, una sola conversión.
7. `back_urls`/`notification_url` desde `NEXT_PUBLIC_SITE_URL` (nunca del `Host`).
8. `503` sin token; estados de error explícitos; `robots: noindex` en `/gracias`.
9. `mercadopago` solo server-side, pin `3.6.1`; sin `MP_PUBLIC_KEY` (no se usa en redirect).
10. Rate-limit defensivo + volumen persistente y una sola réplica documentados.
