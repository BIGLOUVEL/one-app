"use client"

import { motion } from "framer-motion"
import { Settings, Palette, Check } from "lucide-react"
import { useTheme, UITheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const themes: { id: UITheme; name: string; description: string; preview: { bg: string; accent: string; text: string } }[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Dark, sleek, tech-forward design with electric green accents",
    preview: {
      bg: "bg-[hsl(220,20%,4%)]",
      accent: "bg-[hsl(150,100%,42%)]",
      text: "text-[hsl(150,100%,95%)]",
    },
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Swiss editorial style with warm paper tones and ink accents",
    preview: {
      bg: "bg-[hsl(42,33%,96%)]",
      accent: "bg-[hsl(15,70%,50%)]",
      text: "text-[hsl(20,10%,12%)]",
    },
  },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        {/* Theme Section */}
        <section className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred visual theme
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {themes.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative rounded-xl border-2 p-4 text-left transition-all duration-200",
                    theme === t.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {/* Selected indicator */}
                  {theme === t.id && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}

                  {/* Preview */}
                  <div className={cn(
                    "mb-3 h-20 rounded-lg overflow-hidden border border-white/10",
                    t.preview.bg
                  )}>
                    <div className="h-full p-3 flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", t.preview.accent)} />
                        <div className={cn("h-1.5 w-12 rounded-full opacity-60", t.preview.text, "bg-current")} />
                      </div>
                      <div className="space-y-1.5">
                        <div className={cn("h-1.5 w-full rounded-full opacity-20", t.preview.text, "bg-current")} />
                        <div className={cn("h-1.5 w-3/4 rounded-full opacity-20", t.preview.text, "bg-current")} />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold mb-1">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* More settings sections can be added here */}
        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground text-center">
            More settings coming soon
          </p>
        </div>
      </motion.div>
    </div>
  )
}
