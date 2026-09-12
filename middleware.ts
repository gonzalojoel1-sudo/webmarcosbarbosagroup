import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASS
  if (!user || !pass) {
    return new NextResponse("Panel no configurado", { status: 503 })
  }

  const header = req.headers.get("authorization")
  if (header && header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6))
      const idx = decoded.indexOf(":")
      const u = idx >= 0 ? decoded.slice(0, idx) : ""
      const p = idx >= 0 ? decoded.slice(idx + 1) : ""
      if (safeEqual(u, user) && safeEqual(p, pass)) {
        return NextResponse.next()
      }
    } catch {
      /* fall through to 401 */
    }
  }

  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Panel", charset="UTF-8"' },
  })
}
