# Ofrenda UX — Manejo elegante del método de pago

**Fecha:** 2026-09-13
**Ruta:** `/cuerpo-de-cristo/ofrenda`
**Stack:** Next.js 14.2.35 · TypeScript · sin librería nueva
**Scope:** UX + onSubmit flow (sin lógica de negocio nueva) · ~50 líneas de código
**Estado:** diseño propuesto · pendiente revisión

---

## 1. Contexto

Hoy `/cuerpo-de-cristo/ofrenda` ofrece dos métodos: **Mercado Pago** (default) y **Transferencia**. Cuando MP no está configurado (estado actual, por decisión de producto diferida — ver `docs/PENDING.md §2`), el form defaultea a MP y el visitante recibe un 503 confuso al hacer submit.

El spec original proponía un banner apologético. **Reemplazado** tras research y feedback:

- **NN/g "Never hide unavailable options"**: nunca ocultar un método de pago deshabilitado — siempre mostrarlo disabled con nota honesta inline. Aplicado acá.
- **NN/g 2023 tone guide**: evitar tono apologético, evitar "humor que envejece", ofrecer remedy concreto. Aplicado: el banner no se disculpa, enmarca el transfer como opción válida.
- **Cáritas Argentina como referencia LATAM**: copy imperativo ("Hacé tu transferencia o depósito a nuestra cuenta"), datos bancarios completos en una sola card, WhatsApp como segundo canal.
- **Stripe Checkout patrón**: `payment_method_not_available` → "temporarily unavailable… try a different payment method". Adoptado para el catch del POST.

**Investigación completa**: `docs/research/2026-09-13-payment-ux-patterns.md`.

---

## 2. Decisiones de diseño

| Tema | Decisión |
|---|---|
| Detección de MP | Server-side via `isMpCheckoutReady()` (ya existe en `lib/donations/mp.ts:8`) |
| Renderizado del radio MP cuando no configurado | **Visible, disabled**, con nota inline ("Por ahora no disponible — elegí transferencia") |
| Default method | `transferencia` si `!mpReady`, `mercadopago` si `mpReady` |
| Toggle entre métodos cuando MP no configurado | Solo transferencia seleccionable |
| Banner / nota visible | **Sí**, siempre visible cuando `!mpReady`. Copy **positivo**, no apologético. Tipo "info note" |
| Banner dismissible | No — siempre visible mientras `!mpReady` |
| Comportamiento al recibir 503 del POST | Switch method a `transferencia`, focus al panel de transferencia, mensaje claro |
| Cuando se active MP en el futuro | Redeploy con env vars → form vuelve a default MP automáticamente |
| Tests | Unit test nuevo para `defaultMethod()` (función pura) |

---

## 3. UX propuesta

### Estado A — MP configurado (futuro, post-activación)

Comportamiento actual, sin cambios:
- Default: **Mercado Pago**
- Ambos radios seleccionables
- Sin nota adicional

```
┌──────────────────────────────────────────────────────┐
│ Ofrendar ahora                                       │
│                                                      │
│ Elegí el monto                                        │
│ ○ $1.000 ○ $5.000 ○ $10.000 ○ $20.000 ○ $50.000  │
│ ○ Personalizado: $ [___]                            │
│                                                      │
│ Cómo querés ofrendar                                  │
│ ◉ Mercado Pago                                       │
│ ○ Transferencia                                       │
│                                                      │
│ Tu email (opcional, para el comprobante)              │
│ [tu@email.com]                                       │
│                                                      │
│ [ Ofrendar con Mercado Pago → ]                     │
└──────────────────────────────────────────────────────┘
```

### Estado B — MP NO configurado (estado actual)

Comportamiento nuevo:
- Default: **Transferencia** (automático)
- Radio MP visible pero disabled, con nota inline
- Banner siempre visible arriba del form con copy **positivo** sobre transferencia
- Panel de transferencia visible desde el inicio (no depende de toggle)
- Removido el dev marker `[VALIDAR]` (ya no aplica — datos reales configurados)

