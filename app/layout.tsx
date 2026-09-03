import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono, Cinzel } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Providers } from "@/components/providers"
import { Backdrop } from "@/components/backdrop"
import { SpotlightLayer } from "@/components/spotlight"

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const monoTech = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-tech",
  display: "swap",
})

const serifBrand = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif-brand",
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
      className={`${body.variable} ${monoTech.variable} ${serifBrand.variable}`}
    >
      <body className="bg-paper text-foreground antialiased font-body">
        <Backdrop />
        <SpotlightLayer />
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
