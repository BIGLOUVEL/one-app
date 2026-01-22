"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Ghost,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Target,
  Sparkles,
  Clock,
  User,
  Briefcase,
  GraduationCap,
  Rocket,
  Building,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Zap,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { AIGeneratedPlan, ThiefType } from "@/lib/types"

type Step = 1 | 2 | 3 | 4 | 5

const contextTypes = [
  { value: "student", label: "Etudiant", icon: GraduationCap },
  { value: "freelance", label: "Freelance", icon: User },
  { value: "startup", label: "Startup", icon: Rocket },
  { value: "employee", label: "Salarié", icon: Building },
  { value: "other", label: "Autre", icon: Briefcase },
] as const

const horizons = [
  { value: "1 month", label: "1 mois" },
  { value: "3 months", label: "3 mois" },
  { value: "6 months", label: "6 mois" },
  { value: "1 year", label: "1 an" },
]

const thiefLabels: Record<ThiefType, { name: string; icon: string }> = {
  "say-no": { name: "Incapacité à dire non", icon: "🙅" },
  "fear-chaos": { name: "Peur du chaos", icon: "😰" },
  "poor-health": { name: "Santé négligée", icon: "😴" },
  "unsupportive-environment": { name: "Environnement toxique", icon: "🏚️" },
}

