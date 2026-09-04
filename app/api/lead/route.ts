import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const leadSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  plan: z.enum([
    "Plan 1 Consultor",
    "Plan 2 Consejero",
    "Plan 3 Director Externo",
    "Plan 4 Corporativo",
  ]),
  mensaje: z.string().max(2000).optional().or(z.literal("")),
})

type LeadBody = z.infer<typeof leadSchema>

// Fallback persistence — data/leads.jsonl
async function saveFallbackLead(payload: Record<string, unknown>) {
  try {
    const dataDir = path.join(process.cwd(), "data")
    await fs.mkdir(dataDir, { recursive: true })
    const filePath = path.join(dataDir, "leads.jsonl")
    const line = JSON.stringify({ ...payload, _receivedAt: new Date().toISOString() }) + "\n"
    await fs.appendFile(filePath, line, "utf-8")
    return filePath
  } catch (err) {
    console.error("[api/lead] fallback write failed:", err)
    return null
  }
}

function toCrmPayload(body: LeadBody) {
  const parts = body.name.trim().split(/\s+/)
  const firstName = parts[0] ?? body.name
  const lastName = parts.slice(1).join(" ") || "-"

  return {
    firstName,
    lastName,
    email: body.email,
    phone: body.phone || undefined,
    planInteres: body.plan,
    // EspoCRM / Frappe mapped fields — keep original mensaje as description
    mensaje: body.mensaje || "",
    description: body.mensaje || "",
    // extra trace
    source: "web marcosbarbosagroup.com /api/lead",
    // keep raw for debugging
    rawPlan: body.plan,
  }
}

export async function POST(req: NextRequest) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validación falló",
        errors: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }

  const body = parsed.data
  const crmUrl =
    process.env.NEXT_PUBLIC_CRM_URL || process.env.CRM_URL || "https://crm.marcosbarbosagroup.com"

  const crmEndpoint = `${crmUrl.replace(/\/$/, "")}/api/resource/CRM%20Lead`
  const crmPayload = toCrmPayload(body)

  // Frappe REST: data field es un JSON stringificado (estándar frappe)
  const frappeBody = JSON.stringify({
    data: JSON.stringify({
      first_name: crmPayload.firstName,
      last_name: crmPayload.lastName,
      email: crmPayload.email,
      mobile_no: crmPayload.phone ?? "",
      custom_plan_interes: crmPayload.rawPlan ?? "",
      notes: crmPayload.mensaje || crmPayload.description,
      source: "Website",
    }),
  })

  // Try CRM with timeout
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const apiKey = process.env.CRM_API_KEY
    const apiSecret = process.env.CRM_API_SECRET

    const res = await fetch(crmEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && apiSecret
          ? { Authorization: `token ${apiKey}:${apiSecret}` }
          : {}),
      },
      body: frappeBody,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[api/lead] CRM responded ${res.status}:`, text.slice(0, 500))
      // Fallback — still succeed for user
      await saveFallbackLead({ ...body, _crmStatus: res.status, _crmError: text.slice(0, 1000) })
      return NextResponse.json({ ok: true, fallback: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[api/lead] CRM fetch failed, fallback to file:", msg)
    await saveFallbackLead({ ...body, _crmError: msg, _crmEndpoint: crmEndpoint })
    // Do not expose internal error to client as failure — lead is persisted
    return NextResponse.json({ ok: true, fallback: true })
  }
}

// Health check for GET
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "/api/lead", method: "POST" })
}
