"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-16 w-16",
}

const sizePx = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 64,
}

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <Image
      src="/LOGO.png"
      alt="ONE"
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(sizeClasses[size], "object-contain", className)}
      priority
    />
  )
}
