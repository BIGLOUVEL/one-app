"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Check, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconTarget, IconBolt, IconShield, IconFlame, IconMolecule } from "@/components/ui/custom-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CardSwap, { Card as SwapCard } from "@/components/ui/CardSwap"
import { Logo } from "@/components/ui/logo"

const tools = [
  {
    iconType: "target",
    title: "The Focusing Question",
    description: "Cut through the noise. Find the ONE thing that makes everything else easier or unnecessary.",
    color: "primary",
  },
  {
    iconType: "molecule",
    title: "Goal-to-Now Cascade",
    description: "Connect your someday vision to your right-now action. Never lose sight of why today matters.",
    color: "violet",
  },
  {
    iconType: "bolt",
    title: "Time Blocking",
    description: "Protect your focus. Schedule deep work blocks and enter bunker mode to eliminate distractions.",
    color: "orange",
  },
  {
    iconType: "shield",
    title: "Four Thieves Shield",
    description: "Identify what steals your focus. Get tactical playbooks to defend against each thief.",
    color: "cyan",
  },
  {
    iconType: "flame",
    title: "66-Day Challenge",
    description: "Build the focus habit. Track your streak and never miss twice.",
    color: "red",
  },
]

const ToolIcon = ({ type, color }: { type: string; color: string }) => {
  const glowColors: Record<string, string> = {
    primary: "rgba(0,255,136,0.3)",
    violet: "rgba(139,92,246,0.3)",
    orange: "rgba(249,115,22,0.3)",
    cyan: "rgba(6,182,212,0.3)",
    red: "rgba(239,68,68,0.3)",
  }
  const glow = glowColors[color] || glowColors.primary
  const className = `drop-shadow-[0_0_8px_${glow}]`

  switch (type) {
    case "target":
      return <IconTarget size="lg" className={className} />
    case "bolt":
      return <IconBolt size="lg" className={className} />
    case "shield":
      return <IconShield size="lg" className={className} />
    case "flame":
      return <IconFlame size="lg" className={className} />
    case "molecule":
      return <IconMolecule size="lg" className={className} />
    default:
      return <IconTarget size="lg" className={className} />
  }
}

const principles = [
  "ONE active objective at a time. No exceptions.",
  "Everything else is noise until it's done.",
  "Time blocks are sacred. Protect them.",
  "Review weekly. Adjust. Recommit.",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo size="lg" className="drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
            <div>
              <h1 className="text-lg font-bold">ONE</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">The ONE Thing OS</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <Badge className="mb-4" variant="outline">
              <Logo size="xs" className="mr-1" />
              Focus Operating System
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-balance">
              Do <span className="text-primary">ONE</span> thing.
              <br />
              <span className="text-muted-foreground">Do it extraordinarily well.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 text-balance">
              Not a task manager. A focus operating system.
              Pick ONE objective. Lock it in. Execute daily. Everything else waits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/app/define">
                <Button size="lg" className="gap-2 glow-green">
                  Define Your ONE Thing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  See How It Works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* CardSwap Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:flex items-center justify-center relative h-[500px]"
          >
            <CardSwap
              cardDistance={45}
              verticalDistance={50}
              delay={4000}
              pauseOnHover={true}
              width={420}
              height={300}
            >
              <SwapCard className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-5">
                    <IconTarget size="lg" className="drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">The Focusing Question</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    What's the ONE thing I can do such that by doing it everything else will be easier or unnecessary?
                  </p>
                </div>
              </SwapCard>
              <SwapCard className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 mb-5">
                    <IconMolecule size="lg" className="drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Goal-to-Now Cascade</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Connect your someday vision to your right-now action. Never lose sight of why today matters.
                  </p>
                </div>
              </SwapCard>
              <SwapCard className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 mb-5">
                    <IconBolt size="lg" className="drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Time Blocking</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Protect your focus. Schedule deep work blocks and enter bunker mode to eliminate distractions.
                  </p>
                </div>
              </SwapCard>
            </CardSwap>
          </motion.div>
        </div>

        {/* Visual Hero Element - Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-32 relative lg:mt-24"
        >
          <div className="max-w-3xl mx-auto">
            <div className="liquid-glass p-8 md:p-12 text-center">
              <p className="text-lg md:text-xl text-muted-foreground mb-4 italic">
                "What's the ONE thing I can do such that by doing it
                everything else will be easier or unnecessary?"
              </p>
              <p className="text-sm text-muted-foreground">
                — The Focusing Question, Gary Keller
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Principles */}
      <section className="border-y border-border/50 py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {principle}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools / How it works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tools from <span className="text-primary">The ONE Thing</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature is designed to help you pick the right thing, protect your focus, and build the habit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="glass-panel border-border/50 h-full hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${tool.color}/10 border border-${tool.color}/20 mb-4`}>
                      <ToolIcon type={tool.iconType} color={tool.color} />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* The Lock Principle */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="liquid-glass-green p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="hidden md:flex shrink-0">
                <Logo size="xl" className="drop-shadow-[0_0_15px_rgba(0,255,136,0.4)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">The Lock Principle</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  When you commit to your ONE thing, the system locks. You cannot create a new objective until you finish or fail the current one.
                  This isn't a limitation — it's liberation. No more switching. No more negotiating. Just execute.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>One objective at a time</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Complete or fail to unlock</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No escape until done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to focus?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Stop managing tasks. Start achieving the ONE thing that actually matters.
          </p>
          <Link href="/app/define">
            <Button size="lg" className="gap-2 glow-green">
              Start Now — It's Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">
                ONE — The ONE Thing OS
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
