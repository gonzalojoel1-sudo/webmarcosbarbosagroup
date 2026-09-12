# Admin login — replace HTTP Basic Auth with a brand-consistent login + signed session cookie

**Date:** 2026-09-12
**Scope:** `/admin/*` and `/api/admin/*` in `webmarcosbarbosagroup` (single-tenant, single admin, Next.js 14.2.35 App Router).
**Stack:** Next.js 14.2.35 App Router, TypeScript, `node:20-alpine` Docker `standalone` on Dokploy (single replica), Tailwind + `@base-ui/react`, `node:sqlite` (already in use in `lib/board/store.ts`), `zod` for validation, Server Actions for mutations.

---

## TL;DR

**Recommend: roll-your-own signed-and-encrypted session cookie using the same `crypto.createCipheriv('aes-256-gcm', ...)` primitive already used in `lib/confessions/crypto.ts`.** Format is `version.mac.iv.tag.ciphertext` (AEAD, ~120 bytes for a `{userId, iat, exp}` payload), secret lives in a single Dokploy env var `ADMIN_SESSION_SECRET` (`openssl rand -base64 32`), cookie name is `__Host-admin_session`, flags are `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`. Password stays in `ADMIN_PASS` (already an env var) and is compared with `crypto.timingSafeEqual` after a per-boot scrypt hash of the env var (so the plaintext is not retained in memory). Login form is a Next.js Server Action on a new `/login` route that mirrors `components/site/content-page.tsx`; the existing `middleware.ts` becomes a `getSession()` DAL call instead of a `Basic` parse. CSRF is **already covered** by Next.js 14 Server Actions (POST-only + Origin↔Host comparison); no extra token is required. Brute-force protection = in-memory per-IP sliding window (5 attempts / 15 min), acceptable because the single-replica constraint makes the in-memory store authoritative. **Migration = hard cut.** No external consumers of `/api/admin/*` are documented (curl/Playwright tests are updated in the same PR). `iron-session` is the only viable library alternative and is rejected for two reasons: (a) v9 requires Node 22.13+ and the project is on Node 20 (EOL since 2026-04-30; upgrade is out of scope), (b) `v8` works on Node 20 but adds a dependency that duplicates the AEAD primitive already in the codebase. Every alternative library (next-auth, Better-Auth, Lucia, Clerk) is overkill or actively deprecating for single-admin use.

---

## Stack context (what we have, read locally)

- **`middleware.ts:1-60`** — current Basic Auth via `digest()` + constant-time compare (`equalFixed`), covers `matcher: ["/admin/:path*", "/api/admin/:path*"]`. Browser shows the native ugly dialog.
- **`app/admin/layout.tsx:1-14`** — minimal layout, `robots: { index: false, follow: false }` already set. No auth UI.
- **`app/admin/page.tsx:1-230`** — Server Component that renders a tabs UI (`/admin?tab=jobs|confesionario`) consuming `getBoard()` and `getConfessions()`. Uses `force-dynamic` because of `Date()` + `safeLog`.
- **`app/admin/actions.ts:1-72`** — Server Actions (`"use server"`); pattern is `formData → zod-less allowlist → store mutation → revalidatePath("/admin")`. `safeLog("confession.markRead", { id, status })` for security-aware logging.
- **`app/api/admin/{confessions,cv/[id],export}`** — JSON/CSV/stream endpoints behind the same middleware. No documented external consumers.
- **`lib/board/store.ts:1-207`** — `node:sqlite` (`DatabaseSync`), single shared `cached` singleton at module scope, `getBoard()` / `getConfessions()` accessor pattern.
- **`lib/confessions/crypto.ts:1-63`** — the canonical AEAD primitive in this repo: `createCipheriv("aes-256-gcm", key, iv)` + 12-byte IV + 16-byte auth tag + `0x01` version prefix + base64 blob. Key loaded from `CONFESSIONS_ENCRYPTION_KEY` env var (32 bytes base64). Throws `DecryptionError` on bad tag. **This is the exact primitive the session cookie should reuse.**
- **`lib/confessions/log.ts:1-16`** — `safeLog(event, { id, status, code, count, ms })` allowlist; `id` is auto-shortened to 8 chars. Re-usable for admin login events.
- **`.env.example:1-34`** — `ADMIN_USER` + `ADMIN_PASS` (plaintext), `CONFESSIONS_ENCRYPTION_KEY` (32 bytes base64), `CONFESSIONS_IP_SALT`, `DATA_DIR`. No session secret today.
- **`config/theme.ts:1-28`** — primary `#FE4100` / `#FF5C1F`, display `Fraunces`, body `Outfit`, mono `JetBrains Mono` (per the source of truth). `docs/spec.md` mentions `Instrument Serif` but `config/theme.ts` is what the Tailwind provider actually reads — go with theme.ts.
- **`next.config.mjs:1-13`** — `output: "standalone"`, `poweredByHeader: false`, no middleware-specific config.
- **`package.json:1-42`** — Next 14.2.35, React 18, Tailwind 3.4, `zod ^3.25`, no auth lib currently.

