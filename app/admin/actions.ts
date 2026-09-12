"use server"

import { revalidatePath } from "next/cache"
import { getBoard } from "@/lib/board/store"

const JOB_STATUS = new Set(["new", "contacted", "closed"])
const CANDIDATE_STATUS = new Set(["new", "contacted", "closed"])

export async function setJobStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "")
  if (id && JOB_STATUS.has(status)) {
    getBoard().setJobStatus(id, status)
    revalidatePath("/admin")
  }
}

export async function setCandidateStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "")
  if (id && CANDIDATE_STATUS.has(status)) {
    getBoard().setCandidateStatus(id, status)
    revalidatePath("/admin")
  }
}
