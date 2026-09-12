"use server"

import { revalidatePath } from "next/cache"
import { getBoard } from "@/lib/board/store"
import { getConfessions } from "@/lib/confessions/store"
import { encrypt, getEncryptionKey } from "@/lib/confessions/crypto"
import { safeLog } from "@/lib/confessions/log"

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

// --- Confesionario ---

export async function markConfessionRead(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return
  const changed = getConfessions().markRead(id)
  safeLog("confession.markRead", { id, status: changed ? 200 : 304 })
  revalidatePath("/admin")
}

const MAX_NOTE = 8000

export async function setPastoralNote(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const note = String(formData.get("note") ?? "")
  if (!id || !note.trim()) return
  if (note.length > MAX_NOTE) return
  try {
    getEncryptionKey()
  } catch {
    safeLog("confession.setNote", { id, code: "key_missing" })
    return
  }
  let cipher: string
  try {
    cipher = encrypt(note)
  } catch {
    safeLog("confession.setNote", { id, code: "encrypt_failed" })
    return
  }
  const ok = getConfessions().setPastoralNote(id, cipher)
  safeLog("confession.setNote", { id, status: ok ? 200 : 404 })
  revalidatePath("/admin")
}

export async function deleteConfession(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  if (!id || confirm !== "BORRAR") return
  const ok = getConfessions().deleteConfession(id)
  safeLog("confession.delete", { id, status: ok ? 200 : 404 })
  revalidatePath("/admin")
}
