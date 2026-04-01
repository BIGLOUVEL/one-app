"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  Calendar,
  Timer,
  Lock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Map,
  Shield,
  RefreshCw,
  Check,
  CalendarDays,
  Library,
  GitBranch,
  BarChart3,
  X,
  Flame,
  Flag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Logo } from "@/components/ui/logo"

// ─── 5 CORE NAV ITEMS ───────────────────────────────────────────────────────
const coreNavItems = [
  { href: "/app",         label: "Home",         icon: Target,        description: "Your ONE thing — right now",     color: "primary" },
  { href: "/app/define",  label: "My Objective", icon: Lock,          description: "Where you are & why it matters", color: "primary" },
  { href: "/app/focus",   label: "Focus",        icon: Timer,         description: "Deep work session",              color: "primary" },
  { href: "/app/411",     label: "Milestones",   icon: Flag,          description: "Key phases toward your goal",    color: "cyan"    },
  { href: "/app/habit",   label: "Progress",     icon: TrendingUp,    description: "66-day habit & momentum",        color: "orange"  },
]

// ─── OPTIONAL MODULES ────────────────────────────────────────────────────────
const EXTRAS_KEY = "one-nav-extras"

const extraModules = [
  { href: "/app/66days",    label: "66 Days",      icon: Flame,        description: "Streak challenge tracker",color: "orange" },
  { href: "/app/timetable", label: "Calendar",     icon: CalendarDays, description: "Weekly time blocking",    color: "cyan"   },
  { href: "/app/sessions",  label: "Library",      icon: Library,      description: "Sessions & post-its",     color: "yellow" },
  { href: "/app/gps",       label: "GPS Plan",     icon: Map,          description: "One-page strategic plan", color: "violet" },
  { href: "/app/shield",    label: "Four Thieves", icon: Shield,       description: "Protect your focus time", color: "orange" },
  { href: "/app/review",    label: "Review",       icon: RefreshCw,    description: "Weekly reflection",       color: "cyan"   },
  { href: "/app/domino",    label: "Domino Chain", icon: GitBranch,    description: "Momentum visualization",  color: "violet" },
  { href: "/app/analysis",  label: "Analysis",     icon: BarChart3,    description: "Focus performance stats", color: "orange" },
]

function NavItem({ item, isActive, isLocked }: {
  item: typeof coreNavItems[0],
  isActive: boolean,
  isLocked: boolean
}) {
  const isDisabled = false
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { visualPrefs } = useAppStore()

  const colorClasses: Record<string, { bg: string, text: string, border: string, glow: string }> = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
      glow: "shadow-[0_0_20px_rgba(0,255,136,0.15)]"
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      border: "border-violet-500/20",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]"
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]"
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-500/20",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]"
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/20",
      glow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]"
    },
  }

  const colors = colorClasses[item.color] || colorClasses.primary

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className={cn(
              "group relative rounded-xl transition-all duration-300",
              !isCollapsed && "h-11",
              isCollapsed && "!w-8 !h-8 !p-0 justify-center mx-auto",
              isActive && [colors.bg, colors.border, colors.glow, "border"],
              isDisabled && "opacity-40 cursor-not-allowed"
            )}
          >
            <Link
              href={isDisabled ? "#" : item.href}
              onClick={(e) => isDisabled && e.preventDefault()}
              className={cn(isCollapsed && "justify-center")}
            >
              {/* Icon with optional bounce */}
              {isDisabled ? (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <motion.div
                  whileHover={visualPrefs.bounceIcons ? { scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-300",
                    isActive ? colors.text : "text-muted-foreground group-hover:text-foreground"
                  )} />
                </motion.div>
              )}

              {/* Label - hidden when collapsed */}
              {!isCollapsed && (
                <span className={cn(
                  "font-medium transition-colors duration-300",
                  isActive ? colors.text : "text-foreground"
                )}>
                  {item.label}
                </span>
              )}

              {/* Chevron for active - hidden when collapsed */}
              {isActive && !isCollapsed && (
                <ChevronRight className={cn("h-4 w-4 ml-auto", colors.text)} />
              )}
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{item.label}</span>
          <span className="text-muted-foreground text-xs">— {item.description}</span>
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}

