# Web Grupo Marcos Barbosa — Spec (Plan Completo)
**Fecha:** 2026-09-03
**Dominio:** `marcosbarbosagroup.com` + `crm.marcosbarbosagroup.com` + `dokploy.marcosbarbosagroup.com`
**VPS:** CX23 Nuremberg 2vCPU/4GB/40GB (Dokploy)
**Enfoque aprobado:** A — Firma Élite Editorial Táctica • Color dominante `#fe4100`
**Objetivo:** Híbrido C (conversión a Primera Reunión Estratégica + autoridad)
**Edición:** Todo vía Opencode (`config/theme.ts` + `content/*.mdx`)

---

## 1. Contexto (brochure)
Marcos Barbosa — Consultor de Líderes y Negocios, >15 años, ex Fuerzas Especiales Elite (G.O.A.T./E.T.E.R./G.E.-1). Posicionamiento: *Consultoría Estratégica Internacional — Estrategia, liderazgo y tecnología para empresas que buscan trascender*. 
4 pilares: Estrategia / Liderazgo / Automatización / Software-Páginas Web.
6 áreas: Dirección y Estrategia, Gestión y Operaciones, Liderazgo y Personas, Riesgos y Transformación, Comercial y Ventas, Gobierno y Escalamiento.
Metodología 6 pasos: 01 Diagnóstico → 02 Análisis → 03 Estrategia → 04 Implementación → 05 Seguimiento → 06 Escalamiento.
4 planes: Consultor Empresarial / Consejero Estratégico / Director Externo Estratégico / Director Corporativo (Advisory Board).
Conferencias: Motivación, Liderazgo, Trabajo en Equipo, Ventas.
CTA brochure: Primera Reunión Estratégica (diagnóstico para propuesta a medida) + módulos digitales.

Infra ya resuelta: DNS en DonWeb (A `2.28.121.92` para `@`, `www` CNAME, `crm`, `dokploy`), Dokploy healthy en `:3000`.

## 2. Principios de diseño (anti-genérico)
* No plantilla SaaS blanca con ilustraciones outline. Editorial táctico: serif display + grid asimétrico + fotografía documental.
* Un solo color dominante `#fe4100` usado con intención (CTAs, subrayados, progress, hover), no como fondo plano genérico.
* Jerarquía tipográfica fuerte, aire, bordes sutiles, sin sombras pesadas.
* Cada sección tiene propósito de conversión o prueba, nada decorativo.
* Modificable: todo color/logo/tipo/texto en `config/theme.ts` y `content/` — 1 archivo = rebrand.

## 3. Foto principal
`public/images/marcos-hero.jpg` — imagen provista (blazer azul, fondo mapa mundo punteado con nodos naranjas). Uso:
* Hero `/` recorte 4:5, sin fondo gris (se extrae o se integra con degradado `paper` → `ink` para que el mapa no compita).
* Sección `/sobre-marcos` a cuerpo completo.
* Variante `marcos-hero@2x.jpg` optimizada, `priority` LCP, `object-cover`, sin filtro gris.
* No se estira, no se recorta cara. Se usa con marco fino `#fe4100` 2px en hover y badge “15+ años • Fuerzas Especiales”.

## 4. Stack (dinámico, no estático)
* **Next.js 14 App Router (TS) + Tailwind CSS 4 + shadcn/ui + Radix**
* Contenido: **MDX + Content Collections** (`content/planes.mdx`, `content/metodologia.mdx`, etc.) — ISR 60s, sin CMS externo (ahorra 800MB en VPS)
* **Framer Motion** para motion con propósito (ver §7)
* **next/font** (Instrument Serif + Inter) con `display: swap`
* **API Route** `/api/lead` → POST a `crm.marcosbarbosagroup.com` (Espo/Frappe) + webhook WhatsApp
* **Docker** multistage (≈85MB) — deploy Dokploy `marcosbarbosagroup.com:80/443` vía Traefik, SSL Let’s Encrypt auto, healthcheck `/api/health`
* **next-sitemap**, `metadata` por ruta, OG images dinámicas

## 5. Sistema de diseño — tokens (`config/theme.ts`)
```ts
export const theme = {
  colors: {
    primary: "#fe4100", // dominante — CTAs, links, subrayados, focus, progress
    primaryHover: "#e03a00",
    ink: "#0F1115", // hero oscuro / footer
    inkSoft: "#1A1E26",
    paper: "#F5F3EF", // fondos claros
    paper2: "#FFFBF5",
    line: "#E7E5E4",
    muted: "#6B7280",
    navy: "#111827",
    success: "#0D7C66",
  },
  fonts: {
    display: "Instrument Serif", // h1/h2
    body: "Inter", // p/ui
  },
  logo: "/images/logo.svg", // cambias archivo y propaga
  radius: "14px",
} as const
```
Modificar `colors.primary` o `logo` y toda la web actualiza (proveedor Tailwind via CSS vars). Paleta secundaria deriva de #fe4100 con `color-mix`.

