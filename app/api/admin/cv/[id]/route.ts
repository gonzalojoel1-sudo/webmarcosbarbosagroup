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

  let dir: string
  try {
    dir = path.resolve(cvsDir())
  } catch {
    console.error("[admin/cv] storage unavailable")
    return new NextResponse("No disponible", { status: 503 })
  }

  const full = path.join(dir, path.basename(candidate.cv_file))
  if (full !== dir && !full.startsWith(dir + path.sep)) {
    return new NextResponse("No encontrado", { status: 404 })
  }

  const ext = path.extname(full).replace(".", "") || "pdf"
  const downloadName = `cv-${candidate.id}.${ext}`

  try {
    const buf = await readFile(full)
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": candidate.cv_mime || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return new NextResponse("No encontrado", { status: 404 })
  }
}
