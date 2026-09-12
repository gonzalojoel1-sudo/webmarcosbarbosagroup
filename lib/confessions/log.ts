const ALLOWED = new Set(["id", "status", "code", "count", "ms"])

function shortId(v: unknown): string {
  const s = String(v ?? "")
  return s.slice(0, 8)
}

export function safeLog(event: string, fields: Record<string, unknown>): void {
  const parts: string[] = [`event=${event}`]
  for (const key of Object.keys(fields)) {
    if (!ALLOWED.has(key)) continue
    const value = key === "id" ? shortId(fields[key]) : fields[key]
    parts.push(`${key}=${String(value)}`)
  }
  console.log(parts.join(" "))
}
