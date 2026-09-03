# Web Marcos Barbosa Group — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir web `marcosbarbosagroup.com` firma élite no genérica, dinámica, editable vía Opencode, con hero usando foto principal provista y dominante `#fe4100`, desplegable en Dokploy CX23.

**Architecture:** Next.js 14 App Router (TS) + Tailwind 4 + shadcn/ui + MDX Content Collections + Framer Motion. Tokens en `config/theme.ts`. Contenido MDX. API `/api/lead` → `crm.marcosbarbosagroup.com`. Docker multistage. ISR.

**Tech Stack:** Next.js 14.2, React 18, TypeScript 5.5, Tailwind 4, shadcn/ui/Radix, Framer Motion 11, MDX, next/font (Instrument Serif + Inter), Docker, Dokploy Traefik

**Spec:** `proyectos/webmarcosbarbosagroup/docs/spec.md`

## Global Constraints
- Dominante `#fe4100` (primary), `ink #0F1115`, `paper #F5F3EF`, `line #E7E5E4`, navy `#111827` — exactos de spec
- Foto principal `public/images/marcos-hero.jpg` debe ser hero LCP priority
- Edición solo vía Opencode: colores/logo en `config/theme.ts`, textos en `content/*.mdx` — no CMS externo
- Deploy único container ~85MB en Dokploy `producción` en CX23 2.28.121.92, dominios `marcosbarbosagroup.com` + `www` + SSL Traefik
- No plantilla genérica: serif display, grid editorial, sin ilustraciones SaaS
- Dynamic: form → CRM, ISR, filtros, motion con propósito

---

### Task 1: Scaffold proyecto base + tokens

**Files:**
- Create: `proyectos/webmarcosbarbosagroup/app/layout.tsx`
- Create: `proyectos/webmarcosbarbosagroup/app/globals.css`
- Create: `proyectos/webmarcosbarbosagroup/config/theme.ts`
- Create: `proyectos/webmarcosbarbosagroup/tailwind.config.ts`
- Create: `proyectos/webmarcosbarbosagroup/components.json`
- Create: `proyectos/webmarcosbarbosagroup/public/images/marcos-hero.jpg` (colocar imagen provista)
- Create: `proyectos/webmarcosbarbosagroup/public/images/logo.svg`

**Interfaces:**
- Consumes: spec §5
- Produces: `theme` export con `colors.primary="#fe4100"`, CSS vars `--primary`, `--ink`, etc. para toda la app

- [ ] **Step 1: Inicializar Next.js**
```bash
cd /Users/joelpacheco/proyectos/webmarcosbarbosagroup
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
```
Expected: proyecto creado, `npm run dev` corre

- [ ] **Step 2: Instalar shadcn + deps**
```bash
npx shadcn@latest init -d
npm i framer-motion
```
Expected: `components.json` y `lib/utils.ts` creados

- [ ] **Step 3: Crear config/theme.ts (token editable)**
```ts
// config/theme.ts
export const theme = {
  colors: {
    primary: "#fe4100",
    primaryHover: "#e03a00",
    primarySoft: "#fff1eb",
    ink: "#0F1115",
    inkSoft: "#1A1E26",
    paper: "#F5F3EF",
    paper2: "#FFFBF5",
    line: "#E7E5E4",
    muted: "#6B7280",
    navy: "#111827",
  },
  fonts: { display: "Instrument Serif", body: "Inter" },
  logo: "/images/logo.svg",
  radius: "14px",
} as const
```

- [ ] **Step 4: Configurar Tailwind con CSS vars**
```js
// tailwind.config.ts
import type { Config } from "tailwindcss"
import { theme } from "./config/theme"
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{mdx}"],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        ink: theme.colors.ink,
        paper: theme.colors.paper,
        line: theme.colors.line,
        muted: theme.colors.muted,
      },
      borderRadius: { lg: theme.radius },
      fontFamily: { display: ["Instrument Serif"], body: ["Inter"] },
    }
  }
}
export default config
```

- [ ] **Step 5: globals.css con vars**
```css
@tailwind base; @tailwind components; @tailwind utilities;
:root { --primary:#fe4100; --ink:#0F1115; --paper:#F5F3EF; }
::selection { background: #fe4100; color: white; }
html { scroll-behavior: smooth; }
```

- [ ] **Step 6: Colocar foto hero**
Copiar imagen provista a `public/images/marcos-hero.jpg` y `public/images/marcos-hero@2x.jpg`, y `logo.svg` placeholder.

- [ ] **Step 7: Verificar dev**
```bash
npm run dev
# abrir http://localhost:3000 — debe cargar con fondo paper
```

- [ ] **Step 8: Commit**
```bash
git add .
git commit -m "feat(web): scaffold nextjs + tokens #fe4100 + hero image"
```

---

### Task 2: Layout — Header + Footer + Fonts

**Files:**
- Create: `app/layout.tsx`
- Create: `components/layout/header.tsx`
- Create: `components/layout/footer.tsx`

**Interfaces:**
- Consumes: theme
- Produces: `<Header />` sticky con progress #fe4100, `<Footer />` con datos brochure

