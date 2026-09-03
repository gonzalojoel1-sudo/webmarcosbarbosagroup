"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label={mounted ? (isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro") : "Cambiar tema"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line dark:border-white/10 bg-surface/70 dark:bg-white/[0.06] backdrop-blur-md text-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary ${className}`}
    >
      {mounted ? (
        isDark ? (
          <Sun size={17} strokeWidth={1.75} />
        ) : (
          <Moon size={17} strokeWidth={1.75} />
        )
      ) : (
        <span className="h-[17px] w-[17px]" aria-hidden />
      )}
    </button>
  )
}
