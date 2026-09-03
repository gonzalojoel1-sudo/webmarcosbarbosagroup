import type { Config } from "tailwindcss"
import { theme } from "./config/theme"

/**
 * Tokens adaptativos (bg/surface/surface-2/fg/fg-muted/success) se definen
 * como rgb-triplets en CSS vars y se intercambian bajo `.dark` en globals.css
 * (next-themes, class strategy) — un solo token, ambos modos.
 * hairline ya es rgba completa. primary/primary-hover son triplet fijos
 * para soportar alpha (bg-primary/10, border-primary/40, etc.).
 */
const rgb = (v: string) => `rgb(var(--${v}-rgb) / <alpha-value>)`

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: rgb("bg"),
        surface: rgb("surface"),
        "surface-2": rgb("surface-2"),
        hairline: "var(--hairline)",
        fg: rgb("fg"),
        "fg-muted": rgb("fg-muted"),
        primary: rgb("primary"),
        "primary-hover": rgb("primary-hover"),
        "primary-fg": theme.colors.primaryFg,
        success: rgb("success"),
      },
      borderRadius: {
        lg: theme.radius,
        md: `calc(${theme.radius} - 2px)`,
        sm: `calc(${theme.radius} - 4px)`,
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        body: ["var(--font-body)", "Outfit", "sans-serif"],
        sans: ["var(--font-body)", "Outfit", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
}
export default config
