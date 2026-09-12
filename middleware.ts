import { NextRequest, NextResponse } from "next/server"
import { validateAndParse } from "@/lib/auth/session"
import { COOKIE_NAME } from "@/lib/auth/config"
import { safeLog } from "@/lib/confessions/log"

export const config = {
  matcher: [
    "/pastor",
    "/pastor/inbox/:path*",
    "/api/pastor/((?!login-test).*)",
  ],
}

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store")
  return res
}

function redirectToLogin(req: NextRequest, expired = false) {
  const url = req.nextUrl.clone()
  url.pathname = "/pastor"
  url.search = ""
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search)
  if (expired) url.searchParams.set("expired", "1")
  return NextResponse.redirect(url, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === "/api/pastor/login-test") {
    return NextResponse.next()
  }

  if (pathname === "/pastor") {
    return noStore(NextResponse.next())
  }

  const cookieValue = req.cookies.get(COOKIE_NAME)?.value
  const payload = await validateAndParse(cookieValue)

  if (!payload) {
    safeLog("pastor.session.expired", { status: 401 })
    return redirectToLogin(req, true)
  }

  return noStore(NextResponse.next())
}