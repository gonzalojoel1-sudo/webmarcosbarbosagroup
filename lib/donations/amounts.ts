import { z } from "zod"

export const PRESET_AR_S = [1000, 5000, 10000, 20000, 50000] as const
export const MIN_AR_S = 100
export const SANITY_MAX_AR_S = 50_000_000

export const donationIntentSchema = z
  .object({
    presetId: z.number().int().min(0).max(PRESET_AR_S.length - 1).optional(),
    customArs: z.number().int().positive().optional(),
    method: z.enum(["mercadopago", "transferencia"]),
    donorEmail: z.string().email().max(160).optional().or(z.literal("")),
    attemptId: z.string().uuid().optional(),
  })
  .refine((v) => v.presetId !== undefined || v.customArs !== undefined, {
    message: "Elegí o ingresá un monto",
  })

export type DonationIntentInput = z.infer<typeof donationIntentSchema>

export function resolveAmountCents(input: {
  presetId?: number
  customArs?: number
}): number {
  if (input.presetId !== undefined) {
    const ars = PRESET_AR_S[input.presetId]
    if (ars === undefined) throw new Error("Monto inválido")
    return ars * 100
  }
  const ars = input.customArs as number
  if (!Number.isInteger(ars) || ars < MIN_AR_S || ars > SANITY_MAX_AR_S) {
    throw new Error("Monto fuera de rango")
  }
  return ars * 100
}

export function centsToArs(cents: number): number {
  return Math.round(cents) / 100
}