```
┌──────────────────────────────────────────────────────┐
│ Ofrendar ahora                                       │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ ℹ︎ Tu ofrenda se transforma en obra. Elegí     │ │
│ │ cómo querés colaborar.                          │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Elegí el monto                                        │
│ ○ $1.000 ○ $5.000 ○ $10.000 ○ $20.000 ○ $50.000  │
│ ○ Personalizado: $ [___]                            │
│                                                      │
│ Cómo querés ofrendar                                  │
│ ◯ Mercado Pago  (por ahora no disponible)            │
│ ◉ Transferencia                                       │
│                                                      │
│ ╔══════════════════════════════════════════════════╗ │
│ ║ Hacé tu transferencia o depósito a nuestra cuenta:║ │
│ ║ Titular: Marcos Barbosa                          ║ │
│ ║ Alias:    mbg.ofrendas.mp                         ║ │
│ ║ CVU:      0000003100095829384758                  ║ │
│ ║ [Copiar alias] [Avisar por WhatsApp]            ║ │
│ ╚══════════════════════════════════════════════════╝ │
└──────────────────────────────────────────────────────┘
```

**Cambios vs versión anterior del spec:**
- ✅ Banner con copy **positivo** ("Tu ofrenda se transforma en obra") — no apologético
- ✅ Radio MP **visible, no oculto** (NN/g: nunca hide unavailable)
- ✅ Radio MP disabled con nota corta ("por ahora no disponible")
- ✅ Sin "Próximamente" — copy concreto
- ✅ Dev marker `[VALIDAR]` removido del form de producción
- ✅ Subhead de transferencia cambiado a imperativo Cáritas ("Hacé tu transferencia…")
- ✅ Banner siempre visible (no dismissible)

---

## 4. Cambios técnicos

### 4.1 Server component `app/cuerpo-de-cristo/ofrenda/page.tsx`

```tsx
import { isMpCheckoutReady } from "@/lib/donations/mp"
// ...
export default function Page() {
  const mpReady = isMpCheckoutReady()
  // ...
  <OfferingForm mpReady={mpReady} />
}
```

### 4.2 Client component `components/donations/offering-form.tsx`

**Agregar prop:**

```tsx
export function OfferingForm({ mpReady }: { mpReady: boolean }) {
  // ...
  const [method, setMethod] = useState<Method>(
    mpReady ? "mercadopago" : "transferencia"
  )
  // ...
}
```

**Extraer función pura testeable** (top-level export):

```tsx
export function defaultMethod(mpReady: boolean): Method {
  return mpReady ? "mercadopago" : "transferencia"
}
```

**Cambio en el JSX del método selector:**

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
      Mercado Pago {!mpReady && <span className="text-fg-muted text-xs font-normal">— por ahora no disponible</span>}
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

**Banner siempre visible cuando !mpReady** (nuevo bloque, arriba del fieldset de monto):

```tsx
{!mpReady ? (
  <div
    role="note"
    className="rounded-xl border border-hairline bg-surface px-4 py-3 flex items-start gap-3"
  >
    <Info size={18} aria-hidden className="text-fg-muted mt-0.5 flex-shrink-0" />
    <p className="text-sm text-fg leading-relaxed">
      Tu ofrenda se transforma en obra. Elegí cómo querés colaborar.
    </p>
  </div>
) : null}
```

**Cambio en subhead del panel de transferencia:**

```tsx
// Antes:
<p className="text-sm font-semibold text-fg">Datos para transferir</p>

// Después:
<p className="text-sm font-semibold text-fg">
  Hacé tu transferencia o depósito a nuestra cuenta:
</p>
```

**Remover dev marker:**

```tsx
// Eliminar este bloque:
<p className="text-xs text-fg-muted">
  [VALIDAR] Completá el alias/CVU/titular reales en las variables de
  entorno para mostrarlos acá.
</p>
```

**Endurecer onSubmit cuando MP está configurado pero el POST falla** (Stripe-style fallback):

