export const theme = {
  colors: {
    primary: "#fe4100",
    primaryHover: "#e03a00",
    primaryFg: "#0F1115", // texto sobre primary — AA 5.4:1 en ambos modos
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
    display: "Fraunces", // h1/h2 — serif editorial con eje óptico
    body: "Outfit", // p/ui — grotesque geométrica
  },
  logo: "/images/logo.svg",
  radius: "14px",
} as const

export type Theme = typeof theme
