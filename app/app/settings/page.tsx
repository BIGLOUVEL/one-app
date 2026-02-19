"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Palette, Check, Sparkles, RotateCcw, Crown, Lock, X, CreditCard, ExternalLink, Loader2, Globe, User, Bot, LogOut, Clock } from "lucide-react"
import Image from "next/image"
import { useTheme, UITheme } from "@/components/theme-provider"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

const getVisualEffects = (lang: string) => [
  { key: "breathingGradient", label: lang === 'fr' ? "Gradient animé" : "Breathing gradient", description: lang === 'fr' ? "Effet de respiration sur la carte objectif" : "Breathing effect on the objective card" },
  { key: "circularProgress", label: lang === 'fr' ? "Progress circulaire" : "Circular progress", description: lang === 'fr' ? "Barre de progression autour du cadenas" : "Progress bar around the lock" },
  { key: "immersiveFocus", label: lang === 'fr' ? "Mode immersif" : "Immersive mode", description: lang === 'fr' ? "Écran noir total pendant les sessions focus" : "Full black screen during focus sessions" },
  { key: "confettiOnComplete", label: lang === 'fr' ? "Confettis" : "Confetti", description: lang === 'fr' ? "Explosion de confettis à la fin des sessions" : "Confetti burst at the end of sessions" },
  { key: "tiltPostIts", label: lang === 'fr' ? "Post-its 3D" : "3D Post-its", description: lang === 'fr' ? "Effet de rotation 3D au survol des post-its" : "3D tilt effect on post-it hover" },
  { key: "bouncingHeart", label: lang === 'fr' ? "Cœur rebondissant" : "Bouncing heart", description: lang === 'fr' ? "Animation quand tu likes un post-it" : "Animation when you like a post-it" },
  { key: "bounceIcons", label: lang === 'fr' ? "Icônes animées" : "Animated icons", description: lang === 'fr' ? "Rebond des icônes de la sidebar au survol" : "Sidebar icons bounce on hover" },
  { key: "milestoneAnimations", label: lang === 'fr' ? "Célébrations" : "Celebrations", description: lang === 'fr' ? "Animations à 25%, 50%, 75% de progression" : "Animations at 25%, 50%, 75% progress" },
  { key: "streakFire", label: lang === 'fr' ? "Flamme streak" : "Streak flame", description: lang === 'fr' ? "Animation feu pour 7+ jours consécutifs" : "Fire animation for 7+ consecutive days" },
] as const

// Stoic quotes for the theme preview
const stoicQuotes = [
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "First say to yourself what you would be; then do what you have to do.", author: "Epictetus" },
]