export default function OnboardingPage() {
  const router = useRouter()
  const { setObjectiveFromAI } = useAppStore()

  const [step, setStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Someday Goal
  const [somedayGoal, setSomedayGoal] = useState("")

  // Step 2: Context
  const [contextType, setContextType] = useState<typeof contextTypes[number]["value"]>("freelance")
  const [horizon, setHorizon] = useState("3 months")

  // Step 3: Constraints
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [deadline, setDeadline] = useState("")
  const [resources, setResources] = useState("")

  // Step 5: AI Generated Plan
  const [aiPlan, setAIPlan] = useState<AIGeneratedPlan | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["cascade", "focus", "risks"]))

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
    setStep(4)

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          somedayGoal,
          context: {
            type: contextType,
            horizon,
          },
          constraints: {
            hoursPerWeek,
            deadline: deadline || undefined,
            resources: resources || undefined,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du plan")
      }

      const data = await response.json()
      setAIPlan(data.plan)
      setStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setStep(3)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLockIn = () => {
    if (!aiPlan) return

    const finalDeadline = deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    setObjectiveFromAI(aiPlan, finalDeadline)
    router.push("/app")
  }

  const updatePlanField = (path: string, value: string) => {
    if (!aiPlan) return

    const newPlan = JSON.parse(JSON.stringify(aiPlan))
    const keys = path.split(".")
    let obj = newPlan

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value

    setAIPlan(newPlan)
    setEditingField(null)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return somedayGoal.trim().length >= 5
      case 2:
        return contextType && horizon
      case 3:
        return hoursPerWeek > 0
      case 5:
        return aiPlan !== null
      default:
        return false
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20">
              <Ghost className="h-6 w-6 text-primary" />
            </div>
          </div>
          <span className="text-2xl font-semibold tracking-tight">ONE</span>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-primary"
                  : s < step
                  ? "w-4 bg-primary/50"
                  : "w-4 bg-white/10"
              }`}
              animate={{ scale: s === step ? 1.1 : 1 }}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* Step 1: Someday Goal */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold">
                  Quel est ton <span className="text-primary">objectif ultime</span> ?
                </h1>
                <p className="text-muted-foreground text-sm">
                  L'objectif "Someday" — ce que tu veux vraiment accomplir.
                </p>
              </div>

              <div className="liquid-glass p-1">
                <textarea
                  value={somedayGoal}
                  onChange={(e) => setSomedayGoal(e.target.value)}
                  placeholder="Ex: Lancer mon SaaS et atteindre 1000€ MRR"
                  className="w-full bg-transparent px-4 py-4 text-lg focus:outline-none placeholder:text-muted-foreground/40 resize-none min-h-[100px]"
                  autoFocus
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Sois ambitieux mais précis. L'IA va t'aider à découper.
              </p>
            </motion.div>
          )}

          {/* Step 2: Context */}
          {step === 2 && (
            <motion.div
              key="step2"
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
                  Quel est ton <span className="text-cyan-400">contexte</span> ?
                </h1>
                <p className="text-muted-foreground text-sm">
                  L'IA adaptera ses conseils à ta situation.
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
                <label className="text-sm text-muted-foreground">Horizon temporel</label>
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

          {/* Step 3: Constraints */}
          {step === 3 && (
            <motion.div
              key="step3"
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
                  Quelles sont tes <span className="text-orange-400">contraintes</span> ?
                </h1>
                <p className="text-muted-foreground text-sm">
                  L'IA calibrera le plan selon tes ressources réelles.
                </p>
              </div>

              {/* Hours per week */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">Heures disponibles par semaine</label>
                <div className="liquid-glass p-4 flex items-center justify-between">
                  <button
                    onClick={() => setHoursPerWeek(Math.max(1, hoursPerWeek - 5))}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-orange-400">{hoursPerWeek}</span>
                    <span className="text-muted-foreground ml-2">h/semaine</span>
                  </div>
                  <button
                    onClick={() => setHoursPerWeek(Math.min(60, hoursPerWeek + 5))}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Deadline (optional) */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">Deadline (optionnel)</label>
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

              {/* Resources (optional) */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">Ressources / Contraintes (optionnel)</label>
                <div className="liquid-glass p-1">
                  <input
                    type="text"
                    value={resources}
                    onChange={(e) => setResources(e.target.value)}
                    placeholder="Ex: Budget limité, travaille seul, pas de compétences en design"
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

          {/* Step 4: Loading / AI Generation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 py-12"
            >
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                      <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-2xl font-semibold">
                    L'IA analyse ton objectif...
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Création de ta cascade Goal → Now + plan d'action
                  </p>
                </div>

                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Décomposition Someday → Year → Month → Week → Today → Now
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Génération du ONE Thing Statement
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                  >
                    Analyse des risques (Four Thieves)
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Visual Cascade Presentation */}
          {step === 5 && aiPlan && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
            >
              {/* Header */}
              <div className="text-center space-y-3 sticky top-0 bg-[hsl(220,20%,4%)] py-3 z-10">
                <h1 className="text-2xl font-bold">
                  Voici <span className="text-primary">ta cascade</span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  L'IA a décomposé ton objectif. Chaque niveau mène au suivant.
                </p>
              </div>

              {/* Visual Cascade - Vertical Flow */}
              <div className="relative space-y-0">
                {[
                  { key: "somedayGoal", label: "🎯 SOMEDAY", sublabel: "Ta vision ultime", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", text: "text-violet-400" },
                  { key: "yearGoal", label: "📅 CETTE ANNÉE", sublabel: "L'étape annuelle", color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", text: "text-blue-400" },
                  { key: "monthGoal", label: "🗓️ CE MOIS", sublabel: "Focus mensuel", color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400" },
                  { key: "weekGoal", label: "📌 CETTE SEMAINE", sublabel: "L'objectif hebdo", color: "from-green-500/20 to-green-500/5", border: "border-green-500/30", text: "text-green-400" },
                  { key: "todayGoal", label: "⚡ AUJOURD'HUI", sublabel: "Ta priorité du jour", color: "from-yellow-500/20 to-yellow-500/5", border: "border-yellow-500/30", text: "text-yellow-400" },
                ].map((item, idx) => (
                  <div key={item.key}>
                    {/* Cascade Item */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative p-4 rounded-2xl bg-gradient-to-r ${item.color} border ${item.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold ${item.text} uppercase tracking-wider`}>
                              {item.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium">
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
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10"
                            >
                              Annuler
                            </button>
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

                    {/* Arrow connector */}
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

                {/* RIGHT NOW - Highlighted Section */}
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

                {/* THE NOW ACTION - ULTRA PROMINENT */}
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
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          RIGHT NOW
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        {aiPlan.cascade.rightNowAction}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        C'est LA seule chose à faire maintenant. Tout le reste peut attendre.
                      </p>
                      <button
                        onClick={() => setEditingField("cascade.rightNowAction")}
                        className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mx-auto"
                      >
                        <Edit3 className="h-3 w-3" />
                        Modifier
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
                            <button
                              onClick={() => setEditingField(null)}
                              className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10"
                            >
                              Annuler
                            </button>
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
                {/* Focus Block */}
                <div className="liquid-glass rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("focus")}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium">Plan de focus ({aiPlan.focusBlockPlan.duration} min)</span>
                    </div>
                    {expandedSections.has("focus") ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
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

                {/* Risks */}
                <div className="liquid-glass rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("risks")}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium">Ton obstacle principal</span>
                    </div>
                    {expandedSections.has("risks") ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.has("risks") && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10">
                        <span className="text-lg">{thiefLabels[aiPlan.risks.primaryThief].icon}</span>
                        <span className="text-sm font-medium text-red-400">
                          {thiefLabels[aiPlan.risks.primaryThief].name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{aiPlan.risks.thiefDescription}</p>
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="text-xs text-green-400 font-medium">Parade: </span>
                        <span className="text-xs text-green-300">{aiPlan.risks.parade}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20"
              >
                <p className="text-center text-sm font-medium mb-2">
                  Es-tu convaincu que cette cascade te mènera à ton objectif ?
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Si oui, tu t'engages à suivre ce plan. Si non, modifie ce qui ne va pas.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {step !== 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-3"
          >
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  onClick={() => setStep((step - 1) as Step)}
                  variant="outline"
                  className="h-14 rounded-2xl px-6 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}

              <Button
                onClick={() => {
                  if (step === 3) {
                    generatePlan()
                  } else if (step === 5) {
                    handleLockIn()
                  } else {
                    setStep((step + 1) as Step)
                  }
                }}
                disabled={!canProceed() || isLoading}
                className={`flex-1 h-14 rounded-2xl text-base font-medium transition-all duration-300 ${
                  canProceed()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                    : "bg-white/5 text-muted-foreground"
                }`}
              >
                {step === 3 ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Générer mon plan
                  </>
                ) : step === 5 ? (
                  <>
                    Lock it in
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {step === 5 && (
              <p className="text-center text-xs text-muted-foreground">
                Une fois verrouillé, tu ne pourras pas changer d'objectif jusqu'à complétion.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Editable field component
function EditableField({
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  className = "",
}: {
  value: string
  isEditing: boolean
  onEdit: () => void
  onSave: (value: string) => void
  onCancel: () => void
  className?: string
}) {
  const [editValue, setEditValue] = useState(value)

  if (isEditing) {
    return (
      <div className="flex-1 space-y-2">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full bg-white/10 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={2}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(editValue)}
            className="px-3 py-1 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
          >
            Sauver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 group flex items-start gap-2">
      <p className={`flex-1 ${className}`}>{value}</p>
      <button
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity"
      >
        <Edit3 className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  )
}
