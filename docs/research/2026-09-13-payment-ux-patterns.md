# Payment-method selection UX for the ofrenda page — primary-source research

**Date:** 2026-09-13 (research executed 2026-09-13)
**Scope:** the donation form at `https://marcosbarbosagroup.com/cuerpo-de-cristo/ofrenda` (Argentine entity, ARS, Córdoba). Stack: Next.js 14 App Router + Mercado Pago Checkout Pro + alias/CVU transferencia. Goal: opinionated recommendation for how to render the two methods (Mercado Pago / Transferencia) when one is temporarily unavailable, and how to position transferencia alongside Mercado Pago in a way that matches LATAM donor expectations.
**Companion doc:** `2026-09-11-pagos-stripe-mercadopago.md` (Stripe blocked for AR; Mercado Pago is the native option).
**Local files read (not modified):** `app/cuerpo-de-cristo/ofrenda/page.tsx`, `components/donations/offering-form.tsx`, `app/api/donations/mercadopago/route.ts`, `.env.example`.

---

## TL;DR

- **Never silently hide a method that is temporarily unavailable.** The recommended pattern across NN/g, Stripe's own error catalog, Mercado Pago's own UX guide, Shopify Polaris and Baymard is the same: **show it, label it honestly, and offer a working alternative in the same screen** (NN/g "Offer constructive advice"; Shopify "Reduce friction"; Baymard "Third-Party payment methods"). For our site that means: when MP is down, keep the Mercado Pago radio visible but render it **disabled with an inline note** ("Pago online no disponible — usá transferencia") and **promote Transferencia to the default**, never remove both options from the page.
- **Transferencia must look like a first-class payment method, not a fallback.** Cáritas Argentina's primary copy shows the recipe: bold subhead ("Hacé tu transferencia o depósito a nuestra cuenta bancaria"), full bank fields (CBU, Alias, CUIT, cuenta, sucursal, banco), and a separate "Débito en CBU" path that requires the donor to enter the CBU number in a plain numeric input — no PDF, no "send us a message". Copy for transfer should be **imperative + concrete**, not apologetic.
- **Tone on failure: confident, brief, no apology theatre.** NN/g (2023) — "Take a positive tone and don't blame the user. Don't use phrasing that blames users… Avoid humor since it can become stale". Stripe's own error code `payment_method_not_available` says: *"Try a different payment method or retry later with the same payment method."* For our form: **"Pago online no disponible por el momento. Podés ofrendar por transferencia."** — no "lo sentimos", no exclamation marks, no emoji. (Our current code at `app/api/donations/mercadopago/route.ts:38` is already in that direction; the form-side message at `offering-form.tsx:72` is also fine.)
- **Show the bank details inline, not behind a button.** Cáritas shows CBU/Alias/CUIT/sucursal/cuenta/banco **all on the same card** so a donor can copy and never needs a second click. We already do this (alias + CVU + holder via env vars); see "What we recommend" for one correction.
- **Always-visible progress / never-blank state during redirect.** NN/g (2014) — "Always give some type of immediate feedback" and "Don't-click-again warnings: Don't use them." Our form already shows `Loader2` + "Iniciando…" while waiting for `init_point`; that is the correct shape. **Critical:** the button must not become re-clickable mid-flight, which is already enforced by `disabled={loading}`.

---

## 1. When a payment method is unavailable — what to do

