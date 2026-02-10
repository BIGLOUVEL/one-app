"use client"

import * as React from "react"

export type UITheme = "modern" | "elegant" | "stoic" | "monk"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: UITheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: UITheme
  setTheme: (theme: UITheme) => void
}

const VALID_THEMES: UITheme[] = ["modern", "elegant", "stoic", "monk"]

const initialState: ThemeProviderState = {
  theme: "modern",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "modern",
  storageKey = "one-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<UITheme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey) as UITheme | null
    if (stored && VALID_THEMES.includes(stored)) {
      setThemeState(stored)
    }
  }, [storageKey])

  React.useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("theme-modern", "theme-elegant", "theme-stoic", "theme-monk")

    // Add the current theme class (modern is default/root, others get explicit class)
    if (theme !== "modern") {
      root.classList.add(`theme-${theme}`)
    }

    // Add/remove font preset classes
    root.classList.remove("font-preset-stoic", "font-preset-monk")
    if (theme === "stoic") {
      root.classList.add("font-preset-stoic")
    } else if (theme === "monk") {
      root.classList.add("font-preset-monk")
    }

    // Store preference
    localStorage.setItem(storageKey, theme)
  }, [theme, mounted, storageKey])

  const setTheme = React.useCallback((newTheme: UITheme) => {
    setThemeState(newTheme)
  }, [])

  const value = React.useMemo(() => ({
    theme,
    setTheme,
  }), [theme, setTheme])

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider {...props} value={value}>
        {children}
      </ThemeProviderContext.Provider>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
