import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose } from "@/components/site/blocks"
import { ConfessionForm } from "@/components/confessions/confession-form"

export const metadata: Metadata = {
  title: "Confesionario — Un lugar para librarte de tus cargas | Cuerpo de Cristo",
  description:
    "Un buzón privado y cifrado para escribir lo que te pesa. Escucha pastoral sin juicio.",
  alternates: { canonical: "https://marcosbarbosagroup.com/cuerpo-de-cristo/confesionario" },
  robots: { index: true, follow: true },
}

export default function Page() {
  const vertical = getVertical("cuerpo-de-cristo")!
  const child = vertical.children.find((c) => c.slug.endsWith("/confesionario"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Buzón privado"
      italic="para escribir lo que te pesa."
      intro="Un espacio reservado para hablar con libertad. Tu mensaje queda guardado cifrado y solo Marcos lo lee."
      chips={["Confidencial", "Sin juicio", "Cifrado"]}
    >
      <SectionShell>
        <SectionHead
          kicker="Buzón privado"
          title="Escribí con"
          italic="libertad."
          sub="Sin prisa. Sin formato. Sin nombre si no querés."
        />
        <div className="max-w-2xl mx-auto mt-8">
          <ConfessionForm />
        </div>
        <div className="mt-10 max-w-2xl mx-auto">
          <Prose>
            <p className="text-xs text-fg-muted">
              Tu mensaje se cifra antes de guardarse. La clave vive en una
              variable de entorno fuera de este sitio. No guardamos tu IP
              (solo un hash irreversible para evitar abuso). Ver{" "}
              <a href="/privacidad#confesionario" className="underline">
                política de privacidad
              </a>
              .
            </p>
          </Prose>
        </div>
      </SectionShell>
    </ContentPage>
  )
}
