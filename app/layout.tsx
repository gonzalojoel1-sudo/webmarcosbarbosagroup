import type { Metadata } from "next"
import { Fraunces, Outfit, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SiteChrome } from "@/components/layout/site-chrome"
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
  title: "Marcos Barbosa Group — Fe, Empresa, Servicio y Tecnología",
  description:
    "Un grupo con siete frentes: ministerio, consultoría, seguridad y limpieza, software, Legendarios, empleo y formación. Estrategia, liderazgo y servicio para trascender.",
  metadataBase: new URL("https://marcosbarbosagroup.com"),
  openGraph: {
    title: "Marcos Barbosa Group — Fe, Empresa, Servicio y Tecnología",
    description:
      "Siete frentes, una sola visión: que las personas y las empresas crezcan con propósito. Consultoría, ministerio, seguridad, software y más.",
    url: "https://marcosbarbosagroup.com",
    siteName: "Marcos Barbosa Group",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "https://marcosbarbosagroup.com/images/marcos-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Marcos Barbosa Group",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marcos Barbosa Group",
    description:
      "Fe, empresa, servicio y tecnología. Siete frentes, una sola visión.",
    images: ["https://marcosbarbosagroup.com/images/marcos-hero.jpg"],
  },
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
          <SiteChrome>
            <Header />
          </SiteChrome>
          {children}
          <SiteChrome>
            <Footer />
          </SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
