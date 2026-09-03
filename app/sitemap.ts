import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marcosbarbosagroup.com"
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/metodologia`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/planes`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sobre-marcos`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ]
}
