import crypto from "node:crypto"
import assert from "node:assert/strict"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

async function main() {
  const tmp = mkdtempSync(join(tmpdir(), "donations-check-"))
  process.env.MP_WEBHOOK_SECRET = "test-secret"
  process.env.DONATIONS_DATA_DIR = tmp

  const amounts = await import("../lib/donations/amounts.ts")
  const { createSqliteLedger } = await import("../lib/donations/ledger.ts")
  const { verifyMpSignature } = await import("../lib/donations/signature.ts")

  let passed = 0
  const ok = (name: string, fn: () => void) => {
    fn()
    passed++
    console.log(`PASS  ${name}`)
  }

  ok("preset 1000 ARS -> 100000 centavos", () => {
    assert.equal(amounts.resolveAmountCents({ presetId: 0 }), 100000)
  })
  ok("preset 50000 ARS -> 5000000 centavos", () => {
    assert.equal(amounts.resolveAmountCents({ presetId: 4 }), 5000000)
  })
  ok("custom 3500 ARS -> 350000 centavos", () => {
    assert.equal(amounts.resolveAmountCents({ customArs: 3500 }), 350000)
  })
  ok("custom bajo el mínimo lanza", () => {
    assert.throws(() => amounts.resolveAmountCents({ customArs: 50 }))
  })
  ok("custom no entero lanza", () => {
    assert.throws(() => amounts.resolveAmountCents({ customArs: 10.5 }))
  })
  ok("centsToArs(350000) === 3500", () => {
    assert.equal(amounts.centsToArs(350000), 3500)
  })
  ok("presetId fuera de rango lanza", () => {
    assert.throws(() => amounts.resolveAmountCents({ presetId: 99 }))
  })

  const dataId = "123456"
  const xRequestId = "req-abc"
  const ts = String(Math.floor(Date.now() / 1000))
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const v1 = crypto
    .createHmac("sha256", "test-secret")
    .update(manifest)
    .digest("hex")

  ok("firma válida aceptada", () => {
    const r = verifyMpSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId,
      dataId,
    })
    assert.equal(r.ok, true)
  })
  ok("firma inválida rechazada", () => {
    const r = verifyMpSignature({
      xSignature: `ts=${ts},v1=deadbeef`,
      xRequestId,
      dataId,
    })
    assert.equal(r.ok, false)
  })
  ok("firma sin header rechazada", () => {
    const r = verifyMpSignature({ xSignature: null, xRequestId, dataId })
    assert.equal(r.ok, false)
  })

  const ledger = createSqliteLedger(join(tmp, "donations.db"))
  const ref = "11111111-1111-4111-8111-111111111111"

  ok("intención pendiente persistida", () => {
    ledger.upsertIntent({
      id: ref,
      provider: "mercadopago",
      amountCents: 500000,
      currency: "ARS",
      externalReference: ref,
    })
    const row = ledger.getByExternalReference(ref)
    assert.equal(row?.status, "pending")
    assert.equal(row?.amount_cents, 500000)
  })
  ok("intención duplicada no duplica fila", () => {
    ledger.upsertIntent({
      id: ref,
      provider: "mercadopago",
      amountCents: 500000,
      currency: "ARS",
      externalReference: ref,
    })
    assert.equal(ledger.list().length, 1)
  })
  ok("dedupe de evento (mismo id => false)", () => {
    assert.equal(ledger.recordWebhookEvent("mercadopago", "evt-1"), true)
    assert.equal(ledger.recordWebhookEvent("mercadopago", "evt-1"), false)
  })
  ok("hasWebhookEvent refleja lo insertado", () => {
    assert.equal(ledger.hasWebhookEvent("mercadopago", "evt-1"), true)
    assert.equal(ledger.hasWebhookEvent("mercadopago", "evt-x"), false)
  })
  ok("intención pendiente actualiza el monto al reintentar", () => {
    ledger.upsertIntent({
      id: ref,
      provider: "mercadopago",
      amountCents: 100000,
      currency: "ARS",
      externalReference: ref,
    })
    assert.equal(ledger.getByExternalReference(ref)?.amount_cents, 100000)
    assert.equal(ledger.list().length, 1)
  })
  ok("aprobar pago actualiza estado", () => {
    ledger.applyProviderPayment({
      externalReference: ref,
      providerPaymentId: "999",
      status: "approved",
    })
    const row = ledger.getByExternalReference(ref)
    assert.equal(row?.status, "approved")
    assert.ok(row?.approved_at)
    assert.equal(row?.provider_payment_id, "999")
  })
  ok("rechazo/cancelación posterior no des-aprueba", () => {
    ledger.applyProviderPayment({
      externalReference: ref,
      providerPaymentId: "999",
      status: "rejected",
      statusDetail: "cc_rejected_other_reason",
    })
    assert.equal(ledger.getByExternalReference(ref)?.status, "approved")
    ledger.applyProviderPayment({
      externalReference: ref,
      providerPaymentId: "999",
      status: "cancelled",
    })
    assert.equal(ledger.getByExternalReference(ref)?.status, "approved")
  })
  ok("intención ya aprobada no cambia de monto", () => {
    ledger.upsertIntent({
      id: ref,
      provider: "mercadopago",
      amountCents: 777777,
      currency: "ARS",
      externalReference: ref,
    })
    assert.equal(ledger.getByExternalReference(ref)?.amount_cents, 100000)
  })
  ok("reembolso avanza el estado", () => {
    ledger.applyProviderPayment({
      externalReference: ref,
      providerPaymentId: "999",
      status: "refunded",
    })
    assert.equal(ledger.getByExternalReference(ref)?.status, "refunded")
  })
  ok("transición regresiva no retrocede", () => {
    ledger.applyProviderPayment({
      externalReference: ref,
      providerPaymentId: "999",
      status: "approved",
    })
    assert.equal(ledger.getByExternalReference(ref)?.status, "refunded")
  })
  ok("in_process -> rejected se aplica", () => {
    const ref2 = "22222222-2222-4222-8222-222222222222"
    ledger.upsertIntent({
      id: ref2,
      provider: "mercadopago",
      amountCents: 100000,
      currency: "ARS",
      externalReference: ref2,
    })
    ledger.applyProviderPayment({
      externalReference: ref2,
      providerPaymentId: "777",
      status: "in_process",
    })
    assert.equal(ledger.getByExternalReference(ref2)?.status, "in_process")
    ledger.applyProviderPayment({
      externalReference: ref2,
      providerPaymentId: "777",
      status: "rejected",
      statusDetail: "cc_rejected_other_reason",
    })
    assert.equal(ledger.getByExternalReference(ref2)?.status, "rejected")
  })
  ok("approved -> refunded se aplica", () => {
    const ref3 = "33333333-3333-4333-8333-333333333333"
    ledger.upsertIntent({
      id: ref3,
      provider: "mercadopago",
      amountCents: 100000,
      currency: "ARS",
      externalReference: ref3,
    })
    ledger.applyProviderPayment({
      externalReference: ref3,
      providerPaymentId: "888",
      status: "approved",
    })
    ledger.applyProviderPayment({
      externalReference: ref3,
      providerPaymentId: "888",
      status: "refunded",
    })
    assert.equal(ledger.getByExternalReference(ref3)?.status, "refunded")
  })

  console.log(`\nOK: ${passed} verificaciones de ofrendas`)
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err)
  process.exit(1)
})
