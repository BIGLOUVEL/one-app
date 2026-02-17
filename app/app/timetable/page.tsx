"use client"

import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutGrid,
  Loader2,
  Lock,
  Sparkles,
  X,
  Plus,
  Trash2,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  ChevronDown,
  Cloud,
  ImagePlus,
  Target,
  ArrowRight,
  Calendar,
  Timer,
  Brain,
  Eye,
  RefreshCw,
  BarChart3,
  Lightbulb,
  Shield,
  Flame,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import type { TimetableEvent, TimetablePriority, TimetableDay, TimetableInsights } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

// ============================================
// CONSTANTS
// ============================================
const DAYS: TimetableDay[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS_EN: Record<TimetableDay, string> = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" }
const DAY_LABELS_FR: Record<TimetableDay, string> = { monday: "Lun", tuesday: "Mar", wednesday: "Mer", thursday: "Jeu", friday: "Ven", saturday: "Sam", sunday: "Dim" }
const DAY_FULL_EN: Record<TimetableDay, string> = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" }
const DAY_FULL_FR: Record<TimetableDay, string> = { monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi", thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche" }

const CATEGORIES = ["Deep Work", "Meeting", "Admin", "Personal", "Class", "Break", "Commute", "Exercise", "Social", "Other"]

const PRIORITY_CONFIG: Record<TimetablePriority, {
  bg: string; border: string; text: string; dot: string
  barColor: string; label_en: string; label_fr: string
  glowColor: string; solidColor: string
}> = {
  high: {
    bg: "bg-emerald-500/[0.08]", border: "border-emerald-500/20",
    text: "text-emerald-400", dot: "bg-emerald-400", barColor: "bg-emerald-400",
    label_en: "High impact", label_fr: "Fort impact",
    glowColor: "shadow-emerald-500/10", solidColor: "rgba(52,211,153,0.08)",
  },
  medium: {
    bg: "bg-amber-500/[0.08]", border: "border-amber-500/20",
    text: "text-amber-400", dot: "bg-amber-400", barColor: "bg-amber-400",
    label_en: "Neutral", label_fr: "Neutre",
    glowColor: "shadow-amber-500/10", solidColor: "rgba(251,191,36,0.08)",
  },
  low: {
    bg: "bg-red-500/[0.08]", border: "border-red-500/20",
    text: "text-red-400", dot: "bg-red-400", barColor: "bg-red-400",
    label_en: "Low impact", label_fr: "Faible impact",
    glowColor: "shadow-red-500/10", solidColor: "rgba(248,113,113,0.08)",
  },
}

const START_HOUR = 6
const END_HOUR = 23
const SLOT_HEIGHT = 52
const SLOTS = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => {
  const hour = START_HOUR + Math.floor(i / 2)
  const min = i % 2 === 0 ? "00" : "30"
  return `${hour.toString().padStart(2, "0")}:${min}`
})

const MAX_FILE_SIZE = 4 * 1024 * 1024

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

const TIME_OPTIONS = Array.from({ length: (END_HOUR - START_HOUR) * 4 + 1 }, (_, i) => {
  const minutes = START_HOUR * 60 + i * 15
  return minutesToTime(minutes)
})

function getTodayDay(): TimetableDay {
  const jsDay = new Date().getDay()
  const map: TimetableDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  return map[jsDay]
}

// ============================================
// FOCUS SCORE RING — SVG circular gauge
// ============================================
function FocusScoreRing({ score, size = 72, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const scoreColor = score >= 60 ? "stroke-emerald-400" : score >= 35 ? "stroke-amber-400" : "stroke-red-400"
  const textColor = score >= 60 ? "text-emerald-400" : score >= 35 ? "text-amber-400" : "text-red-400"
  const glowColor = score >= 60 ? "rgba(52,211,153,0.15)" : score >= 35 ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className="stroke-white/[0.04]"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={scoreColor}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-lg font-black tabular-nums tracking-tight", textColor)}>{score}</span>
      </div>
    </div>
  )
}

