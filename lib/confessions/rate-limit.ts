type Entry = number[]

export class RateLimiter {
  private hits = new Map<string, Entry>()
  private readonly limit: number
  private readonly windowMs: number
  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs
  }

  check(key: string, now: number = Date.now()): { allowed: boolean; remaining: number } {
    const cutoff = now - this.windowMs
    const existing = this.hits.get(key) ?? []
    const fresh = existing.filter((ts) => ts > cutoff)
    fresh.push(now)
    this.hits.set(key, fresh)
    if (fresh.length > this.limit) {
      return { allowed: false, remaining: 0 }
    }
    return { allowed: true, remaining: this.limit - fresh.length }
  }

  reset(): void {
    this.hits.clear()
  }
}