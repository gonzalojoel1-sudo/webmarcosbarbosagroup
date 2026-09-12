import type { Metadata } from "next"
import { getVertical } from "@/config/verticals"
import { ContentPage } from "@/components/site/content-page"
import { SectionShell } from "@/components/site/section-shell"
import { SectionHead, Prose, BulletGrid, CtaBand } from "@/components/site/blocks"

export const metadata: Metadata = {
  title: "Qué es Legendarios — Movimiento Global | Legendarios",
  description:
    "Qué es Legendarios: movimiento cristocéntrico interdenominacional fundado en 2015 en Guatemala, presente en más de 170 ciudades del mundo y activo en Argentina.",
  alternates: { canonical: "https://marcosbarbosagroup.com/legendarios/que-es" },
}

export default function Page() {
  const vertical = getVertical("legendarios")!
  const child = vertical.children.find((c) => c.slug.endsWith("/que-es"))!
  return (
    <ContentPage
      vertical={vertical}
      child={child}
      title="Qué es"
      italic="Legendarios."
      intro="Un movimiento cristocéntrico e interdenominacional que busca transformar hombres, familias y comunidades. [VALIDAR] Nació en Guatemala en 2015 y hoy está en más de 170 ciudades del mundo."
      chips={["Global", "Argentina", "Propósito"]}
      cta={{ href: "/contacto", label: "Quiero saber más" }}
    >
      <SectionShell>
        <SectionHead kicker="El movimiento" title="Devolver el héroe cazador" italic="a cada familia." />
        <Prose>
          <p>
            <strong>Legendarios</strong> es un movimiento creado para transformar
            hombres a través de experiencias profundas que despiertan su mejor
            versión y los reconectan con su propósito. Su declaración es formar
            hombres <strong>inquebrantables ante el pecado, pero quebrantados
            delante de Dios</strong>.
          </p>
          <p>
            El nombre nació de una conversación sobre los héroes del pasado —los
            padres y abuelos— y la falta de historias propias para transmitir.
            &ldquo;Legendario&rdquo; viene de <em>legere</em>: un hombre cuya vida es una historia
            digna de ser contada. El Legendario N.º 1 es Jesús.
          </p>
          <p>
            No pertenece a una iglesia ni denominación: es un movimiento que
            sirve a la iglesia y se enfoca en los hombres, un segmento
            frecuentemente difícil de alcanzar con métodos tradicionales.
          </p>
        </Prose>
      </SectionShell>

      <SectionShell className="border-t border-hairline">
        <SectionHead kicker="Cómo funciona" title="El TOP y las" italic="manadas." />
        <BulletGrid
          items={[
            { title: "El TOP", desc: "Track Outdoor de Potencial: 4 días de desafío físico, mental y espiritual." },
            { title: "Ser Legendario", desc: "No es automático: se llega al superar el proceso del TOP." },
            { title: "Manadas", desc: "Pequeñas comunidades donde cada hombre sana, es retado y camina." },
            { title: "Valores AHU", desc: "Amor, Honra y Unidad como forma de liderar." },
            { title: "La camiseta naranja", desc: "Símbolo de esfuerzo, perseverancia y transformación." },
            { title: "Legado", desc: "Hombres que se convierten en los héroes de sus generaciones." },
          ]}
        />
      </SectionShell>

      <SectionShell className="border-t border-hairline">
        <SectionHead kicker="En Argentina" title="El movimiento" italic="ya está acá." />
        <Prose>
          <p>
            Legendarios está activo en Argentina, con sedes y encuentros como{" "}
            <strong>[VALIDAR] Legendarios Buenos Aires</strong> y tracks de
            potencial en el país. [VALIDAR] Fundado en Guatemala en 2015, el
            movimiento ya impactó a más de 135.000 hombres en más de 170
            ciudades, 20 países y 3 continentes.
          </p>
          <p>
            [VALIDAR] Líderes locales, sedes oficiales y calendario en Argentina
            deben confirmarse con el equipo nacional antes de publicar.
          </p>
          <p className="text-xs">
            Fuentes: loslegendarios.org (el movimiento y su historia),
            quintopoder.com.gt (alcance de 170 ciudades y 135.000 hombres),
            legendariosbuenosaires.com (presencia en Argentina). Consulta:
            2026-09.
          </p>
        </Prose>
      </SectionShell>

      <CtaBand title="¿Querés ser parte?" sub="Escribinos y te contamos por dónde empezar." label="Quiero saber más" />
    </ContentPage>
  )
}
