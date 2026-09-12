# Ofrendas online — Mercado Pago vs Stripe (Next.js 14 App Router + Docker/Dokploy)

**Date:** 2026-09-11 (research executed 2026-09-12)
**Scope:** one-time donations at `https://marcosbarbosagroup.com/cuerpo-de-cristo/ofrenda`
**Stack:** Next.js 14.2.35 App Router, TypeScript, route handlers only (no separate backend), Docker `standalone` on Dokploy, currency ARS (Argentina, Córdoba).

---

## Executive summary + recommended architecture

**The single most important finding: Stripe cannot open a merchant account in Argentina.** Stripe's official global-availability list (stripe.com/global) includes Brazil and Mexico but **not Argentina** — the page tells unsupported businesses to use Stripe Treasury with stablecoins ("Payments not supported yet") or **Stripe Atlas** (incorporate a US company). A separate 2026-03-25 changelog adds Argentina only as a *payout recipient* country (Global Payouts), which is not the same as accepting payments. Therefore a "Stripe OR Mercado Pago" method choice **cannot be delivered natively for an Argentine entity** without a foreign (US) entity or partner. See §B1 — this is a business/legal decision, not a coding one.

**Recommendation**

1. **Ship Mercado Pago Checkout Pro first** — it is the native, correct option for an Argentine entity collecting ARS. One-time ofrendas do not need a subscription/plan.
2. **Keep the payment-method UI** (the brief asks for it), but render **Stripe as disabled / "próximamente"** behind a feature flag (`NEXT_PUBLIC_ENABLE_STRIPE=false`) until a supported-country entity exists. Do not silently hide it; show an honest note. When/if a US entity is created, enable the Stripe branch pre-built.
3. **Server decides the amount.** Allow-list of preset amounts + optional custom with min/max; the client only sends a preset id or a number that is re-validated server-side. Never send a price from the browser.
4. **Webhook is the source of truth; the return/redirect page is a UX convenience.** On return, re-verify server-side (MP: `Payment.get(id)` or search by `external_reference`; Stripe: retrieve the Checkout Session). Mirror the sibling repo's "never trust the redirect" pattern.
5. **Idempotent ledger.** Every approval written once, keyed by `(provider, provider_payment_id)` with a `UNIQUE` constraint, and every webhook deduped by `(provider, event_id)`. Duplicate provider deliveries are normal.
6. **Persistence:** SQLite (`better-sqlite3`) at a mounted Dokploy volume (`/app/data/donations.db`), with an append-only JSONL audit trail (same pattern as `/api/lead`). Neon Postgres is the escape hatch if Dokploy ever runs multiple replicas. **A volume must be mounted** — today the container's `/app/data` is ephemeral and `data/leads.jsonl` is lost on redeploy.
7. **PCI:** redirect/hosted checkout only → no card data touches our origin → **SAQ A**. State it and design so it stays true (never add raw card fields; MP bricks are hosted iframes).
8. **Secrets:** Dokploy env vars. **Blocking security fix:** `.gitignore` currently ignores `.env*.local` but **not `.env` / `.env.*`** — add those patterns before adding any key.

**Proposed route surface**

| Route | Method | Purpose |
|---|---|---|
| `app/api/donations/mercadopago/route.ts` | POST | Validate amount → create MP preference → return `init_point` |
| `app/api/donations/mercadopago/confirm/route.ts` | POST | Return-page verification by `external_reference` (never trust redirect) |
| `app/api/webhooks/mercadopago/route.ts` | POST | Signature-validated webhook → idempotent ledger write (source of truth) |
| `app/api/donations/stripe/route.ts` | POST | (Flag-gated) create Checkout Session → return `session.url` |
| `app/api/webhooks/stripe/route.ts` | POST | `constructEvent` → idempotent ledger write |
| `app/cuerpo-de-cristo/ofrenda/gracias/page.tsx` | GET | Return page; shows "verificando…" then confirmation |

Shared code: `lib/donations/amounts.ts` (allow-list + resolver), `lib/donations/ledger.ts` (SQLite), `lib/donations/mp.ts`, `lib/donations/stripe.ts`.

---

## A. Mercado Pago (Node / TypeScript)

### A1. Official Node SDK and recommended integration (2026)

- **Package:** `mercadopago` (npm). Current major is **3.x**; latest observed **3.6.1** (`npm view mercadopago version`), published by `mercadopagodeveloperexperience`. The README states **Node.js 18+**. The sibling repo's Python SDK `2.x` (`sdk.preference().create()`) maps to a **different, class-based API** in Node v3 — do not copy the Python call shape.
- **Create a Checkout Pro preference (v3):**

