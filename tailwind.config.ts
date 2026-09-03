import type { Config } from "tailwindcss"
import { theme } from "./config/theme"

/**
 * Tokens adaptativos (paper/paper2/surface/line/muted/foreground/success/
 * primary-soft) se definen como rgb-triplets en CSS vars y se intercambian
 * bajo `.dark` en globals.css — un solo token, ambos modos.
 * Tokens fijos (primary, primary-fg, ink, ink-soft) no cambian.
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
        primary: rgb("primary"),
        "primary-hover": theme.colors.primaryHover,
        "primary-fg": rgb("primary-fg"),
        "primary-soft": rgb("primary-soft"),
        ink: rgb("ink"),
        "ink-soft": rgb("ink-soft"),
        foreground: rgb("foreground"),
        paper: rgb("paper"),
        "paper-2": rgb("paper-2"),
        surface: rgb("surface"),
        line: rgb("line"),
        muted: rgb("muted"),
        navy: theme.colors.navy,
        success: rgb("success"),
        background: "var(--background)",
      },
      borderRadius: {
        lg: theme.radius,
        md: `calc(${theme.radius} - 2px)`,
        sm: `calc(${theme.radius} - 4px)`,
      },
      fontFamily: {
        display: ["var(--font-body)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "sans-serif"],
        sans: ["var(--font-body)", "Plus Jakarta Sans", "sans-serif"],
        "mono-tech": ["var(--font-mono-tech)", "JetBrains Mono", "monospace"],
        "serif-brand": ["var(--font-serif-brand)", "Cinzel", "serif"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
}
export default config