Sibling domains: `crm.marcosbarbosagroup.com` (Espo/Frappe, separate app — irrelevant to cookie scoping because cookies don't cross origins) and `dokploy.marcosbarbosagroup.com` (separate). `marcosbarbosagroup.com` is the only origin that needs the admin cookie.

---

## Decision matrix

| Option | Cookie format | Library deps | Lines added | Native modules? | Node 20 OK? | Verified with primary source |
|---|---|---|---|---|---|---|
| **Roll-your-own (AES-256-GCM + versioned blob)** — **PICK** | `version.mac.iv.tag.ciphertext`, base64url, ~120B | **0** | ~80 (lib) + ~60 (UI) + ~40 (action) | No | Yes | [Node `crypto.createCipheriv`](https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options); matches existing `lib/confessions/crypto.ts` pattern |
| **iron-session v8.x** | `@hapi/iron` envelope (AES-CTR + HMAC-SHA-256, "fingerprint" + password key-derivation) | +1 (`iron-session` + transitive `iron-webcrypto`) | ~30 (config) + ~120 (UI) + ~60 (action) | No | **Yes** (v9 needs Node 22.13+) | [iron-session v9 README, "If you are stuck on an older Node, stay on v8"](https://github.com/vvo/iron-session) |
| **iron-session v9** | same as v8 | same | same | No | **No** (needs Node ≥22.13) | [iron-session README](https://github.com/vvo/iron-session) |
| **`jose` raw (AES-GCM via JWE)** | `JWE Compact` (`header.encKey.iv.ct.tag`) | +1 (`jose`) | ~80 (lib) + 120 (UI) + 60 (action) | No | Yes | [jose docs](https://github.com/panva/jose); [Next.js auth guide uses `jose` for stateless sessions](https://nextjs.org/docs/app/guides/authentication) |
| **`jose` raw (JWS HS256 only — sign, don't encrypt)** | `header.payload.sig` | +1 (`jose`) | ~40 (lib) | No | Yes | Same; JWS leaks payload — only OK if payload is non-sensitive (it is — `{userId, iat, exp}`) but loses defense-in-depth |
| **next-auth / Auth.js v5** | DB-backed sessions or JWT via adapter | +3 (`next-auth`, adapter, prisma/etc.) | ~500+ | Maybe | Yes | [Auth.js "Migrate to Better Auth"](https://authjs.dev/getting-started) banner — **the project itself recommends migrating away** |
| **Lucia** | DB-backed sessions, single-file replacement | 0 (single file from `github.com/lucia-auth/lucia/tree/main/code`) | ~150 | No | Yes | **Deprecated July 2026** ([pilcrowonpaper.com/blog/18](https://pilcrowonpaper.com/blog/18)); only maintainable as a "single-file replacement for the NPM package" |
| **Better-Auth** | Cookie w/ rotating session ID, server-side session record | +1 (`better-auth`) | ~300 | Maybe | Yes | [Better Auth docs](https://www.better-auth.com/docs); uses `scrypt` by default with example swap to Argon2 ([Better Auth password hashing](https://www.better-auth.com/docs/authentication/email-password)); **overkill** for single-admin |
| **HMAC-only with `crypto.createHmac('sha256', ...)`** | `payload.sig`, base64url | 0 | ~60 | No | Yes | OWASP recommends AEAD for tokens containing identifiers; HMAC alone is OK if payload is `{userId, iat, exp}` with no PII. **Not enough** because tampered `exp` would only fail signature check, but a tampered ciphertext-then-MAC AEAD is strictly stronger. |
| **argon2 npm** for password | n/a (password hash, not cookie) | +1 (`argon2` ^0.45) — **requires Node ≥22.0**, no musl prebuilds historically | ~20 | Yes (`.node`) | **No** (lib requires Node ≥22) | [argon2 npm: "node-argon2 works only and is tested against Node >=22.0.0"](https://www.npmjs.com/package/argon2) |
| **Clerk / WorkOS / Auth0** | managed | SDK + dashboard | hundreds | No | Yes | Massive overkill; external dependency + cost + data in third-party system for a single admin |

**Score for THIS project (single-admin, Next 14.2, Node 20, `node:sqlite` already adopted, pattern of `crypto.createCipheriv` already in repo, brand-consistent, low traffic, single replica):**

1. **Roll-your-own AEAD (matches `lib/confessions/crypto.ts`) — 9/10.** Pattern-consistent. Zero new deps. Zero native modules. Fits Node 20.
2. `iron-session` v8 — 7/10. Battle-tested, but adds a dep that does exactly what `crypto.createCipheriv` already does here.
3. `jose` raw AES-GCM — 6/10. Same primitives but adds a dep.
4. Everything else — ≤ 4/10.

---

## Recommended approach

### 1. Cookie format (signed + encrypted, AEAD)

Reuse the `lib/confessions/crypto.ts` envelope. Cookie payload is JSON `{ uid: "admin", iat: number, exp: number }`. Blob layout, base64url-encoded in a single cookie value:

```
v01.<iv_b64u>.<tag_b64u>.<ct_b64u>
```

- `v01` = version prefix (lets us rotate the envelope later without losing sessions).
- `iv` = 12 random bytes per cookie (`crypto.randomBytes(12)`).
- `tag` = 16 bytes from `cipher.getAuthTag()`.
- `ct` = `cipher.update(JSON.stringify(payload), "utf8") + cipher.final()`.
- Key = `Buffer.from(process.env.ADMIN_SESSION_SECRET, "base64")` (32 bytes, throws on boot if missing/wrong size — same pattern as `getEncryptionKey()` in confesionario).

Why AEAD and not HMAC-only: tampering protection AND confidentiality in one primitive; OWASP Authentication Cheat Sheet and OWASP Session Management Cheat Sheet both treat signed-and-encrypted session cookies as the default for "single shared secret" models.

### 2. Cookie flags (`__Host-` prefix, full set)

```
Set-Cookie: __Host-admin_session=v01.iv.tag.ct; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800
```

- **`__Host-` prefix**: mandated by RFC 6265bis to bind Secure + Path=/ + no Domain at the browser layer. OWASP recommends `__Host-` for session IDs explicitly.
- **`HttpOnly`**: required by OWASP; `document.cookie` cannot read it → XSS doesn't leak the session.
- **`Secure`**: required; sent only over HTTPS (Dokploy already terminates TLS at Traefik).
- **`SameSite=Lax`** (NOT Strict): the admin UI lives at `marcosbarbosagroup.com/admin/*` but the login form is at `/login` — `Strict` would drop the cookie on a same-site top-level GET, which is fine here, but `Lax` is the safer pick if we ever deep-link into the admin from a brochure email (Calendly email, WhatsApp click). OWASP allows either; OWASP prefers Strict; we pick Lax because the application is brochure-driven and a one-off deep-link should not lose auth.
- **`Path=/`** + **no `Domain`**: required by `__Host-`; locks cookie to origin.
- **`Max-Age=28800`** = 8 hours idle. Pair with an absolute timeout of 14 days stored in the payload's `exp` (the payload is encrypted, so it cannot be tampered with). OWASP Session Management Cheat Sheet calls for both an idle timeout and an absolute timeout — we satisfy both.

Subdomain scope: because `crm.marcosbarbosagroup.com` is a separate origin (different registrable domain from `marcosbarbosagroup.com`'s perspective) and because the `__Host-` prefix forbids a `Domain` attribute, cookies will never leak to `crm.*` — this is the right outcome.

### 3. Password storage (env var, scrypt-derived hash)

Keep the env-var pattern. Hashing happens once at boot:

```ts
// lib/admin/password.ts
import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto"

const N = 16384, r = 8, p = 1, KEYLEN = 64, SALTLEN = 16

export function hashAdminPassword(plain: string): string {
  const salt = randomBytes(SALTLEN)
  const buf  = scryptSync(plain.normalize("NFKC"), salt, KEYLEN, { N, r, p })
  return `scrypt$N=${N},r=${r},p=${p$$${salt.toString("base64")}$${buf.toString("base64")}`
}

export function verifyAdminPassword(plain: string, stored: string): boolean {
  // parse stored, scrypt(plain, salt, ...), timingSafeEqual
}
```

The hash is **cached at module scope** (same singleton pattern as `getBoard()`) — re-scrypt per request would cost ~100 ms CPU at these parameters and serve no security purpose since `ADMIN_PASS` is the only source of truth. The plaintext password is **never logged, never kept in memory beyond boot**. The cached hash is what lives in the request path.

OWASP-recommended fallback for Argon2id when Argon2 isn't available is `scrypt` with N=2¹⁷/r=8/p=1. We pick the lighter N=2¹⁴ (single-admin, single-replica, no GPU attackers — total attacker budget is ~1 password guess per minute after rate limit), bringing hash cost to ~10–30 ms on the VPS.

Why not Argon2 (`argon2` npm): the package `requires Node ≥22.0.0` per its own README and would add a native `.node` module on top of the existing `node:sqlite` (built-in, no native module). `node:crypto.scryptSync` is built-in, zero native code, exactly the primitive OWASP recommends as the Argon2 fallback.

Why not store the hash in `board.db`: the env var is the source of truth today and is already encrypted at rest in Dokploy. Storing a hash gives a false sense of defense (an attacker who reads `board.db` is the same threat model as one who reads Dokploy env vars). Keep the env-var + per-boot hash pattern. (Open question — see §6.)

### 4. CSRF (free, via Next.js Server Actions)

Next.js 14 Server Actions are POST-only and the framework compares the `Origin` header to the `Host` (or `X-Forwarded-Host`) header — a cross-origin invocation is rejected before the action runs. This is per the Next.js security blog post:

> "All Server Actions can be invoked by plain `<form>`, which could open them up to CSRF attacks. Behind the scenes, Server Actions are always implemented using POST and only this HTTP method is allowed to invoke them. This alone prevents most CSRF vulnerabilities in modern browsers, particularly due to Same-Site cookies being the default. As an additional protection Server Actions in Next.js 14 also compares the `Origin` header to the `Host` header (or `X-Forwarded-Host`). If they don't match, the Action will be rejected."

The login form is implemented as a Server Action (`"use server"`), so CSRF is covered without an explicit token. OWASP Login-CSRF section lists the "login CSRF" attack as a concern specifically when the login form accepts arbitrary credentials — Server Action POST-only + Origin/Host check is sufficient for THIS app (single-tenant, no federated identity). For belt-and-suspenders we additionally:

- Set `Cache-Control: no-store` on `/login` and `/login/*` responses (prevents caching of the form or any error state).
- Redirect after successful login via `redirect()` (Server Action return) — never render authenticated content on the same response as the POST.

### 5. Brute-force protection

In-memory sliding-window rate limit on the login Server Action:

- Key: client IP (derived via `lib/http/client-ip.ts` if it exists, else `headers().get("x-forwarded-for")?.split(",")[0].trim()`).
- Bucket: 5 failed attempts per IP per 15 minutes; exponential back-off after the threshold (1 s → 2 s → 4 s → 8 s) per the confesionario's existing pattern at `lib/confessions/rate-limit.ts`.
- On the 6th attempt, return a single generic error ("Credenciales inválidas") — never differentiate "user not found" vs "wrong password" (OWASP Authentication Cheat Sheet).
- Constant-time compare: `crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(input))` — already implemented in `middleware.ts:13-18` as `equalFixed()`, but for password we use Node's `timingSafeEqual` directly (Buffer path).

In-memory store is acceptable because the deployment is single-replica (per the spec's PENDING §1). For multi-replica we'd swap to `@upstash/ratelimit` (Redis) — same recommendation as the ofrendas research document. Note this in the spec for the multi-replica migration path.

Captcha: overkill for a single-admin panel whose only credential is already gated by a 5/15min rate limit. The publication rate of a successful brute-force against a scrypt-hashed ~10-char password at 1 attempt/15min/IP is astronomical (years) — captcha adds friction without measurable benefit.

### 6. Logout + session invalidation

```ts
// app/admin/actions.ts
export async function adminLogout() {
  const c = await cookies()
  c.delete("__Host-admin_session")
  redirect("/login")
}
```

`c.delete()` issues a `Set-Cookie` with `Max-Age=0` matching the original name/path. The middleware must accept the cookie as "absent" (no fallthrough to Basic Auth).

To invalidate **all** sessions on password change: since the session key is `ADMIN_SESSION_SECRET` and the payload is opaque, rotating `ADMIN_SESSION_SECRET` in Dokploy invalidates every existing session atomically. Document this in `.env.example`. For per-user revocation (single admin only — non-applicable today) the spec would need a "issued-before" timestamp field.

### 7. UI pattern (brand-consistent)

Reuse the components already in `components/site/`. The login page is a Server Component that renders a brand-consistent form:

```
+--------------------------------------------------+
|  Los 1000 Socios · Panel           [theme toggle]|
|                                                  |
|  PANEL · v.1                                     |
|                                                  |
|  Acceso al                                       |
|  panel de gestión                  [serif italic]|
|                                                  |
|  Ingresá tus credenciales para revisar           |
|  búsquedas, postulaciones y confesionario.       |
|                                                  |
|  [ usuario ........................... ]        |
|  [ contraseña ......................... ]        |
|                                                  |
|  [ Entrar ]                                      |
|                                                  |
|  ¿Problemas para entrar?                         |
|  Escribinos a consultora.marcosbarbosa@gmail.com |
+--------------------------------------------------+
```

Concrete mapping:
- Outer wrapper = `components/site/content-page.tsx` `PageHero` with `eyebrow="Los 1000 Socios · Panel"`, `title="Acceso"`, `italic="al panel de gestión"`, `intro="Ingresá tus credenciales..."` (matches the existing brochure cadence).
- Form section = custom inline using `SectionShell` (`components/site/section-shell.tsx`) for max-width centering. **Do not** use `components/ui/button.tsx` raw — it inherits base-ui variants that look SaaS-template. Instead, mirror the existing `.btn-primary` / `.btn-secondary` classes already used in `page-hero.tsx:60`.
- Inputs: `bg-surface border border-hairline rounded-lg px-3 py-2 text-fg focus-visible:ring-2 focus-visible:ring-primary` (matches `admin/page.tsx:24`). `aria-invalid` + `ring-primary` on error.
- Mono micro-label `PANEL · v.1` uses `font-mono` (`JetBrains Mono` per theme) — same restrained editorial detail used in confesionario's date stamps.
- Theme toggle from `components/theme-toggle.tsx` in the top-right (matches the rest of the site).
- Error state: above the form, `role="alert"`, single sentence, no specific failure reason (defense against user-enumeration via timing or wording).
- Logo at top via `components/logo.tsx`.
- Forgot-password affordance: "Contactá al administrador" linking to `mailto:consultora.marcosbarbosa@gmail.com` (single-tenant — there is no self-service reset).

Accessibility:
- `htmlFor` / `id` pairing on every input.
- Submit button receives focus on `aria-describedby` error → page-level summary first, then per-field.
- Reduced motion respected (`MotionConfig reducedMotion="user"` already in `components/providers.tsx`).
- Form supports password-manager auto-fill: `autoComplete="username"` on the user input, `autoComplete="current-password"` on the password input. **This is also the standard mitigation against credential-stuffing (real password managers detect mismatched origins).**

### 8. Migration from Basic Auth (hard cut)

The admin UI is internal — there is no documented external consumer. The single-replica deploy and the brochure-only nature of `marcosbarbosagroup.com` make backward compatibility for `/api/admin/*` unnecessary. Steps:

1. Add the new module: `lib/admin/session.ts`, `lib/admin/password.ts`, `app/admin/login/page.tsx`, `app/admin/login-form.tsx`, `app/admin/actions.ts` (login/logout actions added next to the existing ones).
2. Rewrite `middleware.ts:1-60`:
   - Match `["/admin/:path*", "/api/admin/:path*"]` (unchanged).
   - Try to read + decrypt `__Host-admin_session`. If valid and not expired, `NextResponse.next()`.
   - For browser navigations to `/admin/*`: redirect to `/login?next=<path>` (preserve intended destination).
   - For `/api/admin/*`: return `401` with `WWW-Authenticate: Cookie realm="admin"`.
3. Update existing tests: any Playwright/curl script that authenticates with Basic must be updated to POST `/login` and store the cookie. There are no test fixtures in the repo today (the `package.json:scripts` has `check:routes`, `check:donations`, `check:board`, `check:confessions` but none for admin). Confirm with the user.
4. Deploy: a single PR can switch this on because `/login` and `/admin/*` are behind the same matcher — there is no in-between state where Basic would work and the new flow would not.

**Reject supporting both during transition**: dual-scheme middleware is an attack surface (header smuggling, downgrade attacks) and serves no internal-only use case.

---

## Rejected alternatives

1. **`iron-session` v9** — requires Node 22.13+. Repo is on Node 20 (EOL since 2026-04-30). Upgrading Node is out of scope for this feature; iron-session v8 is the workaround but adds a dep that duplicates the AEAD primitive already in `lib/confessions/crypto.ts`.
2. **`iron-session` v8** — battle-tested and featured in Next.js docs ([nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)), but introduces an extra package and a transitive dependency (`iron-webcrypto`). For a project that already has the exact AEAD primitive in-repo, the swap-in cost is higher than the win. Keep it as the recommendation if the team later wants session-cookie abstraction (e.g., for sharing between Next.js workers or moving to Edge runtime).
3. **`jose` raw** — used in the Next.js docs example for stateless sessions. Zero-dependency tree but the docs example demonstrates JWS-only (HS256), which leaks the payload. To replicate AEAD you'd build JWE manually — more code than reusing `crypto.createCipheriv`. Use only if we later need JWS/JWE for an OAuth handshake.
4. **`next-auth` / Auth.js** — the Auth.js docs currently show a banner "The Auth.js project is now part of Better Auth" with a "Migrate to Better Auth" link. The current trajectory is consolidation, not adoption. For multi-tenant OAuth flows it would shine; for single-admin basic credentials it is a 500+-line library to do 30 lines of work.
5. **Lucia** — **officially deprecated** by its maintainer as of July 2026 (per [pilcrowonpaper.com/blog/18](https://pilcrowonpaper.com/blog/18)). The replacement is a single-file snippet at `github.com/lucia-auth/lucia/tree/main/code/auth_session.ts` — but the project explicitly recommends against building new systems on it. Skip.
6. **Better-Auth** — modern, recommended by Auth.js's own docs, but is a multi-tenant, multi-feature framework (sessions, organizations, plugins, OAuth providers, admin plugin). For one credential pair it brings ~300 KB of code and an architecture designed for users you don't have. It uses scrypt by default with the same recommendation we're following ([Better Auth docs](https://www.better-auth.com/docs/authentication/email-password)).
7. **`argon2` npm** — OWASP's first choice for password hashing, but the package `requires Node ≥22.0.0` and ships a native `.node` module. The repo has already gone out of its way to avoid native modules (`lib/board/store.ts` uses `node:sqlite` built-in). Adding `argon2` reintroduces the exact class of risk `node:sqlite` was adopted to eliminate. Stay with `crypto.scryptSync`.
8. **HMAC-only cookie (`createHmac('sha256', ...)`)** — matches the style of `middleware.ts:7-18` today. Adequate for integrity (tampered `exp` would fail MAC) but does not provide confidentiality — the session ID itself is sensitive (a leaked valid session ID == full takeover) and OWASP recommends AEAD for this case. AEAD adds ~30 lines of code and zero deps.
9. **Clerk / WorkOS / Auth0** — managed SaaS. Adds external dependency, recurring cost, data residency question, and OAuth/SSO scope we don't need. Listed for completeness only.
10. **Captcha / account lockout** — overkill for single-admin. The cost of a 5-attempts-per-15min throttle on a scrypt-hashed credential already exceeds the cost of a successful breach.
11. **Persisting session state in `board.db`** — solves server-side revocation but adds: (a) a new SQLite table, (b) a DB roundtrip on every request, (c) WAL/SQLite concurrent-write consideration (currently the board store is one writer, but rate-limit check before the DB read would be wrong). For single-admin with one device, the AEAD stateless cookie is strictly less code and strictly less failure surface. Revisit if "log out all sessions" or "view active sessions" becomes a product requirement.

---

## Open questions for the user (decisions the spec will need)

1. **Password rotation story:** Is `ADMIN_PASS` rotated by editing Dokploy env + redeploy (current pattern), or do we want a self-service "change password" form in the admin UI? The latter requires the hash to live in `board.db` (so the env var is no longer the source of truth) and a `changePassword` Server Action. **Recommend: keep env var + redeploy** unless there is a concrete product need.
2. **Idle vs absolute timeout:** Proposed 8 h idle (`Max-Age=28800`) and 14 d absolute (encoded in payload `exp`). Confirm both — admin panels usually want "log out at end of day" semantics (8 h idle is correct), but if Marcos sometimes goes a month between sessions, 14 d absolute is right.
3. **Theme on `/login`:** `/login` is outside the existing `(site)` layout and not under `ThemeProvider` in `components/providers.tsx`. Two options: (a) wrap `/login` in the same `ThemeProvider` (heavier, but theme toggle visible); (b) render `/login` always in `light` mode (matches the editorial marketing aesthetic of the brand). The spec asks for a toggle on every page — option (a) is more consistent. Confirm.
4. **Forgot-password affordance:** Currently proposed as `mailto:consultora.marcosbarbosa@gmail.com`. Alternative: a magic-link flow (token emailed via the existing CRM infrastructure). Magic-link requires an email transport (Resend / nodemailer) — out of scope unless the user wants it.
5. **Login attempt log retention:** `safeLog("admin.login", { id, status })` is the minimum. Should we also persist to `board.db` for forensic review? Recommend **no** — logs only, no DB. Confirm.
6. **Brute-force policy:** 5/15min/IP is the recommendation. If Marcos has a flaky VPN that resets IPs, he might lock himself out. Alternatives: (a) 5/15min/IP + bypass list (`CONFESSIONS_IP_SALT` already exists — could host a `ADMIN_TRUSTED_IPS` env var); (b) 10/15min/IP (looser). Recommend (a) with `ADMIN_TRUSTED_IPS=""` default (Dokploy static IP of his home/office + mobile carrier range if known).
7. **Concurrent sessions:** Single admin, single device, single browser — recommend reject concurrent logins by comparing `iat` against a `lastSeen` column in `board.db` only if asked. Stateless cookies tolerate concurrent sessions by design; spec question is whether to forbid them.
8. **Test fixtures:** The PR should include an updated test (or a new `scripts/check-admin.ts`) that logs in via the form, hits `/admin`, and confirms the cookie is set. Confirm scope.
9. **`.env` gitignore:** The current `.gitignore` does not block `.env`/`.env.*` (only `.env*.local`) — flagged in the ofrendas research as a blocking fix. Adding `ADMIN_SESSION_SECRET` requires this fix in the same PR.
10. **Multi-replica future:** If/when Dokploy scales beyond 1 replica, in-memory rate limit becomes per-replica (defeats the purpose). Decision needed now: (a) accept this constraint and document it; (b) introduce `@upstash/ratelimit` (Redis) up front. Recommend (a) — adds zero scope.

---

## References (accessed 2026-09-12)

**OWASP**

- Password Storage Cheat Sheet (Argon2id recommended, scrypt fallback, bcrypt legacy): https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- Session Management Cheat Sheet (64 bits entropy, `__Host-` prefix, SameSite, idle + absolute timeout, renew on privilege change): https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- Cross-Site Request Forgery Prevention Cheat Sheet (SameSite as defense-in-depth, signed double-submit cookie, login CSRF): https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- NodeJS Security Cheat Sheet (brute-force via bouncer/express-brute/rate-limiter, cookie flags, helmet): https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html

**Next.js (primary, official)**

- "How to Think About Security in Next.js" — Server Actions CSRF protection (POST-only + Origin↔Host check), Data Access Layer pattern, taint APIs: https://nextjs.org/blog/security-nextjs-server-components-actions
- App Router Authentication Guide (recommended libs: `iron-session` and `jose`; example uses `jose` for stateless sessions; talks about Database Sessions): https://nextjs.org/docs/app/guides/authentication

**Node.js (primary, official)**

- `crypto.createCipheriv` (AES-256-GCM is `createCipheriv("aes-256-gcm", key, iv)`; returns `cipher.getAuthTag()`): https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options
- `crypto.scryptSync` (built-in, OWASP-recommended Argon2id fallback): https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback
- `crypto.timingSafeEqual` (constant-time Buffer compare): https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b
- `crypto.argon2Sync` (added in Node 22.x — exists, but Node 20 is current): https://nodejs.org/api/crypto.html#cryptoargon2syncalgorithm-parameters

**RFC / IETF (primary)**

- draft-ietf-httpbis-rfc6265bis-22 §4.1.3 Cookie Name Prefixes (`__Host-` requires Secure + Path=/ + no Domain): https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis

**Libraries (primary, official) and their status (2026)**

- iron-session v9.0.1 (featured in Next.js docs; v9 needs Node ≥22.13, v8 works on Node 20): https://github.com/vvo/iron-session and https://www.npmjs.com/package/iron-session
- `jose` v6.x (universal ESM, zero deps, RFC 7515/7516/7517/7518/7519 compliant): https://github.com/panva/jose
- `argon2` (node-argon2) v0.45.1 — requires Node ≥22.0.0, no musl prebuild guarantee historically, MIT, 1.7M weekly downloads: https://www.npmjs.com/package/argon2
- Auth.js (next-auth) — docs banner reads "The Auth.js project is now part of Better Auth" with "Migrate to Better Auth" CTA: https://authjs.dev/getting-started
- Better-Auth — modern, framework-agnostic; email/password auth uses scrypt by default; example swap to `@node-rs/argon2`: https://www.better-auth.com/docs/authentication/email-password
- **Lucia — DEPRECATED July 2026** by its maintainer ([pilcrowonpaper.com/blog/18](https://pilcrowonpaper.com/blog/18)); the website now only contains a single-file replacement snippet. Skip.

**Project context (read locally, not modified)**

- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/middleware.ts` — current Basic Auth scheme.
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/app/admin/{layout.tsx,page.tsx,actions.ts}` — current admin UI shape.
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/app/api/admin/{confessions,cv/[id],export}` — internal endpoints behind the matcher.
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/lib/board/store.ts` — `node:sqlite` singleton pattern.
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/lib/confessions/{crypto.ts,log.ts,rate-limit.ts}` — AEAD primitive, safeLog allowlist, brute-force throttle.
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/.env.example` — env var layout (`ADMIN_USER`, `ADMIN_PASS`, `CONFESSIONS_ENCRYPTION_KEY`, `CONFESSIONS_IP_SALT`).
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/config/theme.ts` — actual theme tokens (Fraunces / Outfit / JetBrains Mono / `#FE4100`).
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/{package.json,next.config.mjs}` — stack context (Next 14.2.35, standalone output, no auth lib today).
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/docs/spec.md` §2 (anti-generic principles), §11 (Dokploy deploy).
- `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/components/{site/{page-hero,content-page,section-shell}.tsx,theme-toggle.tsx,providers.tsx}` — UI patterns to mirror.
- Sibling research: `/Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup/docs/research/2026-09-11-pagos-stripe-mercadopago.md` and `…/2026-09-11-persistencia-ledger.md` — match format and depth.
