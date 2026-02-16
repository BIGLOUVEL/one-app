"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { ArrowRight, Lock, Shield, Check, Zap, Brain, Flame, Palette, Crown } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// ============================================
// MEMBER CARD - The centerpiece (3D tilt)
// ============================================
function MemberCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 150, damping: 20 })

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

  // Holographic gradient follows mouse
  const sheenX = useTransform(mouseX, [0, 1], [0, 100])
  const sheenY = useTransform(mouseY, [0, 1], [0, 100])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-[400px] mx-auto rounded-2xl overflow-hidden cursor-default select-none"
      >
        {/* Card aspect ratio container */}
        <div className="relative" style={{ paddingBottom: "63%" }}>
          {/* Card base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0,0%,9%)] via-[hsl(0,0%,5%)] to-[hsl(0,0%,3%)]" />

          {/* Border */}
          <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

          {/* Holographic sheen - moves with mouse */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background: useTransform(
                [sheenX, sheenY],
                ([x, y]) =>
                  `radial-gradient(ellipse at ${x}% ${y}%, rgba(139,92,246,0.15) 0%, rgba(0,255,136,0.08) 25%, rgba(6,182,212,0.05) 50%, transparent 80%)`
              ),
            }}
          />

          {/* Rainbow refraction lines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: "repeating-linear-gradient(125deg, rgba(255,0,0,0.4) 0px, rgba(255,165,0,0.3) 2px, rgba(255,255,0,0.3) 4px, rgba(0,255,0,0.3) 6px, rgba(0,0,255,0.3) 8px, rgba(139,0,255,0.4) 10px, transparent 12px)",
            }}
          />

          {/* Grain */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

          {/* Card content */}
          <div className="absolute inset-0 z-10 p-5 sm:p-6 flex flex-col justify-between">

            {/* Top: Logo + Pro badge */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Image src="/LOGO.png" alt="ONE" width={26} height={26} className="opacity-80" />
                <div>
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/80">ONE</p>
                  <p className="text-[7px] tracking-[0.2em] uppercase text-white/25">Focus Operating System</p>
                </div>
              </div>
              <motion.div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(0,255,136,0.1))",
                  borderColor: "rgba(139,92,246,0.2)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 8px rgba(139,92,246,0.1)",
                    "0 0 16px rgba(139,92,246,0.2)",
                    "0 0 8px rgba(139,92,246,0.1)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Crown className="h-2.5 w-2.5 text-violet-400" />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase bg-gradient-to-r from-violet-400 to-primary bg-clip-text text-transparent">Pro</span>
              </motion.div>
            </div>

            {/* Center: Chip + contactless */}
            <div className="flex items-center gap-4">
              {/* EMV Chip */}
              <div className="relative w-11 h-8 rounded-[5px] overflow-hidden" style={{ transform: "translateZ(20px)" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/50 via-amber-300/40 to-amber-400/50" />
                <div className="absolute inset-[1px] rounded-[4px] bg-gradient-to-br from-amber-100/20 to-amber-300/30" />
                {/* Chip circuit lines */}
                <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-amber-600/25" />
                <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-amber-600/20" />
                <div className="absolute top-0 bottom-0 left-[65%] w-[1px] bg-amber-600/20" />
                <div className="absolute top-[25%] left-[30%] right-[35%] h-[1px] bg-amber-600/15" />
                <div className="absolute top-[70%] left-[30%] right-[35%] h-[1px] bg-amber-600/15" />
              </div>

              {/* Contactless symbol */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/15">
                <path d="M9 15c1.1-1.1 1.1-2.9 0-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 18c2.2-2.2 2.2-5.8 0-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M15 21c3.3-3.3 3.3-8.7 0-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Bottom: Member info */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] text-white/20 tracking-[0.15em] uppercase mb-0.5">Membre</p>
                <p className="text-[13px] font-medium tracking-[0.12em] text-white/60 uppercase">Votre Nom</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/20 tracking-[0.15em] uppercase mb-0.5">Valide</p>
                <p className="text-[13px] font-medium tabular-nums text-white/60">
                  {new Date().toLocaleDateString("fr-FR", { month: "2-digit", year: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated outer glow */}
        <motion.div
          className="absolute -inset-1 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 30px rgba(139,92,246,0.06), 0 0 80px rgba(0,255,136,0.03)",
              "0 0 40px rgba(139,92,246,0.12), 0 0 100px rgba(0,255,136,0.06)",
              "0 0 30px rgba(139,92,246,0.06), 0 0 80px rgba(0,255,136,0.03)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Reflection below card */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-t from-transparent via-primary/[0.04] to-transparent blur-2xl rounded-full" />
    </motion.div>
  )
}

// ============================================
// FEATURE LIST
// ============================================
function FeatureList() {
  const features = [
    { icon: Brain, text: "IA personnelle qui analyse et ajuste ton plan", color: "text-violet-400" },
    { icon: Zap, text: "Sessions focus illimitees + bunker mode", color: "text-primary" },
    { icon: Flame, text: "Suivi 66 jours, dominos, contrat d'engagement", color: "text-orange-400" },
    { icon: Palette, text: "Themes premium (Stoic, Monk Mode, +)", color: "text-cyan-400" },
    { icon: Shield, text: "Bouclier anti-distractions et analytics", color: "text-emerald-400" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="space-y-3"
    >
      {features.map((feat, i) => {
        const Icon = feat.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] border border-white/[0.06] shrink-0">
              <Icon className={cn("h-3 w-3", feat.color)} />
            </div>
            <p className="text-[13px] text-white/60 leading-snug">{feat.text}</p>
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

  const handleSubscribe = async () => {
    // Auth still loading — wait, don't redirect
    if (authLoading) {
      setError("Chargement en cours, reessaie dans un instant.")
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
        setError(data.error || `Erreur serveur (${response.status}). Reessaie.`)
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
        setError("Impossible de creer la session de paiement. Reessaie.")
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue. Reessaie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">

      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[180px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.03] blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 h-16">
        <Link href="/" className="opacity-50 hover:opacity-100 transition-opacity">
          <Logo className="h-7 w-auto" />
        </Link>
        {user ? (
          <Link href="/app" className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors tracking-[0.15em] uppercase">
            Mon app
          </Link>
        ) : (
          <Link href="/login" className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors tracking-[0.15em] uppercase">
            Connexion
          </Link>
        )}
      </header>

      {/* Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="w-full max-w-5xl">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Member Card */}
            <div className="order-2 lg:order-1">
              <MemberCard />
            </div>

            {/* RIGHT: Copy + CTA */}
            <div className="order-1 lg:order-2 space-y-8">

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/15 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary">Offre de lancement</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.05] mb-4">
                  Deviens membre
                  <br />
                  <span className="bg-gradient-to-r from-primary via-emerald-400 to-violet-400 bg-clip-text text-transparent">
                    ONE Pro.
                  </span>
                </h1>

                <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md">
                  Le systeme de focus qui te force a finir ce que tu commences.
                  Intelligence artificielle. Simplicite radicale.
                </p>
              </motion.div>

              {/* Features */}
              <FeatureList />

              {/* Pricing */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
              >
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-black tabular-nums tracking-tight">1,99$</span>
                  <span className="text-lg text-muted-foreground/40 line-through">6,99$</span>
                  <span className="text-[11px] text-primary font-semibold uppercase tracking-wider">-71%</span>
                </div>
                <p className="text-[12px] text-muted-foreground/40">
                  Premier mois &middot; puis 6,99$/mois &middot; annulable a tout moment
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-4"
              >
                <motion.button
                  onClick={handleSubscribe}
                  disabled={loading || authLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full sm:w-auto sm:min-w-[280px] group cursor-pointer"
                >
                  {/* Glow behind */}
                  <div className="absolute inset-0 bg-primary/25 rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Button body */}
                  <div className="relative h-13 px-8 bg-gradient-to-r from-primary to-primary/90 rounded-xl flex items-center justify-center gap-2.5 font-semibold text-primary-foreground text-sm transition-all overflow-hidden">
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    />
                    <div className="relative z-10 flex items-center gap-2.5">
                      {loading || authLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          <span>Chargement...</span>
                        </>
                      ) : (
                        <>
                          <span>Obtenir ma carte ONE Pro</span>
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
                    className="text-red-400 text-xs"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Trust signals */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground/25 tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-2.5 h-2.5" />
                    Paiement securise
                  </span>
                  <span className="w-px h-2.5 bg-white/5 hidden sm:block" />
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-2.5 h-2.5" />
                    Annulation libre
                  </span>
                  <span className="w-px h-2.5 bg-white/5 hidden sm:block" />
                  <span className="flex items-center gap-1.5">
                    <Check className="w-2.5 h-2.5" />
                    Acces immediat
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
            className="text-center mt-20 pb-8"
          >
            <p className="text-sm text-muted-foreground/30 italic max-w-md mx-auto">
              &quot;Quelle est la SEULE chose que je puisse faire, telle qu&apos;en la faisant, tout le reste deviendra plus simple ou inutile ?&quot;
            </p>
            <p className="text-[10px] text-muted-foreground/20 mt-2 tracking-[0.15em] uppercase">Gary Keller</p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
