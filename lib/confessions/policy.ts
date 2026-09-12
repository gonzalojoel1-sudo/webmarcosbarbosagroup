export const POLICY_VERSION = "2026-09-12-v1" as const

export type PolicyCopy = {
  version: typeof POLICY_VERSION
  consentText: string
  storageNote: string
}

export const CONFESSION_POLICY: PolicyCopy = {
  version: POLICY_VERSION,
  consentText:
    "Entiendo que este mensaje queda guardado cifrado hasta que Marcos lo lea y decida borrarlo. No se publica ni se comparte.",
  storageNote:
    "Los mensajes se cifran con AES-256-GCM antes de guardarse. La clave vive en variable de entorno fuera del volumen.",
}