const themes: {
  id: UITheme
  name: string
  description: string
  premium?: boolean
  preview: { bg: string; accent: string; text: string }
}[] = [
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

// Stoic Theme Preview - special rich preview card
function StoicThemePreview({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const quote = stoicQuotes[Math.floor(Date.now() / 86400000) % stoicQuotes.length]

  // For now, the theme is always unlocked (premium logic can be added later)
  const isUnlocked = true

  const handleClick = () => {
    if (isUnlocked) {
      onSelect()
    } else {
      setShowUnlockModal(true)
    }
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "relative col-span-full rounded-xl border-2 text-left transition-all duration-300 overflow-hidden group",
          isSelected
            ? "border-[hsl(42,72%,52%)] shadow-[0_0_30px_hsl(42,72%,52%,0.15)]"
            : "border-border hover:border-[hsl(42,72%,52%,0.4)]"
        )}
      >
        {/* Premium badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(42,72%,52%)] text-[hsl(228,18%,7%)]">
          <Crown className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Premium</span>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(42,72%,52%)]">
            <Check className="h-3.5 w-3.5 text-[hsl(228,18%,7%)]" />
          </div>
        )}

        {/* Theme Preview - Rich immersive card */}
        <div className="relative h-48 sm:h-56 bg-[hsl(228,18%,7%)] overflow-hidden">
          {/* Marble texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              mixBlendMode: "soft-light",
            }}
          />

          {/* Gold gradient atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(42,72%,52%,0.08)] via-transparent to-[hsl(28,55%,42%,0.06)]" />

          {/* Subtle radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[hsl(42,72%,52%,0.06)] rounded-full blur-3xl" />

          {/* Decorative gold line at top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(42,72%,52%,0.5)] to-transparent" />

          {/* Content: Mini preview of UI elements */}
          <div className="relative z-10 h-full p-6 flex flex-col justify-between">
            {/* Top: Mini nav preview */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md border border-[hsl(42,72%,52%,0.3)] bg-[hsl(42,72%,52%,0.1)] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-sm bg-[hsl(42,72%,52%,0.6)]" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-8 rounded-full bg-[hsl(40,25%,90%,0.5)]" />
                <div className="h-1 w-14 rounded-full bg-[hsl(40,25%,90%,0.15)]" />
              </div>
              <div className="ml-auto flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(42,72%,52%,0.4)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(40,25%,90%,0.15)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(40,25%,90%,0.15)]" />
              </div>
            </div>

            {/* Center: Stoic quote */}
            <div className="text-center space-y-3 px-4">
              <div className="inline-block">
                <p
                  className="text-sm sm:text-base italic leading-relaxed"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: "hsl(40, 25%, 88%)",
                    letterSpacing: "0.01em",
                  }}
                >
                  &ldquo;{quote.text}&rdquo;
                </p>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <div className="h-px w-6 bg-[hsl(42,72%,52%,0.4)]" />
                  <p
                    className="text-[11px] uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "'Crimson Pro', Georgia, serif",
                      color: "hsl(42, 72%, 52%)",
                    }}
                  >
                    {quote.author}
                  </p>
                  <div className="h-px w-6 bg-[hsl(42,72%,52%,0.4)]" />
                </div>
              </div>
            </div>

            {/* Bottom: Mini cards preview */}
            <div className="flex gap-2">
              <div className="flex-1 h-8 rounded-md bg-[hsl(228,15%,10%)] border border-[hsl(228,12%,16%)] flex items-center px-2.5 gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(82,38%,38%)]" />
                <div className="h-1 flex-1 rounded-full bg-[hsl(40,25%,90%,0.1)]" />
              </div>
              <div className="flex-1 h-8 rounded-md bg-[hsl(228,15%,10%)] border border-[hsl(228,12%,16%)] flex items-center px-2.5 gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(42,72%,52%)]" />
                <div className="h-1 flex-1 rounded-full bg-[hsl(42,72%,52%,0.15)]" />
              </div>
              <div className="hidden sm:flex flex-1 h-8 rounded-md bg-[hsl(228,15%,10%)] border border-[hsl(228,12%,16%)] items-center px-2.5 gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(28,55%,42%)]" />
                <div className="h-1 flex-1 rounded-full bg-[hsl(40,25%,90%,0.1)]" />
              </div>
            </div>
          </div>

          {/* Decorative gold line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(42,72%,52%,0.3)] to-transparent" />
        </div>

        {/* Info section */}
        <div className="p-4 bg-[hsl(228,18%,7%)] border-t border-[hsl(228,12%,16%)]">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-base font-semibold mb-1"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: "hsl(40, 25%, 90%)",
                  letterSpacing: "0.02em",
                }}
              >
                Stoica
              </h3>
              <p className="text-xs" style={{ color: "hsl(30, 8%, 50%)" }}>
                Ancient marble, gold accents, philosophical depth. Stoic discipline meets timeless aesthetics.
              </p>
            </div>
            {!isUnlocked && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(42,72%,52%,0.1)] border border-[hsl(42,72%,52%,0.2)]">
                <Lock className="h-3.5 w-3.5 text-[hsl(42,72%,52%)]" />
                <span className="text-xs font-medium text-[hsl(42,72%,52%)]">Unlock</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: "inset 0 0 40px hsl(42, 72%, 52%, 0.04)",
          }}
        />
      </motion.button>

      {/* Unlock Modal (for future premium gating) */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowUnlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-xl overflow-hidden"
              style={{ background: "hsl(228, 18%, 8%)", border: "1px solid hsl(42, 72%, 52%, 0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold top line */}
              <div className="h-px bg-gradient-to-r from-transparent via-[hsl(42,72%,52%,0.6)] to-transparent" />

              <div className="p-6 text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[hsl(42,72%,52%,0.1)] border border-[hsl(42,72%,52%,0.2)] flex items-center justify-center">
                    <Crown className="h-6 w-6 text-[hsl(42,72%,52%)]" />
                  </div>
                </div>

                <div>
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: "hsl(40, 25%, 90%)",
                    }}
                  >
                    Unlock Stoica
                  </h3>
                  <p className="text-sm" style={{ color: "hsl(30, 8%, 50%)" }}>
                    This premium theme is available with ONE Pro.
                  </p>
                </div>

                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="w-full h-11 rounded-lg font-medium text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg, hsl(42, 72%, 52%), hsl(28, 55%, 42%))",
                    color: "hsl(228, 18%, 7%)",
                  }}
                >
                  Upgrade to Pro
                </button>

                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="text-xs transition-colors"
                  style={{ color: "hsl(30, 8%, 50%)" }}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Monk Mode quotes
