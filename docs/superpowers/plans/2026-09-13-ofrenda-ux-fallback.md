# Ofrenda UX Fallback — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuando MP no está configurado, el form de ofrenda debe mostrar transferencia como opción predeterminada con un banner informativo positivo, sin romper el flujo del visitante. Cuando MP está activo, comportamiento actual sin cambios.

**Architecture:** Server component detecta `isMpCheckoutReady()` y pasa `mpReady` como prop al client form. El client form usa la prop para: (a) elegir default, (b) renderizar radio MP disabled con nota inline, (c) mostrar banner positivo siempre visible. Si el POST a MP falla (503), onSubmit hace fallback automático a transferencia con focus al panel.

**Tech Stack:** Next.js 14.2.35 App Router · TypeScript · `lucide-react` (Info icon ya en uso) · sin librería nueva · Node 22.13+.

**Spec:** `docs/superpowers/specs/2026-09-13-ofrenda-ux-fallback.md` — toda decisión de copy/UX vive ahí.

## Global Constraints

- **Node 22.13+** (`--experimental-strip-types`).
- **Stack**: Next.js 14 App Router + TS + Tailwind. **Sin librería nueva**.
- **Patrón de tests**: `scripts/check-donations.ts` con `node --experimental-strip-types`. Helper `ok()`/`done()`/`fail()` igual que `check-confessions.ts` y `check-auth.ts`.
- **Sin cambios de env vars**. La detección usa `isMpCheckoutReady()` que ya existe en `lib/donations/mp.ts`.
- **Sin cambios de API routes**. La defensa en profundidad (503) sigue en `/api/donations/mercadopago`.
- **Commits**: imperativos en español, scoped. Ej: `feat(ofrenda): default method según isMpCheckoutReady()`.
- **Copy EXACTO del spec §3** — no inventar variantes.

---

## File Structure

**Modificar:**
- `app/cuerpo-de-cristo/ofrenda/page.tsx` — agregar import + prop pass
- `components/donations/offering-form.tsx` — prop, useState default, `defaultMethod` export, JSX condicional, fallback en onSubmit, ref para focus, remoción dev marker
- `scripts/check-donations.ts` — 2 tests nuevos

**Sin archivos nuevos. Sin migraciones. Sin cambios de env vars.**

**Responsabilidad por archivo**:
- `page.tsx` (server): detectar MP readiness, pasarlo como prop
- `offering-form.tsx` (client): toda la lógica de presentación
- `defaultMethod()`: función pura testeable, export top-level

---

## Interface Contracts

```ts
// components/donations/offering-form.tsx (nuevo export top-level)
export function defaultMethod(mpReady: boolean): "mercadopago" | "transferencia"

// components/donations/offering-form.tsx (prop actualizada)
export function OfferingForm({ mpReady }: { mpReady: boolean })

// app/cuerpo-de-cristo/ofrenda/page.tsx (uso)
<OfferingForm mpReady={isMpCheckoutReady()} />
```

---

## Task 1: Server-side detection + `defaultMethod` function

**Files:**
- Modify: `app/cuerpo-de-cristo/ofrenda/page.tsx`
- Modify: `components/donations/offering-form.tsx`

**Interfaces:**
- Produce: `defaultMethod(mpReady)` export (consumido por Task 3 tests + por Task 2 componente).
- Produce: `OfferingForm` acepta prop `mpReady`.

- [ ] **Step 1: Crear test del `defaultMethod` en `scripts/check-donations.ts`**

Localizar el final del archivo (antes del `done()` o al inicio, según estructura actual). Agregar:

```ts
import { defaultMethod } from "../components/donations/offering-form.ts"

ok("defaultMethod con MP listo → mercadopago", () => {
  assert.equal(defaultMethod(true), "mercadopago")
})
ok("defaultMethod sin MP → transferencia", () => {
  assert.equal(defaultMethod(false), "transferencia")
})
```

⚠ **Async wrapper**: scripts/check-donations.ts debe wrappear todos los `await ok(...)` y `await import(...)` en `async function main() { ... } main().catch(fail)`. Si el archivo todavía tiene top-level await (rompe con `--experimental-strip-types` por target: es5), ajustar primero.

