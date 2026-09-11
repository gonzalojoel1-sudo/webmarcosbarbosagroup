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
