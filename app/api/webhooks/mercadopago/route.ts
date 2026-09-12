import { NextRequest, NextResponse } from "next/server"
import { getLedger } from "@/lib/donations/ledger"
import { getPayment, isMpConfigured } from "@/lib/donations/mp"
import { verifyMpSignature } from "@/lib/donations/signature"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const noContent = (status: number) => new NextResponse(null, { status, headers: NO_STORE })

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id")
  const topic = url.searchParams.get("type") || url.searchParams.get("topic")

  if (topic && topic !== "payment") {
    return noContent(200)
  }

  const signature = verifyMpSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId,
  })
  if (!signature.ok) {
    console.warn("[webhooks/mp] rejected signature:", signature.reason)
    return noContent(401)
  }

  if (!dataId || !isMpConfigured()) {
    return noContent(200)
  }

  let payload: { id?: string | number } | null = null
  try {
    payload = await req.json()
  } catch {
    payload = null
  }
  const eventId = payload?.id ? String(payload.id) : null

  const ledger = getLedger()
  if (eventId && ledger.hasWebhookEvent("mercadopago", eventId)) {
    return noContent(200)
  }

  let payment
  try {
    payment = await getPayment(dataId)
  } catch {
    console.error("[webhooks/mp] provider fetch failed")
    return noContent(503)
  }

  const ref = payment.external_reference
  if (!ref) return noContent(200)

  const intent = ledger.getByExternalReference(ref)
  if (!intent) {
    console.warn("[webhooks/mp] no intent for reference")
    return noContent(200)
  }

  if (payment.status === "approved") {
    const paidCents = Math.round((payment.transaction_amount ?? 0) * 100)
    if (payment.currency_id !== "ARS" || paidCents !== intent.amount_cents) {
      ledger.applyProviderPayment({
        externalReference: ref,
        providerPaymentId: payment.id,
        status: "in_process",
        statusDetail: "amount_mismatch",
      })
      if (eventId) ledger.recordWebhookEvent("mercadopago", eventId)
      return noContent(200)
    }
  }

  ledger.applyProviderPayment({
    externalReference: ref,
    providerPaymentId: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
    rawJson: JSON.stringify({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
    }),
  })
  if (eventId) ledger.recordWebhookEvent("mercadopago", eventId)

  return noContent(200)
}
