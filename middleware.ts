import { NextRequest, NextResponse } from "next/server"
import { validateAndParse } from "@/lib/auth/session"
import { COOKIE_NAME } from "@/lib/auth/config"

export const config = {
  matcher: ["/pastor/inbox/:path*", "/api/pastor/:path*"],
}

function redirectToLogin(req: NextRequest, expired = false) {
  const url = req.nextUrl.clone()
  url.pathname = "/pastor"
  url.search = ""
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search)
  if (expired) url.searchParams.set("expired", "1")
  return NextResponse.redirect(url, { status: 302 })
}

export async function middleware(req: NextRequest) {
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value
  const payload = validateAndParse(cookieValue)

  if (!payload) {
    return redirectToLogin(req, true)
  }

  return NextResponse.next()
}