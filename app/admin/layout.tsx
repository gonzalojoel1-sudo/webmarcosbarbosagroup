import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel — Los 1000 Socios",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-bg">{children}</div>
}