```tsx
async function onSubmit(e: React.FormEvent) {
  e.preventDefault()
  setError(null)

  if (!amountReady) {
    setError(`Elegí un monto o ingresá uno mayor o igual a ${fmt(MIN)}.`)
    return
  }

  if (method === "transferencia") return

  if (!attemptRef.current) attemptRef.current = crypto.randomUUID()
  setLoading(true)
  try {
    const res = await fetch("/api/donations/mercadopago", { /* ... */ })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.init_point) {
      // Stripe pattern: name the provider, offer remedy
      setError(
        data?.error ||
          "No pudimos iniciar el pago con Mercado Pago. Probá de nuevo en unos minutos o transferí directamente."
      )
      // Switch to transferencia + focus the transfer card
      setMethod("transferencia")
      transferCardRef.current?.focus()
      setLoading(false)
      return
    }
    window.location.assign(data.init_point as string)
  } catch {
    setError("Sin conexión. Verificá tu red y probá de nuevo, o transferí directamente.")
    setMethod("transferencia")
    transferCardRef.current?.focus()
    setLoading(false)
  }
}
```

### 4.3 Defensa en profundidad (mantener)

`/api/donations/mercadopago` route handler **sigue retornando 503** si `MP_ACCESS_TOKEN` falta. Cubre race conditions entre deploys.

### 4.4 Icono nuevo

Agregar `Info` al import de `lucide-react` (ya usado en el form).

---

## 5. Modelo de datos (sin cambios)

Sin schema nuevo. Sin migraciones. Sin nuevos endpoints.

**Único cambio de estado del cliente**: `method` default cambia cuando `mpReady === false`.

---

## 6. Tests

### 6.1 Unit test nuevo

`scripts/check-donations.ts` — agregar:

```ts
import { defaultMethod } from "../components/donations/offering-form.ts"

ok("defaultMethod con MP listo → mercadopago", () => {
  assert.equal(defaultMethod(true), "mercadopago")
})
ok("defaultMethod sin MP → transferencia", () => {
  assert.equal(defaultMethod(false), "transferencia")
})
```

### 6.2 Smoke test manual

1. **Sin MP configurado** (estado actual):
 - `npm start` con Dokploy (sin MP_ACCESS_TOKEN)
 - Visitar `https://marcosbarbosagroup.com/cuerpo-de-cristo/ofrenda`
 - ✅ Banner siempre visible con copy positivo ("Tu ofrenda se transforma en obra…")
 - ✅ Default seleccionado: Transferencia
 - ✅ Radio MP disabled, con nota inline "por ahora no disponible"
 - ✅ Panel de transferencia visible con alias/CVU/titular reales
 - ✅ Sin dev marker `[VALIDAR]` en producción

2. **Submit fallido de MP** (test opcional, requiere MP configurado + luego roto):
 - Click en Mercado Pago → submit → 503
 - ✅ Error region visible con `AlertCircle` icon
 - ✅ Method switch automático a transferencia
 - ✅ Focus salta al panel de transferencia

### 6.3 Pre-PR gate (sin cambios)

```bash
npm run check:confessions && npm run check:auth && npm run check:donations && npm run lint && npx tsc --noEmit && npm run build
```

---

## 7. Seguridad / privacidad

Sin cambios. El form ya:
- No loguea datos sensibles
- Tiene rate-limit (10/min/IP) en `/api/donations/mercadopago`

**Mejora sutil**: cuando se hace fallback a transferencia por error de MP, **no se persiste ningún dato del intento fallido**. Solo se cambia el método del cliente.

---

## 8. Edge cases

| Caso | Comportamiento esperado |
|---|---|
| `MP_ACCESS_TOKEN` set pero `MP_WEBHOOK_SECRET` no | `isMpCheckoutReady()` retorna `false` → Estado B |
| Visita con JS deshabilitado | Server component decide default. Sin JS: ve Transferencia (más seguro) |
| MP configurado pero falla en runtime (token revocado) | onSubmit recibe 5xx → switch a transferencia + focus + mensaje con provider name |
| Transfer vars vacías | Form muestra "Escribinos por WhatsApp y te pasamos los datos" (comportamiento actual) |
| Usuario cambia de opinión y refresca | Estado A: default MP. Estado B: default Transferencia. Refresco refleja el default actual. |

