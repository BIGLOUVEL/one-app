"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { DominoPath } from "@/components/app/domino-path"
import { CascadeView } from "@/components/app/cascade-view"

export default function DominoPage() {
  const router = useRouter()
  const { objective } = useAppStore()
  const hasHydrated = useHasHydrated()

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  if (!hasHydrated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!objective) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">{t("No objective defined.", "Aucun objectif défini.")}</p>
          <Button onClick={() => router.push("/app/onboarding")}>
            {t("Define your ONE Thing", "Définir ton ONE Thing")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Domino</h1>
            <p className="text-xs text-muted-foreground">{t("Progress & alignment", "Progression & alignement")}</p>
          </div>
        </motion.div>

        {/* Domino Progression */}
        <DominoPath />

        {/* Divider */}
        <div className="flex items-center gap-4 px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">{t("Alignment", "Alignement")}</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border/50 to-transparent" />
        </div>

        {/* Cascade Alignment */}
        <CascadeView />
      </div>
    </div>
  )
}