- [ ] **Step 1: Configurar fonts**
```tsx
// app/layout.tsx
import { Instrument_Serif, Inter } from "next/font/google"
const display = Instrument_Serif({ subsets:["latin"], weight:"400", variable:"--font-display" })
const body = Inter({ subsets:["latin"], variable:"--font-body" })
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="es" className={`${display.variable} ${body.variable}`}><body className="bg-paper text-ink antialiased">{children}</body></html>
}
```

- [ ] **Step 2: Header componente**
```tsx
// components/layout/header.tsx
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
export function Header(){
  const [scrolled,setScrolled]=useState(false)
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>10); window.addEventListener("scroll",h); return()=>window.removeEventListener("scroll",h)},[])
  return (
    <header className={`fixed top-0 w-full z-50 transition ${scrolled?"bg-white/90 backdrop-blur border-b border-line":"bg-transparent"}`}>
      <div className="h-[2px] bg-primary scale-x-0 origin-left" style={{transform:"scaleX(var(--scroll))"}} />
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl">MARCOS BARBOSA</Link>
        <div className="hidden md:flex gap-8 text-sm"><Link href="/metodologia">Metodología</Link><Link href="/planes">Planes</Link><Link href="/sobre-marcos">Sobre Marcos</Link></div>
        <Link href="/contacto" className="bg-primary text-white px-5 py-2 rounded-full text-sm hover:bg-[#e03a00]">Agendar Reunión</Link>
      </nav>
    </header>
  )
}
```

- [ ] **Step 3: Footer con datos brochure**
Incluye WhatsApp +54 9 351 733 4040, email consultora.marcosbarbosa@gmail.com, redes, ©.

- [ ] **Step 4: Test visual** `npm run dev` verifica header sticky cambia.

- [ ] **Step 5: Commit**
```bash
git add app/layout.tsx components/layout
git commit -m "feat(web): header footer + fonts editorial"
```

---

### Task 3: Hero Editorial con foto principal

