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
  calendar: {
    email: "Agenda.personal.mb@gmail.com",
    // Link de "Programación de citas" de Google Calendar (ver README en docs).
    // Vacío => los CTAs de agenda caen a /contacto.
    url: process.env.NEXT_PUBLIC_CALENDAR_URL ?? "",
    hours: "Lun a Vie · 8 a 12 y 14 a 19",
  },
} as const

export type Theme = typeof theme
