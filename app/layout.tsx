import type { Metadata } from "next"
import { Fraunces, Outfit } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Providers } from "@/components/providers"

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
})

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
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
      className={`${display.variable} ${body.variable}`}
    >
      <body className="bg-paper text-foreground antialiased font-body">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
