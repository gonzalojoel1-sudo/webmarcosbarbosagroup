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
    success: "#0D7C66",
  },
  fonts: {
    display: "Instrument Serif",
    body: "Inter",
  },
  logo: "/images/logo.svg",
  radius: "14px",
} as const

export type Theme = typeof theme