- [ ] **Step 2: Ejecutar tests — deben FALLAR**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && npm run check:donations
```

Expected: FAIL `defaultMethod is not a function` o `Cannot find named export`.

- [ ] **Step 3: Agregar export `defaultMethod` y prop `mpReady` al form**

En `components/donations/offering-form.tsx`:

**Agregar al top-level** (después de los types, antes del componente):

```ts
export function defaultMethod(mpReady: boolean): "mercadopago" | "transferencia" {
  return mpReady ? "mercadopago" : "transferencia"
}
```

**Modificar la firma del componente**:

```ts
// Antes:
export function OfferingForm() {

// Después:
export function OfferingForm({ mpReady }: { mpReady: boolean }) {
```

**Modificar el useState inicial**:

```ts
// Antes:
const [method, setMethod] = useState<Method>("mercadopago")

// Después:
const [method, setMethod] = useState<Method>(defaultMethod(mpReady))
```

- [ ] **Step 4: Ejecutar tests — deben PASAR**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && npm run check:donations
```

Expected: 2 nuevos PASS (total: tests previos + 2). Si los tests previos del archivo ya no pasan por el refactor del useState, ajustar.

- [ ] **Step 5: Pasar `mpReady` desde el server component**

En `app/cuerpo-de-cristo/ofrenda/page.tsx`:

**Agregar import** (junto a los otros imports):

```ts
import { isMpCheckoutReady } from "@/lib/donations/mp"
```

**Modificar el uso del componente**:

```ts
// Antes:
<OfferingForm />

// Después:
<OfferingForm mpReady={isMpCheckoutReady()} />
```

- [ ] **Step 6: Verificar tipos**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && npx tsc --noEmit && npm run lint
```

Expected: 0 errores.

- [ ] **Step 7: Commit**

```bash
git add components/donations/offering-form.tsx app/cuerpo-de-cristo/ofrenda/page.tsx scripts/check-donations.ts
git commit -m "feat(ofrenda): default method según isMpCheckoutReady() + prop mpReady"
```

---

## Task 2: Render condicional (radio disabled + banner + subhead + dev marker removal)

**Files:**
- Modify: `components/donations/offering-form.tsx`

**Interfaces:**
- Consume: `mpReady` prop de Task 1.

- [ ] **Step 1: Agregar `Info` al import de `lucide-react`**

Localizar el import actual:
```ts
import { Check, Copy, Loader2, MessageCircle, ArrowRight } from "lucide-react"
```

Modificar:
```ts
import { Check, Copy, Info, Loader2, MessageCircle, ArrowRight } from "lucide-react"
```

- [ ] **Step 2: Agregar ref para focus al panel de transferencia**

Localizar la declaración de refs en el componente:
```ts
const attemptRef = useRef<string>("")
```

Agregar:
```ts
const transferCardRef = useRef<HTMLDivElement>(null)
```

- [ ] **Step 3: Renderizar banner siempre visible cuando `!mpReady`**

Localizar el inicio del `<form>` (después del opening `<form ...>`). Insertar:

```tsx
{!mpReady ? (
  <div
    role="note"
    aria-label="Información sobre métodos de ofrenda"
    className="rounded-xl border border-hairline bg-surface px-4 py-3 flex items-start gap-3"
  >
    <Info size={18} aria-hidden className="text-fg-muted mt-0.5 flex-shrink-0" />
    <p className="text-sm text-fg leading-relaxed">
      Tu ofrenda se transforma en obra. Elegí cómo querés colaborar.
    </p>
  </div>
) : null}
```

- [ ] **Step 4: Modificar el radio de Mercado Pago (disabled + nota inline)**

Localizar el bloque del radio "Mercado Pago" (el label que contiene `<input ... value="mercadopago" />`). Reemplazar el `<label>` completo con:

```tsx
<label
  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
    method === "mercadopago"
      ? "border-primary bg-primary/5"
      : !mpReady
      ? "border-hairline bg-surface opacity-60 cursor-not-allowed"
      : "border-hairline bg-surface hover:border-primary/40"
  }`}
>
  <input
    type="radio"
    name="metodo"
    className="sr-only"
    disabled={!mpReady}
    checked={method === "mercadopago"}
    onChange={() => setMethod("mercadopago")}
    aria-describedby={!mpReady ? "mp-not-ready" : undefined}
  />
  <span>
    <span className="block text-sm font-semibold text-fg">
      Mercado Pago
      {!mpReady && (
        <span className="text-fg-muted text-xs font-normal">
          {" "}— por ahora no disponible
        </span>
      )}
    </span>
    <span className="block text-xs text-fg-muted mt-1">
      Tarjeta, cuotas o efectivo en puntos de pago.
    </span>
    {!mpReady ? (
      <span id="mp-not-ready" className="sr-only">
        Por ahora ofrendá por transferencia.
      </span>
    ) : null}
  </span>
</label>
```

- [ ] **Step 5: Cambiar el subhead del panel de transferencia**

Localizar:
```tsx
<p className="text-sm font-semibold text-fg">Datos para transferir</p>
```

Reemplazar con:
```tsx
<p className="text-sm font-semibold text-fg">
  Hacé tu transferencia o depósito a nuestra cuenta:
</p>
```

- [ ] **Step 6: Adjuntar `ref={transferCardRef}` al panel de transferencia**

Localizar el `<div className="card-luxury rounded-2xl p-6 space-y-3">` que contiene "Datos para transferir" (ahora "Hacé tu transferencia…"). Modificar su opening tag:

```tsx
<div ref={transferCardRef} tabIndex={-1} className="card-luxury rounded-2xl p-6 space-y-3">
```

⚠ El `tabIndex={-1}` permite focus programático sin agregar tab order. Necesario para `transferCardRef.current?.focus()`.

- [ ] **Step 7: Remover dev marker `[VALIDAR]`**

Localizar el bloque:
```tsx
<p className="text-xs text-fg-muted">
  [VALIDAR] Completá el alias/CVU/titular reales en las variables de
  entorno para mostrarlos acá.
</p>
```

**Eliminarlo completo.**

- [ ] **Step 8: Verificar tipos + lint + tests**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && \
  npx tsc --noEmit && \
  npm run lint && \
  npm run check:donations
```

Expected: 0 errores, 2 nuevos tests PASS.

- [ ] **Step 9: Commit**

```bash
git add components/donations/offering-form.tsx
git commit -m "feat(ofrenda): radio MP disabled con nota, banner positivo, refactor subhead"
```

---

## Task 3: onSubmit fallback automático + tests + verificación final

**Files:**
- Modify: `components/donations/offering-form.tsx`

**Interfaces:**
- Consume: `transferCardRef` de Task 2.

- [ ] **Step 1: Modificar onSubmit para fallback en 5xx**

Localizar la función `onSubmit` actual. Localizar las dos branches que settean error:

```tsx
if (!res.ok || !data?.init_point) {
  setError(
    data?.error ||
      "No pudimos iniciar el pago. Probá de nuevo o usá transferencia."
  )
  setLoading(false)
  return
}
```

Y:

```tsx
} catch {
  setError("Error de red. Probá de nuevo.")
  setLoading(false)
}
```

Reemplazar la primera:

```tsx
if (!res.ok || !data?.init_point) {
  setError(
    data?.error ||
      "No pudimos iniciar el pago con Mercado Pago. Probá de nuevo en unos minutos o transferí directamente."
  )
  setMethod("transferencia")
  transferCardRef.current?.focus()
  setLoading(false)
  return
}
```

Reemplazar la segunda:

```tsx
} catch {
  setError("Sin conexión. Verificá tu red y probá de nuevo, o transferí directamente.")
  setMethod("transferencia")
  transferCardRef.current?.focus()
  setLoading(false)
}
```

⚠ **Naming de variables**: si el catch está dentro de un try y ya hay una `err` capturada, ajustar el `catch {}` a `catch (err) {}` si TS lo pide. Verificar con `npx tsc --noEmit` después.

- [ ] **Step 2: Verificar tipos**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && npx tsc --noEmit
```

