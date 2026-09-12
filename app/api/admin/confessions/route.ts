import { NextRequest, NextResponse } from "next/server"
import { getConfessions } from "@/lib/confessions/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 100), 500)
  const list = getConfessions().listConfessions(limit).map((c) => ({
    id: c.id,
    status: c.status,
    pseudonym: c.pseudonym,
    wants_response: c.wants_response,
    contact_method: c.contact_method,
    created_at: c.created_at,
    read_at: c.read_at,
    note_updated_at: c.note_updated_at,
    ip_hash_short: c.ip_hash.slice(0, 8),
  }))
  return NextResponse.json(list, {
    headers: { "Cache-Control": "no-store" },
  })
}
