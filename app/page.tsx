import { Hero } from "@/components/hero"
import { Pillars } from "@/components/pillars"
import { MethodologyPreview } from "@/components/methodology-preview"
import { PlansTable } from "@/components/plans-table"
import { Founder } from "@/components/founder"

export default function Home() {
  return (
    <>
      <Hero />
      <Pillars />
      <MethodologyPreview />
      <PlansTable />
      <Founder />
    </>
  )
}