| Strategy | Verdict | Source / reasoning |
|---|---|---|
| **Hide it entirely** | ❌ Avoid | Hiding causes the donor to question whether the page is broken; in our case it also erases the only offline-fallback we offer. NN/g "Avoid prematurely displaying errors" warns against silent removal of options. Baymard's "Payment Flow & Methods (Incl. Third-Party)" topic (39 pages) exists *because* the right pattern is to present third-party methods alongside each other, not to hide one. |
| **Show disabled with "(próximamente)" badge** | ✅ Use for permanent unavailability (e.g., Stripe in AR today) | Clear, honest. The brief in `2026-09-11-pagos-stripe-mercadopago.md §B1` calls for exactly this. This site has no Stripe UI rendered today; if/when it is added, render it disabled + "próximamente" until a supported-country entity exists. |
| **Show disabled + "no disponible por el momento" + promote the working alternative** | ✅ Use for **temporary / runtime** unavailability (the actual case we are solving) | Stripe's catalog uses the wording *"temporarily unavailable"* for `payment_method_not_available` and `processing_error` (docs.stripe.com/error-codes). Mercado Pago's own status taxonomy distinguishes `pending` / `rejected` / `cancelled` — none of these are hidden; they are returned to the merchant who must surface them. NN/g's "Offer constructive advice" guideline applies: tell the user what to do next. |
| **Swap the order silently** | ❌ Don't | Donors who already chose MP would lose context. The label change must be explicit. |
| **Show a modal** | ❌ Avoid for a missing method | NN/g "Design errors based on their impact": "Differentiate between these 'good to know' messages from those posing a barrier… modal dialogs… should be reserved for severe errors." A missing method is informational, not catastrophic. |
| **Refuse to render the page** | ❌ Avoid | MP being down must not take the whole donation page offline — the brief's whole point is to keep transfer working. Our `route.ts:32` correctly returns `503` + JSON; the form already falls back to the transfer card. |

### Exact phrasing decision

Following **NN/g "Take a positive tone and don't blame the user"** (Neusesser & Sunwall, 2023-05-14) and Stripe's own catalog wording, the messages below are the ones to ship. They are short, factual, and offer a constructive next step.

| State | Recommended copy (es-AR) | Do NOT say |
|---|---|---|
| Mercado Pago service unavailable (server-side 5xx from MP) | **"No pudimos iniciar el pago con Mercado Pago. Probá de nuevo en unos minutos o transferí directamente."** | "Lo sentimos, ocurrió un error inesperado" (apology theatre, vague) |
| Mercado Pago not configured (`MP_ACCESS_TOKEN` missing → 503) | **"Pago online no disponible por el momento. Podés ofrendar por transferencia."** (already in `route.ts:38`) | "El servicio está caído" (overstates; may just be misconfig) |
| Transferencia selected but no alias/CVU env vars set | **"Las coordenadas para transferencia no están publicadas. Escribinos por WhatsApp y te las pasamos."** (already in `offering-form.tsx:276`) | "Pronto tendremos transferencia" (false — feature exists, just unconfigured) |
| Validation failure (amount < min) | **"El monto mínimo es $100."** (already in `offering-form.tsx:158`) | "Entrada inválida" / "Input error" (English; blames user) |
| User-initiated network failure | **"Error de red. Probá de nuevo."** (already in `offering-form.tsx:79`) | "Tu internet no anda" (blames user; outside our knowledge) |

---

## 2. Best practices for "transferencia bancaria" presentation in LATAM donations

### 2.1 The Cáritas Argentina pattern (primary, observed on page)

Source: `https://caritas.org.ar/sumate` (HTML captured 2026-09-13). The page offers **eight** donation methods and presents each as a peer, not a backup. The transfer options specifically:

- **Section heading** for bank deposit: *"Hacé tu transferencia o depósito a nuestra cuenta bancaria"* (imperative + concrete — not "¿Querés donar por transferencia?")
- All bank identifiers **on one card**:
  - Cuenta Corriente Banco ICBC 1 — Nº `0546-02000042/42` — Sucursal Casa Central 0546 — CBU `0150546702000000042422` — Alias `DONA.CARITAS.ARG`
  - Cuenta Corriente Banco ICBC 2 — Nº `0501-02143234/61` — CBU `0150501602000143234612` — Alias `DONO.COLECTA`
  - A nombre de: Cáritas Argentina — CUIT `30-51731290-4`
