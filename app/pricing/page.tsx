"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { ArrowRight, Lock, Shield, Check, Zap, Brain, Flame, Palette } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"

// ============================================
// HOLOGRAPHIC MEMBER CARD
// ============================================
function MemberCard({ memberName }: { memberName: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [12, -12]), { stiffness: 200, damping: 25 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-12, 12]), { stiffness: 200, damping: 25 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)

    // Update CSS custom properties for holographic effect
    const card = cardRef.current
    card.style.setProperty("--pointer-x", `${x * 100}%`)
    card.style.setProperty("--pointer-y", `${y * 100}%`)
    card.style.setProperty("--pointer-from-left", `${x}`)
    card.style.setProperty("--pointer-from-top", `${y}`)
    card.style.setProperty("--pointer-from-center", `${Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2)}`)
    card.style.setProperty("--background-x", `${x * 100}%`)
    card.style.setProperty("--background-y", `${y * 100}%`)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    // Don't reset values — idle animation will take over smoothly
  }, [])

  const [isHovering, setIsHovering] = useState(false)
  const idleRef = useRef<number>(0)

  // Idle orbit animation — slow continuous rotation with holographic sync
  useEffect(() => {
    let raf: number
    const animate = () => {
      if (isHovering || !cardRef.current) {
        raf = requestAnimationFrame(animate)
        return
      }

      const t = Date.now() / 1000
      // Slow elliptical orbit: ~8s full cycle
      const nx = 0.5 + Math.sin(t * 0.8) * 0.3
      const ny = 0.5 + Math.cos(t * 0.6) * 0.2

      mouseX.set(nx)
      mouseY.set(ny)

      // Sync CSS custom properties for holographic layers
      const card = cardRef.current
      card.style.setProperty("--pointer-x", `${nx * 100}%`)
      card.style.setProperty("--pointer-y", `${ny * 100}%`)
      card.style.setProperty("--pointer-from-left", `${nx}`)
      card.style.setProperty("--pointer-from-top", `${ny}`)
      card.style.setProperty("--pointer-from-center", `${Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2)}`)
      card.style.setProperty("--background-x", `${nx * 100}%`)
      card.style.setProperty("--background-y", `${ny * 100}%`)
      card.style.setProperty("--card-opacity", "1")

      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isHovering, mouseX, mouseY])

  const displayName = memberName || "VOTRE NOM"

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 25 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.25, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative holo-card-wrapper"
    >
      {/* Behind glow */}
      <div className="holo-behind" />

      <motion.div
        ref={cardRef}
        onMouseMove={(e) => { handleMouseMove(e); setIsHovering(true) }}
        onMouseLeave={() => { handleMouseLeave(); setIsHovering(false) }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="holo-card w-full max-w-[400px] mx-auto cursor-default select-none"
      >
        {/* Card — taller, portrait-leaning ratio */}
        <div className="relative" style={{ paddingBottom: "130%" }}>

          {/* Card base — deep dark with subtle color shift */}
          <div className="absolute inset-0 rounded-[24px]" style={{
            background: "linear-gradient(165deg, hsl(155, 12%, 7%) 0%, hsl(200, 10%, 4%) 40%, hsl(260, 12%, 5%) 100%)",
          }} />

          {/* Subtle radial spotlight from center */}
          <div className="absolute inset-0 rounded-[24px]" style={{
            background: "radial-gradient(ellipse at 50% 35%, rgba(52,211,153,0.04) 0%, transparent 60%)",
          }} />

          {/* Inner border — double */}
          <div className="absolute inset-0 rounded-[24px] border border-white/[0.07]" />
          <div className="absolute inset-[1px] rounded-[23px] border border-white/[0.03]" />

          {/* Holographic shine layer (logo mask) */}
          <div className="holo-shine rounded-[24px]" />

          {/* Glare layer */}
          <div className="holo-glare rounded-[24px]" />

          {/* Grain texture */}
          <div className="absolute inset-0 rounded-[24px] opacity-[0.025]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }} />

          {/* ===== CARD CONTENT ===== */}
          <div className="absolute inset-0 z-10 p-7 sm:p-8 flex flex-col">

            {/* Top: Subtle "ONE" wordmark */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/20">ONE</p>
              <p className="text-[8px] tracking-[0.2em] uppercase text-white/15">EST. 2025</p>
            </div>

            {/* CENTER — The logo, big and proud */}
            <div className="flex-1 flex flex-col items-center justify-center -mt-2">
              {/* Logo with glow */}
              <div className="relative">
                {/* Ambient glow behind logo */}
                <div className="absolute inset-0 scale-[2]" style={{
                  background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 60%)",
                  filter: "blur(30px)",
                }} />
                <Image
                  src="/LOGO.png"
                  alt="ONE"
                  width={80}
                  height={80}
                  className="relative drop-shadow-[0_0_30px_rgba(52,211,153,0.25)]"
                />
              </div>

              {/* Divider line */}
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-7 mb-5" />

              {/* MEMBER text */}
              <p className="text-[9px] tracking-[0.35em] uppercase text-white/25 font-medium">Member</p>

              {/* User's Name — the star */}
              <p className="text-[22px] sm:text-[26px] font-bold tracking-[0.08em] text-white/80 uppercase mt-3 text-center leading-tight">
                {displayName}
              </p>

              {/* Thin separator */}
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-5" />
            </div>

            {/* BOTTOM — Focus Operating System tagline + decorative line */}
            <div className="flex items-end justify-between">
              <p className="text-[7px] tracking-[0.2em] uppercase text-white/12 leading-relaxed">
                Focus Operating<br />System
              </p>

              {/* Decorative corner accent */}
              <div className="flex items-center gap-3">
                <div className="flex gap-[3px]">
                  <div className="w-[3px] h-[3px] rounded-full bg-primary/30" />
                  <div className="w-[3px] h-[3px] rounded-full bg-primary/20" />
                  <div className="w-[3px] h-[3px] rounded-full bg-primary/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reflection below card */}
      <motion.div
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/5 h-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(52,211,153,0.08) 0%, transparent 70%)",
          filter: "blur(25px)",
        }}
        animate={{
          opacity: isHovering ? 1 : 0.4,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}

// ============================================
// FEATURE LIST — Refined
// ============================================
function FeatureList({ lang }: { lang: string }) {
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  const features = [
    { icon: Brain, text: t("Personal AI that analyzes and adjusts your plan", "IA personnelle qui analyse et ajuste ton plan"), color: "text-violet-400", bg: "bg-violet-500/8" },
    { icon: Zap, text: t("Unlimited focus sessions + bunker mode", "Sessions focus illimitées + bunker mode"), color: "text-primary", bg: "bg-primary/8" },
    { icon: Flame, text: t("66-day tracking, dominos, commitment contract", "Suivi 66 jours, dominos, contrat d'engagement"), color: "text-orange-400", bg: "bg-orange-500/8" },
    { icon: Palette, text: t("Premium themes (Stoic, Monk Mode, +)", "Thèmes premium (Stoic, Monk Mode, +)"), color: "text-cyan-400", bg: "bg-cyan-500/8" },
    { icon: Shield, text: t("Anti-distraction shield and analytics", "Bouclier anti-distractions et analytics"), color: "text-emerald-400", bg: "bg-emerald-500/8" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="space-y-2.5"
    >
      {features.map((feat, i) => {
        const Icon = feat.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="flex items-center gap-3.5 group"
          >
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.05] shrink-0 transition-colors",
              feat.bg,
            )}>
              <Icon className={cn("h-3.5 w-3.5", feat.color)} />
            </div>
            <p className="text-[13px] text-white/55 leading-snug group-hover:text-white/70 transition-colors">{feat.text}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function PricingPage() {
  const { user, session, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstName = useAppStore((s) => s.firstName)
  const lang = useAppStore((s) => s.language) || "fr"
  const t = (en: string, fr: string) => lang === "fr" ? fr : en

  const handleSubscribe = async () => {
    if (authLoading) {
      setError(t("Loading, try again shortly.", "Chargement en cours, réessaie dans un instant."))
      return
    }

    if (!user || !session) {
      router.push("/login?redirect=/pricing")
      return
    }

    setLoading(true)
    setError(null)

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
        setError(data.error || t(`Server error (${response.status}). Try again.`, `Erreur serveur (${response.status}). Réessaie.`))
        return
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(t("Unable to create payment session. Try again.", "Impossible de créer la session de paiement. Réessaie."))
      }
    } catch (err: any) {
      setError(err?.message || t("An error occurred. Try again.", "Une erreur est survenue. Réessaie."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">

      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/[0.03] blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-violet-500/[0.02] blur-[180px]" />
        <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.015] blur-[160px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 h-16">
        <Link href="/" className="opacity-50 hover:opacity-100 transition-opacity">
          <Logo className="h-7 w-auto" />
        </Link>
        {user ? (
          <Link href="/app" className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors tracking-[0.15em] uppercase">
            {t("My app", "Mon app")}
          </Link>
        ) : (
          <Link href="/login" className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors tracking-[0.15em] uppercase">
            {t("Login", "Connexion")}
          </Link>
        )}
      </header>

      {/* Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="w-full max-w-5xl">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* LEFT: Holographic Member Card */}
            <div className="order-2 lg:order-1">
              <MemberCard memberName={firstName} />
            </div>

            {/* RIGHT: Copy + CTA */}
            <div className="order-1 lg:order-2 space-y-8">

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/15 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary">
                    {t("Launch offer", "Offre de lancement")}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-black tracking-tight leading-[1.08] mb-4">
                  {t("Become a", "Deviens membre")}
                  <br />
                  <span className="bg-gradient-to-r from-primary via-emerald-300 to-primary bg-clip-text text-transparent">
                    {t("ONE member.", "ONE.")}
                  </span>
                </h1>

                <p className="text-[15px] text-muted-foreground/50 leading-relaxed max-w-md">
                  {t(
                    "The focus system that forces you to finish what you start. Artificial intelligence. Radical simplicity.",
                    "Le système de focus qui te force à finir ce que tu commences. Intelligence artificielle. Simplicité radicale."
                  )}
                </p>
              </motion.div>

              {/* Features */}
              <FeatureList lang={lang} />

              {/* Pricing */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-3 space-y-2"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-[2.5rem] font-black tabular-nums tracking-tight leading-none">1,99$</span>
                  <span className="text-lg text-muted-foreground/30 line-through font-medium">6,99$</span>
                  <span className="text-[11px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">-71%</span>
                </div>
                <p className="text-[12px] text-muted-foreground/35">
                  {t(
                    "First month · then $6.99/mo · cancel anytime",
                    "Premier mois · puis 6,99$/mois · annulable à tout moment"
                  )}
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-5"
              >
                <motion.button
                  onClick={handleSubscribe}
                  disabled={loading || authLoading}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="relative w-full sm:w-auto sm:min-w-[300px] group cursor-pointer"
                >
                  {/* Glow behind */}
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Button body */}
                  <div className="relative h-14 px-8 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center gap-3 font-bold text-primary-foreground text-[14px] transition-all overflow-hidden shadow-xl shadow-primary/20">
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      {loading || authLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          <span>{t("Loading...", "Chargement...")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("Get my ONE membership", "Obtenir ma carte ONE")}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </div>
                </motion.button>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Trust signals */}
                <div className="flex flex-wrap items-center gap-5 text-[10px] text-muted-foreground/20 tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-2.5 h-2.5" />
                    {t("Secure payment", "Paiement sécurisé")}
                  </span>
                  <span className="w-px h-3 bg-white/[0.04] hidden sm:block" />
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-2.5 h-2.5" />
                    {t("Cancel freely", "Annulation libre")}
                  </span>
                  <span className="w-px h-3 bg-white/[0.04] hidden sm:block" />
                  <span className="flex items-center gap-1.5">
                    <Check className="w-2.5 h-2.5" />
                    {t("Instant access", "Accès immédiat")}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-24 pb-8"
          >
            <p className="text-[14px] text-muted-foreground/20 italic max-w-lg mx-auto leading-relaxed">
              {t(
                '"What is the ONE thing I can do, such that by doing it, everything else will become easier or unnecessary?"',
                '"Quelle est la SEULE chose que je puisse faire, telle qu\'en la faisant, tout le reste deviendra plus simple ou inutile ?"'
              )}
            </p>
            <p className="text-[10px] text-muted-foreground/15 mt-3 tracking-[0.2em] uppercase font-medium">Gary Keller</p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
