import { z } from "zod"
import { POLICY_VERSION } from "./policy.ts"

export { POLICY_VERSION }

export const MIN_MESSAGE = 20
export const MAX_MESSAGE = 4000
export const MAX_PSEUDONYM = 60

const optionalShort = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""))

const phoneRe = /^\+?[\d\s\-()]{8,16}$/
const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export const confessionSchema = z
  .object({
    message: z.string().trim().min(MIN_MESSAGE).max(MAX_MESSAGE),
    pseudonym: optionalShort(MAX_PSEUDONYM),
    wantsResponse: z.boolean(),
    contactMethod: z.enum(["email", "whatsapp"]).optional(),
    contactValue: optionalShort(160),
    consent: z.literal(true),
    policyVersion: z.literal(POLICY_VERSION),
    honeypot: z.string().max(255).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (val.wantsResponse && (!val.contactMethod || !val.contactValue)) {
      ctx.addIssue({
        code: "custom",
        message: "Falta canal de contacto",
        path: ["contactValue"],
      })
    }
    if (val.contactMethod === "email" && val.contactValue && !emailRe.test(val.contactValue)) {
      ctx.addIssue({
        code: "custom",
        message: "Email inválido",
        path: ["contactValue"],
      })
    }
    if (val.contactMethod === "whatsapp" && val.contactValue && !phoneRe.test(val.contactValue)) {
      ctx.addIssue({
        code: "custom",
        message: "WhatsApp inválido",
        path: ["contactValue"],
      })
    }
  })

export type ConfessionInput = z.infer<typeof confessionSchema>
