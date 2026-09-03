import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({ ok: true, service: "webmarcosbarbosagroup", ts: new Date().toISOString() })
}
