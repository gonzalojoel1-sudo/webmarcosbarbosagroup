import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago"

export function verifyMpSignature({
  xSignature,
  xRequestId,
  dataId,
}: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}): { ok: true } | { ok: false; reason: string } {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return { ok: false, reason: "not_configured" }
  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret,
      toleranceSeconds: 300,
    })
    return { ok: true }
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      return { ok: false, reason: err.reason }
    }
    return { ok: false, reason: "invalid" }
  }
}
