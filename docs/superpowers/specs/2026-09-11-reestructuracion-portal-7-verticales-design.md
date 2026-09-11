# Reestructuración a portal paraguas de 7 verticales — Design

**Fecha:** 2026-09-11
**Dominio:** marcosbarbosagroup.com (se mantiene)
**Estado:** diseño aprobado · pendiente plan de implementación
**Alcance:** Etapa 1 — esqueleto completo (rutas, navegación, páginas índice y sub-páginas con copy real)

---

## 1. Contexto y objetivo

Hoy `marcosbarbosagroup.com` es una web de **una** vertical (consultoría): home con Hero + Pilares + Metodología + Planes + Founder, y rutas `/metodologia`, `/planes`, `/sobre-marcos`, `/contacto` (+ legales).

El objetivo es transformarla en un **portal paraguas de 7 verticales** distintas, donde la consultora pasa a ser una vertical más y la home presenta al grupo y rutea a cada sección.

**Decisiones tomadas con el usuario:**

| Tema | Decisión |
|---|---|
| Alcance etapa 1 | Estructura completa primero (esqueleto navegable); contenido/backend vertical por vertical después |
| "Formate con nosotros" | 7ª sección top-level |
| "Sobre Marcos" | Global, accesible **solo desde el footer** |
| Home | Portal paraguas del grupo (deja de ser landing de consultora) |
| Secciones interactivas | Páginas reales ahora; backend nuevo después (CTA honesto) |
| Identidad visual | **Un solo sistema, un solo acento `#FE4100`** |
| Copy | Lo escribe el agente desde los bullets del usuario; lo inventado se marca `[VALIDAR]` |
| Arquitectura | Enfoque A — rutas anidadas reales + config única + sub-nav por vertical |
| Servicios → Seguridad | 5 sub-rutas propias |
| Contenido | `config/verticals.ts` para estructura + copy inline en cada `page.tsx` |

---

## 2. Arquitectura de información (árbol de rutas)

```
/                                  Home = portal paraguas (7 verticales)
│
├── /cuerpo-de-cristo              A. Cuerpo de Cristo  (índice)
│   ├── /consejeria-cristiana      Consejería Cristiana
│   ├── /ministerio-empresarial    Ministerio empresarial
│   ├── /confesionario             Confesionario (privado, sensible)
│   ├── /ofrenda                   Ofrenda (botón ofrendar)
│   └── /solidaridad               Solidaridad (obra social)
│
├── /consultora                    B. Consultora  (índice)
│   ├── /metodologia               ← mueve de /metodologia (301)
│   ├── /planes                    ← mueve de /planes (301)
│   ├── /casos-de-exito            Casos de éxito
│   ├── /modelos-de-negocio        Modelos de negocios
│   ├── /capacitaciones            Capacitaciones (cursos)
│   └── /recursos                  Recursos (libros / archivos / automatizaciones)
│
├── /servicios                     C. Servicios  (índice)
│   ├── /seguridad                 Seguridad (índice / overview)
│   │   ├── /fisica                Seguridad física (guardias, custodia)
│   │   ├── /electronica           Seguridad electrónica (cámaras)
│   │   ├── /ciberseguridad        Ciberseguridad (monitoreo)
│   │   ├── /auditoria             Auditoría
│   │   └── /nosotros              Sobre nosotros (habilitaciones, doc, historia, visión)
│   └── /limpieza                  Limpieza
│
├── /software                      D. Software y Aplicaciones (página única)
│        (Software a medida para empresas)
│
├── /legendarios                   E. Legendarios  (índice)
│   ├── /que-es                    Qué es Legendarios (movimiento global + Argentina)
│   ├── /proximas-fechas           Próximas fechas
│   └── /traslados                 Traslados
│
├── /1000-socios                   F. Los 1000 socios  (índice)
│   ├── /bolsa-de-trabajo          Bolsa de trabajo (empresas cargan propuestas)
│   └── /postulate                 Postulate (personas dejan CV)
│
├── /formate                       G. Formate con nosotros  (índice)
│   ├── /rompiendo-barreras        Rompiendo Barreras (formación integral)
│   └── /proximas-formaciones      Próximas formaciones
│
├── /contacto                      Contacto (global, se mantiene)
├── /sobre-marcos                  Sobre Marcos (global, solo footer)
└── /privacidad · /terminos        Legales (se mantienen)
```

**Redirects 301:** `/metodologia` → `/consultora/metodologia`, `/planes` → `/consultora/planes`.

---

## 3. Navegación

### Header (desktop ≥ lg)
- Logo + **7 ítems con dropdown por vertical** + toggle de tema + CTA "Agendar Reunión" (→ `/contacto`).
- Etiquetas cortas en la barra: `Cuerpo de Cristo · Consultora · Servicios · Software · Legendarios · 1000 Socios · Formate`.
- El dropdown muestra: nombre completo, hijos de la vertical, descripción breve y link "Ver <Vertical> →".
- Verticales **sin hijos** (Software) se comportan como link directo: sin dropdown, sin sub-nav.
- Accesible por teclado; `aria-expanded`, cierre con `Esc` y click afuera.

### Sub-nav por vertical
- Debajo del header, en la **página índice** de cada vertical con hijos: fila de **tabs** con sus hijos, activo marcado.
- Verticales sin hijos (Software): sin sub-nav.
- En sub-páginas: sin tabs, con **breadcrumb** (`Consultora / Metodología`).

### Mobile (< lg)
- Drawer a pantalla completa con las 7 verticales como **acordeones** (expanden a sus hijos), CTA Agendar y contacto. Reemplaza el drawer actual de 3 links.

