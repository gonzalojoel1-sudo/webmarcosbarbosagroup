import { GroupHero } from "@/components/home/group-hero"
import { VerticalsGrid } from "@/components/home/verticals-grid"
import { VisionBand } from "@/components/home/vision-band"
import { Founder } from "@/components/founder"
import { CtaBand } from "@/components/site/blocks"

export default function Home() {
  return (
    <>
      <GroupHero />
      <VerticalsGrid />
      <VisionBand />
      <Founder />
      <CtaBand
        title="Hablemos de lo que necesitás."
        sub="Contanos tu desafío y te orientamos a la vertical correcta."
      />
    </>
  )
}
