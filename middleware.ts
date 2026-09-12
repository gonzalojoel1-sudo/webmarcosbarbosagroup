import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}

async function digest(value: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return new Uint8Array(hash)
}

function equalFixed(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

function unauthorized() {
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Panel", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  })
}

export async function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || ""
  const pass = process.env.ADMIN_PASS || ""

  const header = req.headers.get("authorization") || ""
  const spaceIdx = header.indexOf(" ")
  const scheme = spaceIdx >= 0 ? header.slice(0, spaceIdx) : ""
  const encoded = spaceIdx >= 0 ? header.slice(spaceIdx + 1) : ""

  if (user && pass && scheme.toLowerCase() === "basic" && encoded) {
    try {
      const decoded = atob(encoded)
      const idx = decoded.indexOf(":")
      const u = idx >= 0 ? decoded.slice(0, idx) : ""
      const p = idx >= 0 ? decoded.slice(idx + 1) : ""
      const [du, dUser, dp, dPass] = await Promise.all([
        digest(u),
        digest(user),
        digest(p),
        digest(pass),
      ])
      if (equalFixed(du, dUser) && equalFixed(dp, dPass)) {
        return NextResponse.next()
      }
    } catch {
      /* fall through */
    }
  }

  return unauthorized()
}
