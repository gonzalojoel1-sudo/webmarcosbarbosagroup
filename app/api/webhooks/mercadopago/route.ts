import { NextRequest, NextResponse } from "next/server"
import { getLedger } from "@/lib/donations/ledger"
import { getPayment, isMpConfigured } from "@/lib/donations/mp"
import { verifyMpSignature } from "@/lib/donations/signature"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id")
  const topic = url.searchParams.get("type") || url.searchParams.get("topic")

  const signature = verifyMpSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId,
  })

  if (!signature.ok) {
    console.warn("[webhooks/mp] invalid signature:", signature.reason)
    return new NextResponse(null, { status: 401 })
  }

  if (topic && topic !== "payment") {
    return new NextResponse(null, { status: 200 })
  }

  if (!dataId || !isMpConfigured()) {
    return new NextResponse(null, { status: 200 })
  }

  let payload: { id?: string | number; action?: string } | null = null
  try {
    payload = await req.json()
  } catch {
    payload = null
  }

  const eventId = payload?.id
    ? String(payload.id)
    : `pay:${dataId}:${payload?.action ?? "unknown"}`

  const ledger = getLedger()
  if (!ledger.recordWebhookEvent("mercadopago", eventId)) {
    return new NextResponse(null, { status: 200 })
  }

  let payment
  try {
    payment = await getPayment(dataId)
  } catch (err) {
    console.error(
      "[webhooks/mp] fetch payment failed:",
      err instanceof Error ? err.message : "error"
    )
    return new NextResponse(null, { status: 200 })
  }

  const ref = payment.external_reference
  if (!ref) return new NextResponse(null, { status: 200 })

  const intent = ledger.getByExternalReference(ref)
  if (!intent) {
    console.warn("[webhooks/mp] no intent for reference")
    return new NextResponse(null, { status: 200 })
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
      return new NextResponse(null, { status: 200, headers: { "Cache-Control": "no-store" } })
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

  return new NextResponse(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
