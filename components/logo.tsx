import Image from "next/image"

export function Logo({
  size = 32,
  rounded = "rounded-lg",
  className = "",
}: {
  size?: number
  rounded?: string
  className?: string
}) {
  return (
    <Image
      src="/images/logo.svg"
      alt="Marcos Barbosa Group"
      width={size}
      height={size}
      unoptimized
      priority
      className={`${rounded} ${className}`}
    />
  )
}