// ============================================
// EVENT MODAL — Premium editing experience
// ============================================
function EventModal({
  open, onClose, event, defaultDay, defaultTime, onSave, onDelete, lang,
}: {
  open: boolean; onClose: () => void; event?: TimetableEvent | null
  defaultDay?: TimetableDay; defaultTime?: string
  onSave: (data: { day: TimetableDay; startTime: string; endTime: string; title: string; category: string; priority: TimetablePriority }) => void
  onDelete?: () => void; lang: string
}) {
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en)
  const isEdit = !!event

  const [title, setTitle] = useState(event?.title || "")
  const [day, setDay] = useState<TimetableDay>(event?.day || defaultDay || "monday")
  const [startTime, setStartTime] = useState(event?.startTime || defaultTime || "09:00")
  const [endTime, setEndTime] = useState(event?.endTime || minutesToTime(timeToMinutes(defaultTime || "09:00") + 60))
  const [category, setCategory] = useState(event?.category || "Deep Work")
  const [priority, setPriority] = useState<TimetablePriority>(event?.priority || "high")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ day, startTime, endTime, title: title.trim(), category, priority })
    onClose()
  }

  const dayFull = lang === "fr" ? DAY_FULL_FR : DAY_FULL_EN

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 bg-background/80 backdrop-blur-3xl border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden">
        {/* Ambient top glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />

        <div className="relative">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle className="text-[15px] font-bold tracking-tight flex items-center gap-2.5">
              <div className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black",
                isEdit ? "bg-white/[0.06] text-foreground/60" : "bg-primary/10 text-primary"
              )}>
                {isEdit ? <Eye className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </div>
              {isEdit ? t("Edit Event", "Modifier l'événement") : t("New Event", "Nouvel événement")}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-5">
            {/* AI Reasoning — only for AI-extracted events */}
            {event?.reasoning && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/[0.08] p-4 space-y-2"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-primary/60 font-bold">
                  <Brain className="h-3 w-3" />
                  {t("AI Analysis", "Analyse IA")}
                </div>
                <p className="text-[12px] text-muted-foreground/80 leading-[1.7]">{event.reasoning}</p>
                {event.suggestion && (
                  <div className="flex items-start gap-2 pt-0.5">
                    <ArrowRight className="h-3 w-3 text-primary/40 mt-[3px] shrink-0" />
                    <p className="text-[12px] text-primary/60 leading-[1.7]">{event.suggestion}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-bold block">
                {t("Title", "Titre")}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("e.g. Deep work session", "ex. Session de travail profond")}
                className="bg-white/[0.03] border-white/[0.06] h-11 text-sm font-medium placeholder:text-muted-foreground/20 focus:border-primary/30 focus:bg-white/[0.04] transition-all"
                autoFocus
              />
            </div>

            {/* Day + Times */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-bold block">
                  {t("Day", "Jour")}
                </label>
                <Select value={day} onValueChange={(v) => setDay(v as TimetableDay)}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] h-11 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>{dayFull[d]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-bold block">
                  {t("Start", "Début")}
                </label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] h-11 text-sm font-medium tabular-nums">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-bold block">
                  {t("End", "Fin")}
                </label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] h-11 text-sm font-medium tabular-nums">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {TIME_OPTIONS.filter((time) => timeToMinutes(time) > timeToMinutes(startTime)).map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-bold block">
                {t("Category", "Catégorie")}
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.06] h-11 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority — only in edit mode (AI decides, user overrides) */}
            {isEdit && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/40 font-bold block">
                  {t("Impact on your goal", "Impact sur ton objectif")}
                  <span className="text-muted-foreground/20 normal-case tracking-normal ml-2 text-[9px]">
                    {t("(override AI)", "(modifier l'IA)")}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["high", "medium", "low"] as TimetablePriority[]).map((p) => {
                    const pc = PRIORITY_CONFIG[p]
                    const isSelected = priority === p
                    return (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                          "h-10 rounded-xl text-[11px] font-semibold border transition-all duration-200 flex items-center justify-center gap-2",
                          isSelected
                            ? cn(pc.bg, pc.border, pc.text, "shadow-lg", pc.glowColor)
                            : "bg-white/[0.02] border-white/[0.05] text-muted-foreground/30 hover:bg-white/[0.04] hover:text-muted-foreground/50"
                        )}
                      >
                        <div className={cn(
                          "h-[6px] w-[6px] rounded-full transition-all",
                          isSelected ? pc.dot : "bg-current opacity-30"
                        )} />
                        {lang === "fr" ? pc.label_fr : pc.label_en}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Info note for create mode — AI will analyze */}
            {!isEdit && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary/[0.04] border border-primary/[0.06]">
                <Brain className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                <p className="text-[11px] text-muted-foreground/40 leading-[1.5]">
                  {t(
                    "Priority will be analyzed by AI based on your objective",
                    "La priorité sera analysée par l'IA selon ton objectif"
                  )}
                </p>
              </div>
            )}

            {/* Separator */}
            <div className="h-px bg-white/[0.04]" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isEdit && onDelete && (
                !showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground/20 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => { onDelete(); onClose() }}
                    className="h-10 px-4 rounded-xl text-[11px] bg-red-500/10 text-red-400 border border-red-500/15 font-semibold hover:bg-red-500/15 transition-all"
                  >
                    {t("Confirm delete", "Confirmer")}
                  </button>
                )
              )}
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="h-10 px-5 rounded-xl text-[11px] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] font-semibold transition-all"
              >
                {t("Cancel", "Annuler")}
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="h-10 px-6 rounded-xl text-[11px] bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isEdit ? t("Save", "Enregistrer") : t("Create", "Créer")}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// UPLOAD DIALOG — AI Import with premium feel
// ============================================
function UploadDialog({
  open, onClose, onAnalyze, isAnalyzing, lang,
}: {
  open: boolean; onClose: () => void; onAnalyze: (image: string) => void
  isAnalyzing: boolean; lang: string
}) {
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const LOADING_MESSAGES = useMemo(() => [
    t("Reading your schedule...", "Lecture de ton emploi du temps..."),
    t("Identifying time blocks...", "Identification des créneaux..."),
    t("Mapping days and hours...", "Mapping des jours et heures..."),
    t("Analyzing against your objective...", "Analyse par rapport à ton objectif..."),
    t("Scoring focus alignment...", "Calcul de l'alignement focus..."),
    t("Generating insights...", "Génération des recommandations..."),
  ], [lang])

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) { setLoadingMsgIdx(0); return }
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [isAnalyzing, LOADING_MESSAGES.length])

  const handleFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) return
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isAnalyzing) { onClose(); setPreview(null) } }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-background/80 backdrop-blur-3xl border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden">
        {/* Ambient gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/[0.05] to-transparent pointer-events-none" />

        <div className="relative">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-[15px] font-bold flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              {t("AI Schedule Import", "Import IA")}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4 pt-2">
            <p className="text-[12px] text-muted-foreground/50 leading-[1.7]">
              {t(
                "Upload a screenshot of your schedule. AI will extract every event, map it to the correct day and time, and analyze its impact on your ONE objective.",
                "Upload un screenshot de ton emploi du temps. L'IA extrait chaque événement, le place au bon jour et créneau, et analyse son impact sur ton objectif."
              )}
            </p>

            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-300 group overflow-hidden",
                  dragOver
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                )}
              >
                {/* Grid pattern background */}
                <div className="absolute inset-0 opacity-[0.015]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative">
                  <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.05] group-hover:border-white/[0.10] transition-all duration-300">
                    <ImagePlus className="h-6 w-6 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors" />
                  </div>
                  <p className="text-[13px] text-muted-foreground/40 font-medium">
                    {t("Drop your schedule here", "Glisse ton emploi du temps ici")}
                  </p>
                  <p className="text-[11px] text-muted-foreground/20 mt-1.5">
                    {t("or click to browse", "ou clique pour parcourir")} — PNG, JPG — Max 4MB
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg shadow-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Schedule" className="w-full max-h-56 object-contain bg-black/40" />
                  {!isAnalyzing && (
                    <button
                      onClick={() => setPreview(null)}
                      className="absolute top-3 right-3 h-8 w-8 rounded-xl bg-black/50 backdrop-blur-xl border border-white/[0.08] flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onAnalyze(preview)}
                  disabled={isAnalyzing}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all duration-300",
                    isAnalyzing
                      ? "bg-white/[0.04] border border-white/[0.06] text-muted-foreground/60"
                      : "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/25"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={loadingMsgIdx}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className="text-[12px]"
                        >
                          {LOADING_MESSAGES[loadingMsgIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("Analyze & Import", "Analyser et importer")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// STAT CARD — Compact metric display
// ============================================
function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Clock; label: string; value: string; color?: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", color || "bg-white/[0.04]")}>
        <Icon className="h-3.5 w-3.5 opacity-70" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/35 font-bold">{label}</p>
        <p className="text-sm font-bold tabular-nums leading-none mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ============================================
// INSIGHTS PANEL — Premium analysis dashboard
// ============================================
function InsightsPanel({
  events, insights, lang, onReanalyze, isReanalyzing,
}: {
  events: TimetableEvent[]; insights: TimetableInsights | null; lang: string
  onReanalyze?: () => void; isReanalyzing?: boolean
}) {
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en)
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "recommendations">("overview")

  const stats = useMemo(() => {
    let highHours = 0, mediumHours = 0, lowHours = 0
    events.forEach((e) => {
      const duration = (timeToMinutes(e.endTime) - timeToMinutes(e.startTime)) / 60
      if (e.priority === "high") highHours += duration
      else if (e.priority === "medium") mediumHours += duration
      else lowHours += duration
    })
    const total = highHours + mediumHours + lowHours
    const score = total > 0 ? Math.round((highHours / total) * 100) : 0
    return { highHours, mediumHours, lowHours, total, score }
  }, [events])

  const analyzedEvents = useMemo(() =>
    events.filter((e) => e.reasoning).sort((a, b) => {
      const order: Record<TimetablePriority, number> = { high: 0, low: 1, medium: 2 }
      return order[a.priority] - order[b.priority]
    })
  , [events])

  const unanalyzedCount = events.filter((e) => !e.reasoning && e.source !== "google").length

  if (events.length === 0) return null

  const focusScore = insights?.focusScore ?? stats.score
  const hasAnalysis = insights || analyzedEvents.length > 0
  const tabs = [
    { id: "overview" as const, label: t("Overview", "Vue d'ensemble"), icon: BarChart3 },
    { id: "events" as const, label: t("Per Event", "Par événement"), icon: Eye, count: analyzedEvents.length },
    { id: "recommendations" as const, label: t("Actions", "Actions"), icon: Lightbulb, count: insights?.recommendations?.length || 0 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)" }}
    >
      {/* ===== HEADER — Score + Re-analyze ===== */}
      <div className="px-5 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FocusScoreRing score={focusScore} size={64} strokeWidth={5} />
            <div>
              <p className="text-[15px] font-black tracking-tight">{t("Focus Analysis", "Analyse Focus")}</p>
              <p className="text-[11px] text-muted-foreground/35 mt-1">
                {events.length} {t("events", "événements")} — {stats.total.toFixed(1)}h {t("total", "au total")}
              </p>
              {hasAnalysis && insights?.analyzedAt && (
                <p className="text-[9px] text-muted-foreground/20 mt-1">
                  {t("Analyzed", "Analysé")} {new Date(insights.analyzedAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>

          {/* Re-analyze button */}
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              disabled={isReanalyzing}
              className={cn(
                "h-10 px-4 rounded-xl text-[11px] font-bold flex items-center gap-2 transition-all duration-300",
                isReanalyzing
                  ? "bg-white/[0.03] border border-white/[0.06] text-muted-foreground/40"
                  : unanalyzedCount > 0
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110"
                    : "bg-white/[0.04] border border-white/[0.06] text-muted-foreground/60 hover:bg-white/[0.06] hover:text-muted-foreground/80"
              )}
            >
              {isReanalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("Analyzing...", "Analyse...")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {unanalyzedCount > 0
                    ? t(`Analyze ${unanalyzedCount} events`, `Analyser ${unanalyzedCount} événements`)
                    : t("Re-analyze", "Ré-analyser")
                  }
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick stats bar */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: t("High impact", "Fort impact"), hours: stats.highHours, color: "emerald", icon: Flame },
            { label: t("Neutral", "Neutre"), hours: stats.mediumHours, color: "amber", icon: Shield },
            { label: t("Low impact", "Faible impact"), hours: stats.lowHours, color: "red", icon: AlertCircle },
          ].map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-xl p-3.5 border border-white/[0.04]"
              style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.005) 100%)` }}
            >
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  stat.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
                  stat.color === "amber" && "bg-amber-500/10 text-amber-400",
                  stat.color === "red" && "bg-red-500/10 text-red-400",
                )}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[17px] font-black tabular-nums leading-none">{stat.hours.toFixed(1)}<span className="text-[10px] font-bold text-muted-foreground/30 ml-0.5">h</span></p>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/30 font-bold mt-1">{stat.label}</p>
                </div>
              </div>
              {/* Subtle bg accent */}
              <div className={cn(
                "absolute -right-3 -bottom-3 h-16 w-16 rounded-full opacity-[0.03]",
                stat.color === "emerald" && "bg-emerald-400",
                stat.color === "amber" && "bg-amber-400",
                stat.color === "red" && "bg-red-400",
              )} />
            </div>
          ))}
        </div>

        {/* Stacked bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[9px] tabular-nums text-muted-foreground/25 font-bold uppercase tracking-wide">
            <span>{t("Time distribution", "Répartition du temps")}</span>
            <span>{stats.total.toFixed(1)}h</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.03] overflow-hidden flex">
            <motion.div
              className="h-full bg-emerald-400/80 rounded-l-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.total > 0 ? (stats.highHours / stats.total) * 100 : 0}%` }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="h-full bg-amber-400/80"
              initial={{ width: 0 }}
              animate={{ width: `${stats.total > 0 ? (stats.mediumHours / stats.total) * 100 : 0}%` }}
              transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="h-full bg-red-400/80 rounded-r-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.total > 0 ? (stats.lowHours / stats.total) * 100 : 0}%` }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      {/* ===== TABBED CONTENT — only when analysis exists ===== */}
      {hasAnalysis && (
        <>
          {/* Tab bar */}
          <div className="border-t border-white/[0.04] px-5 sm:px-6">
            <div className="flex gap-0.5 -mb-px">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                const isDisabled = tab.id === "events" && analyzedEvents.length === 0
                  || tab.id === "recommendations" && (!insights?.recommendations || insights.recommendations.length === 0)
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={cn(
                      "relative flex items-center gap-1.5 px-4 py-3 text-[11px] font-semibold transition-all",
                      isActive ? "text-foreground" : "text-muted-foreground/30 hover:text-muted-foreground/50",
                      isDisabled && "opacity-30 cursor-not-allowed",
                    )}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={cn(
                        "text-[9px] tabular-nums font-bold px-1.5 py-0.5 rounded-md",
                        isActive ? "bg-primary/10 text-primary" : "bg-white/[0.04] text-muted-foreground/30",
                      )}>{tab.count}</span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="analysis-tab"
                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="border-t border-white/[0.04] px-5 sm:px-6 py-5">
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && insights && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {insights.topInsight && (
                    <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gradient-to-br from-primary/[0.05] to-transparent border border-primary/[0.08]">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-primary/50 font-bold mb-1.5">
                          {t("Key Insight", "Observation clé")}
                        </p>
                        <p className="text-[13px] text-foreground/80 leading-[1.7] font-medium">{insights.topInsight}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.biggestTimeWaster && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
                        <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-red-400/60 font-bold mb-1">
                            {t("Time Drain", "Perte de temps")}
                          </p>
                          <p className="text-[12px] text-muted-foreground/70 leading-[1.7]">{insights.biggestTimeWaster}</p>
                        </div>
                      </div>
                    )}
                    {insights.bestTimeSlot && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.08]">
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-emerald-400/60 font-bold mb-1">
                            {t("Best Slot", "Meilleur créneau")}
                          </p>
                          <p className="text-[12px] text-muted-foreground/70 leading-[1.7]">{insights.bestTimeSlot}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* If no insights and overview tab, show CTA */}
              {activeTab === "overview" && !insights && (
                <motion.div
                  key="overview-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6 space-y-3"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto">
                    <Brain className="h-5 w-5 text-muted-foreground/15" />
                  </div>
                  <p className="text-[12px] text-muted-foreground/30">
                    {t("Click \"Analyze\" to get AI insights on your schedule", "Clique sur \"Analyser\" pour obtenir les insights IA")}
                  </p>
                </motion.div>
              )}

              {/* PER EVENT TAB */}
              {activeTab === "events" && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-2 max-h-[400px] overflow-y-auto pr-1"
                >
                  {analyzedEvents.map((event, i) => {
                    const pc = PRIORITY_CONFIG[event.priority]
                    const duration = ((timeToMinutes(event.endTime) - timeToMinutes(event.startTime)) / 60)
                    const dayLabel = lang === "fr" ? DAY_LABELS_FR[event.day] : DAY_LABELS_EN[event.day]
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group rounded-xl border border-white/[0.04] overflow-hidden hover:border-white/[0.08] transition-all"
                        style={{ background: `linear-gradient(135deg, ${pc.solidColor} 0%, rgba(255,255,255,0.008) 100%)` }}
                      >
                        <div className="flex items-stretch">
                          {/* Priority accent */}
                          <div className={cn("w-1 shrink-0", pc.dot)} />

                          <div className="flex-1 px-3.5 py-3 min-w-0">
                            {/* Event header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={cn("text-[12px] font-bold truncate", pc.text)}>
                                  {event.title}
                                </span>
                                <span className="text-[9px] text-muted-foreground/25 font-medium shrink-0 tabular-nums">
                                  {dayLabel} {event.startTime}–{event.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] font-bold tabular-nums text-muted-foreground/30">
                                  {duration.toFixed(1)}h
                                </span>
                                <div className={cn("h-5 px-2 rounded-md flex items-center text-[9px] font-bold uppercase tracking-wider", pc.bg, pc.text)}>
                                  {event.priority}
                                </div>
                              </div>
                            </div>

                            {/* Reasoning */}
                            {event.reasoning && (
                              <p className="text-[11px] text-muted-foreground/50 leading-[1.6] mt-1.5">
                                {event.reasoning}
                              </p>
                            )}

                            {/* Suggestion */}
                            {event.suggestion && (
                              <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-white/[0.03]">
                                <Lightbulb className="h-3 w-3 text-amber-400/50 mt-[1px] shrink-0" />
                                <p className="text-[10px] text-amber-400/60 leading-[1.6] font-medium">
                                  {event.suggestion}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* RECOMMENDATIONS TAB */}
              {activeTab === "recommendations" && insights?.recommendations && (
                <motion.div
                  key="recs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {insights.recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.025] hover:border-white/[0.06] transition-all"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-black tabular-nums text-primary">{i + 1}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground/65 leading-[1.8] pt-1.5">{rec}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ===== NO ANALYSIS YET — Show CTA ===== */}
      {!hasAnalysis && (
        <div className="border-t border-white/[0.04] px-5 sm:px-6 py-6">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] border border-primary/[0.08] flex items-center justify-center mx-auto">
              <Brain className="h-5 w-5 text-primary/40" />
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-semibold text-muted-foreground/50">
                {t("No analysis yet", "Pas encore d'analyse")}
              </p>
              <p className="text-[11px] text-muted-foreground/25 max-w-xs mx-auto leading-relaxed">
                {t(
                  "Run AI analysis to discover how your schedule aligns with your ONE objective",
                  "Lance l'analyse IA pour découvrir comment ton emploi du temps s'aligne avec ton objectif"
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function TimetablePage() {
  const router = useRouter()
  const hydrated = useHasHydrated()
  const {
    objective, timetableEvents, timetableInsights, isAnalyzingTimetable,
    addTimetableEvent, updateTimetableEvent, deleteTimetableEvent,
    addTimetableEvents, setTimetableInsights, setIsAnalyzingTimetable,
  } = useAppStore()
  const lang = useAppStore((s) => s.language)
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en)

  const [showEventModal, setShowEventModal] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null)
  const [defaultDay, setDefaultDay] = useState<TimetableDay>("monday")
  const [defaultTime, setDefaultTime] = useState("09:00")
  const [currentTimeOffset, setCurrentTimeOffset] = useState<number | null>(null)
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [googleEvents, setGoogleEvents] = useState<TimetableEvent[]>([])
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const { session } = useAuth()

  const today = getTodayDay()
  const dayLabels = lang === "fr" ? DAY_LABELS_FR : DAY_LABELS_EN

  // Current time indicator
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const mins = now.getHours() * 60 + now.getMinutes()
      const gridStart = START_HOUR * 60
      const gridEnd = END_HOUR * 60
      if (mins >= gridStart && mins <= gridEnd) {
        setCurrentTimeOffset(((mins - gridStart) / 30) * SLOT_HEIGHT)
      } else {
        setCurrentTimeOffset(null)
      }
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (currentTimeOffset !== null && gridRef.current) {
      const scrollTarget = Math.max(0, currentTimeOffset - 200)
      gridRef.current.scrollTo({ top: scrollTarget, behavior: "smooth" })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Google Calendar sync
  const syncGoogleCalendar = useCallback(async () => {
    if (!session?.access_token) return
    setIsSyncingGoogle(true)
    try {
      const res = await fetch("/api/google-calendar/events", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.connected) {
        setGoogleCalendarConnected(true)
        setGoogleEvents(data.events || [])
      } else {
        setGoogleCalendarConnected(false)
        setGoogleEvents([])
      }
    } catch (err) {
      console.error("Google Calendar sync failed:", err)
    } finally {
      setIsSyncingGoogle(false)
    }
  }, [session?.access_token])

  // Auto-sync Google Calendar on load
  useEffect(() => {
    if (session?.access_token && hydrated) {
      syncGoogleCalendar()
    }
  }, [session?.access_token, hydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle ?gcal= query params from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gcal = params.get("gcal")
    if (gcal === "connected") {
      syncGoogleCalendar()
      window.history.replaceState({}, "", "/app/timetable")
    } else if (gcal === "denied" || gcal === "error") {
      window.history.replaceState({}, "", "/app/timetable")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnectGoogleCalendar = async () => {
    if (!session?.access_token) return
    try {
      const res = await fetch("/api/google-calendar/auth", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Failed to initiate Google Calendar auth:", err)
    }
  }

  const handleDisconnectGoogleCalendar = async () => {
    if (!session?.access_token) return
    try {
      await fetch("/api/google-calendar/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      setGoogleCalendarConnected(false)
      setGoogleEvents([])
    } catch (err) {
      console.error("Failed to disconnect Google Calendar:", err)
    }
  }

  // Merge local + Google events
  const allEvents = useMemo(() => {
    return [...timetableEvents, ...googleEvents]
  }, [timetableEvents, googleEvents])

  const eventsByDay = useMemo(() => {
    const map: Record<TimetableDay, TimetableEvent[]> = {
      monday: [], tuesday: [], wednesday: [], thursday: [],
      friday: [], saturday: [], sunday: [],
    }
    allEvents.forEach((e) => { if (map[e.day]) map[e.day].push(e) })
    return map
  }, [allEvents])

  const handleSlotClick = (day: TimetableDay, time: string) => {
    setEditingEvent(null)
    setDefaultDay(day)
    setDefaultTime(time)
    setShowEventModal(true)
  }

  const handleEventClick = (event: TimetableEvent) => {
    if (event.source === "google") return // Google events are read-only
    setEditingEvent(event)
    setShowEventModal(true)
  }

  const handleSaveEvent = (data: { day: TimetableDay; startTime: string; endTime: string; title: string; category: string; priority: TimetablePriority }) => {
    if (editingEvent) {
      updateTimetableEvent(editingEvent.id, data)
    } else {
      // New events default to "medium" — AI will assign real priority during analysis
      addTimetableEvent({ ...data, priority: "medium", source: "manual" })
    }
  }

  const handleDeleteEvent = () => {
    if (editingEvent) deleteTimetableEvent(editingEvent.id)
  }

  const handleAnalyze = async (image: string) => {
    if (!objective) return
    setIsAnalyzingTimetable(true)

    try {
      const existingEvents = timetableEvents.map((e) => ({
        day: e.day, startTime: e.startTime, endTime: e.endTime, title: e.title,
      }))

      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          objective: {
            somedayGoal: objective.somedayGoal, monthGoal: objective.monthGoal,
            weekGoal: objective.weekGoal, todayGoal: objective.todayGoal,
            rightNowAction: objective.rightNowAction, why: objective.why,
          },
          language: lang,
          existingEvents,
        }),
      })

      const data = await res.json()

      if (data.error) {
        console.error("Timetable API error:", data.error)
        setIsAnalyzingTimetable(false)
        return
      }

      if (data.events && Array.isArray(data.events)) {
        const newEvents = data.events.map((e: Record<string, string>) => ({
          day: e.day as TimetableDay,
          startTime: e.startTime,
          endTime: e.endTime,
          title: e.title,
          category: e.category || "Other",
          priority: (e.priority || "medium") as TimetablePriority,
          source: "ai-extracted" as const,
          reasoning: e.reasoning,
          suggestion: e.suggestion,
        }))
        addTimetableEvents(newEvents)
      }

      if (data.insights) {
        setTimetableInsights({ ...data.insights, analyzedAt: new Date().toISOString() })
      }

      setIsAnalyzingTimetable(false)
      setShowUploadDialog(false)
    } catch (error) {
      console.error("Failed to analyze:", error)
      setIsAnalyzingTimetable(false)
    }
  }

  // Re-analyze all events against the objective (text-only, no image needed)
  const handleReanalyze = async () => {
    if (!objective || allEvents.length === 0) return
    setIsReanalyzing(true)

    try {
      const existingEventsPayload = allEvents.map((e) => ({
        day: e.day, startTime: e.startTime, endTime: e.endTime,
        title: e.title, category: e.category || "Other",
      }))

      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "analyze",
          objective: {
            somedayGoal: objective.somedayGoal, monthGoal: objective.monthGoal,
            weekGoal: objective.weekGoal, todayGoal: objective.todayGoal,
            rightNowAction: objective.rightNowAction, why: objective.why,
          },
          language: lang,
          existingEvents: existingEventsPayload,
        }),
      })

      const data = await res.json()

      if (data.error) {
        console.error("Re-analyze error:", data.error)
        setIsReanalyzing(false)
        return
      }

      // Update each event's priority, reasoning, and suggestion from AI response
      if (data.events && Array.isArray(data.events)) {
        // Match returned events to existing ones by day+time+title
        data.events.forEach((aiEvent: Record<string, string>) => {
          const match = allEvents.find(
            (e) => e.day === aiEvent.day && e.startTime === aiEvent.startTime && e.title === aiEvent.title
          )
          if (match && match.source !== "google") {
            updateTimetableEvent(match.id, {
              priority: (aiEvent.priority || "medium") as TimetablePriority,
              reasoning: aiEvent.reasoning || undefined,
              suggestion: aiEvent.suggestion || undefined,
            })
          }
        })
      }

      if (data.insights) {
        setTimetableInsights({ ...data.insights, analyzedAt: new Date().toISOString() })
      }

      setIsReanalyzing(false)
    } catch (error) {
      console.error("Failed to re-analyze:", error)
      setIsReanalyzing(false)
    }
  }

  // Loading
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/15" />
      </div>
    )
  }

  // No objective
  if (!objective) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-5 max-w-sm"
        >
          <div className="relative mx-auto w-fit">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground/15" />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Target className="h-2.5 w-2.5 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight">{t("Define your objective first", "Définis ton objectif d'abord")}</h2>
            <p className="text-[13px] text-muted-foreground/40 leading-relaxed">
              {t("Your timetable is analyzed relative to your ONE Thing.", "Ton emploi du temps est analysé par rapport à ton objectif.")}
            </p>
          </div>
          <button
            onClick={() => router.push("/app/define")}
            className="h-11 px-7 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
          >
            {t("Set Objective", "Définir l'objectif")}
          </button>
        </motion.div>
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">
                {t("Timetable", "Emploi du temps")}
              </h1>
              <p className="text-[11px] text-muted-foreground/30 leading-none mt-0.5 max-w-xs truncate">
                {t("Aligned to:", "Aligné sur :")} <span className="text-muted-foreground/50">{objective.somedayGoal}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditingEvent(null); setDefaultDay(today); setDefaultTime("09:00"); setShowEventModal(true) }}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("Add Event", "Ajouter")}
            </button>
            <button
              onClick={() => setShowUploadDialog(true)}
              className="h-9 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-semibold flex items-center gap-2 hover:bg-white/[0.06] hover:border-white/[0.10] transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary/70" />
              {t("AI Import", "Import IA")}
            </button>
            {googleCalendarConnected ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={syncGoogleCalendar}
                  disabled={isSyncingGoogle}
                  className="h-9 px-3.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 text-[11px] font-semibold flex items-center gap-2 text-blue-400 hover:bg-blue-500/[0.10] transition-all"
                >
                  {isSyncingGoogle ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Cloud className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{t("Synced", "Synchronisé")}</span>
                </button>
                <button
                  onClick={handleDisconnectGoogleCalendar}
                  className="h-9 w-9 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-muted-foreground/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title={t("Disconnect Google Calendar", "Déconnecter Google Calendar")}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogleCalendar}
                className="h-9 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-semibold flex items-center gap-2 hover:bg-white/[0.06] hover:border-white/[0.10] transition-all"
              >
                <Cloud className="h-3.5 w-3.5 text-blue-400/70" />
                <span className="hidden sm:inline">Google</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* TIMETABLE GRID */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.05] overflow-hidden shadow-2xl shadow-black/20"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.005) 100%)",
          }}
        >
          {/* Day headers */}
          <div className="grid border-b border-white/[0.05]" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            <div className="p-3 flex items-center justify-center border-r border-white/[0.04]">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/15" />
            </div>
            {DAYS.map((day, i) => {
              const isToday = day === today
              const eventCount = eventsByDay[day].length
              return (
                <div
                  key={day}
                  className={cn(
                    "relative py-3 px-2 text-center transition-colors",
                    i > 0 && "border-l border-white/[0.04]",
                    isToday && "bg-primary/[0.03]"
                  )}
                >
                  {isToday && (
                    <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-lg shadow-primary/40" />
                  )}
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.08em] block",
                    isToday ? "text-primary" : "text-muted-foreground/40"
                  )}>
                    {dayLabels[day]}
                  </span>
                  {eventCount > 0 && (
                    <span className={cn(
                      "text-[9px] tabular-nums mt-0.5 block",
                      isToday ? "text-primary/40" : "text-muted-foreground/20"
                    )}>
                      {eventCount}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Scrollable grid body */}
          <div
            ref={gridRef}
            className="relative overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: "calc(100vh - 280px)", minHeight: 480 }}
          >
            {/* Time rows */}
            <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
              {SLOTS.map((time, i) => {
                const isFullHour = i % 2 === 0
                return (
                  <div key={time} className="contents">
                    {/* Time label */}
                    <div
                      className="relative flex items-start justify-end pr-3 border-r border-white/[0.04]"
                      style={{ height: SLOT_HEIGHT }}
                    >
                      {isFullHour && (
                        <span className="text-[10px] tabular-nums text-muted-foreground/20 font-semibold -mt-[7px] select-none">
                          {time}
                        </span>
                      )}
                    </div>

                    {/* Day columns */}
                    {DAYS.map((day, dayIdx) => {
                      const isToday = day === today
                      const slotKey = `${day}-${time}`
                      const isHovered = hoveredSlot === slotKey
                      return (
                        <div
                          key={slotKey}
                          onClick={() => handleSlotClick(day, time)}
                          onMouseEnter={() => setHoveredSlot(slotKey)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          className={cn(
                            "relative cursor-pointer transition-all duration-150",
                            dayIdx > 0 && "border-l border-white/[0.03]",
                            isFullHour && "border-t border-t-white/[0.04]",
                            !isFullHour && "border-t border-t-white/[0.015]",
                            isToday && "bg-primary/[0.012]",
                            isHovered && !isToday && "bg-white/[0.02]",
                            isHovered && isToday && "bg-primary/[0.04]",
                          )}
                          style={{ height: SLOT_HEIGHT }}
                        >
                          {/* Plus icon on hover */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]"
                              >
                                <div className="h-5 w-5 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                                  <Plus className="h-2.5 w-2.5 text-muted-foreground/30" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* EVENT BLOCKS */}
            {DAYS.map((day, dayIndex) => (
              eventsByDay[day].map((event, eventIndex) => {
                const startMin = timeToMinutes(event.startTime)
                const endMin = timeToMinutes(event.endTime)
                const gridStartMin = START_HOUR * 60
                const topOffset = ((startMin - gridStartMin) / 30) * SLOT_HEIGHT
                const height = ((endMin - startMin) / 30) * SLOT_HEIGHT
                const pc = PRIORITY_CONFIG[event.priority]
                const isCompact = height < 40
                const isTiny = height < 28

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: eventIndex * 0.02, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "absolute rounded-[10px] overflow-hidden transition-all duration-200 z-10 group",
                      "hover:z-20 hover:shadow-xl hover:shadow-black/25",
                      event.source === "google" ? "cursor-default" : "cursor-pointer",
                      "border", event.source === "google" ? "border-blue-500/20" : pc.border,
                    )}
                    style={{
                      top: topOffset + 1,
                      left: `calc(56px + ${dayIndex} * (100% - 56px) / 7 + 3px)`,
                      width: `calc((100% - 56px) / 7 - 6px)`,
                      height: Math.max(height - 2, 24),
                      background: event.source === "google"
                        ? "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0.01) 100%)"
                        : `linear-gradient(135deg, ${pc.solidColor} 0%, rgba(255,255,255,0.01) 100%)`,
                    }}
                    onClick={(e) => { e.stopPropagation(); handleEventClick(event) }}
                  >
                    {/* Left accent bar */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-[3px]",
                      event.source === "google" ? "bg-blue-400" :
                      event.priority === "high" ? "bg-emerald-400" :
                      event.priority === "medium" ? "bg-amber-400" :
                      "bg-red-400"
                    )} />

                    {/* Content */}
                    <div className={cn(
                      "pl-3 pr-2 h-full flex flex-col",
                      isTiny ? "justify-center py-0.5" : "justify-center py-1.5",
                    )}>
                      <p className={cn(
                        "font-semibold leading-tight truncate",
                        event.source === "google" ? "text-blue-400" : pc.text,
                        isTiny ? "text-[10px]" : "text-[11px]",
                      )}>
                        {event.title}
                      </p>
                      {!isCompact && (
                        <p className="text-[9px] text-muted-foreground/30 mt-0.5 tabular-nums font-medium">
                          {event.startTime} – {event.endTime}
                        </p>
                      )}
                      {height > 64 && (
                        <span className="text-[9px] mt-1 px-1.5 py-0.5 rounded-md bg-white/[0.04] text-muted-foreground/30 font-medium w-fit">
                          {event.category}
                        </span>
                      )}
                    </div>

                    {/* Source badge */}
                    {event.source === "ai-extracted" && !isTiny && (
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-4 w-4 rounded-md bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-2 w-2 text-primary/50" />
                        </div>
                      </div>
                    )}
                    {event.source === "google" && !isTiny && (
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-4 w-4 rounded-md bg-blue-500/10 flex items-center justify-center">
                          <Cloud className="h-2 w-2 text-blue-400/50" />
                        </div>
                      </div>
                    )}

                    {/* Hover shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.div>
                )
              })
            ))}

            {/* CURRENT TIME INDICATOR */}
            {currentTimeOffset !== null && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{ top: currentTimeOffset, left: 0, right: 0 }}
              >
                <div className="flex items-center">
                  <div className="w-[56px] flex items-center justify-end pr-2">
                    <span className="text-[8px] tabular-nums text-red-400/60 font-bold bg-background/80 px-1 rounded">
                      {minutesToTime(START_HOUR * 60 + (currentTimeOffset / SLOT_HEIGHT) * 30)}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-[2px] bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[4px]">
                      <div className="h-[9px] w-[9px] rounded-full bg-red-500 shadow-lg shadow-red-500/40 ring-2 ring-background" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {allEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-center space-y-4 max-w-[280px]"
                >
                  <div className="relative mx-auto w-fit">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                      <LayoutGrid className="h-6 w-6 text-muted-foreground/10" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-6px]"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary/20" />
                    </motion.div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[13px] text-muted-foreground/30 font-semibold">
                      {t("Your week starts here", "Ta semaine commence ici")}
                    </p>
                    <p className="text-[11px] text-muted-foreground/15 leading-relaxed">
                      {t(
                        "Click any time slot to add an event, or use AI Import to scan your schedule",
                        "Clique sur un créneau pour ajouter un événement, ou utilise l'Import IA"
                      )}
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* LEGEND */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-3 mb-5"
        >
          {(["high", "medium", "low"] as TimetablePriority[]).map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <div className={cn("h-[5px] w-[5px] rounded-full", PRIORITY_CONFIG[p].dot)} />
              <span className="text-[10px] text-muted-foreground/25 font-medium">
                {lang === "fr" ? PRIORITY_CONFIG[p].label_fr : PRIORITY_CONFIG[p].label_en}
              </span>
            </div>
          ))}
          {googleCalendarConnected && (
            <div className="flex items-center gap-1.5">
              <div className="h-[5px] w-[5px] rounded-full bg-blue-400" />
              <span className="text-[10px] text-muted-foreground/25 font-medium">Google Calendar</span>
            </div>
          )}
          {currentTimeOffset !== null && (
            <div className="flex items-center gap-1.5">
              <div className="h-[5px] w-5 rounded-full bg-red-500/50" />
              <span className="text-[10px] text-muted-foreground/25 font-medium">{t("Now", "Maintenant")}</span>
            </div>
          )}
        </motion.div>

        {/* INSIGHTS */}
        <InsightsPanel
          events={allEvents}
          insights={timetableInsights}
          lang={lang}
          onReanalyze={handleReanalyze}
          isReanalyzing={isReanalyzing}
        />
      </div>

      {/* MODALS */}
      <EventModal
        open={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null) }}
        event={editingEvent}
        defaultDay={defaultDay}
        defaultTime={defaultTime}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        lang={lang}
      />

      <UploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzingTimetable}
        lang={lang}
      />
    </div>
  )
}
