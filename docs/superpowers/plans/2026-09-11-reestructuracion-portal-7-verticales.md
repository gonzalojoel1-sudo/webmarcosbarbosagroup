# Reestructuración a portal paraguas de 7 verticales — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir marcosbarbosagroup.com de una web de consultoría en un portal paraguas de 7 verticales, con navegación completa, rutas anidadas y contenido real (marcado `[VALIDAR]` donde se infiere).

**Architecture:** Enfoque A — `config/verticals.json` es la fuente única de la estructura (7 verticales + hijos); `config/verticals.ts` le agrega íconos y helpers. Header, footer, home, sub-nav, breadcrumb y sitemap consumen ese config. Cada vertical es una carpeta de rutas Next.js; las páginas se arman con plantillas compartidas (`VerticalLanding`, `ContentPage`) + bloques (`Prose`, `BulletGrid`, `CtaBand`) para mantener los archivos chicos.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS 3 · Framer Motion · lucide-react · next-themes

**Spec:** `docs/superpowers/specs/2026-09-11-reestructuracion-portal-7-verticales-design.md`

## Global Constraints

- Un solo sistema y un solo acento: `#FE4100` (tokens en `config/theme.ts` y `app/globals.css`). No agregar colores ni tipografías nuevas.
- Copia editorial en español (voseo rioplatense, tono táctico actual: "sin humo", "sin improvisación").
- Todo dato inferido/inventado (fechas, precios, habilitaciones, datos legales, próximas fechas) se marca `[VALIDAR]`.
- Copy inline en cada `page.tsx`. Estructura solo en `config/`. Sin dependencias nuevas (no MDX, no test runners).
- No recolectar datos ni cobrar en Confesionario/Ofrenda/Bolsa/Postulate en esta etapa: página real + CTA a canal humano.
- Fuera de alcance: backend nuevo, MDX, acento por vertical, panel admin.
- Gate de verificación por tarea: `npm run lint` y `npm run build` (Next typechequea y compila todas las rutas), más QA manual de la ruta tocada.
- Commits frecuentes, mensajes en el estilo del repo (`feat:`, `refactor:`, `fix:`, `docs:`).

---

## File Structure

**Crear — config**
- `config/verticals.json` — datos puros: 7 verticales, hijos con label/slug/description.
- `config/extra-routes.json` — rutas que existen pero no son hijos de navegación (las 5 sub-rutas de Seguridad), para sitemap y verificador.
- `config/verticals.ts` — tipos, mapa de íconos, `verticals`, `allRoutes`, `getVertical`, `getVerticalBySlug`, `getVerticalForPath`.
- `scripts/check-routes.mjs` — verifica que cada slug tenga `app/<slug>/page.tsx`.

**Crear — componentes de sitio**
- `components/site/section-shell.tsx` — wrapper de sección.
- `components/site/breadcrumb.tsx` — migas.
- `components/site/page-hero.tsx` — hero unificado de páginas.
- `components/site/sub-nav.tsx` — tabs de hijos (client).
- `components/site/vertical-card.tsx` — card de acceso.
- `components/site/vertical-landing.tsx` — plantilla de índice de vertical.
- `components/site/content-page.tsx` — plantilla de sub-página.
- `components/site/blocks.tsx` — `Prose`, `BulletGrid`, `SectionHead`, `CtaBand`.
- `components/home/group-hero.tsx` — hero del portal.
- `components/home/verticals-grid.tsx` — grilla de las 7.

**Modificar**
- `components/layout/header.tsx` — 7 dropdowns + drawer acordeón.
- `components/layout/footer.tsx` — 4 columnas desde config.
- `app/page.tsx` — home paraguas.
- `app/sitemap.ts` — desde config.
- `next.config.mjs` — redirects 301.
- `components/methodology-preview.tsx` — link a `/consultora/metodologia`.
- `app/contacto/page.tsx` — links a `/consultora/metodologia` y `/consultora/planes`.
- `package.json` — script `check:routes`.

**Mover**
- `app/metodologia/page.tsx` → `app/consultora/metodologia/page.tsx`.
- `app/planes/page.tsx` → `app/consultora/planes/page.tsx`.

**Crear — páginas** (ver tareas 8–14)

---

### Task 1: Config de verticales + verificador de rutas

**Files:**
- Create: `config/verticals.json`
- Create: `config/verticals.ts`
- Create: `scripts/check-routes.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `verticals: Vertical[]`, `allRoutes: string[]`, `getVertical(id)`, `getVerticalBySlug(slug)`, `getVerticalForPath(path)`, tipos `Vertical`/`VerticalChild`. JSON fields: `id, label, title, slug, description, children[{label, slug, description}]`.

- [ ] **Step 1: Crear `config/verticals.json` y `config/extra-routes.json`**

`config/verticals.json`: el array de 7 verticales (contenido completo abajo).

`config/extra-routes.json`:
```json
[
  "/servicios/seguridad/fisica",
  "/servicios/seguridad/electronica",
  "/servicios/seguridad/ciberseguridad",
  "/servicios/seguridad/auditoria",
  "/servicios/seguridad/nosotros"
]
```

`config/verticals.json`:

```json
[
  {
    "id": "cuerpo-de-cristo",
    "label": "Cuerpo de Cristo",
    "title": "Cuerpo de Cristo",
    "slug": "/cuerpo-de-cristo",
    "description": "Fe que sirve. Consejería, ministerio, solidaridad y un lugar para soltar las cargas.",
    "children": [
      { "label": "Consejería Cristiana", "slug": "/cuerpo-de-cristo/consejeria-cristiana", "description": "Acompañamiento espiritual y consejo bíblico para personas, familias y matrimonios." },
      { "label": "Ministerio Empresarial", "slug": "/cuerpo-de-cristo/ministerio-empresarial", "description": "Fe y empresa en la misma mesa: principios bíblicos aplicados a la conducción." },
      { "label": "Confesionario", "slug": "/cuerpo-de-cristo/confesionario", "description": "Un lugar reservado para librarte de tus cargas, con total confidencialidad." },
      { "label": "Ofrenda", "slug": "/cuerpo-de-cristo/ofrenda", "description": "Sostené la obra de Dios. Ofrendá con alegría y propósito." },
      { "label": "Solidaridad", "slug": "/cuerpo-de-cristo/solidaridad", "description": "Obra social: visitamos familias, llevamos alimento y acompañamos." }
    ]
  },
  {
    "id": "consultora",
    "label": "Consultora",
    "title": "Consultora Estratégica",
    "slug": "/consultora",
    "description": "Estrategia, liderazgo y tecnología para empresas que buscan trascender.",
    "children": [
      { "label": "Metodología", "slug": "/consultora/metodologia", "description": "El método 01—06: de Diagnóstico a Escalamiento, sin improvisación." },
      { "label": "Planes", "slug": "/consultora/planes", "description": "Cuatro niveles de intervención, del Consultor al Board." },
      { "label": "Casos de Éxito", "slug": "/consultora/casos-de-exito", "description": "Empresas reales que ordenaron, ejecutaron y escalaron." },
      { "label": "Modelos de Negocio", "slug": "/consultora/modelos-de-negocio", "description": "Diseño y rediseño de modelos que sostienen el crecimiento." },
      { "label": "Capacitaciones", "slug": "/consultora/capacitaciones", "description": "Conducción y liderazgo, ventas, oratoria, PNL y gestión de emociones." },
      { "label": "Recursos", "slug": "/consultora/recursos", "description": "Libros, archivos y automatizaciones para tu empresa." }
    ]
  },
  {
    "id": "servicios",
    "label": "Servicios",
    "title": "Servicios",
    "slug": "/servicios",
    "description": "Seguridad integral y limpieza profesional para empresas y eventos.",
    "children": [
      { "label": "Seguridad", "slug": "/servicios/seguridad", "description": "Física, electrónica, ciber y auditoría. Cobertura integral." },
      { "label": "Limpieza", "slug": "/servicios/limpieza", "description": "Limpieza profesional para empresas, consorcios y eventos." }
    ]
  },
  {
    "id": "software",
    "label": "Software",
    "title": "Software y Aplicaciones",
    "slug": "/software",
    "description": "Software a medida para empresas: webs, CRMs, tableros y automatizaciones.",
    "children": []
  },
  {
    "id": "legendarios",
    "label": "Legendarios",
    "title": "Legendarios",
    "slug": "/legendarios",
    "description": "Un movimiento global de hombres que se levantan. Lo que está pasando en Argentina.",
    "children": [
      { "label": "Qué es Legendarios", "slug": "/legendarios/que-es", "description": "El movimiento global y su despliegue en Argentina." },
      { "label": "Próximas Fechas", "slug": "/legendarios/proximas-fechas", "description": "Encuentros, retiros y conferencias que vienen." },
      { "label": "Traslados", "slug": "/legendarios/traslados", "description": "Logística y traslados para llegar a cada encuentro." }
    ]
  },
  {
    "id": "1000-socios",
    "label": "1000 Socios",
    "title": "Los 1000 Socios",
    "slug": "/1000-socios",
    "description": "Una red de empresarios y talento. Oportunidades reales, conexiones reales.",
    "children": [
      { "label": "Bolsa de Trabajo", "slug": "/1000-socios/bolsa-de-trabajo", "description": "Empresas cargan sus búsquedas; nosotros hacemos la conexión." },
      { "label": "Postulate", "slug": "/1000-socios/postulate", "description": "Dejá tu CV y postulate a las oportunidades de la red." }
    ]
  },
  {
    "id": "formate",
    "label": "Formate",
    "title": "Formate con Nosotros",
    "slug": "/formate",
    "description": "Formación integral para personas que quieren crecer de verdad.",
    "children": [
      { "label": "Rompiendo Barreras", "slug": "/formate/rompiendo-barreras", "description": "Formación integral: hábitos, mentalidad, liderazgo y propósito." },
      { "label": "Próximas Formaciones", "slug": "/formate/proximas-formaciones", "description": "Fechas, sedes y cupos de las próximas camadas." }
    ]
  }
]
```

- [ ] **Step 2: Crear `config/verticals.ts`**

```ts
import type { LucideIcon } from "lucide-react"
import {
  Church,
  Compass,
  ShieldCheck,
  MonitorSmartphone,
  Flag,
  Handshake,
  GraduationCap,
} from "lucide-react"
import data from "./verticals.json"
import extraRoutes from "./extra-routes.json"

export type VerticalChild = {
  label: string
  slug: string
  description: string
}

export type Vertical = {
  id: string
  label: string
  title: string
  slug: string
  description: string
  icon: LucideIcon
  children: VerticalChild[]
  featured: boolean
}

const ICONS: Record<string, LucideIcon> = {
  "cuerpo-de-cristo": Church,
  consultora: Compass,
  servicios: ShieldCheck,
  software: MonitorSmartphone,
  legendarios: Flag,
  "1000-socios": Handshake,
  formate: GraduationCap,
}

export const verticals: Vertical[] = data.map((v) => ({
  ...v,
  icon: ICONS[v.id] ?? Compass,
  featured: v.id === "consultora",
}))

export const allRoutes: string[] = [
  "/",
  ...verticals.flatMap((v) => [v.slug, ...v.children.map((c) => c.slug)]),
  ...extraRoutes,
  "/contacto",
  "/sobre-marcos",
  "/privacidad",
  "/terminos",
]