## 6. Mapa y contenido (híbrido)
* `/` **Home** — Hero conversión + 4 pilares + metodología preview + planes teaser + founder + CTA final
* `/metodologia` — Timeline 01-06 interactivo (Diagnóstico/Análisis/Estrategia/Implementación/Seguimiento/Escalamiento) con detalle, entregables, quote “La estrategia sin ejecución es solo una ilusión”
* `/planes` — Comparativa 4 planes con matriz (diagnóstico, acompañamiento, coaching, gobierno, expansión) + recomendado Plan 3, FAQs
* `/sobre-marcos` — Historia, fuerzas especiales → liderazgo, certificaciones, foto hero grande, timeline
* `/contacto` — Form + WhatsApp + calendly embed + mapa Córdoba + confianza
* Header sticky con progress #fe4100, footer con contacto brochure (+54 351 733 4040 / consultora.marcosbarbosa@gmail.com / redes)

## 7. Componentes clave (skills: frontend-design, design-taste-frontend, impeccable, animate)
* **Header** — transparente sobre hero → blanco al scroll, logo izquierda, nav centro, CTA `#fe4100` derecha, menú mobile drawer.
* **Hero Editorial** — grid 12 col: izq 7 copy (eyebrow “Consultoría Estratégica Internacional”, h1 2 líneas con subrayado #fe4100, sub, 2 CTAs, métricas “15+ años / +4 planes / Internacional”), der 5 foto Marcos con marco y nodos. Parallax sutil, no bouncy.
* **Pilares** — 4 cards asimétricas (Estrategia/Liderazgo/Automatización/Software) borde `line`, hover eleva 2px + borde #fe4100 izquierda.
* **Metodología** — barra horizontal drag (Embla) 01-06, active con número #fe4100 grande + línea progreso.
* **Planes** — tabla responsive: header sticky, filas hover, badge “Más elegido” Plan 3 con fondo #fe4100.
* **Founder** — foto + quote + 4 bullets Visión/Experiencia/Resultados/Compromiso (del brochure p02).
* **Form Lead** — validación Zod, envío `/api/lead`, estados, WhatsApp deep-link.

## 8. Motion con propósito (animate skill)
* Hero staggered 80ms, carta 0.6s `easeOut`.
* Scroll progress top 2px #fe4100.
* Hover CTAs scale 1.02, no spring agresivo.
* Respeto `prefers-reduced-motion`.
* Interrupciones limpias (layoutId para timeline).

## 9. Dinámico
* No es estático: ISR + API routes + búsqueda/filtro planes + form → CRM.
* Búsqueda `cmd+K` opcional para planes/metodología.
* OG dinámico por plan.

## 10. Integración CRM
`POST /api/lead` → `https://crm.marcosbarbosagroup.com/api/v1/Lead` (EspoCRM) con `firstName, lastName, email, phone, planInteres, mensaje`. Si falla, guarda en `/data/leads.jsonl` + alerta. Webhook opcional n8n.

## 11. Deploy Dokploy
* Repo `webmarcosbarbosagroup` → Dokploy `producción` → Service `web` tipo `Application` (Dockerfile) o `Compose`
* Dockerfile: `node:20-alpine` build → `node:20-alpine` runtime, `next start`
* Domain: `marcosbarbosagroup.com` + `www`, SSL auto, port 3000→80
* Env: `NEXT_PUBLIC_CRM_URL`, `NEXT_PUBLIC_WHATSAPP=5493517334040`
* Build time <90s, RAM ~250MB

## 12. No-genérico checklist
* [ ] Tipografía serif display, no Inter solo
* [ ] Paleta no es azul corporativo genérico — dominante #fe4100 con uso quirúrgico
* [ ] Fotografía real de Marcos, no Unsplash office
* [ ] Grid editorial, no 3 cards centradas iguales
* [ ] Microcopys del brochure reales, no lorem

## 13. SEO / Perf / A11y
* Performance 95+ Lighthouse, LCP <1.8s (hero priority), ISR
* Metadata, sitemap, robots, JSON-LD Organization + Person (Marcos)
* A11y: contraste #fe4100 sobre ink/paper verifica WCAG AA, focus ring #fe4100, labels, skip link

## 14. Estructura de carpetas
```
proyectos/webmarcosbarbosagroup/
├── app/(site)/page.tsx, metodologia/, planes/, sobre-marcos/, contacto/, api/lead/
├── components/{ui, hero, pillars, timeline, plans-table, founder, lead-form}
├── config/theme.ts
├── content/{home.mdx, planes.mdx, metodologia.mdx, founder.mdx}
├── public/images/{logo.svg, marcos-hero.jpg, og.jpg}
├── Dockerfile, docker-compose.yml
└── docs/spec.md (este)
```

## 15. Plan de implementación (siguiente fase: writing-plans)
Fase 1 — Scaffold + tokens + hero con foto (2h)
Fase 2 — Pilares + Metodología timeline (2h)
Fase 3 — Planes comparativa + Founder (2h)
Fase 4 — Form → CRM + deploy Dokploy (1.5h)
Fase 5 — Polish motion + SEO (1h)

---
Aprobado: Enfoque A + #fe4100 + foto principal hero.
