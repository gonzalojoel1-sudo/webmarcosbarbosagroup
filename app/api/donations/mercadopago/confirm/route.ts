import { NextRequest, NextResponse } from "next/server"
import { getLedger } from "@/lib/donations/ledger"
import { isMpConfigured, searchLatestByReference } from "@/lib/donations/mp"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const externalReference = body?.externalReference

  if (!externalReference || typeof externalReference !== "string") {
    return NextResponse.json(
      { ok: false, error: "externalReference requerido" },
      { status: 400 }
    )
  }

  const ledger = getLedger()
  const intent = ledger.getByExternalReference(externalReference)
  if (!intent) {
    return NextResponse.json({ ok: true, status: "unknown" })
  }

  if (!isMpConfigured()) {
    return NextResponse.json({ ok: true, status: intent.status })
  }

  let payment
  try {
    payment = await searchLatestByReference(externalReference)
  } catch (err) {
    console.error(
      "[donations/mp/confirm] search failed:",
      err instanceof Error ? err.message : "error"
    )
    return NextResponse.json({ ok: true, status: intent.status })
  }

  if (!payment) {
    return NextResponse.json({ ok: true, status: intent.status })
  }

  if (payment.status === "approved") {
    const paidCents = Math.round((payment.transaction_amount ?? 0) * 100)
    if (payment.currency_id !== "ARS" || paidCents !== intent.amount_cents) {
      ledger.applyProviderPayment({
        externalReference,
        providerPaymentId: payment.id,
        status: "in_process",
        statusDetail: "amount_mismatch",
      })
      return NextResponse.json({ ok: true, status: "in_process" })
    }
  }

  ledger.applyProviderPayment({
    externalReference,
    providerPaymentId: payment.id,
    status: payment.status,
    statusDetail: payment.status_detail,
  })

  const updated = ledger.getByExternalReference(externalReference)
  return NextResponse.json({
    ok: true,
    status: updated?.status ?? payment.status,
    status_detail: updated?.status_detail ?? payment.status_detail,
  })
}