---

## 9. Deploy

| Paso | Acción |
|---|---|
| 1 | Merge del PR |
| 2 | Redeploy en Dokploy (no requiere cambio de env vars) |
| 3 | Smoke test manual sin MP configurado |
| 4 | Cuando se active MP: setear vars + redeploy + smoke test con MP |

**Down-time**: cero. Cambios UX-only, sin tocar lógica de negocio.

---

## 10. Documentación a actualizar

| Archivo | Cambio |
|---|---|
| `docs/PENDING.md` §2 | Cuando se implemente, agregar nota "UX fallback implementado: MP radio disabled con nota inline, banner positivo siempre visible mientras MP no esté activo" |
| `docs/research/2026-09-13-payment-ux-patterns.md` | (ya creado) — referenciar desde `docs/spec.md` §11 si aplica |

---

## 11. Fuera de alcance

- Detección en runtime de fallos de MP (token revocado) — el handler ya retorna 503, onSubmit maneja
- Email de confirmación al visitante por transferencia (manual vía WhatsApp)
- Métricas / analytics de cuántos intentan MP antes de cambiar a transferencia
- Múltiples providers de pago (Stripe, etc.)
- Auto-detección via fetch al endpoint de MP
- Cambio de copy del dev marker en otras páginas (foco solo en ofrenda)

---

## 12. Costo de implementación

| Item | Estimación |
|---|---|
| Server component: 1 import + 1 prop | 2 min |
| Client form: prop + useState + `defaultMethod` export | 10 min |
| JSX radio MP disabled con nota inline | 15 min |
| Banner siempre visible con icono Info | 10 min |
| Cambio subhead transferencia | 2 min |
| Remover dev marker | 1 min |
| onSubmit con fallback a transferencia | 15 min |
| Unit test `defaultMethod` | 5 min |
| Verificación completa | 10 min |
| **Total** | **~1 hora 10 min** |

---

## 13. Archivos a modificar

- Modify: `app/cuerpo-de-cristo/ofrenda/page.tsx` (1 import, 1 prop)
- Modify: `components/donations/offering-form.tsx` (prop, useState, JSX radio, banner, subhead, fallback, dev marker removal, icon import, ref for focus)
- Modify: `scripts/check-donations.ts` (2 tests nuevos)

**Sin archivos nuevos. Sin migraciones. Sin nueva env var.**

---

## 14. Plan de implementación (siguiente fase)

Si aprobás este spec, el plan sería:
- T1: agregar `mpReady` prop al server page, exportar `defaultMethod` del form
- T2: render condicional (radio MP disabled, banner siempre visible, subhead Cáritas, dev marker removal)
- T3: onSubmit con fallback automático + focus + ref
- T4: tests + verificación completa

Estimación: 4 tasks chicos, ~1.5 horas total.

---

## Anexo — Research citations

| Source | Used for |
|---|---|
| NN/g "Offer constructive advice" | Tono del banner (no apologético) |
| NN/g 2023 error message guidelines | Catch message ("No pudimos iniciar el pago con Mercado Pago…") |
| Baymard payment UX research | "Never hide unavailable methods" |
| Stripe Checkout `payment_method_not_available` wording | "temporarily unavailable… try a different payment method" |
| Cáritas Argentina (caritas.org.ar) | Imperative copy + bank data card pattern |
| Shopify Polaris design system | Notice component pattern + accessible color/icon redundancy |
| Mercado Pago UX guide | Payment method presentation |

Investigación completa: `docs/research/2026-09-13-payment-ux-patterns.md`

---

**¿Aprobás el spec o querés ajustes?** En particular:
- ¿El copy del banner *"Tu ofrenda se transforma en obra. Elegí cómo querés colaborar."* te suena bien?
- ¿La nota inline del radio MP disabled *"— por ahora no disponible"* es el tono correcto?
- ¿El nuevo subhead de transferencia *"Hacé tu transferencia o depósito a nuestra cuenta:"* es el framing que querías?
- ¿El fallback automático al recibir 503 (switch + focus) te parece bien, o preferís que el usuario vea solo el error y elija manualmente?