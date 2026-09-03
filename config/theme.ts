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
    // Programación de citas de Google Calendar (link público de reserva)
    url:
      process.env.NEXT_PUBLIC_CALENDAR_URL ??
      "https://calendar.app.google/KSvdQbgKepan1b1z9",
    hours: "Lun a Vie · 9 a 13 y 15 a 18",
  },
} as const

export type Theme = typeof theme