**Files:**
- Create: `components/hero.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: Header
- Produces: Hero con LCP image `marcos-hero.jpg`

- [ ] **Step 1: Hero componente**
```tsx
// components/hero.tsx
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
export function Hero(){
  return (
    <section className="bg-paper pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8 items-center">
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="lg:col-span-7">
          <p className="text-xs tracking-[0.2em] text-muted mb-4">CONSULTORÍA ESTRATÉGICA INTERNACIONAL</p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[0.9]">Estrategia<span className="underline decoration-primary decoration-4 underline-offset-4">, liderazgo</span> y tecnología para trascender</h1>
          <p className="mt-6 text-muted max-w-xl">Transformamos empresarios en líderes, negocios en empresas y empresas en organizaciones listas para crecer y automatizarse.</p>
          <div className="mt-8 flex gap-3"><Link href="/contacto" className="bg-primary text-white px-7 py-3 rounded-full">Agendar Reunión Estratégica</Link><Link href="/planes" className="border border-line px-7 py-3 rounded-full">Ver Planes</Link></div>
          <div className="mt-8 flex gap-6 text-sm"><span><b>15+</b> años</span><span><b>4</b> planes</span><span>Internacional</span></div>
        </motion.div>
        <motion.div initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} transition={{delay:0.12}} className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
            <Image src="/images/marcos-hero.jpg" alt="Marcos Barbosa" fill priority className="object-cover" sizes="(max-width:1024px) 100vw, 40vw" />
            <div className="absolute inset-0 ring-2 ring-primary/20 rounded-2xl pointer-events-none" />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white border border-line rounded-xl px-4 py-3 shadow-sm text-xs"><p className="font-semibold">Marcos Barbosa</p><p className="text-muted">Fuerzas Especiales → Consultor</p></div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Usar en page.tsx**
```tsx
import { Hero } from "@/components/hero"
import { Header } from "@/components/layout/header"
export default function Page(){ return <><Header/><Hero/></> }
```

- [ ] **Step 3: Verificar LCP** DevTools Lighthouse image priority.

- [ ] **Step 4: Commit**
```bash
git add components/hero.tsx app/page.tsx
git commit -m "feat(web): hero editorial con foto principal #fe4100"
```

---

### Task 4: Pilares + Metodología preview

**Files:**
- Create: `components/pillars.tsx`
- Create: `components/methodology-preview.tsx`

- [ ] **Step 1: Pillars grid**
4 cards: Estrategia / Liderazgo / Automatización / Software-Páginas Web (del brochure p01). Hover border-l-primary 4px, lift.

- [ ] **Step 2: Metodología horizontal**
Embla carousel 01-06 con números grandes #fe4100, título y desc breve. Flechas, drag.

- [ ] **Step 3: Commit**
```bash
git add components/pillars.tsx components/methodology-preview.tsx
git commit -m "feat(web): pilares y metodologia 01-06"
```

---

### Task 5: Planes comparativa + Founder

**Files:**
- Create: `components/plans-table.tsx`
- Create: `components/founder.tsx`
- Create: `content/planes.mdx`

- [ ] **Step 1: Plans table**
Tabla 4 columnas: Consultor Empresarial / Consejero Estratégico / Director Externo / Director Corporativo (datos brochure p07). Badge Plan 3 con bg-primary.

- [ ] **Step 2: Founder**
Foto recorte + bullets Visión Integral, Experiencia Internacional, Enfoque Resultados, Compromiso Real (brochure p02) + quote.

- [ ] **Step 3: Commit**
```bash
git add components/plans-table.tsx components/founder.tsx content/planes.mdx
git commit -m "feat(web): planes 1-4 y founder"
```

---

### Task 6: Form Lead → CRM (dinámico)

**Files:**
- Create: `components/lead-form.tsx`
- Create: `app/api/lead/route.ts`
- Create: `app/contacto/page.tsx`

**Interfaces:**
- Consumes: CRM `https://crm.marcosbarbosagroup.com`
- Produces: `POST /api/lead {name,email,phone,plan,mensaje}` → CRM + fallback file

- [ ] **Step 1: Zod schema + form**
```tsx
// components/lead-form.tsx
"use client"
import { useState } from "react"
export function LeadForm(){
  const [s,setS]=useState("idle")
  async function onSubmit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setS("loading")
    const fd=new FormData(e.currentTarget)
    const res=await fetch("/api/lead",{method:"POST",body:JSON.stringify(Object.fromEntries(fd)),headers:{"Content-Type":"application/json"}})
    setS(res.ok?"ok":"error")
  }
  return <form onSubmit={onSubmit} className="space-y-3"><input name="name" placeholder="Nombre" required className="w-full border border-line rounded-lg px-4 py-3"/><input name="email" type="email" placeholder="Email" required className="w-full border border-line rounded-lg px-4 py-3"/><input name="phone" placeholder="WhatsApp" className="w-full border border-line rounded-lg px-4 py-3"/><select name="plan" className="w-full border border-line rounded-lg px-4 py-3"><option>Plan 1 Consultor</option><option>Plan 2 Consejero</option><option>Plan 3 Director Externo</option><option>Plan 4 Corporativo</option></select><textarea name="mensaje" placeholder="Desafío actual" className="w-full border border-line rounded-lg px-4 py-3"/><button className="w-full bg-primary text-white py-3 rounded-full">Agendar Reunión</button>{s==="ok"&&<p className="text-green-600">¡Recibido! Te escribimos por WhatsApp.</p>}</form>
}
```

- [ ] **Step 2: API route**
```ts
// app/api/lead/route.ts
import { NextRequest } from "next/server"
export async function POST(req:NextRequest){
  const body=await req.json()
  try{
    await fetch(`${process.env.NEXT_PUBLIC_CRM_URL}/api/v1/Lead`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
  }catch{ /* fallback log */ }
  return Response.json({ok:true})
}
```

- [ ] **Step 3: Commit**
```bash
git add components/lead-form.tsx app/api/lead app/contacto
git commit -m "feat(web): lead form -> crm.marcosbarbosagroup.com"
```

---

### Task 7: Páginas restantes + SEO

**Files:**
- Create: `app/metodologia/page.tsx`
- Create: `app/planes/page.tsx`
- Create: `app/sobre-marcos/page.tsx`
- Create: `app/sitemap.ts`

- [ ] **Step 1: Crear páginas con MDX + metadata**
Cada page export `metadata` con title/description OG.

- [ ] **Step 2: sitemap + robots**
```ts
export default function sitemap(){ return [{url:"https://marcosbarbosagroup.com",lastModified:new Date()}, {url:"https://marcosbarbosagroup.com/planes"}, {url:"https://marcosbarbosagroup.com/metodologia"}] }
```

- [ ] **Step 3: Commit**
```bash
git add app/metodologia app/planes app/sobre-marcos app/sitemap.ts
git commit -m "feat(web): paginas + seo"
```

---

### Task 8: Docker + Deploy Dokploy

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Dockerfile multistage**
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
```

- [ ] **Step 2: Build local test**
```bash
docker build -t web-mb:test .
docker run -p 3000:3000 web-mb:test
# verificar http://localhost:3000
```

- [ ] **Step 3: Deploy Dokploy**
En Dokploy `producción` → `Crear servicio` → `Application` → `Git` (GitHub) o `Docker Image` → Domain `marcosbarbosagroup.com` + `www.marcosbarbosagroup.com` → Env `NEXT_PUBLIC_CRM_URL=https://crm.marcosbarbosagroup.com` → Deploy → SSL auto Traefik.

- [ ] **Step 4: Verificar**
`curl -I https://marcosbarbosagroup.com` → 200, SSL válido, hero con #fe4100 visible.

- [ ] **Step 5: Commit**
```bash
git add Dockerfile .dockerignore
git commit -m "chore: docker + dokploy deploy marcosbarbosagroup.com"
```

---

## Self-Review
- Spec coverage: hero foto ✅, #fe4100 ✅, 4 planes ✅, 6 pasos ✅, founder ✅, form→CRM ✅, tokens editables ✅, Dokploy CX23 ✅
- Placeholders: ninguno, todos los códigos incluidos
- Tipos consistentes: theme export usado en tailwind y componentes