```ts
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

const pref = await new Preference(client).create({
  body: {
    items: [{
      id: "ofrenda",
      title: "Ofrenda — Cuerpo de Cristo",
      description: "Ofrenda voluntaria",
      quantity: 1,
      currency_id: "ARS",
      unit_price: 5000, // decimal ARS, NOT cents
    }],
    payer: { email: donorEmail },       // optional
    external_reference: donationId,     // our server-generated id (uuid)
    back_urls: {
      success: `${SITE}/cuerpo-de-cristo/ofrenda/gracias?status=success`,
      failure: `${SITE}/cuerpo-de-cristo/ofrenda/gracias?status=failure`,
      pending: `${SITE}/cuerpo-de-cristo/ofrenda/gracias?status=pending`,
    },
    auto_return: "approved",
    notification_url: `${SITE}/api/webhooks/mercadopago`,
    statement_descriptor: "CUERPO DE CRISTO",
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 3600_000).toISOString(),
  },
  requestOptions: { idempotencyKey: donationId }, // see A6
});

// pref.id, pref.init_point (prod), pref.sandbox_init_point (test)
```

- **React library:** `@mercadopago/sdk-react` (latest **1.0.7**) provides Wallet Brick / Payment Brick / Status Screen Brick (embedded, hosted iframes). **For a redirect flow you do not need it** — redirect the browser to `init_point`. Use Wallet Brick only if you want an embedded "Pagar con Mercado Pago" button on the page without leaving the site. For a donation page with two methods, the redirect is simpler and keeps PCI scope minimal.
- **Note on the newer "Orders API":** MP is also documenting "Checkout Pro (via Orders API)" with an `Order` client and `/v1/orders`. The **Preferences API remains fully supported** and is the established, lower-risk choice for this use case. Prefer Preferences; revisit Orders only if MP deprecates Preferences.

Sources: npm `mercadopago` (v3.6.1); MP docs "Create and configure a payment preference" (Node tab); MP docs "Add the SDK to the frontend"; `mercadopago/sdk-js` README.

### A2. Preference fields (exact shapes)

| Field | Type / shape | Notes |
|---|---|---|
| `items` | `{ id?, title, description?, category_id?, quantity, currency_id, unit_price }[]` | `unit_price` is a **decimal** (e.g. `2000.00`), max 2 decimals. ARS → `currency_id: "ARS"`. |
| `payer` | `{ name?, surname?, email?, phone?{area_code,number}, identification?{type,number}, address?{zip_code,street_name,street_number} }` | Optional; prefills the checkout. `identification` type for AR is `DNI`. |
| `external_reference` | string | Our donation id. Use it to reconcile and to search payments. |
| `back_urls` | `{ success, failure, pending }` | Must be **public DNS**; `localhost`/`127.0.0.1` are rejected ("Something went wrong"). |
| `auto_return` | `"approved"` | Redirect automatically after approval; only valid when `back_urls.success` exists. Up to 40 s, not configurable. |
| `notification_url` | HTTPS URL | Per-preference webhook; **takes precedence** over the panel-configured URL. |
| `statement_descriptor` | string | Appears on the card statement. |
| `expires` / `expiration_date_from` / `expiration_date_to` | bool / ISO 8601 | `expiration_date_to` format `"2026-09-12T15:00:00.000Z"`. |
| `binary_mode` | bool | If `true`, preference only yields `approved`/`rejected` (no `pending`). Optional. |
| `payment_methods` | `{ excluded_payment_types, excluded_payment_methods, installments, default_installments }` | Optional; to hide e.g. `ticket`/`atm`. |
| `metadata` | object | Arbitrary; echoed back on the payment. Useful for channel/purpose. |

The return URL receives GET params: `payment_id`, `status`, `external_reference`, `merchant_order_id`, `preference_id`, `site_id`, `payment_type` (per MP "Return URLs response"). **Do not trust these** for fulfilment — verify server-side.

### A3. Webhooks / notifications + signature validation

**Flow (current, recommended):** configure `notification_url` (per-preference, as above) or configure the URL in *Your integrations → Webhooks*. MP sends an HTTP POST with a JSON body such as:

```json
{
  "id": 12345,
  "live_mode": true,
  "type": "payment",
  "action": "payment.created",
  "date_created": "2015-03-25T10:04:58.396-04:00",
  "user_id": 44444,
  "api_version": "v1",
  "data": { "id": "999999999" }
}
```

