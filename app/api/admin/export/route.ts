import { NextRequest, NextResponse } from "next/server"
import { getBoard } from "@/lib/board/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v)
    s = s.replace(/^[=+\-@\t\r]/, (m) => `'${m}`)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","))
  }
  return lines.join("\n")
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") === "candidates" ? "candidates" : "jobs"
  const format = req.nextUrl.searchParams.get("format") === "json" ? "json" : "csv"

  const board = getBoard()
  const rows = (type === "candidates" ? board.listCandidates(1000) : board.listJobs(1000)) as unknown as Record<
    string,
    unknown
  >[]

  if (format === "json") {
    return NextResponse.json(rows, {
      headers: {
        "Content-Disposition": `attachment; filename="${type}.json"`,
        "Cache-Control": "no-store",
      },
    })
  }

  return new NextResponse(toCsv(rows), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}.csv"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  })
}