// ─── MODULE PICKER MODAL (full-screen, COSM-style grid) ─────────────────────
const moduleColorMap: Record<string, {
  from: string; to: string; border: string; activeBorder: string
  glow: string; text: string; blob: string
}> = {
  cyan:   { from: "from-cyan-500/20",   to: "to-cyan-900/10",   border: "border-cyan-500/15",   activeBorder: "border-cyan-400/50",   glow: "shadow-[0_0_40px_rgba(6,182,212,0.15)]",    text: "text-cyan-400",   blob: "bg-cyan-400"   },
  yellow: { from: "from-yellow-500/20", to: "to-yellow-900/10", border: "border-yellow-500/15", activeBorder: "border-yellow-400/50", glow: "shadow-[0_0_40px_rgba(234,179,8,0.15)]",    text: "text-yellow-400", blob: "bg-yellow-400" },
  violet: { from: "from-violet-500/20", to: "to-violet-900/10", border: "border-violet-500/15", activeBorder: "border-violet-400/50", glow: "shadow-[0_0_40px_rgba(139,92,246,0.15)]",   text: "text-violet-400", blob: "bg-violet-400" },
  orange: { from: "from-orange-500/20", to: "to-orange-900/10", border: "border-orange-500/15", activeBorder: "border-orange-400/50", glow: "shadow-[0_0_40px_rgba(249,115,22,0.15)]",   text: "text-orange-400", blob: "bg-orange-400" },
  primary:{ from: "from-primary/20",    to: "to-primary/5",     border: "border-primary/15",    activeBorder: "border-primary/50",    glow: "shadow-[0_0_40px_rgba(0,255,136,0.15)]",   text: "text-primary",    blob: "bg-primary"    },
}