### Footer (4 columnas)
1. Marca + descripción + CTA Agendar
2. **Verticales** (los 7)
3. **Consultora** (sus 6 hijos — insignia)
4. Contacto (WhatsApp / email / Córdoba) + Sobre Marcos + Privacidad · Términos + redes

---

## 4. Home (portal paraguas)

1. **Hero del grupo** — eyebrow "Marcos Barbosa Group", título paraguas (fe · empresa · seguridad · tecnología · formación), subtítulo, CTAs ("Ver las 7 secciones" / "Agendar Reunión"). Conserva la foto de Marcos. Métricas: `7 verticales · 15+ años · Internacional`.
2. **Las 7 secciones** — grilla editorial de 7 accesos. Consultora destacada (card mayor, borde acento); las otras 6 en cards parejas. Cada card: ícono, título, descripción de una línea, "Entrar →".
3. **Bloque transversal** — "Una visión, siete frentes" + quote de Marcos.
4. **Founder** (componente reutilizado) → link a `/sobre-marcos`.
5. **CTA final** — Agendar Reunión + WhatsApp.

Sale de la home actual: Pilares (4), Metodología preview y Planes (ahora dentro de Consultora).

---

## 5. Modelo de contenido y componentes

### Fuente única de verdad
`config/verticals.ts` declara las 7 verticales y sus hijos (id, label corto, título largo, slug, description, icon). Lo consumen: **header, footer, home, sub-nav, breadcrumb y sitemap**.

```ts
export const verticals = [
  {
    id: "consultora",
    label: "Consultora",
    title: "Consultora Estratégica",
    slug: "/consultora",
    description: "Estrategia, liderazgo y tecnología para empresas que buscan trascender.",
    icon: Compass,
    children: [
      { label: "Metodología", slug: "/consultora/metodologia" },
      // ...
    ],
  },
  // ...6 verticales más
] as const
```

### Componentes nuevos
- `PageHero` — eyebrow + título + subtítulo + chips + CTAs (unifica los 7 heroes de vertical).
- `SubNav` — tabs de hijos de la vertical.
- `Breadcrumb` — migas por ruta.
- `SectionShell` — wrapper de sección con encabezado editorial.
- `VerticalIndex` — grilla de verticales/hijos para páginas índice.

### Componentes reutilizados
`Hero`, `Pillars`, `MethodologyPreview`, `PlansTable`, `Founder`, `LeadForm`, `Button`.

### Copy
- Estructura en `config/verticals.ts`.
- Copy inline en cada `page.tsx` (sin dependencias nuevas). Editar texto = editar la página (opencode friendly).
- Lo inferido/inventado (precios, fechas, datos legales, habilitaciones, próximas fechas) se marca **`[VALIDAR]`**.

---

## 6. Tratamiento visual

- Un sistema, un acento `#FE4100`. Mismos tokens (`config/theme.ts`, `globals.css`).
- Diferenciación de verticales **sin color**: ícono propio (lucide), eyebrow/kicker con el nombre, numeración editorial 01–07, imagen opcional cuando exista (si no, hero tipográfico con ícono).
- Dark/light sin cambios. Sin tipografías ni paletas nuevas.

---

## 7. Migración, SEO y alcance

- **Redirects 301:** `/metodologia` → `/consultora/metodologia`, `/planes` → `/consultora/planes`.
- **Se mantienen:** `/contacto`, `/sobre-marcos`, `/privacidad`, `/terminos`.
- **`sitemap.ts`** reescrito con las ~35 rutas nuevas.
- **Metadata** (title/description/canonical/OG) por página vía helper, manteniendo el patrón actual.
- **Formularios:**
  - Contacto (y sus planes) → `LeadForm` real (sin cambios).
  - Bolsa de trabajo, Postulate, Confesionario, Ofrenda → **página real con copy + CTA honesto** (WhatsApp/email o "próximamente"). Sin backend nuevo; no simular un formulario que no persiste.
- **Legendarios → Qué es:** investigar el movimiento global y Argentina; lo específico marcado `[VALIDAR]`.
- **Fuera de esta etapa:** backend de bolsa/postulación/ofrenda/confesionario, MDX, acento por vertical, panel de administración.

---

## 8. Riesgos y supuestos

- **Volumen:** ~35 rutas + navegación nueva. Es grande pero mecánico; el config único evita inconsistencias.
- **Header con 7 ítems:** riesgo de overflow en desktop chico; mitigado con etiquetas cortas y, si hace falta, colapso a drawer antes de `lg`.
- **Copy `[VALIDAR]`:** el sitio se ve completo pero no debe publicarse a producción sin validar los datos marcados.
- **Confesionario/Ofrenda:** sensibles (privacidad y dinero). En esta etapa no recolectan datos; el CTA deriva a un canal humano.
- **SEO:** los redirects 301 preservan autoridad de `/metodologia` y `/planes`.

---

## 9. Próximo paso

Escribir el plan de implementación (skill **writing-plans**) con fases:
1. `config/verticals.ts` + componentes base (`PageHero`, `SubNav`, `Breadcrumb`, `VerticalIndex`).
2. Header (dropdowns + drawer acordeón) y footer nuevos.
3. Home paraguas.
4. Verticales: Cuerpo de Cristo, Consultora (migra Metodología/Planes), Servicios, Software.
5. Verticales: Legendarios (con investigación), 1000 socios, Formate.
6. Redirects, sitemap, metadata, QA (lint/build, links, a11y, dark/light).
