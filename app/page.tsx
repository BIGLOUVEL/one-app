"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Lock, Zap, Target, Shield, Flame, GitMerge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconTarget, IconBolt, IconShield, IconFlame, IconMolecule } from "@/components/ui/custom-icons"
import { Logo } from "@/components/ui/logo"
import { useRef, useEffect, useState } from "react"

// Animated counter component
function AnimatedCounter({
  value,
  suffix = "",
  label
}: {
  value: number
  suffix?: string
  label: string
}) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime: number
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / 1500, 1)
            setCount(Math.floor(progress * value))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-primary mb-2 font-mono">
        {count}{suffix}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

// Glitch text component
function GlitchText({ children, className = "" }: { children: string, className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 -translate-x-[2px] translate-y-[2px] text-primary/50 z-0 animate-glitch-1"
        aria-hidden
      >
        {children}
      </span>
      <span
        className="absolute top-0 left-0 translate-x-[2px] -translate-y-[1px] text-cyan-500/30 z-0 animate-glitch-2"
        aria-hidden
      >
        {children}
      </span>
    </span>
  )
}

// Floating particles
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
          }}
          animate={{
            y: [null, -20, 20],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

// Animated grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        animate={{ y: ['0vh', '100vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Vertical accent lines */}
      <div className="absolute left-[20%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <div className="absolute right-[20%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
    </div>
  )
}

// Tool data
const tools = [
  {
    icon: IconTarget,
    title: "FOCUSING QUESTION",
    description: "Cut through noise. Find the ONE thing that makes everything else easier or unnecessary.",
    color: "primary",
  },
  {
    icon: IconMolecule,
    title: "GOAL CASCADE",
    description: "Connect someday vision to right-now action. Never lose sight of why today matters.",
    color: "violet",
  },
  {
    icon: IconBolt,
    title: "TIME BLOCKING",
    description: "Protect your focus. Schedule deep work. Enter bunker mode. Eliminate distractions.",
    color: "orange",
  },
  {
    icon: IconShield,
    title: "FOUR THIEVES",
    description: "Identify what steals focus. Get tactical playbooks to defend against each thief.",
    color: "cyan",
  },
  {
    icon: IconFlame,
    title: "66-DAY FORGE",
    description: "Build the focus habit. Track your streak. Never miss twice. Become unstoppable.",
    color: "red",
  },
]

// Stats data
const stats = [
  { value: 1, label: "OBJECTIVE", suffix: "" },
  { value: 66, label: "DAYS TO HABIT", suffix: "" },
  { value: 4, label: "THIEVES BLOCKED", suffix: "" },
  { value: 100, label: "FOCUS", suffix: "%" },
]

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      {/* Global background effects */}
      <GridBackground />
      <Particles />

      {/* Radial gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />

      {/* Header - Minimal, floating */}
      <motion.header
        className="fixed top-0 z-50 w-full"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-background/60 backdrop-blur-xl px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Logo size="lg" className="relative z-10" />
                <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ONE</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Focus OS</p>
              </div>
            </div>
            <Link href="/app">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all">
                <span className="mr-2">Enter</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* HERO - Massive impact */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 leading-[0.85]">
              <span className="text-muted-foreground/30">DO</span>
              <br />
              <GlitchText className="text-primary drop-shadow-[0_0_60px_rgba(0,255,136,0.5)]">
                ONE
              </GlitchText>
              <br />
              <span className="text-muted-foreground/30">THING</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Not a task manager. A <span className="text-foreground font-medium">focus operating system</span>.
            <br className="hidden sm:block" />
            Lock one objective. Execute daily. Everything else waits.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/app/define">
              <Button size="lg" className="group relative overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-base font-semibold">
                <span className="relative z-10 flex items-center gap-2">
                  DEFINE YOUR ONE THING
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-green-400 to-primary bg-[length:200%_100%] animate-shimmer" />
              </Button>
            </Link>
            <Link href="#system">
              <Button size="lg" variant="outline" className="border-white/10 hover:border-white/20 px-8 py-6 text-base">
                EXPLORE SYSTEM
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-32 left-8 w-32 h-32 border-l-2 border-t-2 border-primary/20 rounded-tl-3xl" />
        <div className="absolute top-32 right-8 w-32 h-32 border-r-2 border-t-2 border-primary/20 rounded-tr-3xl" />
        <div className="absolute bottom-32 left-8 w-32 h-32 border-l-2 border-b-2 border-primary/20 rounded-bl-3xl" />
        <div className="absolute bottom-32 right-8 w-32 h-32 border-r-2 border-b-2 border-primary/20 rounded-br-3xl" />
      </motion.section>

      {/* STATS BAR */}
      <section className="relative py-12 border-y border-white/[0.06] bg-card/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE QUESTION */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-3xl" />

            <div className="relative border border-primary/20 rounded-3xl p-8 md:p-16 bg-gradient-to-b from-primary/[0.03] to-transparent">
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-muted-foreground font-mono">the_focusing_question.exe</span>
              </div>

              <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-center leading-relaxed mb-8">
                <span className="text-muted-foreground">"</span>
                What's the <span className="text-primary font-bold">ONE</span> thing I can do
                <br className="hidden md:block" />
                such that by doing it everything else
                <br className="hidden md:block" />
                will be <span className="text-primary">easier</span> or <span className="text-primary">unnecessary</span>?
                <span className="text-muted-foreground">"</span>
              </p>

              <p className="text-center text-sm text-muted-foreground">
                — Gary Keller, <span className="italic">The ONE Thing</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SYSTEM TOOLS */}
      <section id="system" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em]">System Components</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              BUILT FOR <span className="text-primary">EXECUTION</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every feature exists to help you pick the right thing, protect your focus, and build the habit.
            </p>
          </motion.div>

          {/* Tools grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" />
                  <div className="relative h-full p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <Icon size="lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm tracking-wide mb-2 group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* THE LOCK PRINCIPLE */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Animated border */}
            <div className="absolute -inset-px rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-primary bg-[length:200%_100%] animate-shimmer opacity-50" />
            </div>

            <div className="relative rounded-3xl bg-background p-8 md:p-16">
              <div className="grid md:grid-cols-[auto,1fr] gap-8 items-center">
                {/* Lock icon */}
                <div className="flex justify-center md:justify-start">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 30px rgba(0,255,136,0.3)',
                        '0 0 60px rgba(0,255,136,0.5)',
                        '0 0 30px rgba(0,255,136,0.3)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center"
                  >
                    <Lock className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                  </motion.div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
                    THE LOCK <span className="text-primary">PRINCIPLE</span>
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    When you commit to your ONE thing, <span className="text-foreground font-medium">the system locks</span>.
                    You cannot create a new objective until you finish or fail the current one.
                    This isn't a limitation — it's <span className="text-primary font-medium">liberation</span>.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {['One objective at a time', 'Complete or fail to unlock', 'No escape until done'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              READY TO <span className="text-primary">FOCUS</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
              Stop managing tasks. Start achieving the ONE thing that actually matters.
              Lock in. Execute. Win.
            </p>

            <Link href="/app/define">
              <Button size="lg" className="group relative overflow-hidden bg-primary text-primary-foreground px-12 py-7 text-lg font-bold">
                <span className="relative z-10 flex items-center gap-3">
                  START NOW — FREE
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-green-400 to-primary bg-[length:200%_100%] animate-shimmer" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">
                ONE — Focus Operating System
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Built for those who execute.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes glitch-1 {
          0%, 100% { transform: translate(-2px, 2px); }
          25% { transform: translate(2px, -2px); }
          50% { transform: translate(-1px, 1px); }
          75% { transform: translate(1px, -1px); }
        }
        @keyframes glitch-2 {
          0%, 100% { transform: translate(2px, -1px); }
          25% { transform: translate(-2px, 1px); }
          50% { transform: translate(1px, -2px); }
          75% { transform: translate(-1px, 2px); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out infinite;
        }
        .animate-glitch-2 {
          animation: glitch-2 0.3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
