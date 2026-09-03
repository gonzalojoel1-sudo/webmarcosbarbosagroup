import type { Config } from "tailwindcss"
import { theme } from "./config/theme"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        "primary-hover": theme.colors.primaryHover,
        "primary-soft": theme.colors.primarySoft,
        ink: theme.colors.ink,
        "ink-soft": theme.colors.inkSoft,
        paper: theme.colors.paper,
        "paper-2": theme.colors.paper2,
        line: theme.colors.line,
        muted: theme.colors.muted,
        navy: theme.colors.navy,
        success: theme.colors.success,
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        lg: theme.radius,
        md: `calc(${theme.radius} - 2px)`,
        sm: `calc(${theme.radius} - 4px)`,
      },
      fontFamily: {
        display: ["Instrument Serif", "serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