Expected: 0 errores.

- [ ] **Step 3: Verificación completa**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && \
  npm run check:confessions && \
  npm run check:auth && \
  npm run check:donations && \
  npm run lint && \
  npx tsc --noEmit && \
  npm run build
```

Expected: todo exit 0. `check:donations` debe incluir los 2 tests nuevos (total según estado actual del archivo).

- [ ] **Step 4: Smoke test manual en build local**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && \
  CONFESSIONS_ENCRYPTION_KEY=$(openssl rand -base64 32) \
  CONFESSIONS_IP_SALT=$(openssl rand -hex 16) \
  ADMIN_SESSION_KEY=$(openssl rand -base64 32) \
  ADMIN_PASS=test1234567890 \
  NEXT_PUBLIC_TRANSFER_ALIAS=smoke.alias \
  NEXT_PUBLIC_TRANSFER_CVU=0000003100095829384758 \
  NEXT_PUBLIC_TRANSFER_HOLDER=Smoke Test \
  PORT=3001 \
  npm run build && PORT=3001 npm start &
SERVER_PID=$!
sleep 5

# 1. Status code de la página
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/cuerpo-de-cristo/ofrenda
# Expected: 200

# 2. Verificar que el banner está en el HTML
curl -s http://127.0.0.1:3001/cuerpo-de-cristo/ofrenda | grep -c "Tu ofrenda se transforma en obra"
# Expected: 1

# 3. Verificar que el radio MP está disabled
curl -s http://127.0.0.1:3001/cuerpo-de-cristo/ofrenda | grep -c "por ahora no disponible"
# Expected: >= 1

# 4. Verificar que NO hay dev marker [VALIDAR]
curl -s http://127.0.0.1:3001/cuerpo-de-cristo/ofrenda | grep -c "VALIDAR"
# Expected: 0

kill $SERVER_PID
```

