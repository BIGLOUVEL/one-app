"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowRight, ArrowDown } from "lucide-react"
import { useTheme, UITheme } from "@/components/theme-provider"
import { useRef, useEffect, useState } from "react"

// ============================================
// DATA
// ============================================
const systemTools = [
  {
    icon: "/FOCUS.png",
    title: "THE FOCUSING QUESTION",
    description: "What's the ONE thing I can do such that by doing it everything else will be easier or unnecessary?",
    isQuote: true,
    author: "Gary Keller",
  },
  {
    icon: "/MOLECULE.png",
    title: "GOAL CASCADE",
    description: "Connect your someday vision to a right-now action. Every level feeds the next.",
  },
  {
    icon: "/BOLT.png",
    title: "TIME BLOCKING",
    description: "Protect your focus hours. Enter bunker mode. Eliminate every distraction.",
  },
  {
    icon: "/SHIELD.png",
    title: "FOUR THIEVES",
    description: "Identify what steals your focus. Get tactical playbooks to defeat each one.",
  },
  {
    icon: "/FIRE.png",
    title: "66-DAY FORGE",
    description: "It takes 66 days to build a habit. Track your streak. Never miss twice.",
  },
]

const smoothEase = [0.25, 0.46, 0.45, 0.94] as const

// ============================================
// GRAIN OVERLAY
// ============================================
function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{
        opacity: 0.028,
        mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -80])

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden"
      style={{ opacity: heroOpacity }}
    >
      {/* Atmospheric aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsla(150,100%,45%,0.07), hsla(170,80%,35%,0.03), transparent 70%)",
            filter: "blur(120px)",
            left: "50%",
            top: "40%",
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            x: ["-50%", "-40%", "-60%", "-50%"],
            y: ["-50%", "-45%", "-55%", "-50%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsla(180,70%,40%,0.04), hsla(200,60%,35%,0.02), transparent 70%)",
            filter: "blur(100px)",
            right: "20%",
            top: "30%",
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_75%)] pointer-events-none" />

      <motion.div className="relative z-10 text-center" style={{ y: heroY }}>
        {/* ONE */}
        <motion.h1
          className="font-black tracking-[-0.04em] leading-[0.85] mb-4"
          style={{ fontSize: "clamp(5rem, 14vw, 13rem)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: smoothEase }}
        >
          ONE
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-muted-foreground mb-10 sm:mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: smoothEase }}
        >
          Focus Operating System
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed px-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: smoothEase }}
        >
          One objective. Full execution.{" "}
          <span className="text-foreground font-medium">No escape until done.</span>
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: smoothEase }}
        >
          <Link href="/login">
            <motion.span
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm overflow-hidden"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">START FREE</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer" />
            </motion.span>
          </Link>
          <Link href="#system">
            <motion.span
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:border-white/[0.12] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              How it works
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4 text-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

// ============================================
// PROBLEM SECTION
// ============================================
function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-15%" })

  const lines = [
    { text: "You don't lack ambition.", highlight: false },
    { text: "You don't lack tools.", highlight: false },
    { text: "You lack focus.", highlight: true },
  ]

  return (
    <section className="relative py-24 sm:py-32 lg:py-44 px-5">
      <div ref={ref} className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-6">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className={
              line.highlight
                ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
                : "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-muted-foreground/40"
            }
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.2, ease: smoothEase }}
          >
            {line.highlight ? (
              <>You lack <span className="text-primary">focus</span>.</>
            ) : (
              line.text
            )}
          </motion.p>
        ))}

        <motion.p
          className="text-sm sm:text-base text-muted-foreground pt-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease: smoothEase }}
        >
          ONE exists to fix that.
        </motion.p>
      </div>
    </section>
  )
}

