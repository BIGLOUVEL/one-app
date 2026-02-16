"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Flag,
  Zap,
  Shield,
  Lock,
  Loader2,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

const getLoadingMessages = (lang: string) => [
  lang === 'fr' ? "Analyse de ton objectif en cours..." : "Analyzing your objective...",
  lang === 'fr' ? "Création des milestones..." : "Creating milestones...",
  lang === 'fr' ? "Calcul des checkpoints réalistes..." : "Calculating realistic checkpoints...",
  lang === 'fr' ? "Évaluation des risques potentiels..." : "Evaluating potential risks...",
  lang === 'fr' ? "Génération de la trajectoire optimale..." : "Generating optimal trajectory...",
  lang === 'fr' ? "Préparation de ton dashboard personnalisé..." : "Preparing your personalized dashboard...",
]

export default function AnalysisPage() {
  const router = useRouter()
  const hasHydrated = useHasHydrated()
  const { objective, aiRoadmap, isGeneratingRoadmap } = useAppStore()
  const { user, session } = useAuth()

  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const loadingMessages = getLoadingMessages(lang)

  const [messageIndex, setMessageIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Check subscription status
  useEffect(() => {
    async function checkSubscription() {
      if (!session?.access_token) {
        setIsSubscribed(false)
        setCheckingSubscription(false)
        return
      }

      // Skip check in development
      if (process.env.NODE_ENV === "development") {
        setIsSubscribed(true)
        setCheckingSubscription(false)
        return
      }

      try {
        const res = await fetch("/api/stripe/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setIsSubscribed(data.active === true)
        } else {
          setIsSubscribed(false)
        }
      } catch {
        setIsSubscribed(false)
      } finally {
        setCheckingSubscription(false)
      }
    }

    if (hasHydrated) {
      checkSubscription()
    }
  }, [hasHydrated, session?.access_token])

  // Cycle through loading messages
  useEffect(() => {
    if (isGeneratingRoadmap) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [isGeneratingRoadmap])

  // Detect failure
  useEffect(() => {
    if (hasHydrated && !isGeneratingRoadmap && !aiRoadmap && objective) {
      setHasFailed(true)
    }
  }, [hasHydrated, isGeneratingRoadmap, aiRoadmap, objective])

  // Show results when roadmap is ready
  useEffect(() => {
    if (aiRoadmap && !isGeneratingRoadmap) {
      setTimeout(() => setShowResults(true), 500)
    }
  }, [aiRoadmap, isGeneratingRoadmap])

  // Redirect if no objective
  useEffect(() => {
    if (hasHydrated && !objective) {
      router.push("/app/onboarding")
    }
  }, [hasHydrated, objective, router])

  const handleContinue = () => {
    router.push("/app")
  }

  const handleSubscribe = async () => {
    if (!user || !session) {
      router.push("/login?redirect=/app/analysis")
      return
    }

    setPaymentLoading(true)
    setPaymentError(null)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setPaymentError(data.error || t(`Server error (${response.status}). Try again.`, `Erreur serveur (${response.status}). Reessaie.`))
        return
      }

      const data = await response.json()

      if (data.error) {
        setPaymentError(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setPaymentError(t("Could not create payment session. Try again.", "Impossible de creer la session de paiement. Reessaie."))
      }
    } catch {
      setPaymentError(t("An error occurred. Please try again.", "Une erreur est survenue. Reessayez."))
    } finally {
      setPaymentLoading(false)
    }
  }

  if (!hasHydrated || !objective) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Loading or failed state
  if (isGeneratingRoadmap || !aiRoadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          {hasFailed ? (
            <>
              <div className="mx-auto mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-orange-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t("Roadmap generation failed", "La génération du roadmap a échoué")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("No worries — your objective is saved. You can continue without a roadmap.", "Pas de souci — ton objectif est bien enregistré. Tu peux continuer sans roadmap.")}
              </p>
              <button
                onClick={handleContinue}
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {t("Continue", "Continuer")}
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mx-auto mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-medium text-foreground mb-4"
                >
                  {loadingMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>

              <div className="flex justify-center gap-2">
                {loadingMessages.map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      i <= messageIndex ? "bg-primary" : "bg-white/20"
                    )}
                    animate={i === messageIndex ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    )
  }

  // Paywall — non-subscribed user sees blurred results
  const showPaywall = showResults && isSubscribed === false && !checkingSubscription

  // Results view
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24 relative">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn("space-y-8", showPaywall && "blur-[6px] pointer-events-none select-none")}
              aria-hidden={showPaywall}
            >
              {/* Header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">{t("Your Roadmap is ready", "Ton Roadmap est prêt")}</h1>
                <p className="text-muted-foreground">
                  {t("Here's your personalized plan to reach your objective", "Voici ton plan personnalisé pour atteindre ton objectif")}
                </p>
              </div>

              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 border border-primary/20"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {aiRoadmap.summary.totalWeeks}
                    </div>
                    <div className="text-sm text-muted-foreground">{t("Weeks", "Semaines")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-violet-400">
                      {aiRoadmap.summary.totalMilestones}
                    </div>
                    <div className="text-sm text-muted-foreground">Milestones</div>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-3xl font-bold",
                      aiRoadmap.summary.confidenceLevel === "high" ? "text-emerald-400" :
                      aiRoadmap.summary.confidenceLevel === "medium" ? "text-yellow-400" : "text-red-400"
                    )}>
                      {aiRoadmap.summary.confidenceLevel === "high" ? t("High", "Élevée") :
                       aiRoadmap.summary.confidenceLevel === "medium" ? t("Medium", "Moyenne") : t("Low", "Faible")}
                    </div>
                    <div className="text-sm text-muted-foreground">{t("Confidence", "Confiance")}</div>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-3xl font-bold",
                      aiRoadmap.summary.riskLevel === "low" ? "text-emerald-400" :
                      aiRoadmap.summary.riskLevel === "moderate" ? "text-yellow-400" : "text-red-400"
                    )}>
                      {aiRoadmap.summary.riskLevel === "low" ? t("Low", "Faible") :
                       aiRoadmap.summary.riskLevel === "moderate" ? t("Moderate", "Modéré") : t("High", "Élevé")}
                    </div>
                    <div className="text-sm text-muted-foreground">{t("Risk", "Risque")}</div>
                  </div>
                </div>
              </motion.div>

              {/* Milestones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  {t("Your Milestones", "Tes Milestones")}
                </h2>
                <div className="space-y-4">
                  {aiRoadmap.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {milestone.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{milestone.title}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(milestone.targetDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-primary">
                              <Target className="w-3 h-3" />
                              {milestone.targetProgress}% {t("of project", "du projet")}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3" />
                              {milestone.checkpoints.length} checkpoints
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Risks */}
              {aiRoadmap.risks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-400" />
                    {t("Identified risks", "Risques identifiés")}
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {aiRoadmap.risks.slice(0, 4).map((risk) => (
                      <div
                        key={risk.id}
                        className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={cn(
                            "w-4 h-4 mt-0.5 flex-shrink-0",
                            risk.impact === "high" ? "text-red-400" :
                            risk.impact === "medium" ? "text-orange-400" : "text-yellow-400"
                          )} />
                          <div>
                            <h4 className="font-medium text-sm">{risk.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recommendations */}
              {aiRoadmap.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    {t("Recommendations", "Recommandations")}
                  </h2>
                  <div className="space-y-2">
                    {aiRoadmap.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
                      >
                        <ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <button
                  onClick={handleContinue}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {t("Start now", "Commencer maintenant")}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PAYWALL OVERLAY                            */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/60" />

            {/* Paywall card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring", damping: 25 }}
              className="relative max-w-md w-full"
            >
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-60" />

              <div className="relative rounded-3xl border border-primary/20 bg-card/95 backdrop-blur-xl overflow-hidden">
                {/* Top accent line */}
                <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

                <div className="p-8 text-center space-y-6">
                  {/* Lock icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7, type: "spring", damping: 15 }}
                    className="mx-auto"
                  >
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/10 border border-primary/30 flex items-center justify-center">
                        <Lock className="w-9 h-9 text-primary" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Text */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {t("Your plan is ready", "Ton plan est prêt")}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("AI generated your personalized roadmap.", "L'IA a généré ton roadmap personnalisé.")}
                      <br />
                      {t("Unlock full access to ONE.", "Débloque l'accès complet à ONE.")}
                    </p>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5 text-left">
                    {[
                      t("Personalized AI roadmap", "Roadmap IA personnalisé"),
                      t("Focus sessions with bunker mode", "Sessions de focus avec bunker mode"),
                      t("Domino tracking & momentum", "Suivi domino & momentum"),
                      t("AI analysis & recommendations", "Analyse & recommandations IA"),
                    ].map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-foreground/80">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="pt-2 space-y-1">
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-4xl font-bold text-foreground">{t("$1.99", "1,99€")}</span>
                      <span className="text-muted-foreground text-sm">{t("/first month", "/premier mois")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("then $6.99/month — cancel anytime", "puis 6,99€/mois — annulable à tout moment")}
                    </p>
                  </div>

                  {/* Error */}
                  {paymentError && (
                    <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-2">
                      {paymentError}
                    </p>
                  )}

                  {/* CTA button */}
                  <motion.button
                    onClick={handleSubscribe}
                    disabled={paymentLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,255,136,0.15)] hover:shadow-[0_0_50px_rgba(0,255,136,0.25)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("Redirecting...", "Redirection...")}
                      </>
                    ) : (
                      <>
                        {t("Unlock my plan", "Débloquer mon plan")}
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>

                  {/* Trust */}
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {t("Secure payment", "Paiement sécurisé")}
                    </span>
                    <span>•</span>
                    <span>{t("Cancel in 1 click", "Annulation en 1 clic")}</span>
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
