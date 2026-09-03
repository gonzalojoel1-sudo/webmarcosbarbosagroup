export const theme = {
  colors: {
    primary: "#fe4100",
    primaryHover: "#d83400", // gradiente high-ticket: #FE4100 → #D83400
    primaryFg: "#FFFFFF", // texto sobre primary (referencia: siempre blanco)
    primarySoft: "#fff1eb",
    ink: "#0F1115", // superficie oscura fija (footer, paneles)
    inkSoft: "#1A1E26", // superficie oscura elevada (quotes, paneles)
    paper: "#F5F3EF",
    paper2: "#FFFBF5",
    surface: "#FFFFFF",
    line: "#E7E5E4",
    muted: "#6B7280",
    navy: "#111827",
    success: "#0D7C66",
  },
  fonts: {
    display: "Plus Jakarta Sans", // h1/h2 — extrabold tracking-tight
    body: "Plus Jakarta Sans", // p/ui
    mono: "JetBrains Mono", // labels tácticos / eyebrows / entregables
    serifBrand: "Cinzel", // solo monograma "MB"
  },
  logo: "/images/logo.svg",
  radius: "14px",
} as const

export type Theme = typeof theme
