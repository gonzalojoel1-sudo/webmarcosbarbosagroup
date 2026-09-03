export const theme = {
  colors: {
    primary: "#FE4100", // acento quirúrgico: CTA, links, subrayados
    primaryHover: "#FF5C1F",
    primaryFg: "#FFFFFF", // texto sobre primary
    success: "#0D7C66",
  },
  fonts: {
    display: "Fraunces", // h1/h2/quotes — serif editorial, optical sizing
    body: "Outfit", // p, botones, nav, forms
    mono: "JetBrains Mono", // SOLO micro-labels de datos (nunca eyebrows/títulos)
  },
  logo: "/images/logo.svg",
  radius: "16px",
} as const

export type Theme = typeof theme
