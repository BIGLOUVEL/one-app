"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface CustomIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  className?: string
}

const sizeClasses = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
  "2xl": "h-12 w-12",
}

const sizePx = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
}

export function IconTarget({ size = "md", className }: CustomIconProps) {
  return (
    <Image
      src="/FOCUS.png"
      alt="Focus"
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  )
}

export function IconBolt({ size = "md", className }: CustomIconProps) {
  return (
    <Image
      src="/BOLT.png"
      alt="Energy"
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  )
}

export function IconShield({ size = "md", className }: CustomIconProps) {
  return (
    <Image
      src="/SHIELD.png"
      alt="Shield"
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  )
}

export function IconFlame({ size = "md", className }: CustomIconProps) {
  return (
    <Image
      src="/FIRE.png"
      alt="Fire"
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  )
}

export function IconMolecule({ size = "md", className }: CustomIconProps) {
  return (
    <Image
      src="/MOLECULE.png"
      alt="Connect"
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  )
}
