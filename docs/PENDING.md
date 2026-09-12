# Pendientes — marcosbarbosagroup.com

Actualizado: 2026-09-12 · Estado del repo: `main`

## Hecho
- **Portal 7 verticales**: Cuerpo de Cristo, Consultora, Servicios, Software, Legendarios, Los 1000 Socios, Formate. Nav con dropdowns, drawer mobile, sub-nav, breadcrumbs, footer, sitemap, redirects 301.
- **Logo MB real** en header, footer, founder y favicon (`app/icon.svg`).
- **Ofrendas** (`/cuerpo-de-cristo/ofrenda`): monto libre + chips, Mercado Pago Checkout Pro + transferencia, ledger idempotente (`node:sqlite`), webhook firmado, página de gracias. Código en `main`; **falta activar credenciales** (ver pendientes).
- **Bolsa de trabajo + Postulate** (`/1000-socios/...`): empresa publica búsqueda y candidato sube CV (archivo privado, magic-bytes, máx 5 MB, consentimiento). Store `data/board.db` + CVs en `data/cvs/`.

## Pendientes (en orden de prioridad)

### 1. Dokploy — volumen persistente y panel (CRÍTICO)
- Montar volumen persistente en **`/app/data`**; `chown -R 1001:1001`; **replicas = 1**.
- **Backup** del volumen (Dokploy Volume Backups / S3).
- Variables: `ADMIN_USER`, `ADMIN_PASS`, `NEXT_PUBLIC_SITE_URL`.
- **Sin esto se borran ofrendas, leads, búsquedas y CVs en cada deploy.**

### 2. Activar Mercado Pago (cuando estén las cuentas)
- Dokploy: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_ENV`, `NEXT_PUBLIC_SITE_URL`.
- Datos de transferencia: `NEXT_PUBLIC_TRANSFER_ALIAS`, `NEXT_PUBLIC_TRANSFER_CVU`, `NEXT_PUBLIC_TRANSFER_HOLDER`.
- En Mercado Pago: URL de notificación `https://marcosbarbosagroup.com/api/webhooks/mercadopago`.
- **Stripe descartado** hasta tener entidad/LLC en EE.UU. (Stripe Atlas ~USD 500 + compliance). ARQ (cuenta personal USDc) no habilita Stripe.

### 3. CRM nuevo
- Definir el CRM (el Frappe actual se reemplaza por poco práctico) e integrar búsquedas, candidatos, ofrendas y leads.
- Ya hay costura (`lib/board/store.ts`, interfaz `BoardStore`) y **export** `/api/pastor/export?type=jobs|candidates&format=csv|json`.

### 4. Contenido `[VALIDAR]` (~36 marcas en 19 páginas)
- **Servicios / Seguridad**: habilitaciones, documentación, valores, "sobre nosotros".
- **Legendarios**: fechas, sedes, líderes en Argentina, traslados.
- **Consultora**: casos de éxito reales, precios de Capacitaciones, catálogo de Recursos.
- **Formate**: fechas y sedes de próximas formaciones.
- **Ofrenda**: alias/CVU/titular (hoy placeholders por env).

### 5. Confesionario (buzón privado) — ✅ implementado 2026-09-12
- Spec: `docs/superpowers/specs/2026-09-12-confesionario-design.md`
- Plan: `docs/superpowers/plans/2026-09-12-confesionario.md`
- AES-256-GCM en reposo, rate-limit 5/h, honeypot, IP-hash, admin con pestaña, nota pastoral cifrada, doble confirmación de borrado.
- **Activación pendiente**: setear `CONFESSIONS_ENCRYPTION_KEY` y `CONFESSIONS_IP_SALT` en Dokploy (ver §1 del README).

### 6. Pastor Login (admin auth propio) — ✅ implementado 2026-09-12
- Spec: `docs/superpowers/specs/2026-09-12-pastor-login-design.md`
- Plan: `docs/superpowers/plans/2026-09-12-pastor-login.md`
- AES-256-GCM session cookie con `__Host-` prefix, idle 8h / absolute 14d
- scrypt para password con timing-safe compare
- Rate-limit 5/15min/IP-hash
- Hard cut desde Basic Auth. URL `/pastor` (login), `/pastor/inbox` (panel), `/api/pastor/*` (API).
- **Activación pendiente**: setear `ADMIN_SESSION_KEY` y `ADMIN_PASS` en Dokploy (ver §1 del README).
- **Sin links públicos** a `/pastor`. Solo URL directa.

### 7. Recursos (tienda)
- Catálogo (libros/archivos/automatizaciones) + compra. Bloqueado por la activación de pagos y por el catálogo real.

## Referencias
- Specs: `docs/superpowers/specs/`
- Planes: `docs/superpowers/plans/`
- Research de pagos/persistencia: `docs/research/`
- Runbook de deploy y variables: `README.md`
