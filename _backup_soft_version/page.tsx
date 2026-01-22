"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "The Focusing Question",
    description: "What's the ONE thing I can do such that by doing it everything else will be easier or unnecessary?",
  },
  {
    title: "Goal-to-Now Cascade",
    description: "Connect your someday vision to your right-now action. Never lose sight of why today matters.",
  },
  {
    title: "Time Blocking",
    description: "Protect your focus. Schedule deep work blocks and eliminate distractions.",
  },
  {
    title: "66-Day Challenge",
    description: "Build the focus habit. Track your streak and never miss twice.",
  },
]

const principles = [
  "ONE active objective at a time",
  "Everything else is noise until it's done",
  "Time blocks are sacred",
  "Review weekly. Adjust. Recommit.",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background texture-grain">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
              <span className="text-background font-display font-semibold text-sm">D</span>
            </div>
            <span className="font-display font-semibold text-lg">DeadSign</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/app">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/app/define">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Eyebrow */}
              <p className="section-header mb-6">Focus Operating System</p>

              {/* Main headline */}
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-8">
                Do <span className="italic">one</span> thing.
                <br />
                <span className="text-muted-foreground">Do it extraordinarily well.</span>
              </h1>

              {/* Subhead */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                Not a task manager. A commitment device. Pick ONE objective, lock it in,
                and execute until it's done. Everything else waits.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/app/define">
                  <Button size="lg" className="h-12 px-8 text-base gap-2">
                    Define Your ONE Thing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#method">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    Learn the Method
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl italic leading-relaxed mb-6">
              "What's the ONE thing I can do such that by doing it
              everything else will be easier or unnecessary?"
            </blockquote>
            <p className="text-muted-foreground">
              — Gary Keller, <span className="italic">The ONE Thing</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Minus className="h-4 w-4" />
                <span>{principle}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Method */}
      <section id="method" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="max-w-2xl mb-16">
              <p className="section-header mb-4">The Method</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                Tools from <span className="italic">The ONE Thing</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Every feature is designed to help you pick the right thing,
                protect your focus, and build the habit of extraordinary results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-editorial p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-display font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Lock Principle */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <p className="section-header mb-4 text-background/60">The Lock Principle</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-8">
              Once you commit, the system locks.
            </h2>
            <p className="text-xl text-background/70 mb-10 leading-relaxed">
              You cannot create a new objective until you finish or fail the current one.
              This isn't a limitation — it's liberation. No more switching. No more negotiating.
              Just execute.
            </p>
            <div className="flex flex-wrap gap-6">
              {["One objective at a time", "Complete or fail to unlock", "No escape until done"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-background/80">
                  <Check className="h-4 w-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Ready to focus?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Stop managing tasks. Start achieving the ONE thing that actually matters.
            </p>
            <Link href="/app/define">
              <Button size="lg" className="h-14 px-10 text-base gap-2">
                Start Now — It's Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
                <span className="text-background font-display font-semibold text-xs">D</span>
              </div>
              <span className="text-sm text-muted-foreground">
                DeadSign — The ONE Thing OS
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
