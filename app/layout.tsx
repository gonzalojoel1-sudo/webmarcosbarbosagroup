import type { Metadata } from "next"
import { Instrument_Serif, Inter } from "next/font/google"
import "./globals.css"

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
})

const body = Inter({
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
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="bg-paper text-ink antialiased font-body">
        {children}
      </body>
    </html>
  )
}