export function getVertical(id: string): Vertical | undefined {
  return verticals.find((v) => v.id === id)
}

export function getVerticalBySlug(slug: string): Vertical | undefined {
  return verticals.find((v) => v.slug === slug)
}

export function getVerticalForPath(path: string): Vertical | undefined {
  return verticals.find((v) => path === v.slug || path.startsWith(v.slug + "/"))
}
```

- [ ] **Step 3: Crear `scripts/check-routes.mjs`**

```js
import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const verticals = JSON.parse(
  readFileSync(join(root, "config", "verticals.json"), "utf8")
)
const extraRoutes = JSON.parse(
  readFileSync(join(root, "config", "extra-routes.json"), "utf8")
)

const routes = [
  ...verticals.flatMap((v) => [v.slug, ...v.children.map((c) => c.slug)]),
  ...extraRoutes,
]

const extra = ["/contacto", "/sobre-marcos", "/privacidad", "/terminos"]
const missing = []

for (const slug of [...routes, ...extra]) {
  const page = join(root, "app", `${slug}/page.tsx`)
  if (!existsSync(page)) missing.push(page.replace(root + "/", ""))
}

const seen = new Set()
const dupes = routes.filter((s) => (seen.has(s) ? true : (seen.add(s), false)))

if (missing.length || dupes.length) {
  if (missing.length) console.error("Faltan páginas:\n" + missing.join("\n"))
  if (dupes.length) console.error("Slugs duplicados:\n" + dupes.join("\n"))
  process.exit(1)
}
console.log(`OK: ${routes.length + extra.length} rutas con page.tsx`)
```

- [ ] **Step 4: Agregar script a `package.json`**

En `"scripts"`, agregar después de `"lint"`:

```json
"check:routes": "node scripts/check-routes.mjs"
```

- [ ] **Step 5: Verificar (todavía faltan páginas, debe fallar listando lo que falta)**

Run: `node scripts/check-routes.mjs`
Expected: FAIL con la lista de `app/**/page.tsx` faltantes. Es la línea base; se completa a lo largo del plan.

- [ ] **Step 6: Typecheck de la config**

Run: `npm run build`
Expected: PASS (los archivos nuevos compilan; las rutas nuevas aún no existen pero el build no las exige todavía).

- [ ] **Step 7: Commit**

```bash
git add config/verticals.json config/extra-routes.json config/verticals.ts scripts/check-routes.mjs package.json
git commit -m "feat(config): verticales del portal + verificador de rutas"
```

---

### Task 2: Bloques y shell de sección

**Files:**
- Create: `components/site/section-shell.tsx`
- Create: `components/site/blocks.tsx`

**Interfaces:**
- Produces: `SectionShell({ children, className?, id? })`, `Prose({ children })`, `BulletGrid({ items })`, `SectionHead({ kicker?, title, italic?, sub? })`, `CtaBand({ title, sub?, href?, label? })`.

- [ ] **Step 1: Crear `components/site/section-shell.tsx`**

```tsx
import type { ReactNode } from "react"

