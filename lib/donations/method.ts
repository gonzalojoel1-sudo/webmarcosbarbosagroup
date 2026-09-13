export function defaultMethod(mpReady: boolean): "mercadopago" | "transferencia" {
  return mpReady ? "mercadopago" : "transferencia"
}