const monkQuotes = [
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold" },
  { text: "No shortcuts. No excuses. No mercy.", author: "David Goggins" },
  { text: "You are your only limit.", author: "Unknown" },
]

// Monk Mode Theme Preview - brutal, raw, terminal aesthetic
function MonkModePreview({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const quote = monkQuotes[Math.floor(Date.now() / 86400000) % monkQuotes.length]

  const isUnlocked = true

  const handleClick = () => {
    if (isUnlocked) {
      onSelect()
    } else {
      setShowUnlockModal(true)
    }
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "relative col-span-full rounded-sm border-2 text-left transition-all duration-300 overflow-hidden group",
          isSelected
            ? "border-[hsl(0,72%,50%)] shadow-[0_0_20px_hsl(0,72%,50%,0.15)]"
            : "border-[hsl(0,0%,10%)] hover:border-[hsl(0,72%,50%,0.4)]"
        )}
      >
        {/* Premium badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[hsl(0,72%,50%)] text-white">
          <Crown className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Premium</span>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-20 flex h-6 w-6 items-center justify-center rounded-sm bg-[hsl(0,72%,50%)]">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
        )}

        {/* Theme Preview - Dark terminal aesthetic */}
        <div className="relative h-48 sm:h-56 bg-[hsl(0,0%,2%)] overflow-hidden">
          {/* Scanline effect */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}
          />

          {/* Subtle red vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(0,72%,50%,0.04)_100%)]" />

          {/* Content */}
          <div className="relative z-10 h-full p-6 flex flex-col justify-between">
            {/* Top: Terminal-style header */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(0,72%,50%,0.6)]" />
                <div className="w-2 h-2 rounded-full bg-[hsl(0,0%,20%)]" />
                <div className="w-2 h-2 rounded-full bg-[hsl(0,0%,20%)]" />
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.2em] ml-2"
                style={{
                  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  color: "hsl(0, 0%, 30%)",
                }}
              >
                monk_mode.exe
              </div>
            </div>

            {/* Center: Quote in brutal monospace */}
            <div className="text-center space-y-3 px-2">
              <p
                className="text-sm sm:text-base font-medium leading-tight"
                style={{
                  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  color: "hsl(0, 0%, 75%)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-[hsl(0,72%,50%,0.4)]" />
                <p
                  className="text-[10px] uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                    color: "hsl(0, 72%, 50%)",
                  }}
                >
                  {quote.author}
                </p>
                <div className="h-px w-8 bg-[hsl(0,72%,50%,0.4)]" />
              </div>
            </div>

            {/* Bottom: Fake terminal progress bars */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0,0%,25%)" }}>focus</span>
                <div className="flex-1 h-1 bg-[hsl(0,0%,6%)] rounded-none overflow-hidden">
                  <div className="h-full w-[85%] bg-[hsl(0,72%,50%,0.7)]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0,0%,25%)" }}>grind</span>
                <div className="flex-1 h-1 bg-[hsl(0,0%,6%)] rounded-none overflow-hidden">
                  <div className="h-full w-[62%] bg-[hsl(0,0%,20%)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Red line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(0,72%,50%,0.5)] to-transparent" />
        </div>

        {/* Info section */}
        <div className="p-4 bg-[hsl(0,0%,2%)] border-t border-[hsl(0,0%,8%)]">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-base font-bold mb-1 uppercase tracking-wider"
                style={{
                  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  color: "hsl(0, 0%, 85%)",
                  fontSize: "13px",
                }}
              >
                Monk Mode
              </h3>
              <p className="text-xs" style={{ color: "hsl(0, 0%, 35%)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                Pure black. Blood red. Zero distraction. For those who chose discipline over comfort.
              </p>
            </div>
            {!isUnlocked && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[hsl(0,72%,50%,0.1)] border border-[hsl(0,72%,50%,0.2)]">
                <Lock className="h-3.5 w-3.5 text-[hsl(0,72%,50%)]" />
                <span className="text-xs font-medium text-[hsl(0,72%,50%)]">Unlock</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover glow effect - red */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: "inset 0 0 40px hsl(0, 72%, 50%, 0.03)",
          }}
        />
      </motion.button>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowUnlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-sm overflow-hidden"
              style={{ background: "hsl(0, 0%, 3%)", border: "1px solid hsl(0, 72%, 50%, 0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-[hsl(0,72%,50%,0.6)] to-transparent" />
              <div className="p-6 text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-sm bg-[hsl(0,72%,50%,0.1)] border border-[hsl(0,72%,50%,0.2)] flex items-center justify-center">
                    <Crown className="h-6 w-6 text-[hsl(0,72%,50%)]" />
                  </div>
                </div>
                <div>
                  <h3
                    className="text-lg font-bold mb-1 uppercase tracking-wider"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0, 0%, 85%)" }}
                  >
                    Unlock Monk Mode
                  </h3>
                  <p className="text-sm" style={{ color: "hsl(0, 0%, 40%)" }}>
                    This premium theme is available with ONE Pro.
                  </p>
                </div>
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="w-full h-11 rounded-sm font-bold text-sm uppercase tracking-wider transition-all"
                  style={{
                    background: "hsl(0, 72%, 50%)",
                    color: "white",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="text-xs transition-colors"
                  style={{ color: "hsl(0, 0%, 35%)" }}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { visualPrefs, setVisualPref, resetVisualPrefs, language, setLanguage, firstName, setFirstName, aiName, setAIName, energyWindow, setEnergyWindow } = useAppStore()
  const { session, user, signOut } = useAuth()

  const lang = language
  const t = (en: string, fr: string) => lang === 'fr' ? fr : en

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }
  const visualEffects = getVisualEffects(lang)
  const [subStatus, setSubStatus] = useState<{ status: string; active: boolean; currentPeriodEnd: string | null; promoUsed?: boolean; priceAmount?: number | null; priceCurrency?: string | null } | null>(null)
  const [subLoading, setSubLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      if (!session?.access_token) {
        setSubLoading(false)
        return
      }
      try {
        const res = await fetch("/api/stripe/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          setSubStatus(await res.json())
        }
      } catch {
        // silently fail
      } finally {
        setSubLoading(false)
      }
    }
    fetchStatus()
  }, [session?.access_token])

  const openPortal = async () => {
    if (!session?.access_token) return
    setPortalLoading(true)
    setPortalError(null)
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.open(data.url, "_blank")
      } else {
        setPortalError(data.error || t("Failed to open portal", "Impossible d'ouvrir le portail"))
      }
    } catch {
      setPortalError(t("Network error. Try again.", "Erreur réseau. Réessaie."))
    } finally {
      setPortalLoading(false)
    }
  }

  // Format price from cents to display string
  const formatPrice = (amount: number, currency: string) => {
    const value = amount / 100
    const symbol = currency === "eur" ? "€" : currency === "usd" ? "$" : currency.toUpperCase()
    const formatted = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(".", ",")
    return currency === "usd" ? `${symbol}${formatted}` : `${formatted}${symbol}`
  }

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
              {/* Standard themes */}
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

              {/* Stoic Premium Theme - Full-width rich card */}
              <StoicThemePreview
                isSelected={theme === "stoic"}
                onSelect={() => setTheme("stoic")}
              />

              {/* Monk Mode Premium Theme - Full-width brutal card */}
              <MonkModePreview
                isSelected={theme === "monk"}
                onSelect={() => setTheme("monk")}
              />
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="glass-panel rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("Language", "Langue")}</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {t("Choose your preferred language", "Choisissez votre langue préférée")}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { id: "en" as const, name: "English", flag: "🇺🇸" },
              { id: "fr" as const, name: "Français", flag: "🇫🇷" },
            ]).map((l) => (
              <motion.button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative rounded-xl border-2 p-4 text-left transition-all duration-200 flex items-center gap-3",
                  language === l.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                {language === l.id && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <span className="text-2xl">{l.flag}</span>
                <span className="font-semibold">{l.name}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Profile Section */}
        <section className="glass-panel rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("Profile", "Profil")}</h2>
          </div>

          <div className="space-y-4">
            {/* First name */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("Your first name", "Ton prénom")}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("Enter your first name", "Entre ton prénom")}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>

            {/* AI name */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t("Your AI assistant's name", "Le nom de ton assistant IA")}</label>
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-violet-400 shrink-0" />
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAIName(e.target.value)}
                  placeholder="Tony"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground/60">{t("This is the name used by your AI during onboarding and coaching", "C'est le nom utilisé par ton IA pendant l'onboarding et le coaching")}</p>
            </div>
          </div>
        </section>

        {/* Energy Window Section */}
        <section className="glass-panel rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("Energy Window", "Fen\u00eatre d'\u00e9nergie")}</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {t(
              "Willpower depletes throughout the day. Set your schedule to see when your focus is strongest.",
              "La volont\u00e9 s'\u00e9puise au fil de la journ\u00e9e. D\u00e9finis ton rythme pour voir quand ton focus est le plus fort."
            )}
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="font-medium text-sm">{t("Wake-up time", "Heure de r\u00e9veil")}</p>
                <p className="text-xs text-muted-foreground">{t("When does your day start?", "Quand ta journ\u00e9e commence-t-elle ?")}</p>
              </div>
              <input
                type="time"
                value={energyWindow?.wakeUpTime ?? "07:00"}
                onChange={(e) => setEnergyWindow({
                  wakeUpTime: e.target.value,
                  bedTime: energyWindow?.bedTime ?? "23:00",
                  preferredPeriod: energyWindow?.preferredPeriod,
                })}
                className="h-9 px-3 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="font-medium text-sm">{t("Bedtime", "Heure de coucher")}</p>
                <p className="text-xs text-muted-foreground">{t("When does your day end?", "Quand ta journ\u00e9e se termine-t-elle ?")}</p>
              </div>
              <input
                type="time"
                value={energyWindow?.bedTime ?? "23:00"}
                onChange={(e) => setEnergyWindow({
                  wakeUpTime: energyWindow?.wakeUpTime ?? "07:00",
                  bedTime: e.target.value,
                  preferredPeriod: energyWindow?.preferredPeriod,
                })}
                className="h-9 px-3 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <p className="font-medium text-sm">{t("Peak productivity", "Pic de productivit\u00e9")}</p>
              <p className="text-xs text-muted-foreground mb-3">{t("When do you feel most focused?", "Quand te sens-tu le plus concentr\u00e9 ?")}</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "morning" as const, label: t("Morning", "Matin") },
                  { id: "afternoon" as const, label: t("Afternoon", "Apr\u00e8s-midi") },
                  { id: "evening" as const, label: t("Evening", "Soir") },
                ]).map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setEnergyWindow({
                      wakeUpTime: energyWindow?.wakeUpTime ?? "07:00",
                      bedTime: energyWindow?.bedTime ?? "23:00",
                      preferredPeriod: energyWindow?.preferredPeriod === period.id ? undefined : period.id,
                    })}
                    className={cn(
                      "h-10 rounded-xl border text-sm font-medium transition-all",
                      energyWindow?.preferredPeriod === period.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white/5 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Visual Effects Section */}
        <section className="glass-panel rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold">{t("Visual effects", "Effets visuels")}</h2>
            </div>
            <button
              onClick={resetVisualPrefs}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("Reset", "Réinitialiser")}
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {t("Toggle animations and visual effects", "Active ou désactive les animations et effets visuels")}
          </p>

          <div className="space-y-3">
            {visualEffects.map((effect) => (
              <div
                key={effect.key}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium text-sm">{effect.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{effect.description}</p>
                </div>
                <button
                  onClick={() => setVisualPref(effect.key, !visualPrefs[effect.key])}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors duration-200",
                    visualPrefs[effect.key] ? "bg-primary" : "bg-white/20"
                  )}
                >
                  <motion.div
                    animate={{ x: visualPrefs[effect.key] ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Subscription Section */}
        <section className="glass-panel rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("My subscription", "Mon abonnement")}</h2>
          </div>

          {subLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !subStatus || subStatus.status === "none" ? (
            <div className="flex flex-col items-center text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("No active subscription", "Aucun abonnement actif")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("Become a ONE member to unlock all features", "Deviens membre ONE pour débloquer toutes les fonctionnalités")}</p>
              </div>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
              >
                {t("Become a member", "Devenir membre")}
              </a>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Membership Card — portrait style */}
              <div className="relative mx-auto w-full max-w-[260px]">
                <div className="holo-card-wrapper">
                  <div className="holo-card relative rounded-2xl overflow-hidden" style={{ "--card-opacity": "0.8" } as React.CSSProperties}>
                    {/* Glow behind */}
                    <div className="holo-behind absolute -inset-4 rounded-3xl" />

                    {/* Card body */}
                    <div className="relative" style={{ paddingBottom: "130%" }}>
                      {/* Base gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0,0%,10%)] via-[hsl(0,0%,5%)] to-[hsl(0,0%,2%)]" />

                      {/* Border glow */}
                      <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

                      {/* Holographic shine layer */}
                      <div className="holo-shine absolute inset-0 pointer-events-none rounded-2xl" />
                      <div className="holo-glare absolute inset-0 pointer-events-none rounded-2xl" />

                      {/* Grain texture */}
                      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                      {/* Gold accent line at top */}
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-[2px] z-10"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), rgba(139,92,246,0.4), transparent)" }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />

                      {/* Content */}
                      <div className="absolute inset-0 z-10 p-5 flex flex-col items-center justify-between">
                        {/* Top: Wordmark */}
                        <div className="flex items-center justify-between w-full">
                          <p className="text-[11px] font-bold tracking-[0.35em] uppercase text-white/80">ONE</p>
                          <p className="text-[7px] tracking-[0.1em] uppercase text-white/20">EST. 2025</p>
                        </div>

                        {/* Center: Logo + MEMBER + name */}
                        <div className="flex flex-col items-center gap-3">
                          {/* Logo with ambient glow */}
                          <div className="relative">
                            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full scale-150" />
                            <Image src="/LOGO.png" alt="ONE" width={64} height={64} className="relative opacity-90" />
                          </div>

                          {/* Divider */}
                          <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                          {/* MEMBER badge */}
                          <div className={cn(
                            "px-3 py-1 rounded-full border",
                            subStatus.active
                              ? "bg-primary/10 border-primary/30"
                              : "bg-orange-500/10 border-orange-500/30"
                          )}>
                            <span className={cn(
                              "text-[9px] font-bold tracking-[0.25em] uppercase",
                              subStatus.active ? "text-primary" : "text-orange-400"
                            )}>
                              {subStatus.active ? t("MEMBER", "MEMBRE") : subStatus.status === "canceled" ? t("CANCELED", "ANNULÉ") : t("INACTIVE", "INACTIF")}
                            </span>
                          </div>

                          {/* User name */}
                          <p className="text-[18px] font-semibold tracking-[0.08em] text-white/90 uppercase text-center">
                            {firstName || user?.email?.split("@")[0] || "Member"}
                          </p>
                        </div>

                        {/* Bottom: Focus OS label */}
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-[7px] tracking-[0.25em] uppercase text-white/15">Focus Operating System</p>
                          <div className="flex gap-1">
                            <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
                            <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
                            <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing details */}
              <div className="space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      subStatus.active ? "bg-emerald-400" : "bg-orange-400"
                    )} />
                    <p className="text-sm text-muted-foreground">{t("Status", "Statut")}</p>
                  </div>
                  <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                    subStatus.active
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  )}>
                    {subStatus.status === "active" ? t("Active", "Actif") : subStatus.status === "canceled" ? t("Canceled", "Annulé") : subStatus.status === "past_due" ? t("Past due", "En retard") : subStatus.status}
                  </div>
                </div>

                {/* Monthly amount */}
                {subStatus.priceAmount != null && subStatus.priceCurrency && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5">
                    <p className="text-sm text-muted-foreground">{t("Monthly amount", "Montant mensuel")}</p>
                    <p className="text-sm font-semibold">
                      <span>{formatPrice(subStatus.priceAmount, subStatus.priceCurrency)}</span>
                      <span className="text-xs text-muted-foreground font-normal">/{t("month", "mois")}</span>
                    </p>
                  </div>
                )}

                {/* Next billing */}
                {subStatus.currentPeriodEnd && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5">
                    <p className="text-sm text-muted-foreground">
                      {subStatus.status === "canceled" ? t("Access until", "Accès jusqu'au") : t("Next billing", "Prochain prélèvement")}
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(subStatus.currentPeriodEnd).toLocaleDateString(lang === 'fr' ? "fr-FR" : "en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Manage button */}
              <div className="space-y-2">
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {t("Manage subscription", "Gérer mon abonnement")}
                </button>
                {portalError && (
                  <p className="text-xs text-red-400 text-center">{portalError}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Sign Out */}
        <section className="mt-6 mb-8">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-all text-sm font-medium text-red-400 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            {t("Sign out", "Se deconnecter")}
          </button>
        </section>
      </motion.div>
    </div>
  )
}
