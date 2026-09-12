# Web Marcos Barbosa Group — marcosbarbosagroup.com

Portal paraguas de 7 verticales: Cuerpo de Cristo, Consultora, Servicios, Software, Legendarios, Los 1000 Socios y Formate.

Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion · Node 22 (Docker `standalone`) · Dokploy (Traefik SSL).
Dominante: `#FE4100` · Logo: `public/images/logo.svg` / favicon `app/icon.svg`.

## Edición rápida
- Estructura de las 7 verticales: `config/verticals.json` (+ `config/extra-routes.json`).
- Colores/tipografía/logo/agenda: `config/theme.ts`.
- Textos: inline en cada `page.tsx` (marcar lo inferido con `[VALIDAR]`).
- Contenido del sitio: `docs/superpowers/specs/` y `docs/superpowers/plans/`.

## Ofrendas (Mercado Pago + Transferencia)
Página: `/cuerpo-de-cristo/ofrenda` (monto libre + chips) y retorno `/cuerpo-de-cristo/ofrenda/gracias`.
Docs de diseño y research: `docs/superpowers/specs/2026-09-11-ofrendas-mercadopago-design.md`, `docs/research/`.

### Variables de entorno (Dokploy → Environment)
```
MP_ACCESS_TOKEN=          # Access Token de producción (Tus integraciones)
MP_WEBHOOK_SECRET=        # secreto del webhook (Tus integraciones → Webhooks)
MP_ENV=production         # o sandbox
NEXT_PUBLIC_SITE_URL=https://marcosbarbosagroup.com
DONATIONS_DATA_DIR=/app/data
NEXT_PUBLIC_TRANSFER_ALIAS=
NEXT_PUBLIC_TRANSFER_CVU=
NEXT_PUBLIC_TRANSFER_HOLDER=
```
Ver `.env.example`. Sin `MP_ACCESS_TOKEN`, el botón de Mercado Pago responde con un mensaje honesto (503) y queda disponible la transferencia.

### Dokploy (obligatorio para que persistan las ofrendas y los leads)
- Montar un **volumen persistente en `/app/data`** (Application → Advanced → Volumes).
- El contenedor corre como uid/gid **1001**; si el volumen queda `root`, hacer `chown -R 1001:1001` (por SSH o heredando del named volume). Si no, SQLite falla con `EACCES`.
- Dejar **replicas = 1** (SQLite con `node:sqlite` es de un solo escritor).
- Configurar en Mercado Pago la **URL de notificación** `https://marcosbarbosagroup.com/api/webhooks/mercadopago`.

### Seguridad
- Solo redirect a checkout hospedado → PCI **SAQ A** (nunca se tocan datos de tarjeta).
- Webhook con firma HMAC validada (`WebhookSignatureValidator`, tolerancia 300 s).
- Ledger **idempotente** (dos claves: evento y pago) y verificación de monto server-side.
- `.env*` ignorado en git y en el build de Docker.

## Los 1000 Socios (bolsa de trabajo + postulaciones)
- Empresas publican búsquedas en `/1000-socios/bolsa-de-trabajo` y candidatos se postulan con CV en `/1000-socios/postulate`.
- Datos en SQLite `data/board.db` (tablas `job_posts`, `candidates`) y CVs en `data/cvs/` (privados, no servidos por URL).
- **Panel interno** en `/admin` protegido con Basic Auth (`ADMIN_USER` / `ADMIN_PASS`): lista búsquedas y candidatos, descarga el CV y cambia estado. Export en `/api/admin/export?type=jobs|candidates&format=csv|json` (para migrar a un CRM).
- Cuando se elija el CRM nuevo, se sincroniza desde `lib/board/store.ts` (interfaz `BoardStore`) sin tocar los formularios.

## Comandos```
npm run dev
npm run build
npm run lint
npm run check:routes       # verifica que exista page.tsx para cada ruta
npm run check:donations    # tests de montos, firma y ledger (node:sqlite)
```

## Deploy
Repo → Dokploy `producción` → Application (Dockerfile) → marcosbarbosagroup.com (Traefik SSL).
CRM de leads: `crm.marcosbarbosagroup.com` vía `/api/lead`.

## Generar claves del Confesionario

> ⚠ **Crítico**: estas claves son **irrecuperables** si se pierden — los mensajes cifrados no se podrán descifrar. Backupear en bóveda cifrada (1Password / Bitwarden) **fuera** del volumen persistente.

```
# Clave de cifrado AES-256-GCM (32 bytes base64)
openssl rand -base64 32

# Salt para hash de IP (16 bytes hex)
openssl rand -hex 16
```

Setear en Dokploy → Variables. **Nunca** commitear valores reales al repo. Sin clave configurada, el endpoint público responde 503 y la pestaña `/admin?tab=confesionario` muestra un banner persistente.

## Generar claves del Pastor Login

> ⚠ Crítico: estas claves dan acceso al panel interno. Backupear en bóveda cifrada (1Password / Bitwarden) **fuera** del volumen persistente.

```
# Clave de cifrado de sesión AES-256-GCM (32 bytes base64)
openssl rand -base64 32
```

Setear en Dokploy → Variables como `ADMIN_SESSION_KEY`. La contraseña del pastor se setea como `ADMIN_PASS` (16+ chars recomendados). Sin estas dos configuradas, el login devuelve error explícito y la app no arranca.

El username (`ADMIN_USER`) es solo decorativo en el form — el login verifica solo por password. Default `"admin"`.
