"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import confetti from "canvas-confetti"
import Image from "next/image"
import { Crown, ArrowRight, Sparkles, AlertTriangle, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useAppStore } from "@/store/useAppStore"

// ============================================
// PARTICLE FIELD - Background atmosphere
// ============================================
function ParticleField({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
      life: number
      maxLife: number
    }

    const particles: Particle[] = []
    const colors = [
      "rgba(139,92,246,",  // violet
      "rgba(0,255,136,",   // green
      "rgba(255,215,0,",   // gold
      "rgba(6,182,212,",   // cyan
    ]

    const spawn = () => {
      if (particles.length < 60) {
        const color = colors[Math.floor(Math.random() * colors.length)]
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -Math.random() * 1.5 - 0.5,
          size: Math.random() * 2.5 + 0.5,
          opacity: 0,
          color,
          life: 0,
          maxLife: 150 + Math.random() * 150,
        })
      }
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      spawn()
      if (Math.random() > 0.5) spawn()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy

        // Fade in/out
        const lifeRatio = p.life / p.maxLife
        p.opacity = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.7 ? (1 - lifeRatio) / 0.3 : 1
        p.opacity *= 0.6

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity})`
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity * 0.15})`
        ctx.fill()

        if (p.life >= p.maxLife) particles.splice(i, 1)
      }

      animId = requestAnimationFrame(animate)
    }

    animate()
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: active ? 1 : 0, transition: "opacity 1s" }}
    />
  )
}

