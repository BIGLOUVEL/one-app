"use client"

import { Palette } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "modern" ? "elegant" : "modern")}
      className="relative"
    >
      <Palette className="h-5 w-5" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