Expected output:
- HTTP 200
- "Tu ofrenda se transforma en obra": 1
- "por ahora no disponible": >=1
- "VALIDAR": 0

- [ ] **Step 5: Commit**

```bash
git add components/donations/offering-form.tsx
git commit -m "feat(ofrenda): onSubmit fallback automático a transferencia + focus"
```

- [ ] **Step 6: Push**

```bash
cd /Users/joelpacheco/PROYECTOS/webmarcosbarbosagroup && git push origin main
```

- [ ] **Step 7: Verificación post-deploy**

Una vez Dokploy redeploya (~30s):

```bash
# 1. La página sigue sirviendo
curl -s -o /dev/null -w "%{http_code}\n" https://marcosbarbosagroup.com/cuerpo-de-cristo/ofrenda
# Expected: 200

# 2. Banner presente
curl -s https://marcosbarbosagroup.com/cuerpo-de-cristo/ofrenda | grep -c "Tu ofrenda se transforma en obra"
# Expected: 1
```

⚠ **Smoke E2E con Playwright** se hace en la fase siguiente (post-impl), no acá.

---

## Self-Review (checklist del autor)

**Cobertura del spec:**

| Sección del spec | Tasks que la cubren |
|---|---|
| §2 Decisiones de diseño | T1 (defaultMethod), T2 (radio + banner) |
| §3 UX propuesta — Estado A | Sin cambios (T1 + T3 mantienen comportamiento cuando mpReady=true) |
| §3 UX propuesta — Estado B | T1 (default), T2 (radio disabled + banner + subhead + dev marker removed) |
| §4.1 Server component | T1 step 5 |
| §4.2 Client form — prop | T1 step 3 |
| §4.2 JSX radio MP | T2 step 4 |
| §4.2 Banner | T2 step 3 |
| §4.2 Subhead transferencia | T2 step 5 |
| §4.2 Dev marker removal | T2 step 7 |
| §4.2 `defaultMethod` export | T1 step 3 |
| §4.2 onSubmit fallback | T3 step 1 |
| §4.2 Icon Info | T2 step 1 |
| §4.2 transferCardRef | T2 step 2 + step 6 |
| §5 Datos | Sin cambios (correcto) |
| §6 Tests | T1 (defaultMethod test), T3 (verificación completa) |
| §7 Seguridad | Sin cambios |
| §8 Edge cases | Cubiertos por T1 (defaultMethod), T3 (fallback) |

**Placeholder scan**: no hay TBD/TODO/"similar to"/etc. Cada step tiene código real.

**Type consistency**:
- `defaultMethod(mpReady: boolean): "mercadopago" | "transferencia"` — firma exacta en T1 step 3
- `OfferingForm({ mpReady }: { mpReady: boolean })` — firma exacta en T1 step 3
- `transferCardRef` creado en T2 step 2, usado en T3 step 1
- `Info` icon importado en T2 step 1
- `isMpCheckoutReady()` importado en T1 step 5

**Gap encontrado durante la review**: el spec dice "transferred to /api/donations/mercadopago" — el plan ya lo cubre en el onSubmit. Ningún gap.

**Decisión de scope**: el spec menciona que `isMpCheckoutReady()` retorna false si falta `MP_WEBHOOK_SECRET`. El plan ya usa esa función — no hardcodear otra lógica. ✅

---

## Execution Handoff

Plan completo guardado en `docs/superpowers/plans/2026-09-13-ofrenda-ux-fallback.md`. **3 tasks · ~12 steps · tiempo estimado 1-1.5 horas.**

Voy a ejecutar con subagentes (mismo workflow que confesionario + pastor login: audit → dispatch + discover → implement → E2E → re-audit → deliver).

Procedo con subagent-driven-development ahora.