function ModulePickerModal({ enabled, onToggle, onClose }: {
  enabled: string[]
  onToggle: (href: string) => void
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />

        {/* Atmospheric glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[680px] mx-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/20 font-semibold mb-2">
                System
              </p>
              <h2 className="text-[22px] font-bold tracking-tight text-white/90 leading-none">
                Choose Modules
              </h2>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-150 mt-1"
            >
              <X className="h-3.5 w-3.5 text-white/50" />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {extraModules.map((module, i) => {
              const isOn = enabled.includes(module.href)
              const colors = moduleColorMap[module.color] || moduleColorMap.primary
              const Icon = module.icon

              return (
                <motion.button
                  key={module.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => onToggle(module.href)}
                  className={cn(
                    "relative group aspect-[3/4] rounded-2xl border p-4 text-left overflow-hidden",
                    "transition-all duration-200",
                    isOn
                      ? [colors.activeBorder, colors.glow, `bg-gradient-to-br ${colors.from} ${colors.to}`]
                      : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/[0.12]"
                  )}
                >
                  {/* Decorative blobs */}
                  <div className={cn(
                    "absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl transition-opacity duration-300",
                    colors.blob,
                    isOn ? "opacity-20" : "opacity-0 group-hover:opacity-8"
                  )} />
                  <div className={cn(
                    "absolute -left-3 -bottom-3 h-14 w-14 rounded-full blur-xl transition-opacity duration-300",
                    colors.blob,
                    isOn ? "opacity-10" : "opacity-0"
                  )} />

                  {/* Active check */}
                  {isOn && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 h-5 w-5 rounded-full bg-white/15 flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-white/80" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-xl mb-auto mt-1 transition-all duration-200 border",
                    isOn
                      ? [colors.blob.replace("bg-", "bg-") + "/10", colors.border, "border"]
                      : "bg-white/5 border-white/8"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      isOn ? colors.text : "text-white/25"
                    )} />
                  </div>

                  {/* Label at bottom */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className={cn(
                      "text-[13px] font-semibold leading-tight transition-colors duration-200",
                      isOn ? "text-white/90" : "text-white/35"
                    )}>
                      {module.label}
                    </p>
                    <p className={cn(
                      "text-[10px] mt-0.5 leading-snug transition-colors duration-200 line-clamp-2",
                      isOn ? "text-white/40" : "text-white/18"
                    )}>
                      {module.description}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <p className="text-[11px] text-white/20">
              {enabled.length} active
            </p>
            <span className="text-white/10">·</span>
            <p className="text-[11px] text-white/20">Press Esc to close</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

// ─── EXTRA MODULES SECTION ───────────────────────────────────────────────────
function ExtraModulesSection({ pathname, locked }: { pathname: string; locked: boolean }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const [enabled, setEnabled] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EXTRAS_KEY)
      if (saved) setEnabled(JSON.parse(saved))
    } catch {}
  }, [])

  const toggle = (href: string) => {
    setEnabled(prev => {
      const next = prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
      localStorage.setItem(EXTRAS_KEY, JSON.stringify(next))
      return next
    })
  }

  const remove = (href: string) => {
    setEnabled(prev => {
      const next = prev.filter(h => h !== href)
      localStorage.setItem(EXTRAS_KEY, JSON.stringify(next))
      return next
    })
  }

  const enabledModules = extraModules.filter(m => enabled.includes(m.href))

  return (
    <>
      {/* Enabled extra nav items — with X button on hover */}
      {enabledModules.length > 0 && (
        <>
          <div className="px-3 my-2 group-data-[collapsible=icon]:px-1">
            <div className="h-px bg-white/[0.05]" />
          </div>
          <SidebarMenu>
            {enabledModules.map(item => (
              <SidebarMenuItem key={item.href} className="group/extra relative">
                <NavItem
                  item={item}
                  isActive={pathname === item.href}
                  isLocked={locked}
                />
                {/* X button — appears on row hover, hidden when collapsed */}
                {!isCollapsed && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(item.href) }}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                      "h-5 w-5 rounded-md flex items-center justify-center",
                      "opacity-0 group-hover/extra:opacity-100 transition-all duration-150",
                      "bg-white/[0.04] hover:bg-red-500/15 hover:text-red-400",
                      "text-white/25"
                    )}
                    title={`Remove ${item.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </>
      )}

      {/* Separator + Add button */}
      <div className="px-3 mt-2 mb-1 group-data-[collapsible=icon]:px-1">
        <div className="h-px bg-white/[0.05]" />
      </div>

      <div className="relative px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setModalOpen(true)}
              className={cn(
                "flex items-center gap-2 rounded-xl transition-all duration-200",
                "text-muted-foreground/35 hover:text-muted-foreground/70",
                !isCollapsed && "w-full px-3 h-9",
                isCollapsed && "h-8 w-8 justify-center",
                modalOpen && "text-primary/60 bg-primary/8"
              )}
            >
              <motion.div animate={{ rotate: modalOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus className="h-3.5 w-3.5 shrink-0" />
              </motion.div>
              {!isCollapsed && <span className="text-xs font-medium">Add module</span>}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Add module</TooltipContent>
        </Tooltip>
      </div>

      {/* Full-screen module picker modal */}
      {modalOpen && (
        <ModulePickerModal
          enabled={enabled}
          onToggle={toggle}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

function ObjectiveCard() {
  const { objective } = useAppStore()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (!objective || isCollapsed) return null

  const statusConfig = {
    active: {
      bg: "from-primary/10 to-primary/5",
      border: "border-primary/20",
      icon: Lock,
      label: "Locked In",
      progressColor: "bg-primary"
    },
    completed: {
      bg: "from-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-500/20",
      icon: Sparkles,
      label: "Completed",
      progressColor: "bg-emerald-500"
    },
    failed: {
      bg: "from-red-500/10 to-red-500/5",
      border: "border-red-500/20",
      icon: Target,
      label: "Failed",
      progressColor: "bg-red-500"
    },
  }

  const config = statusConfig[objective.status] || statusConfig.active
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mx-2 mb-2 rounded-2xl border p-4",
        `bg-gradient-to-br ${config.bg}`,
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md",
          objective.status === "active" ? "bg-primary/20" :
          objective.status === "completed" ? "bg-emerald-500/20" : "bg-red-500/20"
        )}>
          {objective.status === "active" ? (
            <Image src="/cadenas.png" alt="Locked" width={22} height={22} />
          ) : (
            <Icon className={cn(
              "h-3.5 w-3.5",
              objective.status === "completed" ? "text-emerald-400" : "text-red-400"
            )} />
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {config.label}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold mb-3 line-clamp-2">{objective.title}</p>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{objective.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${objective.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("h-full rounded-full", config.progressColor)}
          />
        </div>
      </div>
    </motion.div>
  )
}

function AppSidebarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLocked } = useAppStore()
  const { user, signOut } = useAuth()
  const locked = isLocked()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="border-0"
    >
      {/* Header */}
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <Link href="/app" className="flex items-center gap-3 group group-data-[collapsible=icon]:justify-center">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Logo size="lg" className="relative drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-base font-bold tracking-tight">ONE</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">The ONE Thing OS</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))}
                  isLocked={locked}
                />
              ))}
            </SidebarMenu>

            {/* Optional modules + add button */}
            <ExtraModulesSection pathname={pathname} locked={locked} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-2">
        <ObjectiveCard />

        {/* User & Settings */}
        <div className="px-2 pt-2 space-y-1 group-data-[collapsible=icon]:px-0">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 group-data-[collapsible=icon]:hidden">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Image src="/profile.png" alt="Profile" width={16} height={16} />
              </div>
              <span className="text-xs text-muted-foreground truncate flex-1">
                {user.email}
              </span>
            </div>
          )}

          {/* Settings Link */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/app/settings"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8",
                  pathname === "/app/settings" && "bg-secondary text-foreground"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              Settings
            </TooltipContent>
          </Tooltip>

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Sign out</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Sign out
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function AppNav({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()
  const isOnboardingRoute = pathname === "/app/onboarding"

  // During onboarding route: no sidebar, centered content
  if (isOnboardingRoute) {
    return (
      <SidebarProvider defaultOpen={false}>
        <TooltipProvider delayDuration={0}>
          <div className="min-h-svh w-full bg-background">
            {children}
          </div>
        </TooltipProvider>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebarContent />
      {children && (
        <SidebarInset>
          {children}
        </SidebarInset>
      )}
    </SidebarProvider>
  )
}

// Mobile bottom nav
export function MobileNav() {
  const pathname = usePathname()

  const mobileItems = [
    { href: "/app",        label: "Home",     icon: Target,     color: "primary" },
    { href: "/app/define", label: "Objective", icon: Lock,      color: "primary" },
    { href: "/app/focus",  label: "Focus",    icon: Timer,      color: "primary" },
    { href: "/app/411",    label: "Milestones", icon: Flag,     color: "cyan" },
    { href: "/app/habit",  label: "Progress", icon: TrendingUp, color: "orange" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground active:bg-secondary/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
              )}
              <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
