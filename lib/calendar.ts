import { theme } from "@/config/theme"

const url = theme.calendar.url.trim()

export const bookingUrl = url || null

/** href para CTAs de agenda: booking page si está configurada, si no /contacto */
export const agendaHref = bookingUrl ?? "/contacto"

/** target/rel solo si es link externo (booking) */
export const agendaLinkProps = bookingUrl
  ? { target: "_blank" as const, rel: "noopener noreferrer" }
  : {}
