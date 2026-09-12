# Pendientes — marcosbarbosagroup.com

Actualizado: 2026-09-12 · Estado del repo: `main`

## Hecho

- **Portal 7 verticales**: Cuerpo de Cristo, Consultora, Servicios, Software, Legendarios, Los 1000 Socios, Formate. Nav con dropdowns, drawer mobile, sub-nav, breadcrumbs, footer, sitemap, redirects 301.
- **Logo MB real** en header, footer, founder y favicon (`app/icon.svg`).
- **Ofrendas** (`/cuerpo-de-cristo/ofrenda`): monto libre + chips, Mercado Pago Checkout Pro + transferencia, ledger idempotente (`node:sqlite`), webhook firmado, página de gracias. Código en `main`; **MP pendiente** (ver §2).
- **Bolsa de trabajo + Postulate** (`/1000-socios/...`): empresa publica búsqueda y candidato sube CV (archivo privado, magic-bytes, máx 5 MB, consentimiento). Store `data/board.db` + CVs en `data/cvs/`.
- **Panel interno `/pastor`** (login propio en `/pastor`, panel en `/pastor/inbox`, API en `/api/pastor/*`): cookie `__Host-pastor_session` AES-256-GCM, scrypt para password, idle 8h / absolute 14d. Sin links públicos.
- **Confesionario** (`/cuerpo-de-cristo/confesionario`): buzón cifrado AES-256-GCM con admin en pestaña confesionario del panel.
- **Env vars configuradas (Dokploy)**: `CONFESSIONS_ENCRYPTION_KEY`, `CONFESSIONS_IP_SALT`, `ADMIN_SESSION_KEY`, `ADMIN_PASS`, `ADMIN_USER`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CRM_URL`, `NEXT_PUBLIC_TRANSFER_ALIAS/CVU/HOLDER`, `DONATIONS_DATA_DIR`, `CRM_API_KEY`, `CRM_API_SECRET`.

## Pendientes (en orden de prioridad)

### 1. Dokploy — volumen persistente y panel (CRÍTICO) ⚠️

**Estado**: pendiente. Sin esto se pierden ofrendas, leads, búsquedas, CVs y confesiones en cada redeploy.

- Montar volumen persistente en **`/app/data`**; `chown -R 1001:1001`; **replicas = 1**.
- **Backup** del volumen (Dokploy Volume Backups / S3).
- **Sin esto**: todo SQLite (`board.db`, `donations.db`) es efímero.

### 2. Activar Mercado Pago — diferido por decisión de producto

**Estado**: documentado pero **NO se va a activar ahora**. Decisión del usuario. Reactivar cuando se abra cuenta MP.

**Vars conocidas (documentadas, listas para setear cuando se active)**:
- Dokploy: `MP_ACCESS_TOKEN` (de MP Dashboard → Credenciales de producción, empieza con `APP_USR-`), `MP_WEBHOOK_SECRET` (generar con `openssl rand -base64 32`), `MP_ENV=production`.
- En Mercado Pago Dashboard: registrar webhook URL `https://marcosbarbosagroup.com/api/webhooks/mercadopago` con eventos `payment` y el mismo secret.
- Stripe descartado hasta tener LLC en EE.UU. (Stripe Atlas ~USD 500 + compliance). ARQ (cuenta personal USDc) no habilita Stripe.

**Mientras tanto**: la opción "Transferencia" en `/cuerpo-de-cristo/ofrenda` funciona con las vars `NEXT_PUBLIC_TRANSFER_*` ya configuradas (alias/CVU/titular). Los visitantes pueden copiar los datos y transferir manualmente.

### 3. CRM nuevo

**Estado**: integración parcial. El endpoint `/api/lead` apunta a `${NEXT_PUBLIC_CRM_URL}/api/resource/CRM%20Lead` (estilo Frappe). Fallback a `/data/leads.jsonl` si CRM no responde.

- El CRM tiene que existir como servicio aparte (no parte de este repo). Hoy no está claro si está corriendo.
- Si se quiere reemplazar Frappe/Espo actual: definir nuevo CRM (decisión de producto), integrar búsquedas, candidatos, ofrendas y leads. Hay costura (`lib/board/store.ts`, interfaz `BoardStore`) y export `/api/pastor/export?type=jobs|candidates&format=csv|json`.

### 4. Contenido `[VALIDAR]` (~36 marcas en 19 páginas)

- **Servicios / Seguridad**: habilitaciones, documentación, valores, "sobre nosotros".
- **Legendarios**: fechas, sedes, líderes en Argentina, traslados.
- **Consultora**: casos de éxito reales, precios de Capacitaciones, catálogo de Recursos.
- **Formate**: fechas y sedes de próximas formaciones.
- **Ofrenda**: ya cubiertos con `NEXT_PUBLIC_TRANSFER_*`.

### 5. Confesionario (buzón privado) — ✅ implementado y activado 2026-09-12

- Spec: `docs/superpowers/specs/2026-09-12-confesionario-design.md`
- Plan: `docs/superpowers/plans/2026-09-12-confesionario.md`
- AES-256-GCM en reposo, rate-limit 5/h, honeypot, IP-hash, admin con pestaña, nota pastoral cifrada, doble confirmación de borrado.
- **Activado**: `CONFESSIONS_ENCRYPTION_KEY` y `CONFESSIONS_IP_SALT` configuradas en Dokploy.

### 6. Pastor Login (admin auth propio) — ✅ implementado y activado 2026-09-12

- Spec: `docs/superpowers/specs/2026-09-12-pastor-login-design.md`
- Plan: `docs/superpowers/plans/2026-09-12-pastor-login.md`
- AES-256-GCM session cookie con `__Host-` prefix, idle 8h / absolute 14d.
- scrypt para password con timing-safe compare.
- Rate-limit 5/15min/IP-hash.
- Hard cut desde Basic Auth. URL `/pastor` (login), `/pastor/inbox` (panel), `/api/pastor/*` (API).
- **Activado**: `ADMIN_SESSION_KEY`, `ADMIN_PASS`, `ADMIN_USER` configuradas en Dokploy.
- **Sin links públicos** a `/pastor`. Solo URL directa.
- **Smoke test manual**: https://marcosbarbosagroup.com/pastor → ingresar password → ver panel.

### 7. Recursos (tienda)

- Catálogo (libros/archivos/automatizaciones) + compra. Bloqueado por la activación de pagos (MP §2) y por el catálogo real.

## Referencias

- Specs: `docs/superpowers/specs/`
- Planes: `docs/superpowers/plans/`
- Research de pagos/persistencia: `docs/research/`
- Runbook de deploy y variables: `README.md`

## Cómo reactivar Mercado Pago (cuando se abra cuenta)

1. Crear cuenta MP Argentina (persona o empresa según volumen esperado).
2. MP Dashboard → Tus integraciones → Credenciales → copiar **Production Access Token** (no el de TEST).
3. Generar webhook secret: `openssl rand -base64 32` → guardar en bóveda.
4. MP Dashboard → Webhooks → Configurar: URL = `https://marcosbarbosagroup.com/api/webhooks/mercadopago`, eventos `payment`, secret = el del paso 3.
5. Dokploy → Variables → agregar `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_ENV=production`.
6. Redeploy.
7. Smoke test en `/cuerpo-de-cristo/ofrenda` con tarjeta de test MP `4509 9535 6623 3704`.