"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// The Focusing Question Drawer
// Triggered from the hero section of the dashboard.
// Gary Keller's core filter: "What's the ONE thing I can do..."
// ─────────────────────────────────────────────────────────────────────────────

interface FocusingQuestionDrawerProps {
  open: boolean
  onClose: () => void
  objectiveTitle?: string
}

export function FocusingQuestionDrawer({ open, onClose, objectiveTitle }: FocusingQuestionDrawerProps) {
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  const [reflection, setReflection] = useState("")

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer — slides in from bottom */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-2xl mx-auto"
          >
            <div className="liquid-glass rounded-t-3xl border border-white/10 p-6 space-y-6">

              {/* Handle */}
              <div className="flex justify-center">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">
                    {t("The Focusing Question", "La Question Focalisante")}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* The Question */}
              <div className="space-y-2">
                <p className="text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                  {t(
                    "What's the ONE thing I can do",
                    "Quelle est la SEULE chose que je puisse faire"
                  )}
                  <br />
                  <span className="text-primary">
                    {t(
                      "such that by doing it, everything else becomes easier or unnecessary?",
                      "telle qu'en la faisant, tout le reste devient plus simple ou inutile ?"
                    )}
                  </span>
                </p>

                {objectiveTitle && (
                  <p className="text-xs text-muted-foreground">
                    {t("In the context of:", "Dans le contexte de :")}
                    {" "}
                    <span className="text-foreground/70">&ldquo;{objectiveTitle}&rdquo;</span>
                  </p>
                )}
              </div>

              {/* Reflection input */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t("Your answer right now", "Ta réponse maintenant")}
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder={t(
                    "The ONE thing I can do right now is...",
                    "La SEULE chose que je peux faire maintenant, c'est..."
                  )}
                  rows={3}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10",
                    "text-sm placeholder:text-muted-foreground/40",
                    "focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30",
                    "resize-none transition-colors"
                  )}
                />
              </div>

              {/* Close / commit */}
              <button
                onClick={onClose}
                className={cn(
                  "w-full h-12 rounded-xl font-medium text-sm transition-all",
                  reflection.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-white/5 border border-white/10 text-muted-foreground"
                )}
              >
                {reflection.trim()
                  ? t("Got it — back to focus", "Compris — retour au focus")
                  : t("Close", "Fermer")
                }
              </button>

              {/* Gary quote */}
              <p className="text-center text-[10px] text-muted-foreground/40 italic pb-2">
                {t("— Gary Keller, The ONE Thing", "— Gary Keller, The ONE Thing")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