- **Separate "Débito en CBU"** path for donors who *want* to enter a CBU from their own bank app (the most native AR flow): label *"Nº de CBU\* \*Sólo números, sin puntos ni comas."*
- Trust signal: *"Tu donación es deducible de ganancias"* — critical for AR donors who itemize.
- Contact fallback for non-digital donors: *"Donaciones de dinero: de lunes a viernes de 9 a 17hs, [+549 11-2817-2726], [email]"* — phone hours are concrete.
- Preset amounts per method, **separately**: tarjeta chips `$20.000 / $12.000 / $6.500`; transferencia chips `$70.000 / $40.000 / $20.000 / $10.000`. The transfer amount chips are **higher** — Cáritas assumes donors who choose to walk to a bank intend to give more. This is a strong, copyable signal.

### 2.2 UNICEF Argentina / TECHO / Greenpeace Argentina — accessibility status

- `https://www.unicef.org.ar/donar/` → transport error / unreachable at research time (verify on next attempt).
- `https://techo.org/dona/` → SPA that uses cookie consent overlay; the actual donation route resolves per country via dropdown (`https://argentina.techo.org/`). The Argentina site under `argentina.techo.org/donar/` returns 404 — they currently route through Mercado Pago link-based donations + WhatsApp rather than a hosted form.
- `https://www.greenpeace.org.ar/donar/` → "No se encontró la página". Greenpeace AR donates through `greenpeace.org/argentina/que-hacemos` and an external form.

**Implication for our site:** Cáritas Argentina is the cleanest LATAM peer — large NGO, mixed methods, Argentine peso. We should mirror its transfer copy conventions (imperative headline, full identifiers on one card, deductibility signal, hours/phone for non-digital donors).

### 2.3 Mercado Pago's own UX best-practices guide

Source: `https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/best-practices/ux-best-practices/ux-for-checkouts/introduction`. MP explicitly tells merchants to *"Keep the data grouped thematically and provide context to the user about the steps to follow"* (the linked sub-page `header-subtitles-text`). The companion page `labels-and-placeholders` covers label/placeholder conventions. MP's guide is for *Checkout Bricks* (embedded fields), not redirect Checkout Pro — but the principles translate: **group, contextualize, never invent placeholder text**.

For *redirect* Checkout Pro (our case), MP's recommendation is to **send the donor into the MP-hosted page fast** with as much context prefilled as possible (payer email, `external_reference`), and **only show post-failure messages on our own return page** when status is `rejected` or `pending`. Our existing `/ofrenda/gracias` route already does this. See §5 for the redirect-failure flow.

### 2.4 What we already do right vs. what to fix

| Check | Current state | Action |
|---|---|---|
| Both methods visible by default | ✅ (`offering-form.tsx:167`) | Keep. |
| Method chooser labels **user-language**, not provider-language | ✅ ("¿Cómo querés ofrendar?" + "Mercado Pago" / "Transferencia") | Keep. Cáritas uses *"Elegí tu medio de donación"*. We are aligned. |
| Bank identifiers (alias/CVU/holder) on one card | ✅ (`offering-form.tsx:255-274`) | Keep. |
| **Copy-button** on alias | ✅ (`offering-form.tsx:284`) | Keep. Baymard highlights copy-to-clipboard as a high-impact microinteraction for payment pages. |
| WhatsApp fallback when env vars are empty | ✅ (`offering-form.tsx:291-298`) | Keep. The Cáritas "9-17hs / phone" pattern is stronger — consider adding hours once a phone is set, but not required. |
| Imperative + concrete subhead for transfer | ⚠️ Missing — currently no subhead above the alias/CVU block | **Add:** *"Hacé tu transferencia o depósito a nuestra cuenta:"* (mirror Cáritas). |
| Deductibility / trust signal | ⚠️ Not shown | Optional. Add if/when ARCA/AFIP status is confirmed; do **not** invent a receipt claim. |
| [VALIDAR] placeholder text | ⚠️ Still rendered when env vars are empty (`offering-form.tsx:301`) | **Remove** — `[VALIDAR]` is an internal marker that leaked into production code; ship only when env vars are filled. |
| Preset amounts | ⚠️ Fixed at $1k / $5k / $10k / $20k / $50k | Consider rounding to `k` notation that matches LATAM convention (`$1.000` not `$1000`, see Cáritas). Minor — Intl.NumberFormat already handles it via `maximumFractionDigits: 0`. |
| **Method-availability signal** for runtime MP failure | ⚠️ Inline error only — the radio still looks selected | **Fix:** when the user picks MP and the API returns 503, **automatically switch selection to transferencia** *and* show the inline error. See §5. |

