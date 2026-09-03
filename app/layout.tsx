import type { Metadata } from "next"
import { Fraunces, Outfit, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Providers } from "@/components/providers"

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
})

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Marcos Barbosa Group — Consultoría Estratégica Internacional",
  description:
    "Estrategia, liderazgo y tecnología para empresas que buscan trascender. +15 años, ex Fuerzas Especiales. Primera Reunión Estratégica.",
  metadataBase: new URL("https://marcosbarbosagroup.com"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-bg text-fg antialiased font-body">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
