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

## Comandos
```
npm run dev
npm run build
npm run lint
npm run check:routes       # verifica que exista page.tsx para cada ruta
npm run check:donations    # tests de montos, firma y ledger (node:sqlite)
```

## Deploy
Repo → Dokploy `producción` → Application (Dockerfile) → marcosbarbosagroup.com (Traefik SSL).
CRM de leads: `crm.marcosbarbosagroup.com` vía `/api/lead`.
