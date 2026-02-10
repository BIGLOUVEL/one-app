import type { Metadata } from "next"
import { Outfit, Fraunces, Cormorant_Garamond, Crimson_Pro, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"

// CLASSIC - Original fonts (Fraunces + Outfit)
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
})

// STOIC - Classical fonts (Cormorant Garamond + Crimson Pro)
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-stoic-display",
  weight: ["300", "400", "500", "600", "700"],
})

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-stoic-body",
  weight: ["300", "400", "500", "600", "700"],
})

// MONK - Terminal monospace (JetBrains Mono)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-monk",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "ONE - One Objective. Total Focus.",
  description: "Not a task manager. A focus operating system. Pick ONE objective. Lock it in. Execute daily.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${fraunces.variable} ${cormorantGaramond.variable} ${crimsonPro.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="modern">
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
