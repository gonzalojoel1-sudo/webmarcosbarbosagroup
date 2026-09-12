export const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000
export const ABSOLUTE_TIMEOUT_MS = 14 * 24 * 60 * 60 * 1000
export const COOKIE_NAME = "__Host-pastor_session" as const
export const POLICY_VERSION = "2026-09-12-v1" as const

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
export const RATE_LIMIT_MAX = 5

// Mismo primitivo que lib/confessions/crypto.ts (cifrado AES-256-GCM)
export const VERSION_BYTE = 0x01
export const VERSION_PREFIX = "0x01"

export const IV_LEN = 12
export const TAG_LEN = 16