// ============================================
// BENTO CARD
// ============================================
function BentoCard({
  tool,
  index,
  isHero,
}: {
  tool: (typeof systemTools)[number]
  index: number
  isHero?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: smoothEase }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className={`group relative rounded-2xl border border-white/[0.06] overflow-hidden transition-colors duration-500 hover:border-primary/20 ${
        isHero ? "md:col-span-1 md:row-span-2" : ""
      }`}
    >
      {/* Hover light sweep */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent" />

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col ${isHero ? "p-6 sm:p-8 lg:p-10" : "p-5 sm:p-6"}`}>
        {/* Icon */}
        <div className="relative mb-5 sm:mb-6">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              width: isHero ? 120 : 80,
              height: isHero ? 120 : 80,
              background: "radial-gradient(circle, hsla(150,100%,45%,0.08), transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <Image
            src={tool.icon}
            alt={tool.title}
            width={isHero ? 72 : 52}
            height={isHero ? 72 : 52}
            className={`relative z-10 ${
              isHero
                ? "w-14 h-14 sm:w-[72px] sm:h-[72px]"
                : "w-10 h-10 sm:w-[52px] sm:h-[52px]"
            } object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]`}
          />
        </div>

        {/* Title */}
        <h3
          className={`font-bold tracking-wide mb-3 group-hover:text-primary transition-colors duration-300 ${
            isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm"
          }`}
        >
          {tool.title}
        </h3>

        {/* Description / Quote */}
        {tool.isQuote ? (
          <div className="flex-1 flex flex-col justify-between">
            <p className={`italic leading-relaxed text-muted-foreground/80 ${isHero ? "text-base sm:text-lg lg:text-xl" : "text-sm"}`}>
              <span className="text-primary/60 not-italic">&ldquo;</span>
              {tool.description}
              <span className="text-primary/60 not-italic">&rdquo;</span>
            </p>
            {tool.author && (
              <p className="mt-4 text-xs text-muted-foreground/40">
                <span className="inline-block w-4 h-px bg-primary/30 mr-2 align-middle" />
                {tool.author}
              </p>
            )}
          </div>
        ) : (
          <p className={`text-muted-foreground leading-relaxed ${isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
            {tool.description}
          </p>
        )}
      </div>

      {/* Bottom border accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/30 transition-all duration-700" />
    </motion.div>
  )
}

// ============================================
// SYSTEM SECTION
// ============================================
function SystemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <section id="system" className="relative py-24 sm:py-32 lg:py-40 px-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: smoothEase }}
          className="text-center mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The System
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5">
            Built for <span className="text-primary">execution</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Five interlocking systems. One purpose: help you pick the right thing, protect your focus, and build the habit.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-[minmax(220px,auto)]">
          {systemTools.map((tool, i) => (
            <BentoCard key={tool.title} tool={tool} index={i} isHero={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// LOCK SECTION
// ============================================
function LockSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-15%" })

  const rules = [
    "One objective at a time",
    "Complete or fail to unlock",
    "No escape until done",
  ]

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 px-5">
      {/* Section separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref} className="max-w-[1100px] mx-auto">
        <div className="relative rounded-3xl border border-white/[0.06] overflow-hidden">
          {/* Animated border glow */}
          <motion.div
            className="absolute -inset-px rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, transparent 30%, hsla(150,100%,45%,0.1) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative bg-background rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
              {/* Lock icon */}
              <motion.div
                className="flex justify-center md:justify-start"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, ease: smoothEase }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-64 sm:h-64 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, hsla(150,100%,45%,0.1), transparent 60%)",
                      filter: "blur(30px)",
                    }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <Image
                    src="/cadenas.png"
                    alt="Lock"
                    width={200}
                    height={200}
                    className="relative z-10 w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                  />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2, ease: smoothEase }}
              >
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-5">
                  The Lock <span className="text-primary">Principle</span>
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  When you commit, <span className="text-foreground font-medium">the system locks</span>.
                  You cannot create a new objective until you finish or fail the current one.
                  This isn&apos;t a limitation — it&apos;s{" "}
                  <span className="text-primary font-medium">liberation</span>.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {rules.map((rule, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/[0.06] border border-primary/[0.12]"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: smoothEase }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">{rule}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// STATS
// ============================================
function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  const stats = [
    { value: "1", label: "Objective" },
    { value: "66", label: "Days to Habit" },
    { value: "4", label: "Thieves Blocked" },
    { value: "100%", label: "Focus" },
  ]

  return (
    <section className="relative py-16 sm:py-20 px-5">
      <div ref={ref} className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08, ease: smoothEase }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-1.5 tabular-nums tracking-tight">
              {stat.value}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ============================================
// CTA SECTION
// ============================================
function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 px-5">
      <div ref={ref} className="max-w-2xl mx-auto text-center">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5"
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: smoothEase }}
        >
          Ready to <span className="text-primary">focus</span>?
        </motion.h2>

        <motion.p
          className="text-sm sm:text-base md:text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: smoothEase }}
        >
          Stop managing tasks. Start achieving the ONE thing that actually matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: smoothEase }}
          className="space-y-4"
        >
          <Link href="/login">
            <motion.span
              className="group relative inline-flex items-center gap-3 px-10 sm:px-14 py-4 sm:py-5 rounded-xl bg-primary text-primary-foreground font-bold text-base sm:text-lg overflow-hidden"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10">START FREE</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.08]" />
            </motion.span>
          </Link>
          <p className="text-xs text-muted-foreground/40">No credit card required</p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function LandingPage() {
  const { setTheme } = useTheme()
  const savedThemeRef = useRef<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Force modern theme
  useEffect(() => {
    const stored = localStorage.getItem("one-ui-theme")
    savedThemeRef.current = stored
    setTheme("modern")
    if (stored) localStorage.setItem("one-ui-theme", stored)
    return () => {
      const toRestore = savedThemeRef.current as UITheme | null
      if (toRestore && toRestore !== "modern") setTheme(toRestore)
    }
  }, [setTheme])

  // Nav scroll state
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <GrainOverlay />

      {/* NAV */}
      <motion.header
        className="fixed top-0 z-50 w-full"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: smoothEase }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
          <nav
            className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-500 ${
              scrolled
                ? "bg-background/70 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                : "bg-transparent border border-transparent"
            }`}
          >
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/LOGO.png" alt="ONE" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8" priority />
              <div className="hidden sm:block">
                <span className="text-sm font-bold tracking-tight">ONE</span>
                <span className="text-[8px] uppercase tracking-[0.15em] text-primary/70 ml-1.5">Focus OS</span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                Sign in
              </Link>
              <Link href="/login">
                <motion.span
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium hover:bg-primary/15 hover:border-primary/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.span>
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>

      <main>
        <HeroSection />
        <ProblemSection />
        <SystemSection />
        <LockSection />
        <StatsStrip />
        <CTASection />
      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-white/[0.04] py-8 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/LOGO.png" alt="ONE" width={20} height={20} className="w-5 h-5 opacity-60" />
            <span className="text-xs text-muted-foreground/40">ONE — Focus Operating System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
