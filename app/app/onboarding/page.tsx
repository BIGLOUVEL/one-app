"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  User,
  Briefcase,
  GraduationCap,
  Rocket,
  Building,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Zap,
  Shield,
  X,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/components/auth/auth-provider"
import { AIGeneratedPlan, ThiefType } from "@/lib/types"

// ============================================
// TYPES
// ============================================

type Step =
  | "intro"
  | "name"
  | "braindump"
  | "confront"
  | "eliminate"
  | "reveal"
  | "context"
  | "steps"
  | "constraints"
  | "generating"
  | "cascade"

interface GoalPostIt {
  id: string
  text: string
  color: "yellow" | "pink" | "blue" | "green" | "purple"
  rotation: number
  eliminated: boolean
}

// ============================================
// CONSTANTS
// ============================================

const postItColors: Record<GoalPostIt["color"], { bg: string; text: string; border: string }> = {
  yellow: { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300/50" },
  pink: { bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-300/50" },
  blue: { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-300/50" },
  green: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300/50" },
  purple: { bg: "bg-violet-100", text: "text-violet-900", border: "border-violet-300/50" },
}

const colorKeys: GoalPostIt["color"][] = ["yellow", "pink", "blue", "green", "purple"]

// These constants are now computed inside the component to support i18n (see below).

// ============================================
// COMPONENT
// ============================================

export default function OnboardingPage() {
  const router = useRouter()
  const { session } = useAuth()
  const objective = useAppStore(s => s.objective)
  const { setObjectiveFromAI, setAIRoadmap, setIsGeneratingRoadmap, firstName: storedFirstName, setFirstName: storeFirstName } = useAppStore()
  const lang = useAppStore(s => s.language)

  // Guard: if user already has an objective, send them to dashboard — no re-onboarding
  useEffect(() => {
    if (objective) {
      router.replace("/app")
    }
  }, [objective, router])
  const aiName = useAppStore(s => s.aiName) || 'Tony'
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  // --- i18n-aware constants ---
  const contextTypes = [
    { value: "student" as const, label: t("Student", "Étudiant"), icon: GraduationCap },
    { value: "freelance" as const, label: "Freelance", icon: User },
    { value: "startup" as const, label: "Startup", icon: Rocket },
    { value: "employee" as const, label: t("Employee", "Salarié"), icon: Building },
    { value: "other" as const, label: t("Other", "Autre"), icon: Briefcase },
  ]

  const horizons = [
    { value: "1 month", label: t("1 month", "1 mois") },
    { value: "3 months", label: t("3 months", "3 mois") },
    { value: "6 months", label: t("6 months", "6 mois") },
    { value: "1 year", label: t("1 year", "1 an") },
  ]

  const thiefLabels: Record<ThiefType, { name: string; icon: string }> = {
    "say-no": { name: t("Inability to say no", "Incapacité à dire non"), icon: "🚫" },
    "fear-chaos": { name: t("Fear of chaos", "Peur du chaos"), icon: "🌪️" },
    "poor-health": { name: t("Neglected health", "Santé négligée"), icon: "💔" },
    "unsupportive-environment": { name: t("Toxic environment", "Environnement toxique"), icon: "🏚️" },
  }

  const progressDots = [
    { steps: ["intro", "name", "braindump", "confront", "eliminate", "reveal"], label: "ONE Thing" },
    { steps: ["context"], label: t("Context", "Contexte") },
    { steps: ["steps"], label: t("Steps", "Étapes") },
    { steps: ["constraints"], label: t("Constraints", "Contraintes") },
    { steps: ["generating"], label: t("AI", "IA") },
    { steps: ["cascade"], label: t("Cascade", "Cascade") },
  ]

  const getEliminationPrompt = (remaining: number): string => {
    if (remaining > 6) return t("Click on the goals that could wait a year without consequences.", "Clique sur les objectifs qui pourraient attendre un an sans conséquences.")
    if (remaining > 4) return t("Which one excites you the least when you wake up in the morning?", "Lequel t'excite le moins quand tu te réveilles le matin ?")
    if (remaining > 2) return t("If you could only keep two, which one would you eliminate?", "Si tu ne pouvais en garder que deux, lequel éliminerais-tu ?")
    if (remaining === 2) return t("Which one will knock down all the other dominoes?", "Lequel fera tomber tous les autres dominos ?")
    return ""
  }

  const [step, setStep] = useState<Step>("intro")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstNameInput, setFirstNameInput] = useState(storedFirstName || "")

  // --- Elimination phase state ---
  const [goals, setGoals] = useState<GoalPostIt[]>([])
  const [newGoal, setNewGoal] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [showConfrontText, setShowConfrontText] = useState(false)

  // --- Wizard state (existing) ---
  const [somedayGoal, setSomedayGoal] = useState("")
  const [contextType, setContextType] = useState<typeof contextTypes[number]["value"]>("freelance")
  const [horizon, setHorizon] = useState("3 months")
  const [essentialSteps, setEssentialSteps] = useState<string[]>([""])
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [deadline, setDeadline] = useState("")
  const [resources, setResources] = useState("")
  const [aiPlan, setAIPlan] = useState<AIGeneratedPlan | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["cascade", "focus", "risks"]))

  // --- Intro animation ---
  const introWords = t("You can't do everything. But you can do THE thing that matters.", "Tu ne peux pas tout faire. Mais tu peux faire LA chose qui compte.").split(" ")
  const [introComplete, setIntroComplete] = useState(false)
  const introWordCount = introWords.length

  useEffect(() => {
    if (step === "intro") {
      const timer = setTimeout(() => setIntroComplete(true), introWordCount * 150 + 800)
      return () => clearTimeout(timer)
    }
  }, [step, introWordCount])

  // --- Confront phase auto-reveal ---
  useEffect(() => {
    if (step === "confront") {
      const timer = setTimeout(() => setShowConfrontText(true), 2000)
      return () => clearTimeout(timer)
    } else {
      setShowConfrontText(false)
    }
  }, [step])

  // Auto-transition to reveal when only 1 goal remains
  const remainingGoals = goals.filter(g => !g.eliminated)
  const remainingCount = remainingGoals.length
  const lastGoalText = remainingGoals[0]?.text
  useEffect(() => {
    if (step === "eliminate" && remainingCount === 1 && lastGoalText) {
      const timer = setTimeout(() => {
        setSomedayGoal(lastGoalText)
        setStep("reveal")
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [step, remainingCount, lastGoalText])

  // --- Helpers ---
  const addGoal = () => {
    const text = newGoal.trim()
    if (!text) return

    const color = colorKeys[goals.length % colorKeys.length]
    const rotation = Math.random() * 8 - 4 // -4 to 4 degrees

    setGoals(prev => [
      ...prev,
      {
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        color,
        rotation,
        eliminated: false,
      },
    ])
    setNewGoal("")
    inputRef.current?.focus()
  }

  const eliminateGoal = (id: string) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, eliminated: true } : g)))
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const generatePlan = async () => {
    setIsLoading(true)
    setError(null)
    setStep("generating")

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          somedayGoal,
          essentialSteps: essentialSteps.filter(s => s.trim()),
          context: { type: contextType, horizon },
          constraints: {
            hoursPerWeek,
            deadline: deadline || undefined,
            resources: resources || undefined,
          },
          language: lang,
        }),
      })

      if (!response.ok) throw new Error(t("Error while generating the plan", "Erreur lors de la génération du plan"))

      const data = await response.json()
      setAIPlan(data.plan)
      setStep("cascade")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("An error occurred", "Une erreur est survenue"))
      setStep("constraints")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLockIn = async () => {
    if (!aiPlan) return

    const finalDeadline = deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    setObjectiveFromAI(aiPlan, finalDeadline)

    // Persist onboarding completion to Supabase
    if (session?.access_token) {
      fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {}) // Best-effort, don't block navigation
    }

    setIsGeneratingRoadmap(true)
    router.push("/app/analysis")

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: {
            somedayGoal: aiPlan.cascade.somedayGoal,
            yearGoal: aiPlan.cascade.yearGoal,
            monthGoal: aiPlan.cascade.monthGoal,
            weekGoal: aiPlan.cascade.weekGoal,
            todayGoal: aiPlan.cascade.todayGoal,
            rightNowAction: aiPlan.cascade.rightNowAction,
            deadline: finalDeadline,
            why: aiPlan.why,
          },
          context: { type: contextType, hoursPerWeek },
          essentialSteps: essentialSteps.filter(s => s.trim()),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAIRoadmap(data.roadmap)
      } else {
        console.error("Roadmap API returned", response.status)
        setIsGeneratingRoadmap(false)
      }
    } catch (err) {
      console.error("Failed to generate roadmap:", err)
      setIsGeneratingRoadmap(false)
    }
  }

  const updatePlanField = (path: string, value: string) => {
    if (!aiPlan) return
    const newPlan = JSON.parse(JSON.stringify(aiPlan))
    const keys = path.split(".")
    let obj = newPlan
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
    obj[keys[keys.length - 1]] = value
    setAIPlan(newPlan)
    setEditingField(null)
  }

  const today = new Date().toISOString().split("T")[0]

  const goBack = () => {
    switch (step) {
      case "name":
        setStep("intro")
        break
      case "braindump":
        setStep("name")
        break
      case "confront":
        setStep("braindump")
        break
      case "eliminate":
        setGoals(prev => prev.map(g => ({ ...g, eliminated: false })))
        setStep("confront")
        break
      case "reveal":
        setGoals(prev => {
          const eliminated = prev.filter(g => g.eliminated)
          if (eliminated.length > 0) {
            const lastId = eliminated[eliminated.length - 1].id
            return prev.map(g => g.id === lastId ? { ...g, eliminated: false } : g)
          }
          return prev
        })
        setStep("eliminate")
        break
      case "context":
        if (goals.length > 0 && remainingCount === 1) {
          setStep("reveal")
        } else {
          setStep("braindump")
        }
        break
      case "steps":
        setStep("context")
        break
      case "constraints":
        setStep("steps")
        break
      case "cascade":
        setStep("constraints")
        break
    }
  }

  // --- Progress dot index ---
  const currentDotIndex = progressDots.findIndex(d => d.steps.includes(step))

  // Determine if we should show the nav buttons
  const showNav = step !== "generating" && step !== "intro" && step !== "name" && step !== "confront" && step !== "eliminate" && step !== "reveal"

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Back arrow — top left */}
      {step !== "intro" && step !== "generating" && (
        <motion.button
          key={`back-${step}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={goBack}
          className="fixed top-6 left-6 p-2.5 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-white/10 transition-all z-20"
          aria-label={t("Go back", "Retour")}
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
      )}

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress indicator — hidden on intro/braindump/confront/eliminate/reveal */}
        {!["intro", "name", "braindump", "confront", "eliminate", "reveal"].includes(step) && (
          <div className="flex justify-center gap-2 mb-8">
            {progressDots.map((dot, idx) => (
              <motion.div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentDotIndex
                    ? "w-8 bg-primary"
                    : idx < currentDotIndex
                    ? "w-4 bg-primary/50"
                    : "w-4 bg-white/10"
                }`}
                animate={{ scale: idx === currentDotIndex ? 1.1 : 1 }}
              />
            ))}
          </div>
        )}

        {/* ============================================ */}
        {/* STEPS */}
        {/* ============================================ */}
        <AnimatePresence mode="wait">
          {/* ------------------------------------------ */}
          {/* STEP: INTRO */}
          {/* ------------------------------------------ */}
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-12"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full scale-150" />
                  <Logo size="lg" />
                </div>
              </motion.div>

              {/* Animated text — word by word */}
              <div className="max-w-md mx-auto mb-12">
                <p className="text-2xl md:text-3xl font-semibold leading-relaxed">
                  {introWords.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.3 }}
                      className={
                        (word === "LA" || word === "THE") ? "text-primary font-black" : ""
                      }
                    >
                      {word}{" "}
                    </motion.span>
                  ))}
                </p>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: introComplete ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  onClick={() => setStep("name")}
                  className="h-14 px-8 rounded-2xl text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                >
                  {t("Begin", "Commencer")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: NAME */}
          {/* ------------------------------------------ */}
          {step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {t("What's your first name?", "Comment tu t'appelles ?")}
                </h1>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {lang === 'fr'
                    ? <>{aiName} sera ton assistant personnel. Il a besoin de savoir a qui il parle.</>
                    : <>{aiName} will be your personal assistant. He needs to know who he&apos;s talking to.</>
                  }
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-xs"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (firstNameInput.trim()) {
                      storeFirstName(firstNameInput.trim())
                      setStep("braindump")
                    }
                  }}
                  className="space-y-6"
                >
                  <div className="liquid-glass p-1">
                    <input
                      type="text"
                      value={firstNameInput}
                      onChange={(e) => setFirstNameInput(e.target.value)}
                      placeholder={t("Your first name...", "Ton prénom...")}
                      className="w-full bg-transparent px-4 py-4 text-center text-lg font-medium focus:outline-none placeholder:text-muted-foreground/40"
                      autoFocus
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!firstNameInput.trim()}
                    className="w-full h-14 rounded-2xl text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-green disabled:opacity-30"
                  >
                    {firstNameInput.trim()
                      ? (lang === 'fr' ? `Salut ${firstNameInput.trim()} 👋` : `Hey ${firstNameInput.trim()} 👋`)
                      : t("Continue", "Continuer")
                    }
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: BRAIN DUMP */}
          {/* ------------------------------------------ */}
          {step === "braindump" && (
            <motion.div
              key="braindump"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <Logo size="sm" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold">
                  {lang === 'fr'
                    ? <>{storedFirstName ? `${storedFirstName}, note` : "Note"} <span className="text-primary">tous</span> tes objectifs</>
                    : <>{storedFirstName ? `${storedFirstName}, write` : "Write"} down <span className="text-primary">all</span> your goals</>
                  }
                </h1>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {lang === 'fr'
                    ? `Tout ce que tu veux accomplir. Ne filtre rien, ${aiName} fera le tri avec toi.`
                    : `Everything you want to accomplish. Don't filter anything, ${aiName} will sort it out with you.`
                  }
                </p>
              </div>

              {/* Post-its grid */}
              <div className="min-h-[280px]">
                {goals.length === 0 ? (
                  <div className="flex items-center justify-center h-[280px] text-muted-foreground/30 text-sm">
                    {t("Your goals will appear here...", "Tes objectifs apparaîtront ici...")}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {goals.map((goal, idx) => {
                        const colors = postItColors[goal.color]
                        return (
                          <motion.div
                            key={goal.id}
                            initial={{ scale: 0, rotate: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              rotate: goal.rotation,
                              opacity: 1,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                              delay: 0.05,
                            }}
                            className={`relative p-4 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} shadow-lg cursor-default group`}
                            style={{ transform: `rotate(${goal.rotation}deg)` }}
                          >
                            <p className="text-sm font-medium leading-snug pr-5">
                              {goal.text}
                            </p>
                            {/* Delete button */}
                            <button
                              onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {/* Tape effect */}
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/60 rounded-sm" />
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addGoal()
                  }}
                  className="flex gap-2"
                >
                  <div className="liquid-glass p-1 flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder={t("Ex: Launch my SaaS, Learn piano...", "Ex: Lancer mon SaaS, Apprendre le piano...")}
                      className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/40"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!newGoal.trim()}
                    className="h-[50px] w-[50px] rounded-2xl bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary shrink-0"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </form>

                {/* Counter & hint */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>{goals.length} {t("goal", "objectif")}{goals.length > 1 ? "s" : ""}</span>
                  {goals.length < 3 && (
                    <span>{t("Minimum 3 goals", "Minimum 3 objectifs")}</span>
                  )}
                  {goals.length >= 3 && goals.length < 5 && (
                    <span className="text-primary/70">{t("Continue or move on", "Continue ou passe à la suite")}</span>
                  )}
                  {goals.length >= 5 && (
                    <span className="text-primary/70">{t("Great list!", "Belle liste !")}</span>
                  )}
                </div>
              </div>

              {/* Continue button */}
              {goals.length >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={() => setStep("confront")}
                    className="w-full h-14 rounded-2xl text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                  >
                    {t("I'm done", "J'ai fini")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              )}

              {/* Skip button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <button
                  onClick={() => {
                    setSomedayGoal("")
                    setStep("context")
                  }}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("I don't know yet — AI will help", "Je ne sais pas encore — l'IA m'aidera")}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: CONFRONTATION */}
          {/* ------------------------------------------ */}
          {step === "confront" && (
            <motion.div
              key="confront"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Dramatic text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center space-y-2"
              >
                <h1 className="text-2xl md:text-3xl font-bold">
                  {lang === 'fr'
                    ? `${storedFirstName || ""}, regarde tout ce que tu veux accomplir.`.replace(/^, /, "")
                    : `${storedFirstName || ""}, look at everything you want to accomplish.`.replace(/^, /, "")
                  }
                </h1>
                <p className="text-lg text-muted-foreground">
                  {goals.length} {t("goals", "objectifs")}. <span className="text-red-400">{t("You can't do everything.", "Tu ne peux pas tout faire.")}</span>
                </p>
              </motion.div>

              {/* All post-its displayed */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {goals.map((goal, idx) => {
                  const colors = postItColors[goal.color]
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, rotate: goal.rotation }}
                      transition={{ delay: idx * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                      className={`p-4 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} shadow-lg`}
                    >
                      <p className="text-sm font-medium leading-snug">{goal.text}</p>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/60 rounded-sm" />
                    </motion.div>
                  )
                })}
              </div>

              {/* Reveal text + CTA */}
              <AnimatePresence>
                {showConfrontText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <p className="text-lg font-semibold text-primary">
                      {t("It's time to choose.", "Il est temps de choisir.")}
                    </p>
                    <Button
                      onClick={() => setStep("eliminate")}
                      className="h-14 px-8 rounded-2xl text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                    >
                      {t("Start elimination", "Commencer l'élimination")}
                      <Trash2 className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: ELIMINATION */}
          {/* ------------------------------------------ */}
          {step === "eliminate" && (
            <motion.div
              key="eliminate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header with counter */}
              <div className="text-center space-y-3">
                <motion.div
                  key={remainingGoals.length}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                >
                  <span className="text-2xl font-bold text-primary">{remainingGoals.length}</span>
                  <span className="text-sm text-muted-foreground">
                    {t(`goal${remainingGoals.length > 1 ? "s" : ""} remaining`, `objectif${remainingGoals.length > 1 ? "s" : ""} restant${remainingGoals.length > 1 ? "s" : ""}`)}
                  </span>
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={getEliminationPrompt(remainingGoals.length)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium max-w-md mx-auto"
                  >
                    {getEliminationPrompt(remainingGoals.length)}
                  </motion.p>
                </AnimatePresence>

                <p className="text-xs text-muted-foreground">
                  {t("Click on a goal to eliminate it", "Clique sur un objectif pour l'éliminer")}
                </p>
              </div>

              {/* Post-its — clickable to eliminate */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[200px]">
                <AnimatePresence>
                  {goals
                    .filter(g => !g.eliminated)
                    .map((goal) => {
                      const colors = postItColors[goal.color]
                      return (
                        <motion.button
                          key={goal.id}
                          layout
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ scale: 1, opacity: 1, rotate: goal.rotation }}
                          exit={{
                            scale: 0.6,
                            opacity: 0,
                            y: 50,
                            filter: "blur(8px)",
                            rotate: goal.rotation + 10,
                          }}
                          transition={{
                            exit: { duration: 0.4, ease: "easeIn" },
                            layout: { type: "spring", stiffness: 300, damping: 25 },
                          }}
                          whileHover={{ scale: 1.05, rotate: 0 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => eliminateGoal(goal.id)}
                          className={`relative p-4 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} shadow-lg text-left cursor-pointer group`}
                        >
                          <p className="text-sm font-medium leading-snug">{goal.text}</p>
                          {/* Tape effect */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/60 rounded-sm" />
                          {/* Hover X overlay */}
                          <div className="absolute inset-0 rounded-lg bg-red-500/0 group-hover:bg-red-500/10 transition-colors flex items-center justify-center">
                            <X className="h-8 w-8 text-red-500/0 group-hover:text-red-500/60 transition-colors" />
                          </div>
                        </motion.button>
                      )
                    })}
                </AnimatePresence>
              </div>

              {/* Progress bar — visual elimination progress */}
              <div className="space-y-2">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                    animate={{
                      width: `${((goals.length - remainingGoals.length) / Math.max(goals.length - 1, 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {t(`${goals.length - remainingGoals.length} eliminated out of ${goals.length}`, `${goals.length - remainingGoals.length} éliminé${goals.length - remainingGoals.length > 1 ? "s" : ""} sur ${goals.length}`)}
                </p>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: REVELATION */}
          {/* ------------------------------------------ */}
          {step === "reveal" && remainingGoals.length === 1 && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
            >
              {/* Reveal text */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold"
              >
                {t("Here is your", "Voici ta")} <span className="text-primary">ONE Thing</span>.
              </motion.h1>

              {/* The winning post-it */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: remainingGoals[0].rotation }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  delay: 0.6,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="relative"
              >
                {/* Glow */}
                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-3xl" />
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px hsl(150 100% 42% / 0.2)",
                      "0 0 40px hsl(150 100% 42% / 0.4)",
                      "0 0 20px hsl(150 100% 42% / 0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`relative p-8 rounded-xl ${postItColors[remainingGoals[0].color].bg} border-2 border-primary/50 shadow-2xl max-w-sm`}
                >
                  <p className={`text-xl font-bold leading-snug ${postItColors[remainingGoals[0].color].text}`}>
                    {remainingGoals[0].text}
                  </p>
                  {/* Tape */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 rounded-sm" />
                </motion.div>
              </motion.div>

              {/* Quote */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-sm text-muted-foreground italic max-w-sm"
              >
                {t("\"What is the ONE thing I can do, such that by doing it, everything else will become easier or unnecessary?\"", "\"Quelle est la SEULE chose que je puisse faire, telle qu'en la faisant, tout le reste deviendra plus simple ou inutile ?\"")}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <Button
                  onClick={() => setStep("context")}
                  className="h-14 px-8 rounded-2xl text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                >
                  {t("This is my ONE Thing", "C'est mon ONE Thing")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* WIZARD STEPS (existing — renumbered) */}
          {/* ============================================ */}

          {/* ------------------------------------------ */}
          {/* STEP: CONTEXT */}
          {/* ------------------------------------------ */}
          {step === "context" && (
            <motion.div
              key="context"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold">
                  {lang === 'fr'
                    ? <>{storedFirstName || ""}, quel est ton <span className="text-cyan-400">contexte</span> ?</>
                    : <>{storedFirstName || ""}, what&apos;s your <span className="text-cyan-400">context</span>?</>
                  }
                </h1>
                <p className="text-muted-foreground text-sm">
                  {lang === 'fr'
                    ? `${aiName} adaptera ses conseils a ta situation.`
                    : `${aiName} will adapt his advice to your situation.`
                  }
                </p>
              </div>

              {/* Context Type */}
              <div className="grid grid-cols-5 gap-2">
                {contextTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => setContextType(type.value)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        contextType === type.value
                          ? "bg-cyan-500/20 border border-cyan-500/40"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${contextType === type.value ? "text-cyan-400" : "text-muted-foreground"}`} />
                      <span className={`text-xs ${contextType === type.value ? "text-cyan-400" : "text-muted-foreground"}`}>
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Horizon */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">{t("Time horizon", "Horizon temporel")}</label>
                <div className="grid grid-cols-4 gap-2">
                  {horizons.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => setHorizon(h.value)}
                      className={`py-3 px-4 rounded-xl text-sm transition-all ${
                        horizon === h.value
                          ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400"
                          : "bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground"
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: ESSENTIAL STEPS */}
          {/* ------------------------------------------ */}
          {step === "steps" && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <Sparkles className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold">
                  {lang === 'fr' ? <>Quelles sont les <span className="text-emerald-400">étapes clés</span> ?</> : <>What are the <span className="text-emerald-400">key steps</span>?</>}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("List the steps you think are essential to reach your goal. AI will use them to create your plan.", "Liste les étapes que tu penses essentielles pour atteindre ton objectif. L'IA s'en servira pour créer ton plan.")}
                </p>
              </div>

              <div className="space-y-2">
                {essentialSteps.map((stepText, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-bold w-6 text-center shrink-0">{idx + 1}</span>
                    <div className="liquid-glass p-1 flex-1">
                      <input
                        type="text"
                        value={stepText}
                        onChange={(e) => {
                          const updated = [...essentialSteps]
                          updated[idx] = e.target.value
                          setEssentialSteps(updated)
                        }}
                        placeholder={`${t("Step", "Étape")} ${idx + 1}...`}
                        className="w-full bg-transparent px-3 py-2.5 text-sm focus:outline-none placeholder:text-muted-foreground/40"
                        autoFocus={idx === essentialSteps.length - 1}
                      />
                    </div>
                    {essentialSteps.length > 1 && (
                      <button
                        onClick={() => setEssentialSteps(essentialSteps.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground/40 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setEssentialSteps([...essentialSteps, ""])}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/30 text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
              >
                {t("+ Add a step", "+ Ajouter une étape")}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                {t("No need to be exhaustive — AI will complete and organize.", "Pas besoin d'être exhaustif — l'IA complétera et ordonnera.")}
              </p>

              <button
                onClick={() => {
                  setEssentialSteps([""])
                  setStep("constraints")
                }}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("Skip — AI will handle it", "Passer — l'IA s'en chargera")}
              </button>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: CONSTRAINTS */}
          {/* ------------------------------------------ */}
          {step === "constraints" && (
            <motion.div
              key="constraints"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold">
                  {lang === 'fr'
                    ? <>{storedFirstName || ""}, quelles sont tes <span className="text-orange-400">contraintes</span> ?</>
                    : <>{storedFirstName || ""}, what are your <span className="text-orange-400">constraints</span>?</>
                  }
                </h1>
                <p className="text-muted-foreground text-sm">
                  {lang === 'fr'
                    ? `${aiName} calibrera le plan selon tes ressources reelles.`
                    : `${aiName} will calibrate the plan based on your real resources.`
                  }
                </p>
              </div>

              {/* Hours per week */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">{t("Hours available per week", "Heures disponibles par semaine")}</label>
                <div className="liquid-glass p-4 flex items-center justify-between">
                  <button
                    onClick={() => setHoursPerWeek(Math.max(1, hoursPerWeek - 5))}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-orange-400">{hoursPerWeek}</span>
                    <span className="text-muted-foreground ml-2">{t("h/week", "h/semaine")}</span>
                  </div>
                  <button
                    onClick={() => setHoursPerWeek(Math.min(60, hoursPerWeek + 5))}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">{t("Deadline (optional)", "Deadline (optionnel)")}</label>
                <div className="liquid-glass p-1">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={today}
                    className="w-full bg-transparent px-4 py-3 text-base focus:outline-none text-foreground [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">{t("Resources / Constraints (optional)", "Ressources / Contraintes (optionnel)")}</label>
                <div className="liquid-glass p-1">
                  <input
                    type="text"
                    value={resources}
                    onChange={(e) => setResources(e.target.value)}
                    placeholder={t("Ex: Limited budget, working alone, no design skills", "Ex: Budget limité, travaille seul, pas de compétences en design")}
                    className="w-full bg-transparent px-4 py-3 text-base focus:outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: AI GENERATION */}
          {/* ------------------------------------------ */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 py-8"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-primary/40 blur-3xl rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="relative p-8 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/20 border border-primary/40"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
              </div>

              <div className="text-center">
                <motion.h1
                  className="text-2xl font-bold mb-2"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {lang === 'fr' ? `${aiName} analyse...` : `${aiName} is analyzing...`}
                </motion.h1>
                <p className="text-sm text-muted-foreground">
                  {lang === 'fr'
                    ? `${aiName} etudie ton objectif pour creer un plan sur-mesure${storedFirstName ? `, ${storedFirstName}` : ""}.`
                    : `${aiName} is studying your goal to create a custom plan${storedFirstName ? `, ${storedFirstName}` : ""}.`
                  }
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { text: t(`Analyzing "${somedayGoal.slice(0, 30)}${somedayGoal.length > 30 ? "..." : ""}"`, `Analyse de "${somedayGoal.slice(0, 30)}${somedayGoal.length > 30 ? "..." : ""}"`), delay: 0 },
                  { text: t(`Profile detected: ${contextTypes.find(c => c.value === contextType)?.label}`, `Profil détecté: ${contextTypes.find(c => c.value === contextType)?.label}`), delay: 0.8 },
                  { text: t(`Capacity: ${hoursPerWeek}h/week over ${horizons.find(h => h.value === horizon)?.label}`, `Capacité: ${hoursPerWeek}h/semaine sur ${horizons.find(h => h.value === horizon)?.label}`), delay: 1.6 },
                  { text: t("Breaking down cascade Goal → Now", "Découpage en cascade Goal → Now"), delay: 2.4 },
                  { text: t("Creating 90 min focus plan", "Création du plan de focus 90 min"), delay: 3.2 },
                  { text: t("Identifying obstacles", "Identification des obstacles"), delay: 4.0 },
                  { text: t("Generating ONE Thing Statement", "Génération du ONE Thing Statement"), delay: 4.8 },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.delay, duration: 0.4 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    </div>
                    <span className="text-sm flex-1">{item.text}</span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: item.delay + 0.6 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {t("Preparing your personalized plan...", "Préparation de ton plan personnalisé...")}
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------ */}
          {/* STEP: CASCADE REVIEW */}
          {/* ------------------------------------------ */}
          {step === "cascade" && aiPlan && (
            <motion.div
              key="cascade"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
            >
              <div className="text-center space-y-3 sticky top-0 bg-[hsl(220,20%,4%)] py-3 z-10">
                <h1 className="text-2xl font-bold">
                  {lang === 'fr'
                    ? <>{storedFirstName || ""}, voici <span className="text-primary">ta cascade</span></>
                    : <>{storedFirstName || ""}, here is <span className="text-primary">your cascade</span></>
                  }
                </h1>
                <p className="text-muted-foreground text-sm">
                  {lang === 'fr'
                    ? `${aiName} a decompose ton objectif. Chaque niveau mene au suivant.`
                    : `${aiName} has broken down your goal. Each level leads to the next.`
                  }
                </p>
              </div>

              <div className="relative space-y-0">
                {[
                  { key: "somedayGoal", label: "SOMEDAY", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", text: "text-violet-400" },
                  { key: "yearGoal", label: t("THIS YEAR", "CETTE ANNÉE"), color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", text: "text-blue-400" },
                  { key: "monthGoal", label: t("THIS MONTH", "CE MOIS"), color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400" },
                  { key: "weekGoal", label: t("THIS WEEK", "CETTE SEMAINE"), color: "from-green-500/20 to-green-500/5", border: "border-green-500/30", text: "text-green-400" },
                  { key: "todayGoal", label: t("TODAY", "AUJOURD'HUI"), color: "from-yellow-500/20 to-yellow-500/5", border: "border-yellow-500/30", text: "text-yellow-400" },
                ].map((item, idx) => (
                  <div key={item.key}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative p-4 rounded-2xl bg-gradient-to-r ${item.color} border ${item.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <span className={`text-xs font-bold ${item.text} uppercase tracking-wider`}>
                            {item.label}
                          </span>
                          <p className="text-sm font-medium mt-1">
                            {aiPlan.cascade[item.key as keyof typeof aiPlan.cascade]}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingField(`cascade.${item.key}`)}
                          className="p-1.5 rounded-lg hover:bg-white/10 opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </div>
                      {editingField === `cascade.${item.key}` && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            defaultValue={aiPlan.cascade[item.key as keyof typeof aiPlan.cascade]}
                            className="w-full bg-black/30 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            rows={2}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                updatePlanField(`cascade.${item.key}`, (e.target as HTMLTextAreaElement).value)
                              }
                            }}
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10">{t("Cancel", "Annuler")}</button>
                            <button
                              onClick={(e) => {
                                const textarea = (e.target as HTMLElement).parentElement?.parentElement?.querySelector("textarea")
                                if (textarea) updatePlanField(`cascade.${item.key}`, textarea.value)
                              }}
                              className="px-3 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                    {idx < 4 && (
                      <div className="flex justify-center py-1">
                        <motion.div
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          transition={{ delay: idx * 0.1 + 0.05 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-0.5 h-3 bg-gradient-to-b from-white/20 to-white/5" />
                          <ChevronDown className="h-4 w-4 text-white/30 -mt-1" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}

                {/* RIGHT NOW */}
                <div className="flex justify-center py-2">
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-0.5 h-4 bg-gradient-to-b from-white/20 to-primary/50" />
                    <ChevronDown className="h-5 w-5 text-primary -mt-1" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-3xl" />
                  <div className="relative p-6 rounded-2xl bg-gradient-to-r from-primary/30 to-emerald-500/20 border-2 border-primary/50">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">RIGHT NOW</span>
                      </div>
                      <p className="text-lg font-bold">{aiPlan.cascade.rightNowAction}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("This is THE only thing to do now. Everything else can wait.", "C'est LA seule chose à faire maintenant. Tout le reste peut attendre.")}
                      </p>
                      <button
                        onClick={() => setEditingField("cascade.rightNowAction")}
                        className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mx-auto"
                      >
                        <Edit3 className="h-3 w-3" />
                        {t("Edit", "Modifier")}
                      </button>
                      {editingField === "cascade.rightNowAction" && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            defaultValue={aiPlan.cascade.rightNowAction}
                            className="w-full bg-black/30 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10">{t("Cancel", "Annuler")}</button>
                            <button
                              onClick={(e) => {
                                const textarea = (e.target as HTMLElement).parentElement?.parentElement?.querySelector("textarea")
                                if (textarea) updatePlanField("cascade.rightNowAction", textarea.value)
                              }}
                              className="px-3 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Collapsible Details */}
              <div className="space-y-3 pt-4">
                <div className="liquid-glass rounded-2xl overflow-hidden">
                  <button onClick={() => toggleSection("focus")} className="w-full p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium">{t("Focus plan", "Plan de focus")} ({aiPlan.focusBlockPlan.duration} min)</span>
                    </div>
                    {expandedSections.has("focus") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {expandedSections.has("focus") && (
                    <div className="px-4 pb-4 space-y-2">
                      {aiPlan.focusBlockPlan.steps.map((stepItem, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                          <span className="text-xs text-orange-400 w-8">{stepItem.duration}m</span>
                          <span className="text-sm flex-1">{stepItem.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="liquid-glass rounded-2xl overflow-hidden">
                  <button onClick={() => toggleSection("risks")} className="w-full p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium">{t("Your main obstacle", "Ton obstacle principal")}</span>
                    </div>
                    {expandedSections.has("risks") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {expandedSections.has("risks") && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10">
                        <Shield className="h-4 w-4 text-red-400 shrink-0" />
                        <span className="text-sm font-medium text-red-400">{thiefLabels[aiPlan.risks.primaryThief].name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{aiPlan.risks.thiefDescription}</p>
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="text-xs text-green-400 font-medium">{t("Counter: ", "Parade: ")}</span>
                        <span className="text-xs text-green-300">{aiPlan.risks.parade}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20"
              >
                <p className="text-center text-sm font-medium mb-2">
                  {t("Are you convinced this cascade will lead you to your goal?", "Es-tu convaincu que cette cascade te mènera à ton objectif ?")}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  {t("If yes, you commit to following this plan. If not, edit what doesn't fit.", "Si oui, tu t'engages à suivre ce plan. Si non, modifie ce qui ne va pas.")}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================ */}
        {/* NAVIGATION BUTTONS */}
        {/* ============================================ */}
        {showNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-3"
          >
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (step === "braindump" && goals.length >= 3) {
                    setStep("confront")
                  } else if (step === "context") {
                    setStep("steps")
                  } else if (step === "steps") {
                    setStep("constraints")
                  } else if (step === "constraints") {
                    generatePlan()
                  } else if (step === "cascade") {
                    handleLockIn()
                  }
                }}
                disabled={
                  (step === "braindump" && goals.length < 3) ||
                  (step === "constraints" && hoursPerWeek <= 0) ||
                  isLoading
                }
                className={`flex-1 h-14 rounded-2xl text-base font-medium transition-all duration-300 ${
                  "bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                }`}
              >
                {step === "constraints" ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t("Generate my plan", "Générer mon plan")}
                  </>
                ) : step === "cascade" ? (
                  <>
                    Lock it in
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    {t("Continue", "Continuer")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {step === "cascade" && (
              <p className="text-center text-xs text-muted-foreground">
                {t("Once locked, you cannot change your objective until completion.", "Une fois verrouillé, tu ne pourras pas changer d'objectif jusqu'à complétion.")}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