and query params include `data.id` and `type=payment`. **Legacy IPN** uses `?topic=payment&id=...` and is not signature-validated the same way — prefer Webhooks.

**Exact signature algorithm (from MP docs, "Without SDKs"):**

1. Read headers `x-signature` (e.g. `ts=1704908010,v1=618c...`) and `x-request-id`, and `data.id` from the **query string**.
2. Build the manifest: `id:[data.id];request-id:[x-request-id];ts:[ts];`
   - `data.id` must be **lowercased** if alphanumeric (e.g. `ORD01JQ…` → `ord01jq…`).
   - If a value is missing, **remove that segment** from the manifest before hashing.
3. `HMAC-SHA256(secret, manifest)` in **hex**, compared to `v1`.
4. Also check `ts` recency to limit replay.

TypeScript:

```ts
import crypto from "node:crypto";

export function verifyMpSignature(opts: {
  xSignature: string; xRequestId: string; dataId: string; secret: string;
}): boolean {
  const parts = Object.fromEntries(
    opts.xSignature.split(",").map((p) => {
      const [k, ...v] = p.split("=");
      return [k.trim(), v.join("=").trim()];
    })
  ) as { ts?: string; v1?: string };
  if (!parts.ts || !parts.v1) return false;

  const dataId = opts.dataId.toLowerCase();
  const manifest = `id:${dataId};request-id:${opts.xRequestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", opts.secret).update(manifest).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

**Where the secret comes from:** *Your integrations → select application → Webhooks → Configure notification → reveal the generated secret*. It has no expiry but rotation is recommended (a **Reset** button). The official SDKs also expose `WebhookSignatureValidator.validate({ xSignature, xRequestId, dataId, secret })` (Node import from `mercadopago`); use it if your installed v3 exports it, otherwise the code above is the spec.

**After validation:** fetch the resource with the access token: `GET https://api.mercadopago.com/v1/payments/{data.id}`. Never trust amounts/status from the webhook body — fetch and compare.

### A4. Sandbox vs production

- **Credentials live in** *Your integrations → Integration data → Test/Production credentials* (Public Key + Access Token).
- **Token prefixes:** historically `TEST-` = sandbox, `APP_USR-` = production. **Important 2026 nuance:** for newly created applications (Orders API / Automatic Payments), the **test Access Token also starts with `APP_USR`**, same as production; the `live_mode` flag distinguishes them. Do not branch solely on the prefix. Verify with `GET /users/me` or rely on the `live_mode` field (`false` in test).
- **Preference response returns both** `init_point` (production) and `sandbox_init_point` (test). With test credentials use `sandbox_init_point`.
- **Test users:** *Your integrations → Your application → Test accounts*. MP auto-creates a **seller** test account; create a **buyer** test account to run the purchase (up to 15). A 6-digit verification code may be required at login. Test accounts cannot access Test Credentials/Integration Quality sections.
- **End-to-end testing:** `back_urls` must be publicly reachable and not localhost → use a staging subdomain (e.g. `staging.marcosbarbosagroup.com` behind Dokploy/Traefik) or a tunnel. Use the test buyer account and MP test cards; the notification signature works with test credentials.
- **Go to production:** swap test → production Public Key + Access Token and re-issue the panel webhook URL/secrets.

### A5. Server-side verification

- **By id (preferred when you have it, e.g. from the webhook):** `new Payment(client).get({ id })` → inspect `status`.
- **By `external_reference` (the return-page fallback, mirrors the sibling repo):** `new Payment(client).search({ options: { external_reference, sort: "date_created", criteria: "desc" } })`, then find the most recent `status === "approved"`. The sibling repo's `mp_service.fetch_approved_mp_payment()` does exactly this in Python; port it 1:1 to TS.
- **Always re-check:** `status === "approved"` **and** `transaction_amount` matches the server-computed amount (within a cent) **and** `currency_id === "ARS"` **and** `external_reference === donationId` before marking paid.
- **`status` values:** `approved`, `pending`, `in_process`, `authorized`, `rejected`, `cancelled`, `refunded`, `charged_back`, `in_mediation`. Key `status_detail`s: `accredited` (approved), `pending_waiting_payment` / `pending_waiting_transfer` (pending), `cc_rejected_*` (card rejections), `rejected_high_risk`, `insufficient_amount`, `refunded`, `charged_back`.
- The legacy `merchant_order` webhook topic exists (`topic_merchant_order_wh`); **`payment` is the right topic for Checkout Pro**.

### A6. Idempotency

- **Preference creation:** pass `requestOptions.idempotencyKey` (client-level `options.idempotencyKey` is also supported in v3). Use the server-generated `donationId`. Re-issuing with the same key returns the same preference instead of creating a second one. The sibling repo achieves the same with a 1-hour cache of `order.mercadopago_preference_id`.
- **Webhooks:** MP retries and can deliver duplicates. Make the handler idempotent: insert into the ledger with `UNIQUE(provider, provider_payment_id)` (and a separate `webhook_events` table with `UNIQUE(provider, event_id)`). On conflict, return `200` and do nothing. Never create a new donation row per webhook.
- Return `200` quickly; do heavy work (email, CRM mirror) after the ledger write, best-effort.

### A7. ARS specifics

- Use `currency_id: "ARS"`; `unit_price` is a decimal with **max 2 decimals**. `site_id` for Argentina is `MLA` (returned by the API).
- Convert carefully: MP wants **decimal ARS**, Stripe wants **minor units (centavos)**. Keep the canonical value as **integer centavos** in our code and convert at the boundary (`mpUnitPrice = cents / 100`).
- **Minimum/maximum:** MP documents positive amounts and 2-decimal precision; it does **not** publish an explicit universal ARS minimum in the Checkout Pro preference docs (card-network/PSP minimums apply at checkout). **Uncertain — verify with a test-user purchase.** Enforce our own sane min/max anyway (§C1).

---

## B. Stripe (Node / TypeScript)

### B1. Account availability for Argentina — **CRITICAL**

**Stripe does not support Argentina as an account/business country.** The official stripe.com/global page lists supported countries and **Argentina is not among them** (Brazil and Mexico are the LATAM entries). For businesses outside supported countries the page offers only:

- **Stripe Treasury with stablecoins** — "accessible from the USA and 100+ additional countries/regions. **Payments not supported yet.**" (i.e. money management, not card acceptance), and
- **Stripe Atlas** — "Incorporate a US company from anywhere in the world… open a US bank account, accept payments."

Separately, a **2026-03-25 API changelog** added Argentina, Colombia and Egypt as **Global Payouts recipient** countries (`ar_bank_account`) — this is for *sending* payouts to Argentina, **not** for an Argentine business to accept payments. Do not conflate the two.

**Practical options for marcosbarbosagroup.com:**
1. **Mercado Pago** (recommended; native ARS, local methods, Córdoba-friendly).
2. **Stripe Atlas** → US LLC + US bank account → then Stripe Checkout works, settled in USD; adds US tax/compliance overhead and FX. Only worth it if cross-border card acceptance is a hard requirement.
3. **A supported-country partner/entity** receiving on behalf of the ministry (legal/accounting decision).
4. **Stripe Connect** does **not** solve this by itself — the *platform* account must itself be in a supported country.

**Recommendation:** treat Stripe as unavailable for production and gate it behind a flag. Ship MP.

Sources: stripe.com/global; docs.stripe.com/changelog (cross-border payouts, 2026-03-25).

### B2. Recommended one-time flow (when Stripe is enabled)

Use **Checkout Sessions (Stripe-hosted full page)** — lowest complexity, PCI-lightest, supports `submit_type: "donate"`. (Payment Links are no-code but can't take a server-decided dynamic amount easily; Elements is overkill.)

Next.js 14 App Router route handler:

```ts
// app/api/donations/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const { cents, donationId } = await resolveDonation(await req.json()); // server allow-list
  const origin = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      submit_type: "donate",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "ars",
          unit_amount: cents, // minor units = centavos
          product_data: { name: "Ofrenda — Cuerpo de Cristo" },
        },
      }],
      success_url: `${origin}/cuerpo-de-cristo/ofrenda/gracias?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cuerpo-de-cristo/ofrenda`,
      metadata: { donation_id: donationId, purpose: "ofrenda" },
      client_reference_id: donationId,
    },
    { idempotencyKey: donationId }
  );

  return NextResponse.json({ url: session.url });
}
```

On the return page, retrieve `stripe.checkout.sessions.retrieve(session_id)` and confirm `status === "complete"` **and** `payment_status === "paid"` before showing success — the webhook remains the ledger source of truth.

### B3. Webhook verification in a Next.js route handler

```ts
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text(); // RAW body — do NOT call req.json() first
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.payment_status === "paid") await recordDonation(event.id, s); // idempotent
      break;
    }
    case "payment_intent.succeeded": { /* optional secondary confirmation */ break; }
    case "charge.refunded": { await markRefunded(event.data.object as Stripe.Charge); break; }
    case "payment_intent.payment_failed": { await markFailed(event.data.object as Stripe.PaymentIntent); break; }
  }
  return new NextResponse(null, { status: 200 }); // fast 2xx
}
```

- **Events that matter:** `checkout.session.completed` (fulfil/donate), `payment_intent.succeeded` (defensive), `charge.refunded` (reverse), `payment_intent.payment_failed` (logging). Subscribe only to these.
- **Raw body:** App Router route handlers give you the raw body via `await req.text()`. Never parse/mutate before `constructEvent`. Stripe explicitly warns that raw-body manipulation breaks verification.
- **Replay protection:** the library default tolerance is **5 minutes** on the signed timestamp; do not set tolerance `0` (disables recency). Additionally dedupe on `event.id`.

### B4. Currency: does Stripe support ARS?

- Stripe's **Supported currencies** doc lists **ARS in the minimum-charge table at `0.50 ARS`**, alongside `0.50 BRL`, `10 MXN` — evidence ARS is a supported **presentment** currency for Stripe generally. The presentment-currency table itself is rendered dynamically and was not captured verbatim; **treat "ARS presentment supported" as high-confidence but verify in the Dashboard** once an account exists.
- **Account-country still gates everything:** even if ARS presentment is supported, the *merchant* must be in a supported country. A US entity could present ARS and settle in USD; the buyer may incur FX fees, and settlement would not be in ARS unless a supported ARS settlement account exists.
- **Honest uncertainty:** Stripe's docs are clear that presentment ≠ settlement ≠ customer's card currency, and cross-border fees can apply. Do not promise ARS settlement for Stripe without a Dashboard check.

### B5. Test mode, keys, CLI, cards

- Keys: `sk_test_…` / `pk_test_…` (test), `sk_live_…` (live). Keep the secret key server-side only.
- Local webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` prints the `whsec_…` secret; or `STRIPE_WEBHOOK_SECRET=$(stripe listen --print-secret) npm run dev`.
- Test cards: success `4242 4242 4242 4242`; 3DS `4000 0025 0000 3155`; decline `4000 0000 0000 9995`.
- Trigger events: `stripe trigger checkout.session.completed`.

### B6. Idempotency

- Session creation: `{ idempotencyKey: donationId }` as the second arg to `sessions.create` (Stripe saves the first response for ≥24 h and replays it; same key with different params errors). Use a UUID; never use PII in the key.
- Webhooks: store `event.id` with a `UNIQUE` constraint; skip already-processed ids. Stripe explicitly recommends this because Webhook endpoints "might occasionally receive the same event more than once" and two distinct events can describe the same object.

---

## C. Shared security & architecture

### C1. Never trust the client — server-decided amount

```ts
// lib/donations/amounts.ts
import { z } from "zod";

export const PRESET_CENTS = [100_00, 500_00, 1000_00, 2000_00, 5000_00, 10000_00] as const; // ARS 100…10 000
export const MIN_CENTS = 100_00;        // ARS 100
export const MAX_CENTS = 5_000_000_00;  // ARS 5 000 000

const bodySchema = z.object({
  preset: z.number().int().optional(),
  customAmount: z.number().positive().max(50_000_000).optional(),
  method: z.enum(["mercadopago", "stripe"]),
  donorEmail: z.string().email().max(160).optional().or(z.literal("")),
  donorName: z.string().max(120).optional().or(z.literal("")),
});

export function resolveDonation(raw: unknown) {
  const body = bodySchema.parse(raw);
  let cents: number;
  if (typeof body.preset === "number") {
    cents = PRESET_CENTS[body.preset];          // index into allow-list only
    if (cents == null) throw new Error("Invalid preset");
  } else if (typeof body.customAmount === "number") {
    cents = Math.round(body.customAmount * 100); // convert once, server-side
  } else {
    throw new Error("Amount required");
  }
  if (cents < MIN_CENTS || cents > MAX_CENTS) throw new Error("Amount out of range");
  return { cents, method: body.method, donationId: crypto.randomUUID(), ...body };
}
```

Rules: client sends `preset | customAmount`, never a price id or final amount used verbatim; the server recomputes cents and re-checks min/max; the amount stored on the provider is the server value; on verification, compare the provider amount back to the stored value.

### C2. Signature verification, replay protection, idempotent writes

- Verify provider signatures **before** any side effect (MP A3, Stripe B3).
- Replay: MP → check `ts` recency; Stripe → library 5-min tolerance; both → ledger unique keys.
- Idempotent ledger: single `INSERT ... ON CONFLICT DO NOTHING` on `UNIQUE(provider, provider_payment_id)`; separate `webhook_events(provider, event_id)` unique table. Return `2xx` fast; do email/CRM after.

### C3. Persistence options (single Docker container on Dokploy)

| Option | Fit | Pros | Cons |
|---|---|---|---|
| **SQLite (`better-sqlite3`)** — recommend | Best for now | Single file on a volume, synchronous, transactional, zero external service; matches single-container constraint | Native module: needs build deps on alpine and must ship in Next `standalone`; volume required |
| Append-only JSONL (`data/donations.jsonl`) | Fallback / audit trail | Zero dependencies, already the repo pattern (`/api/lead`) | No transactions/constraints; concurrent-write corruption risk; weak for money |
| **Neon Postgres** (`@neondatabase/serverless`) | Escape hatch | Serverless, survives multi-replica, real constraints | Network dependency, cost, extra secret; overkill for low volume |
| **Frappe CRM** | No | Already integrated for leads | CRM ≠ ledger; no payment constraints/idempotency; don't hold money records there |
| Provider dashboard only | No | Zero code | No reconciliation DB, no server-side dedupe |

**Recommendation:** `better-sqlite3` at `/app/data/donations.db` + JSONL audit line per event. Concretely:

- `next.config.mjs` (Next 14.2): `experimental: { serverComponentsExternalPackages: ["better-sqlite3"] }` (renamed `serverExternalPackages` in Next 15).
- Dockerfile `deps` stage: `RUN apk add --no-cache python3 make g++` before `npm ci`; verify the compiled `.node` binary is present in the standalone output, else `COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3` in `runner`.
- Dokploy: mount a **persistent volume** at `/app/data`; the existing `data/leads.jsonl` (currently ephemeral, `/app/data` created in Dockerfile with no volume) should move there too.
- Schema sketch: `donations(id TEXT PK, donation_id TEXT UNIQUE, provider TEXT, provider_payment_id TEXT, amount_cents INTEGER, currency TEXT DEFAULT 'ARS', status TEXT, donor_email TEXT, external_reference TEXT, created_at TEXT, approved_at TEXT, raw_json TEXT)` + `UNIQUE(provider, provider_payment_id)`; `webhook_events(provider TEXT, event_id TEXT, received_at TEXT, PRIMARY KEY(provider, event_id))`.

### C4. PCI scope

Both integrations are **redirect/hosted** (MP Checkout Pro `init_point`, Stripe hosted Checkout) → **no card data enters our origin** → eligible for **PCI DSS SAQ A** (self-assessment, lightest). Keep it so: never add raw card fields; if you ever embed MP bricks, they are hosted iframes (still SAQ A); if you ever use card fields directly (MP Payment Brick with tokenization done locally, Stripe Elements), reassess (SAQ A-EP). State this in the PR/README.

### C5. Environment variables (names only) and secret handling

```
# Mercado Pago
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=                 # only if Wallet Brick is used
MP_WEBHOOK_SECRET=
MP_ENV=production              # or sandbox

# Stripe (flag-gated; only when an eligible entity exists)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_ENABLE_STRIPE=false

# Site
NEXT_PUBLIC_SITE_URL=https://marcosbarbosagroup.com

# Persistence
DONATIONS_DATA_DIR=/app/data

# Existing (unchanged)
NEXT_PUBLIC_CRM_URL=
CRM_API_KEY=
CRM_API_SECRET=
```

- Store in **Dokploy environment variables** (encrypted at rest), not in the image.
- **Blocking:** add `.env`, `.env.*` (keeping `!.env.example`) to `.gitignore` — currently only `.env*.local` is ignored.
- Never log tokens or full provider payloads; log ids only. Rotate webhook secrets periodically (MP Reset button; Stripe "Roll secret").

### C6. Rate limiting and abuse prevention

- The create-payment endpoint is the abuse target (preference/session spam). Apply: per-IP token bucket (e.g. 10/min, 30/h) and a per-donation guard. A tiny in-memory `Map` is acceptable **only on a single replica**; Dokploy can scale, so for correctness prefer **`@upstash/ratelimit` (Redis)** or a **Traefik/Cloudflare** rate-limit middleware in front.
- Layer bot defence: a Cloudflare **Turnstile** token or a honeypot field on the form; server-verify before creating a preference.
- Cap the amount server-side (§C1) and cap concurrent open preferences per IP.
- Note the irony to avoid: provider checkout itself is protected, but our `POST` could be used to mint thousands of preferences — throttle it.

### C7. Reconciliation & receipts (Argentina)

- **Reconciliation:** daily, pull the provider's report — MP *Released money / Account money* reports, or Stripe Balance/Payouts — and diff against the ledger by `external_reference`/`client_reference_id`. Alert on: provider "approved" with no ledger row (missed webhook → backfill via `Payment.search`), ledger row with no provider approval (shouldn't happen; investigate), and amount mismatches. A nightly cron route (`/api/cron/reconcile`, protected by a secret header) is enough at this volume.
- **Donor receipts:** MP issues the buyer a payment confirmation; Stripe can email receipts. Optionally send a thank-you email (Resend/nodemailer) — keep it non-fiscal unless advised. **AFIP/ARCA:** an "ofrenda" is generally a donation, not a sale; whether a fiscal receipt (factura) is legally required depends on the entity's tax situation. **Do not build AFIP/ARCA integration now.** Flag it as an open question for the accountant; if required later, use an AFIP/ARCA web-service provider rather than hand-rolling.

### C8. UX

- One page, two blocks: **(1) amount** — preset chips (e.g. $500 / $1.000 / $2.000 / $5.000 / $10.000 ARS) + "Otro monto" input with min/max validation mirroring the server; **(2) method** — radio/segmented: "Mercado Pago" (active) / "Tarjeta (Stripe)" (disabled with "próximamente" while the flag is off).
- "Confirmar ofrenda" does different things per provider:
  - **Mercado Pago:** `POST /api/donations/mercadopago` → receive `{ init_point }` → `window.location.assign(init_point)` (or render Wallet Brick).
  - **Stripe:** `POST /api/donations/stripe` → receive `{ url }` → `window.location.assign(url)`.
- Both land on `/cuerpo-de-cristo/ofrenda/gracias`, which shows "Verificando tu ofrenda…", calls the matching `confirm` route (MP) or retrieves the session (Stripe), then shows success/pending/failure. Always show the honest outcome; for MP `pending`, say "tu pago está pendiente de acreditación".
- Accessibility/trust: show the exact amount, disabled state, and that payment happens on the provider's secure page.

---

## D. Open-source references

1. **`mercadopago/sdk-nodejs`** — https://github.com/mercadopago/sdk-nodejs
   Official Node SDK (v3). Worth copying: `src/examples/preference/create.ts` (preference body + `requestOptions.idempotencyKey`), the Payment client examples (`get.ts`, `search`), and the `WebhookSignatureValidator` implementation (mirrors §A3). This is the canonical source for the class-based v3 API used above.

2. **`stripe-samples/checkout-one-time-payments`** — https://github.com/stripe-samples/checkout-one-time-payments
   Official Stripe sample for one-time Checkout. Verified structure: `client/`, `server/` (Node among them), `.env.example`, `README.md`, `main.tf`. Worth copying: the server's Checkout Session creation, the webhook handler pattern, and `.env.example` naming. Pair with Stripe's Next.js quickstart (docs.stripe.com/checkout/quickstart) for the exact App Router route-handler shape.

3. **`saulin18/mercadopago-checkout-pro-certification-nextjs`** — https://github.com/saulin18/mercadopago-checkout-pro-certification-nextjs
   Community Next.js project built to pass MP Checkout Pro certification (created 2026-06, updated 2026-09). Useful as a concrete App Router reference for preference creation + return handling. Review before copying (small personal repo; not officially maintained).

4. **`mykhayloyuminov/nextjs-stripe-checkout`** — https://github.com/mykhayloyuminov/nextjs-stripe-checkout
   Next.js 14 App Router + TypeScript, Checkout Sessions + Webhooks. Demonstrates the route-handler webhook verification pattern (`await req.text()` + `constructEvent`) in the same framework version as this site. Best used as a structural reference only.

Also relevant: `Underewarrr/fullstack-vercel-sg-app-nextjs` (MP SDK + Checkout Pro + Checkout Transparent, older) and MP's own `mercadopago/sdk-js` README for Wallet Brick if you later embed the button.

---

## Open questions / risks

1. **Stripe in Argentina (highest risk):** confirmed not supported as an account country. Decide the business path (skip Stripe / Stripe Atlas US LLC / partner entity) before writing any Stripe UI as "available".
2. **`.env` not gitignored:** must fix before adding secrets. (§C5)
3. **No persistent volume today:** `/app/data` is ephemeral; donations (and leads) would vanish on redeploy. Mount a Dokploy volume. (§C3)
4. **`better-sqlite3` on alpine + `standalone`:** native module can be dropped from the standalone trace. Verify the `.node` binary ships; otherwise COPY it explicitly or use Neon. (§C3)
5. **Multi-replica Dokploy:** in-memory rate limiting and SQLite file locks break across replicas. Confirm single-replica, or move to Redis+Postgres. (§C3, §C6)
6. **MP ARS minimum:** not published in the preference docs; verify with a test-user purchase. Enforce our own min/max regardless. (§A7)
7. **MP test-token prefix drift:** test tokens now commonly start with `APP_USR` (not `TEST-`). Don't branch on prefix; use `live_mode` / `sandbox_init_point`. (§A4)
8. **Webhook secret retrieval:** confirm whether `mercadopago` v3.6.x actually exports `WebhookSignatureValidator`; if not, use the hand-rolled HMAC in §A3 (spec-equivalent).
9. **AFIP/ARCA:** confirm with an accountant whether ofrendas need a fiscal receipt; do not build it now. (§C7)
10. **`back_urls` cannot be localhost:** local e2e testing needs a public staging URL or tunnel. (§A4)
11. **`auto_return: "approved"`** requires a public `back_urls.success`; plan that before enabling. (§A2)
12. **Refunds/chargebacks** are not covered by this brief but will happen: `charge.refunded` / MP `refunded` + `charged_back` should flip the ledger to a non-donated state in a follow-up.

---

## Sources (accessed 2026-09-12)

Primary (official):

- Stripe — Global availability: https://stripe.com/global
- Stripe — Supported currencies (min-charge list incl. 0.50 ARS): https://docs.stripe.com/currencies
- Stripe — Webhooks (signature verification, replay, duplication): https://docs.stripe.com/webhooks
- Stripe — Idempotent requests: https://docs.stripe.com/api/idempotent_requests
- Stripe — Build a payments page / Checkout: https://docs.stripe.com/payments/checkout/build-integration
- Stripe — Checkout quickstart (Node/Next.js App Router, test cards): https://docs.stripe.com/checkout/quickstart
- Stripe — Cross-border payouts new countries (AR as payout recipient), 2026-03-25: https://docs.stripe.com/changelog/dahlia/2026-03-25/cross-border-payouts-new-countries
- Stripe — Create an account (`country` semantics): https://docs.stripe.com/api/accounts/create
- Mercado Pago — Create and configure a payment preference: https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/create-payment-preference
- Mercado Pago — Configure return URLs (`back_urls`, `auto_return`, return params): https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/configure-back-urls
- Mercado Pago — Webhooks (signature template, secret location, topics): https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/additional-content/notifications/webhooks
- Mercado Pago — Payment status / `status_detail` (Checkout API response handling): https://www.mercadopago.cl/developers/en/docs/checkout-api-payments/response-handling/query-results
- Mercado Pago — Transaction status (`status`/`status_detail` list, Orders): https://www.mercadopago.com.ar/developers/en/docs/checkout-api-orders/payment-management/status/transaction-status
- Mercado Pago — OAuth (token prefixes `APP_USR`/`TEST`, `live_mode`): https://www.mercadopago.com.ar/developers/en/reference/authentication/oauth/_oauth_token/post
- Mercado Pago — Test accounts: https://www.mercadopago.com.ar/developers/en/docs/mp-point/resources/test-accounts
- Mercado Pago — Create application / test credentials: https://www.mercadopago.com.ar/developers/en/docs/automatic-payments-orders/create-application
- npm — `mercadopago` (v3.x, README, Node 18+): https://www.npmjs.com/package/mercadopago
- npm — `@mercadopago/sdk-react` (v1.0.7, from `npm view`)
- GitHub — `mercadopago/sdk-nodejs`: https://github.com/mercadopago/sdk-nodejs
- GitHub — `mercadopago/sdk-js`: https://github.com/mercadopago/sdk-js

Reference implementations / OSS:

- https://github.com/stripe-samples/checkout-one-time-payments
- https://github.com/saulin18/mercadopago-checkout-pro-certification-nextjs
- https://github.com/mykhayloyuminov/nextjs-stripe-checkout
- https://github.com/Underewarrr/fullstack-vercel-sg-app-nextjs

Local context (read, not modified):

- `/Users/joelpacheco/PROYECTOS/satisfecho-pos/back/app/mp_service.py` — preference build + `fetch_approved_mp_payment()` search-by-`external_reference` pattern.
- `/Users/joelpacheco/PROYECTOS/satisfecho-pos/back/app/main.py` — `POST /orders/{id}/create-mp-preference` and `confirm-mp-payment` (server-side discovery; never takes a client payment id).
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/{Dockerfile,next.config.mjs,.gitignore,app/api/lead/route.ts,app/cuerpo-de-cristo/ofrenda/page.tsx}`.