// ============================================
// MEMBER CARD - Holographic celebration card
// ============================================
function CelebrationCard({ userName, phase }: { userName: string; phase: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [12, -12]), { stiffness: 120, damping: 18 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-12, 12]), { stiffness: 120, damping: 18 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  const sheenX = useTransform(mouseX, [0, 1], [0, 100])
  const sheenY = useTransform(mouseY, [0, 1], [0, 100])

  // Auto-rotate when not hovered (idle shimmer)
  useEffect(() => {
    if (phase < 2) return
    let t = 0
    const interval = setInterval(() => {
      t += 0.02
      mouseX.set(0.5 + Math.sin(t) * 0.15)
      mouseY.set(0.5 + Math.cos(t * 0.7) * 0.1)
    }, 50)

    const handleMove = () => clearInterval(interval)
    const card = cardRef.current
    card?.addEventListener("mousemove", handleMove)

    return () => {
      clearInterval(interval)
      card?.removeEventListener("mousemove", handleMove)
    }
  }, [phase, mouseX, mouseY])

  const today = new Date()
  const dateStr = today.toLocaleDateString("fr-FR", { month: "2-digit", year: "2-digit" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 120, rotateX: 40, scale: 0.7 }}
      animate={
        phase >= 2
          ? { opacity: 1, y: 0, rotateX: 0, scale: 1 }
          : { opacity: 0, y: 120, rotateX: 40, scale: 0.7 }
      }
      transition={{
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2,
      }}
      className="relative"
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-[420px] mx-auto rounded-2xl overflow-hidden cursor-default select-none"
      >
        {/* Aspect ratio */}
        <div className="relative" style={{ paddingBottom: "63%" }}>
          {/* Card base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0,0%,11%)] via-[hsl(0,0%,6%)] to-[hsl(0,0%,3%)]" />

          {/* Border */}
          <div className="absolute inset-0 rounded-2xl border border-white/[0.1]" />

          {/* Gold accent line at top */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), rgba(139,92,246,0.5), transparent)" }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Holographic sheen */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              background: useTransform(
                [sheenX, sheenY],
                ([x, y]) =>
                  `radial-gradient(ellipse at ${x}% ${y}%, rgba(255,215,0,0.2) 0%, rgba(139,92,246,0.15) 20%, rgba(0,255,136,0.08) 40%, rgba(6,182,212,0.05) 60%, transparent 80%)`
              ),
            }}
          />

          {/* Rainbow refraction */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: "repeating-linear-gradient(125deg, rgba(255,0,0,0.4) 0px, rgba(255,165,0,0.3) 2px, rgba(255,255,0,0.3) 4px, rgba(0,255,0,0.3) 6px, rgba(0,0,255,0.3) 8px, rgba(139,0,255,0.4) 10px, transparent 12px)",
            }}
          />

          {/* Grain */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

          {/* Content */}
          <div className="absolute inset-0 z-10 p-5 sm:p-6 flex flex-col justify-between">

            {/* Top: Logo + Pro badge */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Image src="/LOGO.png" alt="ONE" width={28} height={28} className="opacity-90" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.3em] uppercase text-white/90">ONE</p>
                  <p className="text-[7px] tracking-[0.2em] uppercase text-white/30">Focus Operating System</p>
                </div>
              </div>
              <motion.div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border"
                style={{
                  background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(139,92,246,0.15))",
                  borderColor: "rgba(255,215,0,0.25)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 8px rgba(255,215,0,0.1)",
                    "0 0 20px rgba(255,215,0,0.25)",
                    "0 0 8px rgba(255,215,0,0.1)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Crown className="h-2.5 w-2.5 text-amber-400" />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase bg-gradient-to-r from-amber-300 to-violet-400 bg-clip-text text-transparent">Pro</span>
              </motion.div>
            </div>

            {/* Center: Chip + contactless */}
            <div className="flex items-center gap-4">
              {/* EMV Chip */}
              <div className="relative w-11 h-8 rounded-[5px] overflow-hidden" style={{ transform: "translateZ(20px)" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/60 via-amber-300/50 to-amber-400/60" />
                <div className="absolute inset-[1px] rounded-[4px] bg-gradient-to-br from-amber-100/25 to-amber-300/35" />
                <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-amber-600/30" />
                <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-amber-600/25" />
                <div className="absolute top-0 bottom-0 left-[65%] w-[1px] bg-amber-600/25" />
                <div className="absolute top-[25%] left-[30%] right-[35%] h-[1px] bg-amber-600/20" />
                <div className="absolute top-[70%] left-[30%] right-[35%] h-[1px] bg-amber-600/20" />
              </div>

              {/* Contactless */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/20">
                <path d="M9 15c1.1-1.1 1.1-2.9 0-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 18c2.2-2.2 2.2-5.8 0-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M15 21c3.3-3.3 3.3-8.7 0-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Bottom: Member info */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] text-white/25 tracking-[0.15em] uppercase mb-0.5">Membre</p>
                <motion.p
                  className="text-[13px] font-medium tracking-[0.1em] text-white/70 uppercase"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                >
                  {userName}
                </motion.p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/25 tracking-[0.15em] uppercase mb-0.5">Depuis</p>
                <motion.p
                  className="text-[13px] font-medium tabular-nums text-white/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0, duration: 0.6 }}
                >
                  {dateStr}
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Outer glow - more dramatic during celebration */}
        <motion.div
          className="absolute -inset-2 rounded-3xl pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 40px rgba(255,215,0,0.08), 0 0 100px rgba(139,92,246,0.05), 0 0 160px rgba(0,255,136,0.03)",
              "0 0 60px rgba(255,215,0,0.15), 0 0 120px rgba(139,92,246,0.1), 0 0 200px rgba(0,255,136,0.06)",
              "0 0 40px rgba(255,215,0,0.08), 0 0 100px rgba(139,92,246,0.05), 0 0 160px rgba(0,255,136,0.03)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Reflection */}
      <motion.div
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full blur-3xl"
        style={{ background: "linear-gradient(to top, transparent, rgba(255,215,0,0.04), rgba(139,92,246,0.03), transparent)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function PaymentVerifier() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const lang = useAppStore(s => s.language)
  const storedFirstName = useAppStore(s => s.firstName)
  const t = useCallback((en: string, fr: string) => lang === 'fr' ? fr : en, [lang])

  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [phase, setPhase] = useState(0)
  // Phase 0: idle
  // Phase 1: verifying (pulse loader)
  // Phase 2: card reveal + confetti
  // Phase 3: welcome text + CTA
  const [isExiting, setIsExiting] = useState(false)

  // Derive display name - prefer firstName from store
  const userName = (storedFirstName || user?.email?.split("@")[0] || "MEMBRE").toUpperCase()

  // Confetti burst
  const fireConfetti = useCallback(() => {
    const duration = 4000
    const end = Date.now() + duration

    // Initial big burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.45 },
      colors: ["#FFD700", "#FFA500", "#8B5CF6", "#00FF88", "#06B6D4"],
      startVelocity: 40,
      gravity: 0.8,
      ticks: 200,
    })

    // Side cannons
    setTimeout(() => {
      confetti({ particleCount: 40, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: ["#FFD700", "#8B5CF6", "#00FF88"] })
      confetti({ particleCount: 40, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: ["#FFD700", "#8B5CF6", "#00FF88"] })
    }, 300)

    // Sustained sparkle
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#FFD700", "#FFA500"],
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#FFD700", "#FFA500"],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    setTimeout(frame, 600)
  }, [])

  // Verification logic with retry
  const verifyPayment = useCallback(async () => {
    setStatus("verifying")
    setPhase(1)

    const maxRetries = 3
    const retryDelay = 2000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          // Wait for auth session to be ready, then retry
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, retryDelay))
            continue
          }
          setStatus("error")
          return
        }

        const response = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        })

        if (response.ok) {
          setStatus("success")
          setPhase(2)
          return
        }

        const errorData = await response.json().catch(() => ({}))
        console.error(`Verify attempt ${attempt}/${maxRetries} failed:`, errorData)

        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, retryDelay))
          continue
        }
      } catch (error) {
        console.error(`Verify attempt ${attempt}/${maxRetries} error:`, error)
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, retryDelay))
          continue
        }
      }
    }

    // All retries exhausted
    setStatus("error")
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    verifyPayment()
  }, [sessionId, verifyPayment])

  // Phase transitions
  useEffect(() => {
    if (phase === 2) {
      // Fire confetti after card appears
      const confettiTimer = setTimeout(fireConfetti, 1200)
      // Show welcome text
      const textTimer = setTimeout(() => setPhase(3), 2200)
      return () => {
        clearTimeout(confettiTimer)
        clearTimeout(textTimer)
      }
    }
  }, [phase, fireConfetti])

  // Enter the app
  const handleEnter = () => {
    setIsExiting(true)
    // Final confetti pop
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#FFD700", "#00FF88"],
      startVelocity: 30,
    })
    setTimeout(() => {
      router.replace("/app")
    }, 800)
  }

  if (!sessionId || status === "idle") return null

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Dark background */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Radial light burst */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, rgba(139,92,246,0.04) 30%, rgba(0,255,136,0.02) 50%, transparent 70%)" }}
            />
          </motion.div>

          {/* Particles */}
          <ParticleField active={phase >= 2} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-lg w-full">

            {/* Phase 1: Verification loader */}
            <AnimatePresence>
              {phase === 1 && (
                <motion.div
                  exit={{ opacity: 0, scale: 0.8, y: -40 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-6"
                >
                  {/* Pulsing ring */}
                  <div className="relative">
                    <motion.div
                      className="w-20 h-20 rounded-full border-2 border-white/10"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(255,215,0,0)",
                          "0 0 0 20px rgba(255,215,0,0.05)",
                          "0 0 0 0 rgba(255,215,0,0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-t-amber-400/60 border-r-violet-400/40 border-b-transparent border-l-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image src="/LOGO.png" alt="ONE" width={28} height={28} className="opacity-70" />
                    </div>
                  </div>

                  <motion.p
                    className="text-sm text-white/40 tracking-[0.2em] uppercase"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {t("Activation...", "Activation...")}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error state */}
            <AnimatePresence>
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/90 font-medium">
                      {t("Payment received, activation pending", "Paiement recu, activation en cours")}
                    </p>
                    <p className="text-sm text-white/40 max-w-xs">
                      {t(
                        "Your payment was processed but we're having trouble activating your account. Try again or contact support.",
                        "Ton paiement a ete traite mais l'activation a echoue. Reessaie ou contacte le support."
                      )}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => verifyPayment()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary/90 hover:bg-primary text-black rounded-lg font-medium text-sm transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t("Retry", "Reessayer")}
                    </button>
                    <button
                      onClick={() => router.replace("/app")}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors"
                    >
                      {t("Continue anyway", "Continuer quand meme")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 2+: Card */}
            {phase >= 2 && (
              <CelebrationCard userName={userName} phase={phase} />
            )}

            {/* Phase 3: Welcome text + CTA */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  {/* Welcome text */}
                  <div className="space-y-2">
                    <motion.div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-400">
                        {t("Membership activated", "Abonnement active")}
                      </span>
                    </motion.div>

                    <motion.h1
                      className="text-2xl sm:text-3xl font-black tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <span className="text-white">{t("Welcome,", "Bienvenue,")}</span>
                      <br />
                      <span className="bg-gradient-to-r from-amber-300 via-primary to-violet-400 bg-clip-text text-transparent">
                        {t("ONE Pro member.", "membre ONE Pro.")}
                      </span>
                    </motion.h1>

                    <motion.p
                      className="text-sm text-white/30 max-w-xs mx-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {t(
                        "Your focus OS is now fully unlocked. Time to build.",
                        "Ton OS de focus est maintenant totalement deverrouille. C'est le moment de construire."
                      )}
                    </motion.p>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={handleEnter}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-primary/20 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative h-13 px-10 bg-gradient-to-r from-amber-500/90 via-primary to-primary/90 rounded-xl flex items-center justify-center gap-3 font-semibold text-black text-sm transition-all overflow-hidden">
                      {/* Shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                      />
                      <span className="relative z-10">{t("Enter ONE", "Entrer dans ONE")}</span>
                      <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 200px 60px rgba(0,0,0,0.4)" }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
