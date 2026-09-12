import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel interno — Marcos Barbosa Group",
  robots: { index: false, follow: false },
}

export default function PastorLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg">{children}</div>
}