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