export function SectionShell({
  children,
  className = "",
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`py-16 md:py-24 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  )
}
```

- [ ] **Step 2: Crear `components/site/blocks.tsx`**

```tsx
import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SectionShell } from "./section-shell"

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-fg-muted leading-relaxed max-w-2xl [&_strong]:text-fg [&_strong]:font-medium">
      {children}
    </div>
  )
}

export function BulletGrid({
  items,
}: {
  items: { title: string; desc: string }[]
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.title} className="card-luxury rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden />
            <p className="text-sm font-semibold text-fg">{it.title}</p>
          </div>
          <p className="mt-2 text-sm text-fg-muted leading-relaxed">{it.desc}</p>
        </div>
      ))}
    </div>
  )
}

export function SectionHead({
  kicker,
  title,
  italic,
  sub,
}: {
  kicker?: string
  title: string
  italic?: string
  sub?: string
}) {
  return (
    <div className="max-w-2xl mb-10">
      {kicker ? (
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">
          {kicker}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight leading-tight text-fg">
        {title}
        {italic ? (
          <>
            {" "}
            <span className="italic text-primary">{italic}</span>
          </>
        ) : null}
      </h2>
      {sub ? <p className="mt-3 text-sm text-fg-muted leading-relaxed">{sub}</p> : null}
    </div>
  )
}

export function CtaBand({
  title,
  sub,
  href = "/contacto",
  label = "Agendar Reunión",
}: {
  title: string
  sub?: string
  href?: string
  label?: string
}) {
  return (
    <SectionShell>
      <div className="card-luxury card-accent rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl md:text-2xl tracking-tight text-fg">
            {title}
          </h3>
          {sub ? <p className="text-sm text-fg-muted mt-1.5">{sub}</p> : null}
        </div>
        <Link
          href={href}
          className="shrink-0 btn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
        >
          {label} <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </SectionShell>
  )
}
```

- [ ] **Step 3: Verificar**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/site/section-shell.tsx components/site/blocks.tsx
git commit -m "feat(site): shell de seccion y bloques reutilizables"
```

---

### Task 3: Breadcrumb, PageHero, SubNav

**Files:**
- Create: `components/site/breadcrumb.tsx`
- Create: `components/site/page-hero.tsx`
- Create: `components/site/sub-nav.tsx`

**Interfaces:**
- Consumes: `VerticalChild` de `@/config/verticals`.
- Produces: `Breadcrumb({ items })`, `PageHero({ eyebrow, title, italic?, intro, chips?, primary?, secondary?, breadcrumb? })`, `SubNav({ items })`.

- [ ] **Step 1: Crear `components/site/breadcrumb.tsx`**

```tsx
import Link from "next/link"

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[]
}) {
  return (
    <nav aria-label="Ruta de navegación" className="text-xs text-fg-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            {it.href ? (
              <Link href={it.href} className="hover:text-fg transition-colors">
                {it.label}
              </Link>
            ) : (
              <span className="text-fg">{it.label}</span>
            )}
            {i < items.length - 1 ? <span aria-hidden>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

- [ ] **Step 2: Crear `components/site/page-hero.tsx`**

```tsx
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Breadcrumb } from "./breadcrumb"

type CTA = { href: string; label: string }

export function PageHero({
  eyebrow,
  title,
  italic,
  intro,
  chips,
  primary,
  secondary,
  breadcrumb,
}: {
  eyebrow: string
  title: string
  italic?: string
  intro: string
  chips?: string[]
  primary?: CTA
  secondary?: CTA
  breadcrumb?: { label: string; href?: string }[]
}) {
  return (
    <section className="pt-32 md:pt-40 pb-12 border-b border-hairline bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
        <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted mt-4">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-fg max-w-3xl">
          {title}
          {italic ? (
            <>
              <br />
              <span className="italic text-primary">{italic}</span>
            </>
          ) : null}
        </h1>
        <p className="mt-5 text-fg-muted max-w-2xl leading-relaxed">{intro}</p>
        {chips && chips.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {chips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-fg"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
        {primary || secondary ? (
          <div className="mt-8 flex flex-wrap gap-4">
            {primary ? (
              <Link
                href={primary.href}
                className="btn-primary px-6 py-3 text-sm font-medium tracking-wide inline-flex items-center gap-2"
              >
                {primary.label} <ArrowRight size={16} aria-hidden />
              </Link>
            ) : null}
            {secondary ? (
              <Link
                href={secondary.href}
                className="btn-secondary px-6 py-3 text-sm font-medium tracking-wide inline-flex items-center gap-2"
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Crear `components/site/sub-nav.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { VerticalChild } from "@/config/verticals"

export function SubNav({ items }: { items: VerticalChild[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Secciones" className="border-b border-hairline bg-bg">
      <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto scroll-snap-x">
        {items.map((c) => {
          const active = pathname === c.slug
          return (
            <Link
              key={c.slug}
              href={c.slug}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 px-4 py-4 text-sm border-b-2 transition-colors ${
                active
                  ? "border-primary text-fg"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              {c.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Verificar**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/site/breadcrumb.tsx components/site/page-hero.tsx components/site/sub-nav.tsx
git commit -m "feat(site): breadcrumb, page hero y sub-nav"
```

---

### Task 4: VerticalCard, VerticalLanding, ContentPage

**Files:**
- Create: `components/site/vertical-card.tsx`
- Create: `components/site/vertical-landing.tsx`
- Create: `components/site/content-page.tsx`

**Interfaces:**
- Consumes: `Vertical`, `VerticalChild`, `SectionShell`, `PageHero`, `SubNav`, `Breadcrumb`.
- Produces: `VerticalCard({ title, description, href, icon, large? })`, `VerticalLanding({ vertical, title, italic?, intro, chips? })`, `ContentPage({ vertical, child, eyebrow, title, italic?, intro, chips?, cta?, children })`.

- [ ] **Step 1: Crear `components/site/vertical-card.tsx`**

```tsx
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"

export function VerticalCard({
  title,
  description,
  href,
  icon: Icon,
  large = false,
}: {
  title: string
  description: string
  href: string
  icon: LucideIcon
  large?: boolean
}) {
  return (
    <Link
      href={href}
      className={`card-luxury rounded-2xl ${large ? "p-8 md:p-10" : "p-7"} group flex flex-col`}
    >
      <span className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden />
      </span>
      <h3
        className={`mt-6 font-display tracking-tight text-fg ${
          large ? "text-2xl md:text-3xl" : "text-xl"
        }`}
      >
        {title}
      </h3>
      <p className="mt-2 text-fg-muted text-sm leading-relaxed">{description}</p>
      <span className="mt-auto pt-6 flex items-center gap-1.5 text-xs font-semibold text-fg-muted group-hover:text-primary transition-colors">
        <span className="h-px w-6 bg-primary" aria-hidden />
        Entrar
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
          aria-hidden
        />
      </span>
    </Link>
  )
}
```

- [ ] **Step 2: Crear `components/site/vertical-landing.tsx`**

```tsx
import type { ReactNode } from "react"
import type { Vertical } from "@/config/verticals"
import { PageHero } from "./page-hero"
import { SubNav } from "./sub-nav"
import { SectionShell } from "./section-shell"
import { VerticalCard } from "./vertical-card"

export function VerticalLanding({
  vertical,
  title,
  italic,
  intro,
  chips,
  children,
}: {
  vertical: Vertical
  title: string
  italic?: string
  intro: string
  chips?: string[]
  children?: ReactNode
}) {
  return (
    <main>
      <PageHero
        eyebrow={vertical.title}
        title={title}
        italic={italic}
        intro={intro}
        chips={chips}
        primary={{ href: "/contacto", label: "Agendar Reunión" }}
      />
      {vertical.children.length > 0 ? <SubNav items={vertical.children} /> : null}
      {vertical.children.length > 0 ? (
        <SectionShell>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vertical.children.map((c) => (
              <VerticalCard
                key={c.slug}
                title={c.label}
                description={c.description}
                href={c.slug}
                icon={vertical.icon}
              />
            ))}
          </div>
        </SectionShell>
      ) : null}
      {children}
    </main>
  )
}
```

- [ ] **Step 3: Crear `components/site/content-page.tsx`**

```tsx
import type { ReactNode } from "react"
import type { Vertical, VerticalChild } from "@/config/verticals"
import { PageHero } from "./page-hero"

export function ContentPage({
  vertical,
  child,
  eyebrow,
  title,
  italic,
  intro,
  chips,
  cta,
  children,
}: {
  vertical: Vertical
  child: VerticalChild
  eyebrow?: string
  title: string
  italic?: string
  intro: string
  chips?: string[]
  cta?: { href: string; label: string }
  children: ReactNode
}) {
  return (
    <main>
      <PageHero
        eyebrow={eyebrow ?? vertical.title}
        title={title}
        italic={italic}
        intro={intro}
        chips={chips}
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: vertical.label, href: vertical.slug },
          { label: child.label },
        ]}
        primary={cta}
      />
      {children}
    </main>
  )
}
```

- [ ] **Step 4: Verificar**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/site/vertical-card.tsx components/site/vertical-landing.tsx components/site/content-page.tsx
git commit -m "feat(site): card de vertical, landing y plantilla de contenido"
```

---

### Task 5: Header con 7 dropdowns + drawer acordeón

**Files:**
- Modify: `components/layout/header.tsx` (reescritura completa)

**Interfaces:**
- Consumes: `verticals` de `@/config/verticals`, `ThemeToggle`.
- Produces: `Header` (misma export que hoy; `app/layout.tsx` no cambia).

- [ ] **Step 1: Reescribir `components/layout/header.tsx`**

```tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useSpring } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { verticals } from "@/config/verticals"

export function Header() {
  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  })
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
    setOpenDropdown(null)
    setOpenAccordion(null)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null)
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const isActive = (slug: string) =>
    pathname === slug || pathname.startsWith(slug + "/")

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        className="absolute top-0 left-0 h-[2px] w-full bg-primary origin-left"
        style={{ scaleX: progress }}
        aria-hidden
      />
      <div
        className={`bg-white/60 dark:bg-[#0C0C0E]/70 backdrop-blur-[20px] backdrop-saturate-[1.8] border-b transition-colors duration-200 ${
          scrolled ? "border-hairline" : "border-transparent"
        }`}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            onClick={() => setOpen(false)}
          >
            <span className="w-8 h-8 rounded-lg border border-hairline bg-surface flex items-center justify-center font-display font-semibold text-[13px] tracking-wide text-fg">
              MB
            </span>
            <span className="text-sm font-medium tracking-tight text-fg">
              Marcos Barbosa
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Principal">
            {verticals.map((v) => {
              const active = isActive(v.slug)
              if (v.children.length === 0) {
                return (
                  <Link
                    key={v.id}
                    href={v.slug}
                    className={`text-sm transition-colors ${
                      active ? "text-primary" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    {v.label}
                  </Link>
                )
              }
              const ddOpen = openDropdown === v.id
              return (
                <div
                  key={v.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (closeTimer.current) clearTimeout(closeTimer.current)
                    setOpenDropdown(v.id)
                  }}
                  onMouseLeave={() => {
                    closeTimer.current = setTimeout(
                      () => setOpenDropdown((cur) => (cur === v.id ? null : cur)),
                      120
                    )
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={ddOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenDropdown((cur) => (cur === v.id ? null : v.id))}
                    className={`inline-flex items-center gap-1 text-sm transition-colors ${
                      active ? "text-primary" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    {v.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${ddOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {ddOpen ? (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[22rem]">
                      <div className="card-luxury rounded-2xl p-2 shadow-[0_24px_60px_-24px_rgba(12,12,14,0.35)]">
                        <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                          {v.title}
                        </p>
                        <ul className="py-1">
                          {v.children.map((c) => (
                            <li key={c.slug}>
                              <Link
                                href={c.slug}
                                className="block rounded-xl px-3 py-2 text-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={v.slug}
                          className="block rounded-xl px-3 py-2 text-sm font-medium text-primary hover:text-primary-hover"
                        >
                          Ver {v.label} →
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/contacto"
              className="btn-primary px-5 py-2 text-sm font-medium inline-flex items-center"
            >
              Agendar Reunión
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 -mr-2 text-fg"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden drawer-enter bg-white/95 dark:bg-[#0C0C0E]/95 backdrop-blur-[20px] border-b border-hairline max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 py-4">
            {verticals.map((v) => {
              const expanded = openAccordion === v.id
              return (
                <div key={v.id} className="border-b border-hairline last:border-b-0">
                  {v.children.length > 0 ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setOpenAccordion(expanded ? null : v.id)}
                        className="w-full flex items-center justify-between py-3 text-base text-fg"
                      >
                        <span className={isActive(v.slug) ? "text-primary" : ""}>
                          {v.title}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      </button>
                      {expanded ? (
                        <div className="pb-3 pl-2">
                          <Link
                            href={v.slug}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm font-medium text-primary"
                          >
                            Ver {v.label}
                          </Link>
                          {v.children.map((c) => (
                            <Link
                              key={c.slug}
                              href={c.slug}
                              onClick={() => setOpen(false)}
                              className="block py-2 text-sm text-fg-muted hover:text-fg"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <Link
                      href={v.slug}
                      onClick={() => setOpen(false)}
                      className="block py-3 text-base text-fg"
                    >
                      {v.title}
                    </Link>
                  )}
                </div>
              )
            })}
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="mt-5 btn-primary px-5 py-3 text-center text-sm font-medium block"
            >
              Agendar Reunión
            </Link>
            <div className="mt-4 pt-4 border-t border-hairline flex flex-col gap-2 text-sm text-fg-muted">
              <a
                href="https://wa.me/5493517334040"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg"
              >
                WhatsApp +54 9 351 733 4040
              </a>
              <a
                href="mailto:consultora.marcosbarbosa@gmail.com"
                className="hover:text-fg break-all"
              >
                consultora.marcosbarbosa@gmail.com
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: QA manual (dev)**

Run: `npm run dev`
Abrir `http://localhost:3000`. Verificar: 7 ítems en la barra; cada dropdown abre/cierra con hover, click y `Esc`; en <1024px aparece el botón de menú y los acordeones expanden sus hijos; el toggle de tema funciona; no hay overflow horizontal.

- [ ] **Step 4: Commit**

```bash
git add components/layout/header.tsx
git commit -m "feat(nav): header con dropdowns por vertical y drawer acordeon"
```

---

### Task 6: Footer de 4 columnas

**Files:**
- Modify: `components/layout/footer.tsx` (reescritura completa)

**Interfaces:**
- Consumes: `verticals`, `getVertical("consultora")`.

- [ ] **Step 1: Reescribir `components/layout/footer.tsx`**

```tsx
import Link from "next/link"
import { verticals, getVertical } from "@/config/verticals"

export function Footer() {
  const consultora = getVertical("consultora")

  return (
    <footer className="bg-[#0C0C0E] text-[#F2F0EB]/80 border-t border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center font-display font-semibold text-[13px] tracking-wide text-[#F2F0EB]">
                MB
              </span>
              <p className="text-sm font-semibold text-[#F2F0EB]">
                Marcos Barbosa Group
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#F2F0EB]/60">
              Fe, estrategia, servicio y tecnología. Siete frentes, una sola
              visión: que las personas y las empresas crezcan de verdad.
            </p>
            <Link
              href="/contacto"
              className="mt-6 inline-flex btn-primary px-5 py-2.5 text-sm font-medium"
            >
              Agendar Reunión
            </Link>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/50 mb-4">
              Verticales
            </p>
            <ul className="space-y-2.5 text-sm">
              {verticals.map((v) => (
                <li key={v.id}>
                  <Link
                    href={v.slug}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {v.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/50 mb-4">
              {consultora?.title ?? "Consultora"}
            </p>
            <ul className="space-y-2.5 text-sm">
              {consultora?.children.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.slug}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#F2F0EB]/50 mb-4">
              Contacto
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://wa.me/5493517334040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200"
                >
                  WhatsApp +54 9 351 733 4040
                </a>
              </li>
              <li>
                <a
                  href="mailto:consultora.marcosbarbosa@gmail.com"
                  className="hover:text-primary transition-colors duration-200 break-all"
                >
                  consultora.marcosbarbosa@gmail.com
                </a>
              </li>
              <li className="text-[#F2F0EB]/50">Córdoba, Argentina</li>
              <li>
                <Link
                  href="/sobre-marcos"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Sobre Marcos
                </Link>
              </li>
              <li className="flex gap-3 pt-1">
                <Link href="/privacidad" className="hover:text-primary transition-colors duration-200">
                  Privacidad
                </Link>
                <span className="text-[#F2F0EB]/30" aria-hidden>
                  ·
                </span>
                <Link href="/terminos" className="hover:text-primary transition-colors duration-200">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#F2F0EB]/60">
          <p>
            © {new Date().getFullYear()} Marcos Barbosa Group. Todos los derechos
            reservados.
          </p>
          <p>Córdoba · Internacional</p>
          <p className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" aria-hidden />
            Todos los sistemas operativos
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "feat(nav): footer de 4 columnas desde config de verticales"
```

---

### Task 7: Home portal paraguas

**Files:**
- Create: `components/home/group-hero.tsx`
- Create: `components/home/verticals-grid.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `verticals`, `VerticalCard`, `SectionHead`, `SectionShell`, `Founder`.
- Produces: `GroupHero`, `VerticalsGrid`.

- [ ] **Step 1: Crear `components/home/group-hero.tsx`**

```tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

const EASE = [0.23, 1, 0.32, 1] as const

const METRICS = [
  { value: "7", label: "Verticales" },
  { value: "15+", label: "Años de experiencia" },
  { value: "Internacional", label: "Latinoamérica y Europa" },
] as const

export function GroupHero() {
  const reduce = useReducedMotion()
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.05 } },
  }
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  }

  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-40 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[40rem] h-[40rem] translate-x-1/3 -translate-y-1/4"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--primary-rgb) / 0.06), transparent)",
        }}
      />
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-7"
        >
          <motion.p
            variants={item}
            className="text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            Marcos Barbosa Group
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-fg text-balance"
          >
            Fe, empresa, servicio y tecnología para{" "}
            <span className="italic text-primary">trascender</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-fg-muted"
          >
            Un grupo con siete frentes. Del ministerio a la consultora, de la
            seguridad al software: todo apunta a que las personas y las empresas
            crezcan con propósito.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="#secciones"
              className="btn-primary px-7 py-3.5 text-sm font-medium inline-flex items-center"
            >
              Ver las 7 secciones
            </Link>
            <Link
              href="/contacto"
              className="btn-secondary px-7 py-3.5 text-sm font-medium inline-flex items-center"
            >
              Agendar Reunión
            </Link>
          </motion.div>
          <motion.div
            variants={item}
            className="mt-12 pt-8 border-t border-hairline flex flex-wrap gap-x-12 gap-y-6"
          >
            {METRICS.map((m) => (
              <div key={m.label}>
                <p className="font-display text-2xl sm:text-3xl tracking-tight leading-none text-fg">
                  {m.value}
                </p>
                <p className="mt-1.5 text-xs text-fg-muted">{m.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: EASE }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_24px_60px_-24px_rgba(12,12,14,0.35)]">
            <Image
              src="/images/marcos-hero.jpg"
              alt="Marcos Barbosa — Fundador, Marcos Barbosa Group"
              fill
              priority
              className="photo-bw object-cover object-top"
              sizes="(max-width:1024px) 100vw, 40vw"
            />
          </div>
          <div className="mt-4 flex justify-center lg:justify-start">
            <span className="inline-flex items-center rounded-full border border-hairline bg-surface px-4 py-1.5 text-xs text-fg-muted">
              Marcos Barbosa · Fundador
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Crear `components/home/verticals-grid.tsx`**

```tsx
import { verticals } from "@/config/verticals"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead } from "@/components/site/blocks"
import { VerticalCard } from "@/components/site/vertical-card"

export function VerticalsGrid() {
  const featured = verticals.find((v) => v.featured) ?? verticals[0]
  const rest = verticals.filter((v) => v.id !== featured.id)

  return (
    <SectionShell id="secciones" className="border-t border-hairline">
      <SectionHead
        kicker="Las 7 verticales"
        title="Un grupo."
        italic="Siete frentes."
        sub="Cada vertical resuelve algo distinto. Entrá a la que necesitás hoy."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:row-span-2">
          <VerticalCard
            title={featured.title}
            description={featured.description}
            href={featured.slug}
            icon={featured.icon}
            large
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-1">
          {rest.slice(0, 2).map((v) => (
            <VerticalCard
              key={v.id}
              title={v.title}
              description={v.description}
              href={v.slug}
              icon={v.icon}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-1">
          {rest.slice(2, 4).map((v) => (
            <VerticalCard
              key={v.id}
              title={v.title}
              description={v.description}
              href={v.slug}
              icon={v.icon}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
          {rest.slice(4).map((v) => (
            <VerticalCard
              key={v.id}
              title={v.title}
              description={v.description}
              href={v.slug}
              icon={v.icon}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
```

- [ ] **Step 3: Reescribir `app/page.tsx`**

```tsx
import { GroupHero } from "@/components/home/group-hero"
import { VerticalsGrid } from "@/components/home/verticals-grid"
import { Founder } from "@/components/founder"
import { CtaBand } from "@/components/site/blocks"

export default function Home() {
  return (
    <>
      <GroupHero />
      <VerticalsGrid />
      <Founder />
      <CtaBand
        title="Hablemos de lo que necesitás."
        sub="Contanos tu desafío y te orientamos a la vertical correcta."
      />
    </>
  )
}
```

- [ ] **Step 4: Verificar**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: QA manual (dev)**

Abrir `/`. Verificar: hero del grupo, grilla de 7 (Consultora destacada), sección Founder, CTA final. Links de cada card apuntan a `/…` (darán 404 hasta las tareas 8–14, es esperado).

- [ ] **Step 6: Commit**

```bash
git add components/home/group-hero.tsx components/home/verticals-grid.tsx app/page.tsx
git commit -m "feat(home): portal paraguas con hero de grupo y grilla de 7 verticales"
```

---

### Task 8: Vertical Cuerpo de Cristo (índice + 5 hijos)

**Files:**
- Create: `app/cuerpo-de-cristo/page.tsx`
- Create: `app/cuerpo-de-cristo/consejeria-cristiana/page.tsx`
- Create: `app/cuerpo-de-cristo/ministerio-empresarial/page.tsx`
- Create: `app/cuerpo-de-cristo/confesionario/page.tsx`
- Create: `app/cuerpo-de-cristo/ofrenda/page.tsx`
- Create: `app/cuerpo-de-cristo/solidaridad/page.tsx`

**Interfaces:**
- Consumes: `getVertical("cuerpo-de-cristo")`, `VerticalLanding`, `ContentPage`, `SectionShell`, `SectionHead`, `Prose`, `BulletGrid`, `CtaBand`.

- [ ] **Step 1: Crear `app/cuerpo-de-cristo/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Cuerpo de Cristo — Consejería, Ministerio y Solidaridad | Marcos Barbosa Group",
  description:
    "Consejería cristiana, ministerio empresarial, confesionario, ofrenda y solidaridad. Fe que sirve y acompaña.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Fe que sirve."
      italic="Un cuerpo, muchos dones."
      intro="Consejería, ministerio, solidaridad y un lugar reservado para soltar las cargas. La obra de Dios también se organiza, se acompaña y se sostiene."
      chips={["Consejería", "Ministerio", "Solidaridad", "Ofrenda"]}
    />
  )
}
```

- [ ] **Step 2: Crear `app/cuerpo-de-cristo/consejeria-cristiana/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Consejería Cristiana | Cuerpo de Cristo — Marcos Barbosa Group",
  description:
    "Acompañamiento espiritual y consejo bíblico para personas, familias y matrimonios. Un espacio de escucha y dirección.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/consejeria-cristiana" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/consejeria-cristiana"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Consejería"
      italic="cristiana."
      intro="Un espacio de escucha, dirección y acompañamiento. Consejo bíblico para personas, familias y matrimonios que necesitan claridad y contención."
      chips={["Confidencial", "Acompañamiento", "Dirección bíblica"]}
      cta={{ href: "/contacto", label: "Solicitar una consejería" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Para quién"
          title="Cuando la carga es pesada,"
          italic="no la llevés solo."
          sub="La consejería no es un consejo rápido: es un proceso de escucha y dirección."
        />
        <BulletGrid
          items={[
            { title: "Personas", desc: "Decisiones, duelos, hábitos y propósito de vida." },
            { title: "Matrimonios", desc: "Comunicación, acuerdos y reconstrucción del vínculo." },
            { title: "Familias", desc: "Crianza, límites y unidad familiar con base bíblica." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              Cada proceso empieza con una charla inicial sin costo. A partir de
              ahí definimos juntos la frecuencia y el enfoque. Todo lo que se
              habla queda entre vos y quien te acompaña.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand
        title="¿Querés empezar un proceso?"
        sub="Escribinos y coordinamos la primera charla."
        label="Solicitar consejería"
      />
    </ContentPage>
  )
}
```

- [ ] **Step 3: Crear `app/cuerpo-de-cristo/ministerio-empresarial/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Ministerio Empresarial | Cuerpo de Cristo — Marcos Barbosa Group",
  description:
    "Fe y empresa en la misma mesa: principios bíblicos aplicados a la conducción, la ética y la cultura de tu negocio.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/ministerio-empresarial" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/ministerio-empresarial"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Fe y empresa"
      italic="en la misma mesa."
      intro="Reunimos empresarios que quieren conducir con integridad. Principios bíblicos llevados a la operación, la cultura y las decisiones difíciles."
      chips={["Encuentros", "Principios", "Conducción"]}
      cta={{ href: "/contacto", label: "Quiero participar" }}
    >
      <SectionShell>
        <SectionHead
          kicker="La propuesta"
          title="Conducir bien"
          italic="también es un acto de fe."
          sub="Un espacio para compartir la presión real de liderar, con base y con hermanos que entienden."
        />
        <BulletGrid
          items={[
            { title: "Encuentros de empresarios", desc: "Reuniones periódicas para compartir y orar." },
            { title: "Principios aplicados", desc: "Ética, generosidad y mayordomía en el negocio." },
            { title: "Acompañamiento", desc: "Consejo para decisiones de conducción y familia." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Frecuencia, sede y modalidad de los encuentros se
              confirman con el equipo. Escribinos para sumarte a la próxima
              reunión.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="Sumate al próximo encuentro" sub="Dejanos tus datos y te avisamos." label="Quiero participar" />
    </ContentPage>
  )
}
```

- [ ] **Step 4: Crear `app/cuerpo-de-cristo/confesionario/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Confesionario — Un lugar para librarte de tus cargas | Cuerpo de Cristo",
  description:
    "Un lugar reservado y confidencial para librarte de tus cargas. Escucha, confesión y descanso, con total privacidad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/confesionario" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/confesionario"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Un lugar para"
      italic="librarte de tus cargas."
      intro="Hay cosas que pesan y no se cuentan en cualquier lado. Este es un espacio reservado, confidencial y sin juicio, para hablar y soltar."
      chips={["Confidencial", "Sin juicio", "Escucha"]}
      cta={{ href: "/contacto", label: "Pedir un encuentro privado" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Cómo funciona"
          title="Privacidad"
          italic="antes que nada."
          sub="En esta etapa el encuentro se coordina de forma directa y personal. No hay formularios públicos ni datos que se guarden solos."
        />
        <BulletGrid
          items={[
            { title: "Confidencial", desc: "Lo que se habla queda entre vos y quien te escucha." },
            { title: "Sin juicio", desc: "Un espacio de escucha y misericordia, no de condena." },
            { title: "Encuentro privado", desc: "Se coordina personalmente para cuidar tu privacidad." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              Para pedir un encuentro, escribinos por WhatsApp o desde la página
              de contacto y lo coordinamos de forma privada. No compartas
              información sensible por formularios.
            </p>
          </Prose>
        </div>
      </SectionShell>
    </ContentPage>
  )
}
```

- [ ] **Step 5: Crear `app/cuerpo-de-cristo/ofrenda/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Ofrenda — Sostené la obra de Dios | Cuerpo de Cristo",
  description:
    "Ofrendá con alegría y propósito para sostener la obra: consejería, ministerio y solidaridad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/ofrenda" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/ofrenda"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Ofrendá"
      italic="con alegría."
      intro="Cada ofrenda sostiene la obra: consejería, ministerio, solidaridad y la ayuda concreta a las familias que visitamos."
      chips={["Propósito", "Transparencia", "Obra de Dios"]}
      cta={{ href: "/contacto", label: "Quiero ofrendar" }}
    >
      <SectionShell>
        <SectionHead
          kicker="A dónde va"
          title="Tu ofrenda"
          italic="se convierte en obra."
          sub="No se pierde en un pozo: se transforma en acompañamiento y ayuda concreta."
        />
        <BulletGrid
          items={[
            { title: "Consejería", desc: "Sostener el acompañamiento a personas y familias." },
            { title: "Ministerio", desc: "Encuentros, materiales y logística de la obra." },
            { title: "Solidaridad", desc: "Visitas, alimentos y ayuda a familias que lo necesitan." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] En esta etapa las ofrendas se coordinan de forma directa.
              Escribinos para recibir los datos de transferencia o el medio
              habilitado. El botón de ofrenda online se suma más adelante.
            </p>
          </Prose>
        </div>
      </SectionShell>
    </ContentPage>
  )
}
```

- [ ] **Step 6: Crear `app/cuerpo-de-cristo/solidaridad/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Solidaridad — Obra social que visita familias | Cuerpo de Cristo",
  description:
    "Obra social: visitamos familias, llevamos alimento y acompañamos. Sumate como voluntario o colaborá.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/solidaridad" },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/solidaridad"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Una obra social"
      italic="con los pies en la calle."
      intro="Visitamos familias, llevamos alimento y acompañamos a quien está pasando un momento difícil. La fe se demuestra con hechos."
      chips={["Visitas", "Alimento", "Voluntariado"]}
      cta={{ href: "/contacto", label: "Sumarme como voluntario" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Qué hacemos"
          title="Ir"
          italic="a donde hace falta."
          sub="Nos movemos en territorio, con discreción y respeto por cada familia."
        />
        <BulletGrid
          items={[
            { title: "Visitas a familias", desc: "Acompañamiento presencial a quienes lo necesitan." },
            { title: "Alimento y ropa", desc: "Relevamiento y entrega de lo urgente." },
            { title: "Voluntariado", desc: "Sumate con tiempo, recursos o manos." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Zonas de trabajo, calendario de visitas y forma de
              colaborar se coordinan con el equipo. Escribinos si querés sumarte.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="La fe se demuestra con hechos" sub="Sumate como voluntario o colaborá con la obra social." label="Quiero ayudar" />
    </ContentPage>
  )
}
```

- [ ] **Step 7: Verificar**

Run: `npm run build`
Expected: PASS. Luego `npm run dev` y abrir `/cuerpo-de-cristo` y sus 5 hijos; verificar sub-nav activo, breadcrumb, dark/light y sin overflow.

- [ ] **Step 8: Commit**

```bash
git add app/cuerpo-de-cristo
git commit -m "feat(vertical): cuerpo de cristo con 5 subpaginas"
```

---

### Task 9: Vertical Consultora (índice + migración de Metodología y Planes + 4 nuevas)

**Files:**
- Create: `app/consultora/page.tsx`
- Move: `app/metodologia/page.tsx` → `app/consultora/metodologia/page.tsx`
- Move: `app/planes/page.tsx` → `app/consultora/planes/page.tsx`
- Create: `app/consultora/casos-de-exito/page.tsx`
- Create: `app/consultora/modelos-de-negocio/page.tsx`
- Create: `app/consultora/capacitaciones/page.tsx`
- Create: `app/consultora/recursos/page.tsx`
- Modify: `components/methodology-preview.tsx` (link)
- Modify: `app/contacto/page.tsx` (links)

**Interfaces:**
- Consumes: `getVertical("consultora")`, `VerticalLanding`, `ContentPage`, bloques, `Pillars`, `MethodologyPreview`, `PlansTable`.

- [ ] **Step 1: Mover los archivos con git**

```bash
mkdir -p app/consultora
git mv app/metodologia app/consultora/metodologia
git mv app/planes app/consultora/planes
```

- [ ] **Step 2: Actualizar canonical/OG en `app/consultora/metodologia/page.tsx`**

Reemplazar las 3 ocurrencias de `https://marcosbarbosagroup.com/metodologia` por `https://marcosbarbosagroup.com/consultora/metodologia` (en `openGraph.url` y `alternates.canonical`).

- [ ] **Step 3: Actualizar links internos de la Metodología**

En `app/consultora/metodologia/page.tsx`, cambiar `href="/planes"` → `href="/consultora/planes"`.

- [ ] **Step 4: Actualizar canonical/OG en `app/consultora/planes/page.tsx`**

Reemplazar `https://marcosbarbosagroup.com/planes` por `https://marcosbarbosagroup.com/consultora/planes`. Y cambiar el link interno `href="/metodologia"` → `href="/consultora/metodologia"`.

- [ ] **Step 5: Actualizar `components/methodology-preview.tsx`**

Cambiar `href="/metodologia"` → `href="/consultora/metodologia"`.

- [ ] **Step 6: Actualizar `app/contacto/page.tsx`**

Cambiar `href="/metodologia"` → `href="/consultora/metodologia"` y `href="/planes"` → `href="/consultora/planes"` (en las 2 cards de la franja de confianza).

- [ ] **Step 7: Crear `app/consultora/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"
import { Pillars } from "@/components/pillars"
import { MethodologyPreview } from "@/components/methodology-preview"

export const metadata: Metadata = {
  title: "Consultora Estratégica — Estrategia, Liderazgo y Tecnología | Marcos Barbosa Group",
  description:
    "Consultoría estratégica internacional: metodología 01—06, planes 1—4, casos de éxito, modelos de negocio, capacitaciones y recursos.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Estrategia que"
      italic="se ejecuta."
      intro="Del Diagnóstico al Escalamiento. Estrategia, liderazgo y tecnología para empresas que buscan trascender, con método probado y sin improvisación."
      chips={["Metodología 01—06", "Planes 1—4", "Acompañamiento en territorio"]}
    >
      <Pillars />
      <MethodologyPreview />
    </VerticalLanding>
  )
}
```

- [ ] **Step 8: Crear `app/consultora/casos-de-exito/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Casos de Éxito | Consultora — Marcos Barbosa Group",
  description:
    "Empresas reales que ordenaron, ejecutaron y escalaron con la metodología 01—06.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/casos-de-exito" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/casos-de-exito"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Resultados,"
      italic="no powerpoints."
      intro="Lo que importa no es el plan: es lo que pasa en la empresa después. Estos son los frentes donde más se nota el método."
      chips={["Orden", "Ejecución", "Escalamiento"]}
      cta={{ href: "/contacto", label: "Quiero resultados así" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Dónde se nota"
          title="Transformaciones"
          italic="concretas."
        />
        <BulletGrid
          items={[
            { title: "Orden y prioridades", desc: "Dueños que dejaron de apagar incendios y recuperaron foco." },
            { title: "Equipos que ejecutan", desc: "Roles, rituales y cultura que no dependen del dueño." },
            { title: "Escalamiento", desc: "Empresas que crecieron con sistema y gobierno, sin perder control." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Los casos nominales (empresa, rubro y métrica) se publican
              solo con autorización del cliente. Completar con los casos
              habilitados.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Tu empresa puede ser el próximo caso?" sub="Empezá por el Diagnóstico 01." label="Agendar Reunión" />
    </ContentPage>
  )
}
```

- [ ] **Step 9: Crear `app/consultora/modelos-de-negocio/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Modelos de Negocio | Consultora — Marcos Barbosa Group",
  description:
    "Diseño y rediseño de modelos de negocio que sostienen el crecimiento: propuesta, márgenes, canales y escalabilidad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/modelos-de-negocio" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/modelos-de-negocio"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="El modelo"
      italic="antes que la táctica."
      intro="Si el modelo no cierra, ninguna campaña lo salva. Diseñamos y rediseñamos la forma en que tu empresa genera y captura valor."
      chips={["Propuesta de valor", "Márgenes", "Escalabilidad"]}
      cta={{ href: "/contacto", label: "Revisar mi modelo" }}
    >
      <SectionShell>
        <SectionHead
          kicker="Qué trabajamos"
          title="Las piezas que"
          italic="hacen sostenible el crecimiento."
        />
        <BulletGrid
          items={[
            { title: "Propuesta de valor", desc: "Qué ofrecés, a quién y por qué te eligen." },
            { title: "Márgenes y precios", desc: "Estructura de costos y política de precios sana." },
            { title: "Canales y demanda", desc: "Cómo llegás al cliente y cómo lo retenés." },
            { title: "Escalabilidad", desc: "Qué limita crecer sin caos y cómo destrabarlo." },
            { title: "Ingresos recurrentes", desc: "De ventas sueltas a flujo previsible." },
            { title: "Riesgos", desc: "Dependencias peligrosas y cómo reducirlas." },
          ]}
        />
      </SectionShell>
      <CtaBand title="¿Tu modelo aguanta el próximo salto?" sub="Lo miramos juntos en el Diagnóstico." label="Agendar Reunión" />
    </ContentPage>
  )
}
```

- [ ] **Step 10: Crear `app/consultora/capacitaciones/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Capacitaciones — Conducción, Ventas, Oratoria y PNL | Consultora",
  description:
    "Herramientas de conducción y liderazgo, estrategia y técnicas de ventas, oratoria y expresión eficaz, PNL aplicada, inteligencia y gestión de emociones.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/capacitaciones" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/capacitaciones"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Equipos que"
      italic="aprenden y aplican."
      intro="Capacitaciones para empresas: no teoría suelta, herramientas que el equipo usa al día siguiente."
      chips={["Liderazgo", "Ventas", "Oratoria", "PNL", "Emociones"]}
      cta={{ href: "/contacto", label: "Pedir una capacitación" }}
    >
      <SectionShell>
        <SectionHead kicker="Programas" title="Herramientas" italic="de conducción y liderazgo." />
        <BulletGrid
          items={[
            { title: "Conducción y Liderazgo", desc: "Cómo conducir personas, no solo tareas." },
            { title: "Estrategia y Técnicas de Ventas", desc: "Proceso comercial y cierre con método." },
            { title: "Oratoria y Expresión Eficaz", desc: "Comunicar con claridad y presencia." },
            { title: "PNL Aplicada", desc: "Patrones de pensamiento y conducta en el trabajo." },
            { title: "Inteligencia y Gestión de Emociones", desc: "Autocontrol y trato bajo presión." },
            { title: "Y más", desc: "Programas a medida según tu equipo y objetivos." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Duración, modalidad (presencial/online) y valores se
              definen según la cantidad de participantes y la profundidad del
              programa.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Tu equipo necesita esto?" sub="Armamos un programa a medida." label="Pedir propuesta" />
    </ContentPage>
  )
}
```

- [ ] **Step 11: Crear `app/consultora/recursos/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Recursos para tu Empresa — Libros, Archivos y Automatizaciones | Consultora",
  description:
    "Comprá recursos para tu empresa: libros, archivos y automatizaciones listas para usar.",
  alternates: { canonical: "https://marcosbarbosagroup.com/consultora/recursos" },
}

export default function Page() {
  const vertical = getVertical("consultora")!
  const child = vertical.children.find((c) => c.slug.endsWith("/recursos"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Recursos para"
      italic="pasar a la acción."
      intro="Materiales seleccionados para que tu equipo no arranque de cero: libros, archivos y automatizaciones listas para usar."
      chips={["Libros", "Archivos", "Automatizaciones"]}
      cta={{ href: "/contacto", label: "Quiero ver los recursos" }}
    >
      <SectionShell>
        <SectionHead kicker="Qué incluye" title="Para leer," italic="para bajar y para automatizar." />
        <BulletGrid
          items={[
            { title: "Libros", desc: "Selección de lectura sobre estrategia, liderazgo y gestión." },
            { title: "Archivos", desc: "Plantillas, tableros y documentos listos para usar." },
            { title: "Automatizaciones", desc: "Procesos y flujos automatizados para tu operación." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] El catálogo y su forma de compra (tienda online / link de
              pago) se definen en la próxima fase. Por ahora escribinos y te
              contamos qué recursos están disponibles.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Buscás un recurso puntual?" sub="Escribinos y te decimos qué hay disponible." label="Consultar recursos" />
    </ContentPage>
  )
}
```

- [ ] **Step 12: Verificar**

Run: `npm run build`
Expected: PASS. QA: `/consultora`, `/consultora/metodologia`, `/consultora/planes`, y las 4 nuevas. Verificar que `/metodologia` y `/planes` redirigen (Task 15) — por ahora dan 404 hasta la tarea de redirects.

- [ ] **Step 13: Commit**

```bash
git add app/consultora app/contacto/page.tsx components/methodology-preview.tsx
git commit -m "feat(vertical): consultora con indice, migracion de metodologia y planes, y 4 subpaginas"
```

---

### Task 10: Vertical Servicios (índice + Seguridad con 5 sub-rutas + Limpieza)

**Files:**
- Create: `app/servicios/page.tsx`
- Create: `app/servicios/seguridad/page.tsx`
- Create: `app/servicios/seguridad/fisica/page.tsx`
- Create: `app/servicios/seguridad/electronica/page.tsx`
- Create: `app/servicios/seguridad/ciberseguridad/page.tsx`
- Create: `app/servicios/seguridad/auditoria/page.tsx`
- Create: `app/servicios/seguridad/nosotros/page.tsx`
- Create: `app/servicios/limpieza/page.tsx`

**Nota:** `config/verticals.json` declara a Seguridad con 2 hijos (Seguridad, Limpieza). Las 5 sub-rutas de Seguridad **no** están en el sub-nav de Servicios; se navegan desde la landing de Seguridad. Por eso Seguridad no puede usar `VerticalLanding` (que arma sub-nav con `children`): usa `PageHero` + grilla propia.

- [ ] **Step 1: Crear `app/servicios/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Servicios — Seguridad Integral y Limpieza Profesional | Marcos Barbosa Group",
  description:
    "Seguridad física, electrónica, ciberseguridad y auditoría, más limpieza profesional para empresas y eventos.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Protegemos y"
      italic="cuidamos lo tuyo."
      intro="Seguridad integral y limpieza profesional. Personal capacitado, protocolos claros y cobertura para empresas, consorcios y eventos."
      chips={["Seguridad", "Limpieza", "Cobertura en territorio"]}
    />
  )
}
```

- [ ] **Step 2: Crear `app/servicios/seguridad/page.tsx`**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { getVertical } from "@/config/verticals"
import { PageHero } from "@/components/site/page-hero"
import { SubNav } from "@/components/site/sub-nav"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, CtaBand } from "@/components/site/blocks"
import { ShieldCheck, Camera, Lock, SearchCheck, Building2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Seguridad — Física, Electrónica, Ciber y Auditoría | Servicios",
  description:
    "Seguridad física (guardias y custodia), electrónica (cámaras), ciberseguridad (monitoreo) y auditoría. Sobre nosotros: habilitaciones y trayectoria.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad" },
}

const areas = [
  { label: "Seguridad Física", desc: "Guardias, custodia y control de accesos.", href: "/servicios/seguridad/fisica", icon: ShieldCheck },
  { label: "Seguridad Electrónica", desc: "Instalación de cámaras y sistemas de alarma.", href: "/servicios/seguridad/electronica", icon: Camera },
  { label: "Ciberseguridad", desc: "Monitoreo y protección de tus sistemas.", href: "/servicios/seguridad/ciberseguridad", icon: Lock },
  { label: "Auditoría", desc: "Diagnóstico de vulnerabilidades y riesgos.", href: "/servicios/seguridad/auditoria", icon: SearchCheck },
  { label: "Sobre Nosotros", desc: "Habilitaciones, documentación, historia y visión.", href: "/servicios/seguridad/nosotros", icon: Building2 },
] as const

export default function Page() {
  const vertical = getVertical("servicios")!
  return (
    <main>
      <PageHero
        eyebrow="Servicios / Seguridad"
        title="Seguridad"
        italic="integral."
        intro="Una sola división cubre lo físico, lo electrónico, lo digital y la auditoría. Menos proveedores, más control."
        chips={["Guardias", "Cámaras", "Monitoreo", "Auditoría"]}
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/servicios" },
          { label: "Seguridad" },
        ]}
        primary={{ href: "/contacto", label: "Solicitar cobertura" }}
      />
      <SubNav items={vertical.children} />
      <SectionShell>
        <SectionHead kicker="Áreas" title="Cuatro frentes de" italic="seguridad." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map(({ label, desc, href, icon: Icon }) => (
            <Link key={href} href={href} className="card-luxury rounded-2xl p-6 group flex flex-col">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl tracking-tight text-fg">{label}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás cubrir un objetivo?" sub="Contanos qué hay que proteger y armamos el esquema." label="Solicitar cobertura" />
    </main>
  )
}
```

- [ ] **Step 3: Crear las 5 sub-rutas de Seguridad**

Cada una reutiliza `ContentPage` con `vertical = getVertical("servicios")` y un `child` sintético. Crear los 5 archivos:

`app/servicios/seguridad/fisica/page.tsx`:
```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Seguridad Física — Guardias y Custodia | Servicios",
  description: "Guardias de seguridad, custodia y control de accesos con personal capacitado.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/fisica" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Seguridad Física", slug: "/servicios/seguridad/fisica", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Seguridad"
      italic="física."
      intro="Guardias de seguridad y custodia para empresas, consorcios y eventos. Presencia, protocolo y personal capacitado."
      chips={["Guardias", "Custodia", "Control de accesos"]}
      cta={{ href: "/contacto", label: "Solicitar personal" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="Presencia que" italic="disuade y protege." />
        <BulletGrid
          items={[
            { title: "Guardias de seguridad", desc: "Cobertura fija o rotativa según el objetivo." },
            { title: "Custodia", desc: "Traslado y protección de personas y bienes." },
            { title: "Control de accesos", desc: "Registro, acreditación y circulación ordenada." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Horarios, dotación mínima y valores se definen según el objetivo a cubrir.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás guardias?" sub="Definimos el esquema de cobertura juntos." label="Solicitar personal" />
    </ContentPage>
  )
}
```

`app/servicios/seguridad/electronica/page.tsx`:
```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Seguridad Electrónica — Instalación de Cámaras | Servicios",
  description: "Instalación de cámaras de seguridad, alarmas y sistemas de monitoreo.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/electronica" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Seguridad Electrónica", slug: "/servicios/seguridad/electronica", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Seguridad"
      italic="electrónica."
      intro="Instalación de cámaras y sistemas de alarma. Ves lo que pasa, lo registrás y lo revisás cuando lo necesitás."
      chips={["Cámaras", "Alarmas", "Instalación"]}
      cta={{ href: "/contacto", label: "Pedir instalación" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="Ojos y oídos" italic="en tu objetivo." />
        <BulletGrid
          items={[
            { title: "Cámaras de seguridad", desc: "Instalación y configuración de CCTV." },
            { title: "Alarmas", desc: "Sensores y avisos ante intrusión o emergencia." },
            { title: "Visualización remota", desc: "Acceso desde el celular o la computadora." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Cantidad de cámaras, marcas y presupuesto se definen tras el relevamiento del sitio.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Querés ver todo desde el celular?" sub="Relevamos el sitio y te pasamos una propuesta." label="Pedir instalación" />
    </ContentPage>
  )
}
```

`app/servicios/seguridad/ciberseguridad/page.tsx`:
```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Ciberseguridad — Monitoreo y Protección | Servicios",
  description: "Monitoreo, protección de sistemas y respuesta ante incidentes digitales.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/ciberseguridad" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Ciberseguridad", slug: "/servicios/seguridad/ciberseguridad", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Ciber"
      italic="seguridad."
      intro="Tu empresa también se defiende en digital. Monitoreo, protección y respuesta para reducir el riesgo de un incidente."
      chips={["Monitoreo", "Protección", "Respuesta"]}
      cta={{ href: "/contacto", label: "Evaluar mi riesgo" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="El riesgo que" italic="no se ve." />
        <BulletGrid
          items={[
            { title: "Monitoreo", desc: "Vigilancia de sistemas y alertas tempranas." },
            { title: "Protección", desc: "Buenas prácticas, accesos y respaldo de información." },
            { title: "Respuesta", desc: "Plan de acción ante incidentes digitales." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Alcance del monitoreo y herramientas utilizadas se definen según la infraestructura de cada empresa.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Sabés qué tan expuesta está tu empresa?" sub="Empezá con una evaluación de riesgo." label="Evaluar mi riesgo" />
    </ContentPage>
  )
}
```

`app/servicios/seguridad/auditoria/page.tsx`:
```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Auditoría de Seguridad | Servicios",
  description: "Auditoría de seguridad: diagnóstico de vulnerabilidades y riesgos en tus instalaciones y sistemas.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/auditoria" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Auditoría", slug: "/servicios/seguridad/auditoria", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Auditoría"
      italic="de seguridad."
      intro="Antes de contratar más seguridad, entendé dónde están las grietas. Diagnosticamos vulnerabilidades y priorizamos lo urgente."
      chips={["Diagnóstico", "Vulnerabilidades", "Plan"]}
      cta={{ href: "/contacto", label: "Pedir una auditoría" }}
    >
      <SectionShell>
        <SectionHead kicker="El proceso" title="Mirar con" italic="ojos de riesgo." />
        <BulletGrid
          items={[
            { title: "Relevamiento", desc: "Instalaciones, accesos, procesos y sistemas." },
            { title: "Diagnóstico", desc: "Vulnerabilidades y puntos ciegos detectados." },
            { title: "Plan priorizado", desc: "Qué resolver primero y cómo." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Alcance y entregables de la auditoría se definen según el tamaño del objetivo.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Cuándo fue tu última auditoría?" sub="Relevamos y te damos un plan claro." label="Pedir auditoría" />
    </ContentPage>
  )
}
```

`app/servicios/seguridad/nosotros/page.tsx`:
```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Sobre Nosotros — Habilitaciones y Trayectoria | Seguridad",
  description: "Habilitaciones, documentación, historia y visión de la división de seguridad.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/seguridad/nosotros" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = { label: "Sobre Nosotros", slug: "/servicios/seguridad/nosotros", description: "" }
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      eyebrow="Servicios / Seguridad"
      title="Quiénes"
      italic="somos."
      intro="Nuestra historia, visión y, sobre todo, la documentación que respalda cada servicio. En seguridad, la habilitación no es un detalle."
      chips={["Habilitaciones", "Documentación", "Trayectoria"]}
      cta={{ href: "/contacto", label: "Solicitar documentación" }}
    >
      <SectionShell>
        <SectionHead kicker="Respaldo" title="Papeles en orden," italic="servicio en serio." />
        <BulletGrid
          items={[
            { title: "Habilitaciones", desc: "Documentación vigente para operar y cubrir objetivos." },
            { title: "Nuestra historia", desc: "Cómo se construyó la división de seguridad." },
            { title: "Visión", desc: "Proteger personas y bienes con protocolo y respeto." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Números de habilitación, organismo, años de trayectoria y
              razón social deben completarse con los datos reales de la empresa
              antes de publicar.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás la documentación?" sub="Te compartimos habilitaciones y respaldos." label="Solicitar documentación" />
    </ContentPage>
  )
}
```

- [ ] **Step 4: Crear `app/servicios/limpieza/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Limpieza Profesional para Empresas y Eventos | Servicios",
  description: "Limpieza profesional para empresas, consorcios y eventos. Personal capacitado y protocolos claros.",
  alternates: { canonical: "https://marcosbarbosagroup.com/servicios/limpieza" },
}

export default function Page() {
  const vertical = getVertical("servicios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/limpieza"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Limpieza"
      italic="profesional."
      intro="Espacios impecables, sin improvisar. Personal capacitado y protocolos para empresas, consorcios y eventos."
      chips={["Empresas", "Consorcios", "Eventos"]}
      cta={{ href: "/contacto", label: "Pedir presupuesto" }}
    >
      <SectionShell>
        <SectionHead kicker="Servicios" title="Orden y limpieza" italic="como parte de la operación." />
        <BulletGrid
          items={[
            { title: "Oficinas y empresas", desc: "Limpieza diaria, semanal o por abono." },
            { title: "Consorcios", desc: "Espacios comunes, escaleras y cocheras." },
            { title: "Eventos", desc: "Limpieza previa, durante y posterior al evento." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Frecuencia, dotación y valores se definen según el tamaño y las necesidades del espacio.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Necesitás un esquema de limpieza?" sub="Relevamos el espacio y te pasamos presupuesto." label="Pedir presupuesto" />
    </ContentPage>
  )
}
```

- [ ] **Step 5: Verificar**

Run: `npm run build`
Expected: PASS. QA: `/servicios`, `/servicios/seguridad` (+5 sub) y `/servicios/limpieza`.

- [ ] **Step 6: Commit**

```bash
git add app/servicios
git commit -m "feat(vertical): servicios con seguridad (5 subrutas) y limpieza"
```

---

### Task 11: Vertical Software (página única)

**Files:**
- Create: `app/software/page.tsx`

**Interfaces:**
- Consumes: `getVertical("software")`, `PageHero`, `SectionShell`, `SectionHead`, `BulletGrid`, `Prose`, `CtaBand`.

- [ ] **Step 1: Crear `app/software/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { PageHero } from "@/components/site/page-hero"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, BulletGrid, Prose, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Software a Medida para Empresas | Marcos Barbosa Group",
  description:
    "Software a medida: webs, sistemas, CRMs, tableros y automatizaciones que se adaptan a tu operación.",
  alternates: { canonical: "https://marcosbarbosagroup.com/software" },
}

export default function Page() {
  const vertical = getVertical("software")!
  return (
    <main>
      <PageHero
        eyebrow={vertical.title}
        title="Software que se adapta"
        italic="a tu empresa."
        intro="No adaptes tu operación a un sistema genérico. Construimos el software que tu negocio necesita: webs, sistemas internos, CRMs, tableros y automatizaciones."
        chips={["A medida", "Web y sistemas", "Automatización"]}
        primary={{ href: "/contacto", label: "Contar mi proyecto" }}
      />
      <SectionShell>
        <SectionHead
          kicker="Qué construimos"
          title="Herramientas"
          italic="que se usan de verdad."
          sub="Del relevamiento a la entrega, pensado para tu forma de trabajar."
        />
        <BulletGrid
          items={[
            { title: "Webs y plataformas", desc: "Sitios y aplicaciones hechas para tu negocio." },
            { title: "Sistemas internos", desc: "Gestión, stock, ventas y procesos a medida." },
            { title: "CRMs y tableros", desc: "Datos ordenados para decidir con claridad." },
            { title: "Automatizaciones", desc: "Tareas repetitivas que corren solas." },
            { title: "Integraciones", desc: "Tus herramientas conectadas entre sí." },
            { title: "Soporte y evolución", desc: "El sistema crece junto con la empresa." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              Trabajamos por etapas: primero entendemos el proceso, después
              construimos y medimos. Sin cajas negras ni dependencia de un
              proveedor que no explica lo que hace.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Tenés un proceso que pide sistema?" sub="Contanos y te decimos cómo lo resolvemos." label="Contar mi proyecto" />
    </main>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run build`
Expected: PASS. QA: `/software` (sin sub-nav, link directo en header).

- [ ] **Step 3: Commit**

```bash
git add app/software
git commit -m "feat(vertical): software y aplicaciones a medida"
```

---

### Task 12: Vertical Legendarios (investigación + índice + 3 hijos)

**Files:**
- Create: `app/legendarios/page.tsx`
- Create: `app/legendarios/que-es/page.tsx`
- Create: `app/legendarios/proximas-fechas/page.tsx`
- Create: `app/legendarios/traslados/page.tsx`

**Interfaces:**
- Consumes: `getVertical("legendarios")`, `VerticalLanding`, `ContentPage`, bloques.

- [ ] **Step 1: Investigar Legendarios (global + Argentina)**

Buscar en fuentes primarias qué es el movimiento **Legendarios** (origen, propósito, principios, cómo se organiza) y qué está pasando en **Argentina** (sedes, encuentros, líderes). Objetivo: 3–5 datos verificables para el copy de "Qué es". Anotar las fuentes.

- [ ] **Step 2: Crear `app/legendarios/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Legendarios — Movimiento Global de Hombres | Marcos Barbosa Group",
  description:
    "Legendarios: un movimiento global de hombres que se levantan. Qué es y qué está pasando en Argentina.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios" },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Hombres que"
      italic="se levantan."
      intro="Legendarios es un movimiento global que forma y reúne hombres con propósito. En Argentina está creciendo, y queremos que seas parte."
      chips={["Movimiento global", "Argentina", "Encuentros"]}
    />
  )
}
```

- [ ] **Step 3: Crear `app/legendarios/que-es/page.tsx`**

Redactar con los datos de la investigación. Usar la estructura de abajo y completar los `[VALIDAR]` con lo verificado.

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Qué es Legendarios — Movimiento Global | Legendarios",
  description:
    "Qué es Legendarios: origen, propósito y principios del movimiento global, y su crecimiento en Argentina.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios/que-es" },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/que-es"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Qué es"
      italic="Legendarios."
      intro="[VALIDAR] Síntesis verificada del movimiento: qué es, de dónde viene y qué busca. Completar con 2–3 líneas citando la fuente."
      chips={["Global", "Argentina", "Propósito"]}
      cta={{ href: "/contacto", label: "Quiero saber más" }}
    >
      <SectionShell>
        <SectionHead kicker="El movimiento" title="Una idea simple:" italic="levantarse." />
        <BulletGrid
          items={[
            { title: "[VALIDAR] Origen", desc: "[VALIDAR] Dónde y cuándo nace el movimiento." },
            { title: "[VALIDAR] Propósito", desc: "[VALIDAR] Qué busca en la vida de los hombres." },
            { title: "[VALIDAR] Principios", desc: "[VALIDAR] Los pilares que lo sostienen." },
            { title: "En Argentina", desc: "[VALIDAR] Qué está pasando hoy y dónde." },
            { title: "Cómo sumarse", desc: "Desde un encuentro puntual hasta ser parte de la comunidad." },
            { title: "Comunidad", desc: "Hombres que se acompañan y se desafían a crecer." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Fuentes: citar los links/sitios primarios usados en la
              investigación, con fecha de consulta.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Querés ser parte?" sub="Escribinos y te contamos por dónde empezar." label="Quiero saber más" />
    </ContentPage>
  )
}
```

- [ ] **Step 4: Crear `app/legendarios/proximas-fechas/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Próximas Fechas | Legendarios",
  description: "Encuentros, retiros y conferencias de Legendarios en Argentina. Próximas fechas.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios/proximas-fechas" },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/proximas-fechas"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Próximas"
      italic="fechas."
      intro="Los próximos encuentros de Legendarios en Argentina. Guardá la fecha y sumate."
      chips={["Encuentros", "Retiros", "Conferencias"]}
      cta={{ href: "/contacto", label: "Quiero anotarme" }}
    >
      <SectionShell>
        <SectionHead kicker="Calendario" title="Lo que" italic="viene." />
        <BulletGrid
          items={[
            { title: "[VALIDAR] Próximo encuentro", desc: "[VALIDAR] Fecha, sede y horario." },
            { title: "[VALIDAR] Retiro", desc: "[VALIDAR] Fecha, lugar y modalidad." },
            { title: "[VALIDAR] Conferencia", desc: "[VALIDAR] Fecha, sede y orador." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Completar con las fechas reales confirmadas. Si aún no hay
              calendario cerrado, reemplazar por "Fechas en definición" y ofrecer
              avisarte.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="No te la pierdas" sub="Dejanos tus datos y te avisamos de cada fecha." label="Avisarme" />
    </ContentPage>
  )
}
```

- [ ] **Step 5: Crear `app/legendarios/traslados/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Traslados | Legendarios",
  description: "Logística y traslados para llegar a los encuentros de Legendarios.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios/traslados" },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/traslados"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Traslados"
      italic="sin excusas."
      intro="Que no llegar sea el motivo para perdértelo. Organizamos traslados para los encuentros; sumate y viajamos juntos."
      chips={["Logística", "Salidas", "Cupos"]}
      cta={{ href: "/contacto", label: "Reservar mi lugar" }}
    >
      <SectionShell>
        <SectionHead kicker="Cómo funciona" title="Nos organizamos" italic="para llegar." />
        <BulletGrid
          items={[
            { title: "Puntos de salida", desc: "[VALIDAR] Ciudades y puntos de encuentro." },
            { title: "Horarios", desc: "[VALIDAR] Horarios de salida y regreso." },
            { title: "Cupos", desc: "[VALIDAR] Capacidad y forma de reservar." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>[VALIDAR] Completar con la logística real de traslados por encuentro.</p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Viajás con nosotros?" sub="Reservá tu lugar y coordinamos la salida." label="Reservar lugar" />
    </ContentPage>
  )
}
```

- [ ] **Step 6: Verificar**

Run: `npm run build`
Expected: PASS. QA: `/legendarios` (+3).

- [ ] **Step 7: Commit**

```bash
git add app/legendarios
git commit -m "feat(vertical): legendarios con que-es, proximas fechas y traslados"
```

---

### Task 13: Vertical Los 1000 Socios (índice + Bolsa de trabajo + Postulate)

**Files:**
- Create: `app/1000-socios/page.tsx`
- Create: `app/1000-socios/bolsa-de-trabajo/page.tsx`
- Create: `app/1000-socios/postulate/page.tsx`

**Interfaces:**
- Consumes: `getVertical("1000-socios")`, `VerticalLanding`, `ContentPage`, bloques.

- [ ] **Step 1: Crear `app/1000-socios/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Los 1000 Socios — Bolsa de Trabajo y Talento | Marcos Barbosa Group",
  description:
    "Una red de empresarios y talento: bolsa de trabajo para empresas y postulación para candidatos.",
  alternates: { canonical: "https://marcosbarbosagroup.com/1000-socios" },
}

export default function Page() {
  const vertical = getVertical("1000-socios")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Una red que"
      italic="conecta."
      intro="Mil socios, un objetivo: que la oportunidad y el talento se encuentren. Las empresas cargan sus búsquedas y nosotros hacemos la conexión."
      chips={["Empresas", "Talento", "Conexión"]}
    />
  )
}
```

- [ ] **Step 2: Crear `app/1000-socios/bolsa-de-trabajo/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Bolsa de Trabajo para Empresas | Los 1000 Socios",
  description:
    "Cargá tu búsqueda laboral y nosotros hacemos la conexión con los candidatos de la red.",
  alternates: { canonical: "https://marcosbarbosagroup.com/1000-socios/bolsa-de-trabajo" },
}

export default function Page() {
  const vertical = getVertical("1000-socios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/bolsa-de-trabajo"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Publicá tu"
      italic="búsqueda."
      intro="Cargá la propuesta laboral y nosotros hacemos la conexión con el talento de la red. Menos ruido, más candidatos alineados."
      chips={["Empresas", "Búsquedas", "Conexión"]}
      cta={{ href: "/contacto", label: "Cargar una búsqueda" }}
    >
      <SectionShell>
        <SectionHead kicker="Para empresas" title="Tu búsqueda," italic="nuestra red." />
        <BulletGrid
          items={[
            { title: "Cargás la propuesta", desc: "Puesto, perfil y condiciones en pocos pasos." },
            { title: "Hacemos la conexión", desc: "Filtramos y acercamos los perfiles de la red." },
            { title: "Menos fricción", desc: "Menos CVs al azar y más candidatos alineados." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] En esta etapa las búsquedas se reciben por contacto
              directo (WhatsApp/email); el formulario de carga y el panel de la
              bolsa se suman en la próxima fase.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Buscás incorporar talento?" sub="Contanos el puesto y lo difundimos en la red." label="Cargar búsqueda" />
    </ContentPage>
  )
}
```

- [ ] **Step 3: Crear `app/1000-socios/postulate/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Postulate — Dejá tu CV | Los 1000 Socios",
  description:
    "Dejá tu CV y postulate a las oportunidades de la red de Los 1000 Socios.",
  alternates: { canonical: "https://marcosbarbosagroup.com/1000-socios/postulate" },
}

export default function Page() {
  const vertical = getVertical("1000-socios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/postulate"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Dejá tu CV"
      italic="y postulate."
      intro="Si buscás trabajo o querés estar en la red para futuras oportunidades, dejá tu perfil. Te contactamos cuando aparezca algo para vos."
      chips={["Talento", "CV", "Oportunidades"]}
      cta={{ href: "/contacto", label: "Enviar mi CV" }}
    >
      <SectionShell>
        <SectionHead kicker="Para candidatos" title="Tu perfil," italic="en la red." />
        <BulletGrid
          items={[
            { title: "Dejá tu CV", desc: "Contanos qué hacés y qué buscás." },
            { title: "Entramos en contacto", desc: "Te avisamos cuando haya una búsqueda que encaje." },
            { title: "Sin costo", desc: "Postularte y estar en la red no tiene costo." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] En esta etapa el CV se recibe por WhatsApp/email; la carga
              con archivo y el matching automático se suman en la próxima fase.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Listo para el próximo paso?" sub="Enviá tu CV y quedás en la red." label="Enviar mi CV" />
    </ContentPage>
  )
}
```

- [ ] **Step 4: Verificar**

Run: `npm run build`
Expected: PASS. QA: `/1000-socios`, `/1000-socios/bolsa-de-trabajo`, `/1000-socios/postulate`.

- [ ] **Step 5: Commit**

```bash
git add app/1000-socios
git commit -m "feat(vertical): los 1000 socios con bolsa de trabajo y postulate"
```

---

### Task 14: Vertical Formate con Nosotros (índice + Rompiendo Barreras + Próximas formaciones)

**Files:**
- Create: `app/formate/page.tsx`
- Create: `app/formate/rompiendo-barreras/page.tsx`
- Create: `app/formate/proximas-formaciones/page.tsx`

**Interfaces:**
- Consumes: `getVertical("formate")`, `VerticalLanding`, `ContentPage`, bloques.

- [ ] **Step 1: Crear `app/formate/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { VerticalLanding } from "@/components/site/vertical-landing"

export const metadata: Metadata = {
  title: "Formate con Nosotros — Rompiendo Barreras | Marcos Barbosa Group",
  description:
    "Formación integral para personas que quieren crecer: Rompiendo Barreras y próximas formaciones.",
  alternates: { canonical: "https://marcosbarbosagroup.com/formate" },
}

export default function Page() {
  const vertical = getVertical("formate")!
  return (
    <VerticalLanding
      vertical={vertical}
      title="Formate"
      italic="para romper barreras."
      intro="Formación integral para personas que quieren crecer de verdad: hábitos, mentalidad, liderazgo y propósito, con herramientas aplicables."
      chips={["Formación integral", "Rompiendo Barreras", "Próximas camadas"]}
    />
  )
}
```

- [ ] **Step 2: Crear `app/formate/rompiendo-barreras/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Rompiendo Barreras — Formación Integral | Formate con Nosotros",
  description:
    "Rompiendo Barreras: formación integral en hábitos, mentalidad, liderazgo y propósito.",
  alternates: { canonical: "https://marcosbarbosagroup.com/formate/rompiendo-barreras" },
}

export default function Page() {
  const vertical = getVertical("formate")!
  const child = vertical.children.find((c) => c.slug.endsWith("/rompiendo-barreras"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Rompiendo"
      italic="Barreras."
      intro="Una formación integral para romper los límites que te frenan: hábitos, mentalidad, liderazgo y propósito, con trabajo práctico."
      chips={["Hábitos", "Mentalidad", "Liderazgo", "Propósito"]}
      cta={{ href: "/contacto", label: "Quiero anotarme" }}
    >
      <SectionShell>
        <SectionHead kicker="Qué trabajás" title="Las barreras" italic="que se rompen." />
        <BulletGrid
          items={[
            { title: "Mentalidad", desc: "Cambiar la forma de mirar los problemas." },
            { title: "Hábitos", desc: "Rutinas que sostienen el cambio en el tiempo." },
            { title: "Liderazgo", desc: "Conducirte y conducir a otros con propósito." },
            { title: "Propósito", desc: "Claridad sobre hacia dónde vas y por qué." },
            { title: "Comunicación", desc: "Expresarte con claridad y seguridad." },
            { title: "Acción", desc: "Pasar de la idea al hecho, con método." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Duración, modalidad y dinámica de la formación se definen
              con el equipo. Escribinos para conocer la próxima camada.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="¿Listo para romper tus barreras?" sub="Sumate a la próxima formación." label="Quiero anotarme" />
    </ContentPage>
  )
}
```

- [ ] **Step 3: Crear `app/formate/proximas-formaciones/page.tsx`**

```tsx
import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Próximas Formaciones | Formate con Nosotros",
  description: "Fechas, sedes y cupos de las próximas formaciones.",
  alternates: { canonical: "https://marcosbarbosagroup.com/formate/proximas-formaciones" },
}

export default function Page() {
  const vertical = getVertical("formate")!
  const child = vertical.children.find((c) => c.slug.endsWith("/proximas-formaciones"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Próximas"
      italic="formaciones."
      intro="Las fechas que vienen. Anotate temprano: los cupos son limitados."
      chips={["Fechas", "Sedes", "Cupos"]}
      cta={{ href: "/contacto", label: "Reservar mi lugar" }}
    >
      <SectionShell>
        <SectionHead kicker="Calendario" title="Lo que" italic="viene." />
        <BulletGrid
          items={[
            { title: "[VALIDAR] Formación 1", desc: "[VALIDAR] Fecha, sede y cupos." },
            { title: "[VALIDAR] Formación 2", desc: "[VALIDAR] Fecha, sede y cupos." },
            { title: "[VALIDAR] Formación 3", desc: "[VALIDAR] Fecha, sede y cupos." },
          ]}
        />
        <div className="mt-10">
          <Prose>
            <p>
              [VALIDAR] Completar con las fechas reales. Si aún no están
              definidas, reemplazar por "Fechas en definición" y ofrecer avisarte.
            </p>
          </Prose>
        </div>
      </SectionShell>
      <CtaBand title="Reservá tu lugar" sub="Dejanos tus datos y te confirmamos la próxima camada." label="Reservar lugar" />
    </ContentPage>
  )
}
```

- [ ] **Step 4: Verificar**

Run: `npm run build`
Expected: PASS. QA: `/formate`, `/formate/rompiendo-barreras`, `/formate/proximas-formaciones`.

- [ ] **Step 5: Commit**

```bash
git add app/formate
git commit -m "feat(vertical): formate con rompiendo barreras y proximas formaciones"
```

---

### Task 15: Redirects 301, sitemap y verificador de rutas en verde

**Files:**
- Modify: `next.config.mjs`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `allRoutes` de `@/config/verticals`.
- Produces: redirects `/metodologia` y `/planes`; sitemap con todas las rutas.

- [ ] **Step 1: Agregar redirects a `next.config.mjs`**

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/metodologia", destination: "/consultora/metodologia", permanent: true },
      { source: "/planes", destination: "/consultora/planes", permanent: true },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Reescribir `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next"
import { allRoutes } from "@/config/verticals"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marcosbarbosagroup.com"
  const now = new Date()

  const priorityFor = (route: string) => {
    if (route === "/") return 1
    const depth = route.split("/").filter(Boolean).length
    if (depth === 1) return 0.9
    return 0.7
  }

  return allRoutes.map((route) => ({
    url: route === "/" ? base : `${base}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: priorityFor(route),
  }))
}
```

- [ ] **Step 3: Verificador de rutas debe estar en verde**

Run: `npm run check:routes`
Expected: PASS con `OK: 36 rutas con page.tsx` (7 verticales + 20 hijos + 5 sub-rutas de Seguridad + contacto/sobre-marcos/privacidad/terminos).

- [ ] **Step 4: Build final y verificación de redirects**

Run: `npm run build && npm run start`
Abrir `http://localhost:3000/metodologia` → debe redirigir a `/consultora/metodologia` (301). Igual `/planes` → `/consultora/planes`. Verificar `/sitemap.xml` (todas las rutas) y `/robots.txt`.

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs app/sitemap.ts
git commit -m "feat(seo): redirects 301 de metodologia y planes, sitemap desde config"
```

---

### Task 16: QA final integral

**Files:** sin cambios (verificación). Corregir en su tarea correspondiente si algo falla.

- [ ] **Step 1: Lint y build**

Run: `npm run lint && npm run build && npm run check:routes`
Expected: los tres PASS.

- [ ] **Step 2: QA de navegación (todos los anchos)**

Run: `npm run dev`
- Desktop ≥1024: los 7 ítems; cada dropdown abre/cierra (hover, click, Esc, click afuera); ítem activo en acento cuando estás en esa vertical.
- Mobile <1024: drawer con acordeones; cada hijo navega; el drawer cierra al navegar.
- Sub-nav en cada índice de vertical con hijos, con el activo marcado. Software sin sub-nav.
- Breadcrumb correcto en todas las sub-páginas.
- Footer: 4 columnas, los 7 verticales, hijos de Consultora, Sobre Marcos y legales.

- [ ] **Step 3: QA de contenido y datos**

- Buscar `[VALIDAR]` en `app/` y confirmar que cada uno está identificado para completar antes de publicar.
- Verificar que Confesionario, Ofrenda, Bolsa y Postulate derivan a contacto/WhatsApp y no fingen persistir datos.

- [ ] **Step 4: QA visual y a11y**

- Dark y light en home, un índice y una sub-página.
- `prefers-reduced-motion` activo: sin animaciones molestas.
- Foco visible en header, dropdowns y formulario de contacto.
- Sin overflow horizontal en 375px, 768px, 1280px.

- [ ] **Step 5: Commit (si hubo correcciones)**

```bash
git add -A
git commit -m "fix(qa): correcciones de navegacion, contenido y responsive"
```

---

## Self-Review

**Spec coverage:**
- 7 verticales top-level + hijos → Tareas 1, 8–14.
- Home portal paraguas → Tarea 7.
- Header con dropdowns + sub-nav + breadcrumb + drawer → Tareas 3, 5.
- Footer 4 columnas → Tarea 6.
- "Sobre Marcos" solo footer → Tarea 6.
- Config única de estructura + copy inline → Tareas 1, 2.
- Un sistema/un acento → Global Constraints + todas las tareas (no se agregan colores).
- Redirects 301, sitemap, metadata → Tareas 9, 15.
- Interactivas como página real con CTA honesto → Tareas 8, 12, 13, 14.
- Legendarios con investigación → Tarea 12.
- Fuera de alcance respetado (sin backend/MDX/acento por vertical).

**Placeholder scan:** los `[VALIDAR]` son intencionales (contenido a validar por el usuario), no placeholders de plan. No quedan "TBD/TODO/implement later".

**Type consistency:** `Vertical`/`VerticalChild` definidos en Task 1 y usados consistentemente; `VerticalLanding` recibe `vertical`; `ContentPage` recibe `vertical`+`child`; `SubNav` recibe `VerticalChild[]`; `VerticalCard` recibe `{title, description, href, icon, large?}`. Los 5 hijos de Seguridad usan `child` sintético porque no están en el config de Servicios (nota explícita en Task 10).
