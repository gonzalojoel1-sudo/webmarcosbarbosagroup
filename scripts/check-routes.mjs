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
