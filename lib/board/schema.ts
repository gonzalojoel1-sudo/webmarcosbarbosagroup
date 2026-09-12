import { z } from "zod"

const optionalText = (max: number) =>
  z.string().max(max).optional().or(z.literal(""))

export const jobSchema = z.object({
  company: z.string().min(2).max(120),
  title: z.string().min(2).max(140),
  location: optionalText(120),
  modality: z.enum(["remoto", "presencial", "hibrido"]).optional().or(z.literal("")),
  salaryRange: optionalText(80),
  description: z.string().min(20).max(4000),
  contactName: z.string().min(2).max(120),
  contactEmail: z.string().email().max(160),
  contactPhone: optionalText(30),
  honeypot: z.string().max(0).optional().or(z.literal("")),
})

export const candidateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: optionalText(30),
  desiredRole: optionalText(140),
  experience: optionalText(4000),
  consent: z.literal(true),
  honeypot: z.string().max(0).optional().or(z.literal("")),
})

export type JobInput = z.infer<typeof jobSchema>
export type CandidateInput = z.infer<typeof candidateSchema>

export const MAX_CV_BYTES = 5 * 1024 * 1024
export const ALLOWED_CV: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}
