"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutGrid,
  Upload,
  Loader2,
  Lock,
  Sparkles,
  X,
  RotateCcw,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  ChevronRight,
  Info,
  ArrowRight,
} from "lucide-react"
import { useAppStore, useHasHydrated } from "@/store/useAppStore"
import { cn } from "@/lib/utils"
import type { TimetableAnalysis, TimetableBlock, TimetablePriority } from "@/lib/types"

// ============================================
// CONSTANTS
// ============================================
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const DAY_LABELS_EN: Record<string, string> = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" }
const DAY_LABELS_FR: Record<string, string> = { monday: "Lun", tuesday: "Mar", wednesday: "Mer", thursday: "Jeu", friday: "Ven", saturday: "Sam", sunday: "Dim" }

const PRIORITY_STYLES: Record<TimetablePriority, { bg: string; border: string; text: string; dot: string; bar: string; bgSolid: string }> = {
  high: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400", bar: "bg-emerald-400", bgSolid: "bg-emerald-500/10" },
  medium: { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400", bar: "bg-amber-400", bgSolid: "bg-amber-500/10" },
  low: { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400", bar: "bg-red-400", bgSolid: "bg-red-500/10" },
}

const SLOT_HEIGHT = 44
const MAX_FILE_SIZE = 4 * 1024 * 1024

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

// ============================================
// UPLOAD ZONE
// ============================================
function UploadZone({ onImageSelected, lang, error }: {
  onImageSelected: (base64: string) => void
  lang: string
  error: string | null
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  const processFile = useCallback((file: File) => {
    setFileError(null)
    if (!file.type.startsWith("image/")) {
      setFileError(t("Please upload an image file", "Merci d'uploader une image"))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(t("Image too large (max 4MB)", "Image trop lourde (max 4Mo)"))
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [lang])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div className="space-y-6">
      {!preview ? (
        <motion.div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-primary/[0.02]"
          )}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className={cn(
                "w-16 h-16 rounded-2xl border flex items-center justify-center transition-colors",
                isDragging ? "bg-primary/15 border-primary/30" : "bg-primary/10 border-primary/20"
              )}
              animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6, repeat: isDragging ? Infinity : 0 }}
            >
              <Upload className={cn("w-7 h-7 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
            </motion.div>
            <div>
              <p className="font-semibold text-lg">{t("Drop your timetable here", "Depose ton emploi du temps ici")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("or click to browse — PNG, JPG up to 4MB", "ou clique pour parcourir — PNG, JPG jusqu'a 4Mo")}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border bg-black/10">
            <img src={preview} alt="Timetable preview" className="w-full max-h-[400px] object-contain" />
            <button
              onClick={() => { setPreview(null); setFileError(null) }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            onClick={() => onImageSelected(preview)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {t("Analyze my schedule", "Analyser mon emploi du temps")}
          </motion.button>
        </motion.div>
      )}

      {(fileError || error) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fileError || error}
        </motion.div>
      )}
    </div>
  )
}

// ============================================
// ANALYZING STATE
// ============================================
function AnalyzingState({ lang }: { lang: string }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const messages = lang === 'fr'
    ? [
      "Lecture de ton emploi du temps...",
      "Identification des blocs horaires...",
      "Analyse par rapport a ton objectif...",
      "Attribution des priorites...",
      "Generation des insights...",
      "Creation de ton emploi du temps optimise...",
    ]
    : [
      "Reading your timetable...",
      "Identifying time blocks...",
      "Analyzing against your objective...",
      "Assigning priority levels...",
      "Generating insights...",
      "Creating your optimized timetable...",
    ]

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      {/* Pulsing grid icon */}
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(var(--primary-rgb), 0)",
              "0 0 0 20px rgba(var(--primary-rgb), 0.05)",
              "0 0 0 0 rgba(var(--primary-rgb), 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <LayoutGrid className="w-8 h-8 text-primary" />
          </motion.div>
        </motion.div>
      </div>

      {/* Message */}
      <div className="text-center space-y-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-1.5">
          {messages.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i === msgIndex ? "bg-primary w-4" : i < msgIndex ? "bg-primary/40" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// FOCUS SCORE RING
// ============================================
function FocusScoreRing({ score }: { score: number }) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const scoreColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"
  const strokeColor = score >= 70 ? "stroke-emerald-400" : score >= 40 ? "stroke-amber-400" : "stroke-red-400"

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-border/20" />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none" strokeWidth="6" strokeLinecap="round"
          className={strokeColor}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn("text-2xl font-bold", scoreColor)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Focus</span>
      </div>
    </div>
  )
}

// ============================================
// BLOCK DETAIL MODAL
// ============================================
function BlockDetailModal({ block, onClose, lang }: { block: TimetableBlock; onClose: () => void; lang: string }) {
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const style = PRIORITY_STYLES[block.priority]
  const priorityLabel = block.priority === "high"
    ? t("High Impact", "Impact eleve")
    : block.priority === "medium"
      ? t("Neutral", "Neutre")
      : t("Low Value", "Faible valeur")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-md rounded-2xl bg-background border border-border p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{block.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{block.startTime} - {block.endTime}</span>
              <span className="text-muted-foreground/40">|</span>
              <span className="capitalize">{DAY_LABELS_EN[block.day]}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority + Category */}
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", style.bg, style.border, style.text)}>
            <div className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
            {priorityLabel}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-border text-xs text-muted-foreground">
            {block.category}
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("Analysis", "Analyse")}</p>
          <p className="text-sm leading-relaxed">{block.reasoning}</p>
        </div>

        {/* Suggestion */}
        {block.suggestion && (
          <div className={cn("p-3 rounded-xl border", style.bgSolid, style.border)}>
            <div className="flex items-start gap-2">
              <Zap className={cn("w-4 h-4 mt-0.5 shrink-0", style.text)} />
              <div>
                <p className={cn("text-xs font-medium mb-0.5", style.text)}>{t("Suggestion", "Suggestion")}</p>
                <p className="text-sm">{block.suggestion}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ============================================
// TIMETABLE GRID
// ============================================
function TimetableGrid({ blocks, onBlockClick, lang }: {
  blocks: TimetableBlock[]
  onBlockClick: (block: TimetableBlock) => void
  lang: string
}) {
  const dayLabels = lang === 'fr' ? DAY_LABELS_FR : DAY_LABELS_EN

  // Determine which days have blocks
  const activeDays = DAYS.filter(day => blocks.some(b => b.day === day))
  if (activeDays.length === 0) return null

  // Determine time range
  const allMinutes = blocks.flatMap(b => [timeToMinutes(b.startTime), timeToMinutes(b.endTime)])
  const earliest = Math.floor(Math.min(...allMinutes) / 60) * 60
  const latest = Math.ceil(Math.max(...allMinutes) / 60) * 60
  const startHour = earliest / 60
  const endHour = latest / 60
  const totalSlots = (endHour - startHour) * 2 // 30-min slots

  // Generate time labels
  const timeSlots: string[] = []
  for (let h = startHour; h < endHour; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`)
    timeSlots.push(`${h.toString().padStart(2, "0")}:30`)
  }

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-white/[0.02]">
      <div
        className="grid min-w-[600px]"
        style={{
          gridTemplateColumns: `56px repeat(${activeDays.length}, 1fr)`,
          gridTemplateRows: `40px repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
        }}
      >
        {/* Corner cell */}
        <div className="sticky left-0 z-20 bg-background/80 backdrop-blur-sm border-b border-r border-border" />

        {/* Day headers */}
        {activeDays.map((day, i) => (
          <div
            key={day}
            className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-center"
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {dayLabels[day]}
            </span>
          </div>
        ))}

        {/* Time labels */}
        {timeSlots.map((slot, i) => (
          <div
            key={`time-${i}`}
            className="sticky left-0 z-10 bg-background/50 flex items-start justify-end pr-2 pt-0.5 border-r border-border/50"
            style={{ gridColumn: 1, gridRow: i + 2 }}
          >
            {i % 2 === 0 && (
              <span className="text-[10px] text-muted-foreground/50 tabular-nums">{slot}</span>
            )}
          </div>
        ))}

        {/* Grid lines */}
        {timeSlots.map((_, i) => (
          <div
            key={`line-${i}`}
            className={cn("border-b", i % 2 === 0 ? "border-border/20" : "border-border/10")}
            style={{ gridColumn: `2 / -1`, gridRow: i + 2 }}
          />
        ))}

        {/* Blocks */}
        {blocks.map((block) => {
          const dayIndex = activeDays.indexOf(block.day as typeof activeDays[number])
          if (dayIndex === -1) return null

          const startMin = timeToMinutes(block.startTime)
          const endMin = timeToMinutes(block.endTime)
          const startSlot = (startMin - earliest) / 30
          const endSlot = (endMin - earliest) / 30
          const span = endSlot - startSlot
          const blockHeight = span * SLOT_HEIGHT
          const style = PRIORITY_STYLES[block.priority]

          return (
            <motion.button
              key={block.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.random() * 0.3 }}
              whileHover={{ scale: 1.02, zIndex: 30 }}
              onClick={() => onBlockClick(block)}
              className={cn(
                "relative mx-1 my-0.5 rounded-lg border px-2 py-1 text-left transition-all cursor-pointer overflow-hidden",
                style.bg, style.border,
                "hover:shadow-lg"
              )}
              style={{
                gridColumn: dayIndex + 2,
                gridRowStart: Math.floor(startSlot) + 2,
                gridRowEnd: Math.floor(startSlot) + 2 + Math.max(1, Math.round(span)),
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                <span className="text-[11px] font-medium truncate">{block.title}</span>
              </div>
              {blockHeight > 50 && (
                <span className="text-[9px] text-muted-foreground/60 ml-3">
                  {block.startTime} - {block.endTime}
                </span>
              )}
              {blockHeight > 80 && (
                <span className="text-[9px] text-muted-foreground/40 ml-3 block truncate">
                  {block.category}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// INSIGHTS PANEL
// ============================================
function InsightsPanel({ analysis, lang }: { analysis: TimetableAnalysis; lang: string }) {
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en
  const { summary, insights } = analysis

  const totalHours = summary.highPriorityHours + summary.mediumPriorityHours + summary.lowPriorityHours

  const stats = [
    { label: t("High Impact", "Impact eleve"), hours: summary.highPriorityHours, count: summary.highPriorityCount, priority: "high" as const },
    { label: t("Neutral", "Neutre"), hours: summary.mediumPriorityHours, count: summary.mediumPriorityCount, priority: "medium" as const },
    { label: t("Low Value", "Faible valeur"), hours: summary.lowPriorityHours, count: summary.lowPriorityCount, priority: "low" as const },
  ]

  return (
    <div className="space-y-6">
      {/* Focus Score + Time Breakdown */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <FocusScoreRing score={summary.focusScore} />
          <div className="flex-1 space-y-3 w-full">
            {stats.map((stat, i) => {
              const style = PRIORITY_STYLES[stat.priority]
              const pct = totalHours > 0 ? Math.round((stat.hours / totalHours) * 100) : 0
              return (
                <motion.div
                  key={stat.priority}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", style.dot)} />
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-medium tabular-nums">
                      {stat.hours}h <span className="text-muted-foreground/50 text-xs">({stat.count} {t("blocks", "blocs")})</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-border/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                      className={cn("h-full rounded-full", style.bar)}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Insights cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("Key Insight", "Insight cle")}</span>
          </div>
          <p className="text-sm leading-relaxed">{insights.topInsight}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("Biggest Time Waster", "Plus gros gouffre")}</span>
          </div>
          <p className="text-sm leading-relaxed">{insights.biggestTimeWaster}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-panel rounded-xl p-4 space-y-2 sm:col-span-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("Best Time Slot", "Meilleur creneau")}</span>
          </div>
          <p className="text-sm leading-relaxed">{insights.bestTimeSlot}</p>
        </motion.div>
      </div>

      {/* Recommendations */}
      {insights.recommendations?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-panel rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold">{t("Recommendations", "Recommandations")}</h3>
          </div>
          <div className="space-y-2.5">
            {insights.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                </div>
                <p className="text-sm leading-relaxed">{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ============================================
// RESULTS VIEW
// ============================================
function ResultsView({ analysis, onReset, lang }: {
  analysis: TimetableAnalysis
  onReset: () => void
  lang: string
}) {
  const [selectedBlock, setSelectedBlock] = useState<TimetableBlock | null>(null)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with reset */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{t("Your Optimized Schedule", "Ton emploi du temps optimise")}</h2>
          <p className="text-sm text-muted-foreground">
            {analysis.blocks.length} {t("blocks analyzed", "blocs analyses")} — {t("click any block for details", "clique sur un bloc pour les details")}
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t("New analysis", "Nouvelle analyse")}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">{t("High Impact", "Impact eleve")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-muted-foreground">{t("Neutral", "Neutre")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-muted-foreground">{t("Low Value", "Faible valeur")}</span>
        </div>
      </div>

      {/* Timetable Grid */}
      <TimetableGrid
        blocks={analysis.blocks}
        onBlockClick={setSelectedBlock}
        lang={lang}
      />

      {/* Insights */}
      <InsightsPanel analysis={analysis} lang={lang} />

      {/* Block detail modal */}
      <AnimatePresence>
        {selectedBlock && (
          <BlockDetailModal
            block={selectedBlock}
            onClose={() => setSelectedBlock(null)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function TimetablePage() {
  const router = useRouter()
  const hasHydrated = useHasHydrated()
  const objective = useAppStore(s => s.objective)
  const timetableAnalysis = useAppStore(s => s.timetableAnalysis)
  const isAnalyzingTimetable = useAppStore(s => s.isAnalyzingTimetable)
  const setTimetableAnalysis = useAppStore(s => s.setTimetableAnalysis)
  const setIsAnalyzingTimetable = useAppStore(s => s.setIsAnalyzingTimetable)
  const clearTimetableAnalysis = useAppStore(s => s.clearTimetableAnalysis)
  const lang = useAppStore(s => s.language)
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (imageBase64: string) => {
    if (!objective) return
    setIsAnalyzingTimetable(true)
    setError(null)

    try {
      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          objective: {
            somedayGoal: objective.somedayGoal,
            monthGoal: objective.monthGoal,
            weekGoal: objective.weekGoal,
            todayGoal: objective.todayGoal,
            rightNowAction: objective.rightNowAction,
            why: objective.why,
          },
          language: lang,
        }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()

      const analysis: TimetableAnalysis = {
        id: `timetable-${Date.now()}`,
        objectiveId: objective.id,
        analyzedAt: new Date().toISOString(),
        blocks: data.analysis.blocks || [],
        summary: data.analysis.summary || {
          totalBlocks: 0, highPriorityCount: 0, mediumPriorityCount: 0, lowPriorityCount: 0,
          highPriorityHours: 0, mediumPriorityHours: 0, lowPriorityHours: 0, focusScore: 0,
        },
        insights: data.analysis.insights || {
          topInsight: "", biggestTimeWaster: "", bestTimeSlot: "", recommendations: [],
        },
      }

      setTimetableAnalysis(analysis)
    } catch {
      setError(t(
        "Analysis failed. Please try again with a clearer image.",
        "L'analyse a echoue. Reessaye avec une image plus nette."
      ))
      setIsAnalyzingTimetable(false)
    }
  }

  if (!hasHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // No objective guard
  if (!objective || objective.status !== "active") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">{t("No active objective", "Aucun objectif actif")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "Define your ONE Thing first so we can analyze your schedule against it.",
                "Definis d'abord ton ONE Thing pour qu'on puisse analyser ton emploi du temps."
              )}
            </p>
          </div>
          <button
            onClick={() => router.push("/app/onboarding")}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t("Define your ONE Thing", "Definir ton ONE Thing")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <LayoutGrid className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("Timetable Analyzer", "Analyseur d'emploi du temps")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("Upload your schedule and see what truly matters", "Upload ton emploi du temps et vois ce qui compte vraiment")}
            </p>
          </div>
        </div>

        {/* Content based on state */}
        {isAnalyzingTimetable ? (
          <AnalyzingState lang={lang} />
        ) : timetableAnalysis ? (
          <ResultsView
            analysis={timetableAnalysis}
            onReset={clearTimetableAnalysis}
            lang={lang}
          />
        ) : (
          <div className="space-y-6">
            {/* How it works */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">{t("How it works", "Comment ca marche")}</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: Upload,
                    title: t("Upload", "Upload"),
                    desc: t("Take a screenshot of your weekly timetable", "Fais une capture de ton emploi du temps hebdo"),
                  },
                  {
                    icon: Sparkles,
                    title: t("AI Analysis", "Analyse IA"),
                    desc: t("GPT-4 reads and analyzes each time block", "GPT-4 lit et analyse chaque bloc horaire"),
                  },
                  {
                    icon: LayoutGrid,
                    title: t("Color-coded schedule", "Emploi du temps colore"),
                    desc: t("See what matters vs. what wastes your time", "Vois ce qui compte vs. ce qui te fait perdre du temps"),
                  },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <step.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Zone */}
            <UploadZone
              onImageSelected={handleAnalyze}
              lang={lang}
              error={error}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