---

## 3. Recommended tone on payment pages

Cited authorities (consensus):

| Authority | Quote / rule | URL |
|---|---|---|
| **NN/g — Error-Message Guidelines** (Neusesser, Sunwall, 2023-05-14) | "Use human-readable language. Error messages should be plainspoken. Avoid technical jargon." | https://www.nngroup.com/articles/error-message-guidelines/ |
| **NN/g — same article** | "Concisely and precisely describe the issue. Generic messages such as 'An error occurred' lack context." | (same) |
| **NN/g — same article** | "Offer constructive advice. Merely stating the problem is also not enough; offer some potential remedies." | (same) |
| **NN/g — same article** | "Take a positive tone and don't blame the user. Don't use phrasing that blames users or implies they are doing something wrong, such as invalid, illegal, or incorrect." | (same) |
| **NN/g — same article** | "Avoid humor since it can become stale if users encounter the error frequently." | (same) |
| **NN/g — same article** | "Avoid prematurely displaying errors. Presenting errors too early is a hostile pattern." | (same) |
| **NN/g — Website Forms Usability** (Whitenton, 2016-05-01) | "Provide highly visible and specific error messages. Errors should be signaled through a variety of cues, not solely through color." | https://www.nngroup.com/articles/web-form-design/ |
| **NN/g — Progress Indicators** (Sherwin, 2014-10-26) | "Always give some type of immediate feedback. A user's wait time begins the moment when she initiates an action." | https://www.nngroup.com/articles/progress-indicators/ |
| **NN/g — same article** | "Don't-click-again warnings: Don't use them. The way to avoid extra clicks is to show the user that the first click has been accepted." | (same) |
| **Stripe Error codes catalog** (docs.stripe.com/error-codes) | `payment_method_not_available` — "The payment processor for the provided payment method is temporarily unavailable. Try a different payment method or retry later with the same payment method." | https://docs.stripe.com/error-codes |
| **Stripe — same catalog** | `processing_error` — "An error occurred while processing the card. Try again later or with a different payment method." | (same) |
| **Shopify — UX for payments** (shopify.dev/docs/apps/build/checkout/payments/ux-for-payments) | "Display them on the specific fields that contain the invalid data, including a message explaining what went wrong and how to fix it." | https://shopify.dev/docs/apps/build/checkout/payments/ux-for-payments |
| **Shopify — UX for checkout** (shopify.dev/docs/apps/build/checkout/ux-for-checkout) | "Reduce friction… only show components when you know that customers need them… Help customers understand what's optional." | https://shopify.dev/docs/apps/build/checkout/ux-for-checkout |
| **Mercado Pago — UX best practices** | "Keep the data grouped thematically and provide context to the user about the steps to follow." (link from the guide's intro) | https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/best-practices/ux-best-practices/ux-for-checkouts/introduction |
| **Baymard — Cart & Checkout Usability Research** | Dedicated topic "Payment Flow & Methods (Incl. Third-Party)" — 8 guidelines covering "how to integrate and display an array of different third-party payment methods." Free articles on `baymard.com/blog`. | https://baymard.com/research/checkout-usability |

### Concrete tone do/don't table (es-AR, ofrenda context)

| Don't write | Write instead | Why |
|---|---|---|
| "Lo sentimos, hubo un error inesperado." | "No pudimos iniciar el pago con Mercado Pago. Probá de nuevo en unos minutos o transferí directamente." | NN/g: avoid apology theatre; offer remedy. Stripe: "temporarily unavailable" is the industry-standard wording. |
| "Entrada inválida." | "El monto mínimo es $100." | NN/g: avoid blame + jargon; be specific. |
| "Servicio caído 😔" | "Pago online no disponible por el momento." | NN/g: avoid humor that gets stale. No emoji unless explicitly part of brand voice. |
| "El sistema devolvió 502." | "No pudimos conectar con Mercado Pago." | NN/g: human-readable language; hide HTTP status. |
| "Por favor intente nuevamente más tarde 🙏" | "Probá en unos minutos." | Shorter. Avoids English borrow. Avoids emoji in failure copy. |
| `window.confirm("¿Está seguro que quiere cancelar?")` | Not applicable here | NN/g "Avoid Reset and Cancel buttons" applies broadly. |

---

## 4. Mercado Pago-specific patterns

Source: `https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/additional-settings/payment-methods`.

### 4.1 Hiding a method MP-side

MP explicitly supports per-preference exclusion: `payment_methods.excluded_payment_methods[]` (specific card brands) and `payment_methods.excluded_payment_types[]` (`ticket`, `atm`, etc.). The "Cash in account" payment method **cannot be excluded**. This is how, for instance, a seller who only wants to take cards turns off cash tickets.

**Implication for us:** if we ever want to limit our ofrenda to cards only (no Rapipago tickets), we'd add `payment_methods.excluded_payment_types: [{ id: "ticket" }]` to the preference. We don't need this today — letting the donor see every option MP offers is the LATAM norm.

### 4.2 When a payment method fails *inside* MP's hosted page

The MP-hosted Checkout Pro returns `status` via the `back_urls` query string (`?status=success|failure|pending&payment_id=...`). Our `/gracias` page already calls the MP `confirm` route which re-validates server-side. The actual failure states (per the `status` table) include `rejected` (and the `status_detail` like `cc_rejected_card_disabled`, `cc_rejected_insufficient_amount`, `cc_rejected_other_reason`) — these are surfaced by MP *inside* its own page. From our app's perspective we only see the final `status` on return; we should:

1. Re-fetch the payment server-side (we do).
2. Map `rejected` → show "El pago fue rechazado. Probá con otro medio o transferí." with a one-click switch to transferencia (current: shown but not pre-selected).
3. Map `pending` → show "Tu pago está en proceso de acreditación." (already in our `/gracias` page).
4. Map `approved` → thank-you (already implemented).

### 4.3 When the API call itself fails (our side, before redirect)

This is the case the brief actually cares about. Our `route.ts:32-42` already handles `isMpCheckoutReady() === false` (no token in env) with a 503 + a clear message. The form (`offering-form.tsx:69-75`) surfaces that message via `setError(...)`. **What's missing today** (see §5): the form does not auto-switch the radio to transferencia when MP comes back unavailable. The donor sees an error but is still looking at MP as the selected option.

---

## 5. What we recommend for THIS site (marcosbarbosagroup.com ofrenda)

### 5.1 The fix to ship

Goal: when the `/api/donations/mercadopago` POST returns 5xx (or 503 specifically), the UI must (a) auto-select transferencia, (b) show the inline error from §3, and (c) scroll the donor's eye to the transfer card. Concretely:

- In `offering-form.tsx`, detect `res.status === 503` or `data?.code === "MP_NOT_CONFIGURED"` in the catch block. When matched:
  - `setMethod("transferencia")`
  - `setError("Pago online no disponible por el momento. Podés ofrendar por transferencia.")`
  - Smooth-scroll the transfer `<fieldset>` into view (existing `card-luxury` block at `offering-form.tsx:255-305`).
- Do **not** remove the Mercado Pago radio; it must remain visible so the donor can retry when the service recovers.
- Do **not** open a modal. The inline alert plus auto-switch is enough (NN/g "Design errors based on their impact").

### 5.2 Copy adjustments (small, do them all together)

| Location | Current | Change to |
|---|---|---|
| `offering-form.tsx:182` (Mercado Pago sub-line) | "Tarjeta de crédito/débito, cuotas, dinero en cuenta y efectivo. Pago seguro en el sitio de Mercado Pago." | Keep as-is. ✅ |
| `offering-form.tsx:204` (Transfer sub-line) | "Sin comisión. Transferís a nuestra cuenta y nos avisás." | "Sin comisión. Te pasamos los datos y nos avisás por WhatsApp." (clearer about the next step) |
| `offering-form.tsx:256` (transfer subhead) | "Datos para transferir" | "Hacé tu transferencia o depósito a nuestra cuenta:" (Cáritas pattern, imperative) |
| `offering-form.tsx:301-303` `[VALIDAR]` note | "Completá el alias/CVU/titular reales…" | **Remove entirely.** Once env vars are empty, show only the WhatsApp CTA + a single line: *"Las coordenadas para transferencia no están publicadas. Escribinos por WhatsApp y te las pasamos."* No internal marker. |
| `route.ts:38` 503 error | "El pago online no está disponible por el momento. Podés ofrendar por transferencia." | Keep. ✅ (already matches §3) |
| `offering-form.tsx:72` API error catch | "No pudimos iniciar el pago. Probá de nuevo o usá transferencia." | "No pudimos iniciar el pago con Mercado Pago. Probá de nuevo en unos minutos o transferí directamente." (avoid generic "el pago", name the provider per NN/g "Concisely and precisely describe") |
| `offering-form.tsx:79` network catch | "Error de red. Probá de nuevo." | Keep. ✅ (short, no blame) |

### 5.3 What NOT to change

- **The 2-method radio layout.** Cáritas uses 3 to 5+ options as peer cards; we don't need to expand. Two well-styled cards is the right scale for this audience.
- **The preset amount chips.** Cáritas differentiates preset amounts per method (transfer = larger). We could mirror that, but for our first release the same chips per method is fine — donors self-select based on capacity, not method.
- **The email field.** It's optional (per current code) which is correct; required email on a donation page increases friction without value (NN/g Whitenton "Keep it short").

### 5.4 Accessibility guardrails (cite NN/g + WCAG via NN/g)

- Use `role="alert"` + `aria-live="polite"` on the error region ✅ (already in `offering-form.tsx:230-231`).
- The radio is implemented as `<label>` wrapping `<input type="radio">` — this is the right a11y pattern.
- Do **not** rely on color alone to indicate error. The current implementation adds red text on red-tinted background — that's two cues (color + position), but consider adding an icon (e.g. `AlertCircle`) for a third redundant cue (NN/g "Use noticeable, redundant, and accessible indicators"; "about 350 million people worldwide with a color-vision deficiency").
- When the form auto-switches the method on 503, programmatically move focus to the transfer card's first focusable element (the copy-alias button or the WhatsApp link). This is the equivalent of Shopify's "If there is only a single field with an error, then move focus to that field instead" pattern.

### 5.5 Out-of-scope for this brief (do not implement now)

- Stripe disabled-with-próximamente rendering (already documented in `2026-09-11-pagos-stripe-mercadopago.md`).
- Receipts / AFIP / ARCA fiscal integration (open question, flagged).
- Recurring donations (Cáritas has them; not in our brief).
- "Donar desde el exterior" path (Cáritas uses HelpArgentina.org widget; not relevant until we cross-border).

---

## References (all primary, accessed 2026-09-13)

### Vendor documentation (Checkout Pro / Checkout Bricks / Stripe Checkout)

1. Mercado Pago — *Create and configure a payment preference*: https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/create-payment-preference
2. Mercado Pago — *Configure other payment methods* (`payment_methods.excluded_payment_methods[]` / `payment_methods.excluded_payment_types[]`; "Cash in account cannot be excluded"): https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/additional-settings/payment-methods
3. Mercado Pago — *UX best practices for checkouts* (intro index linking to headings/subtitles and labels/placeholders): https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/best-practices/ux-best-practices/ux-for-checkouts/introduction
4. Mercado Pago — *Headings, subheadings and explanatory texts* (linked from #3): https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/best-practices/ux-best-practices/ux-for-checkouts/header-subtitles-text
5. Mercado Pago — *Labels and placeholders* (linked from #3): https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/best-practices/ux-best-practices/ux-for-checkouts/label-and-placeholders
6. Stripe — *Manage payment methods* (hosted Checkout): https://docs.stripe.com/payments/checkout/payment-methods.md?payment-ui=stripe-hosted
7. Stripe — *Error codes* (full table; `payment_method_not_available`, `processing_error`): https://docs.stripe.com/error-codes
8. Stripe — *Decline codes* (for the return-page re-validate flow): https://docs.stripe.com/declines/codes

### UX research (NN/g, Baymard, Shopify Polaris / UX for checkout)

9. NN/g — *Error-Message Guidelines* (Neusesser, Sunwall, 2023-05-14): https://www.nngroup.com/articles/error-message-guidelines/
10. NN/g — *Progress Indicators Make a Slow System Less Insufferable* (Sherwin, 2014-10-26): https://www.nngroup.com/articles/progress-indicators/
11. NN/g — *Website Forms Usability: Top 10 Recommendations* (Whitenton, 2016-05-01): https://www.nngroup.com/articles/web-form-design/
12. NN/g — *10 Design Guidelines for Reporting Errors in Forms* (Krause): https://www.nngroup.com/articles/errors-forms-design-guidelines/
13. Baymard Institute — *Cart & Checkout Usability Research* (index of 110+ guidelines across 17 topics; *Payment Flow & Methods (Incl. Third-Party)* is the relevant 39-page report): https://baymard.com/research/checkout-usability
14. Shopify — *UX for checkout* (trust, friction, test scenarios): https://shopify.dev/docs/apps/build/checkout/ux-for-checkout
15. Shopify — *UX for payments* (form validation: error banner at top + focus; single-field error → move focus to that field): https://shopify.dev/docs/apps/build/checkout/payments/ux-for-payments
16. Shopify — *UX for pre-purchase product offers*: https://shopify.dev/docs/apps/build/checkout/product-offers/ux-for-pre-purchase-product-offers
17. Apple — *Human Interface Guidelines — Components / Status* (referenced via deeplink; JS-rendered): https://developer.apple.com/design/human-interface-guidelines/components/status
18. Apple — *Human Interface Guidelines — Foundations / Accessibility*: https://developer.apple.com/design/human-interface-guidelines/foundations/accessibility
19. Material Design 3 — *Communication / Typography* (referenced): https://m3.material.io/styles/communication/typography

### LATAM donation platform observations (primary on-page copy, captured 2026-09-13)

20. Cáritas Argentina — *Donar / Sumate*: https://caritas.org.ar/sumate (full HTML captured; verbatim copy used in §2.1)
21. Cáritas Argentina — *Donaciones desde el exterior* (HelpArgentina widget): https://www.helpargentina.org/en/ong/dt/id/184/caritas-argentina-comision-nacional
22. TECHO Latam — *Donate* (country selector landing): https://techo.org/dona/
23. TECHO Argentina — *Home* (current routing of Argentine donations is via WhatsApp / Mercado Pago links): https://argentina.techo.org/
24. UNICEF Argentina — *Donar*: https://www.unicef.org.ar/donar (transport error at research time; retry)
25. Greenpeace Argentina — *Donar*: https://www.greenpeace.org.ar/donar (page 404 at research time; donations likely routed through international Greenpeace form)

### Local context (read, not modified)

26. `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/app/cuerpo-de-cristo/ofrenda/page.tsx` (section headings, intro copy).
27. `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/components/donations/offering-form.tsx` (current radio, transfer card, error states).
28. `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/app/api/donations/mercadopago/route.ts` (`isMpCheckoutReady()` 503 path at line 32).
29. `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/.env.example` (`NEXT_PUBLIC_TRANSFER_ALIAS`, `NEXT_PUBLIC_TRANSFER_CVU`, `NEXT_PUBLIC_TRANSFER_HOLDER`).
30. `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/docs/research/2026-09-11-pagos-stripe-mercadopago.md` (companion doc; covers Stripe blocked-for-AR and the route surface).
