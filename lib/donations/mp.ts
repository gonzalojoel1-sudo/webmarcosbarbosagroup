import { MercadoPagoConfig, Preference, Payment } from "mercadopago"
import { centsToArs } from "./amounts"

export function isMpConfigured(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN)
}

export function isMpCheckoutReady(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET)
}

function config(): MercadoPagoConfig {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error("MP_NOT_CONFIGURED")
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } })
}

export async function createPreference({
  donationId,
  cents,
  donorEmail,
  siteUrl,
}: {
  donationId: string
  cents: number
  donorEmail?: string
  siteUrl: string
}): Promise<{ preferenceId: string; initPoint: string }> {
  const preference = new Preference(config())
  const base = siteUrl.replace(/\/$/, "")
  const res = await preference.create({
    body: {
      items: [
        {
          id: "ofrenda",
          title: "Ofrenda — Cuerpo de Cristo",
          description: "Ofrenda voluntaria",
          quantity: 1,
          currency_id: "ARS",
          unit_price: centsToArs(cents),
        },
      ],
      ...(donorEmail ? { payer: { email: donorEmail } } : {}),
      external_reference: donationId,
      back_urls: {
        success: `${base}/cuerpo-de-cristo/ofrenda/gracias?status=success`,
        failure: `${base}/cuerpo-de-cristo/ofrenda/gracias?status=failure`,
        pending: `${base}/cuerpo-de-cristo/ofrenda/gracias?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${base}/api/webhooks/mercadopago`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 3600_000).toISOString(),
    },
    requestOptions: { idempotencyKey: donationId },
  })

  const isSandbox = (process.env.MP_ENV || "production") === "sandbox"
  const initPoint = isSandbox
    ? res.sandbox_init_point || res.init_point
    : res.init_point

  if (!res.id || !initPoint) throw new Error("MP_PREFERENCE_INCOMPLETE")
  return { preferenceId: String(res.id), initPoint: String(initPoint) }
}

export type ProviderPayment = {
  id: string | number
  status: string
  status_detail?: string
  transaction_amount?: number
  currency_id?: string
  external_reference?: string
}

export async function getPayment(id: string | number): Promise<ProviderPayment> {
  const res = await new Payment(config()).get({ id })
  return res as unknown as ProviderPayment
}

export async function searchLatestByReference(ref: string): Promise<ProviderPayment | null> {
  const res = await new Payment(config()).search({
    options: { external_reference: ref, sort: "date_created", criteria: "desc" },
  })
  const results = (res as unknown as { results?: ProviderPayment[] })?.results ?? []
  const approved = results.find((p) => p.status === "approved")
  return approved ?? results[0] ?? null
}
