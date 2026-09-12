import path from "node:path"

export type CvExt = "pdf" | "doc" | "docx"

export function sniffCvExt(bytes: Uint8Array): CvExt | null {
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return "pdf"
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    return "docx"
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 &&
    bytes[5] === 0xb1 &&
    bytes[6] === 0x1a &&
    bytes[7] === 0xe1
  ) {
    return "doc"
  }
  return null
}

export function nameExtension(name: string): string {
  return (name.split(".").pop() || "").toLowerCase()
}

export function safeOriginalName(name: string): string {
  const base = path.basename(name || "").replace(/[\u0000-\u001f\u007f]/g, "")
  return base.slice(0, 255) || "cv"
}
