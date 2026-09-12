import { NextRequest, NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { getBoard, cvsDir } from "@/lib/board/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const candidate = getBoard().getCandidate(params.id)
  if (!candidate || !candidate.cv_file) {
    return new NextResponse("No encontrado", { status: 404 })
  }

  const safe = path.basename(candidate.cv_file)
  const full = path.join(cvsDir(), safe)
  if (!full.startsWith(cvsDir())) {
    return new NextResponse("No encontrado", { status: 404 })
  }

  try {
    const buf = await readFile(full)
    const downloadName = (candidate.cv_original_name || safe).replace(/"/g, "")
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": candidate.cv_mime || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return new NextResponse("No encontrado", { status: 404 })
  }
}
