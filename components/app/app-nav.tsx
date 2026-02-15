"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  Plus,
  GitBranch,
  Calendar,
  Map,
  Timer,
  Flame,
  Shield,
  ClipboardCheck,
  Lock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Settings,
  LogOut,
  User,
  History,
  Library,
  LayoutGrid,
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

const mainNavItems = [
  { href: "/app", label: "Dashboard", icon: Target, description: "Your ONE thing", color: "primary" },
  { href: "/app/define", label: "Define", icon: Plus, description: "Set objective", color: "primary" },
]

const systemNavItems = [
  { href: "/app/domino", label: "Domino", icon: GitBranch, description: "Progress & alignment", color: "violet" },
  { href: "/app/timetable", label: "Timetable", icon: LayoutGrid, description: "Schedule analysis", color: "cyan" },
  { href: "/app/411", label: "4-1-1", icon: Calendar, description: "Weekly goals", color: "cyan" },
  { href: "/app/gps", label: "GPS", icon: Map, description: "Purpose & goals", color: "orange" },
]

const focusNavItems = [
  { href: "/app/focus", label: "Focus", icon: Timer, description: "Deep work", color: "primary" },
  { href: "/app/sessions", label: "My Library", icon: Library, description: "Sessions & Post-its", color: "violet" },
  { href: "/app/habit", label: "66 Days", icon: Flame, description: "Build habit", color: "orange" },
  { href: "/app/shield", label: "Shield", icon: Shield, description: "Block thieves", color: "cyan" },
  { href: "/app/review", label: "Review", icon: ClipboardCheck, description: "Reflect", color: "violet" },
]

function NavItem({ item, isActive, isLocked }: {
  item: typeof mainNavItems[0],
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
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isLocked={locked}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isLocked={false}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Focus */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
            Focus
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {focusNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isLocked={false}
                />
              ))}
            </SidebarMenu>
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
  const { objective, hasCompletedOnboarding } = useAppStore()
  const [showSidebar, setShowSidebar] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if we're in onboarding mode (no objective)
  const isOnboarding = !objective || !hasCompletedOnboarding

  // Handle sidebar visibility with animation
  useEffect(() => {
    // Wait for hydration
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    if (!isOnboarding && !showSidebar) {
      // Objective just got set, animate sidebar in after a small delay
      const timer = setTimeout(() => {
        setShowSidebar(true)
      }, 300)
      return () => clearTimeout(timer)
    } else if (isOnboarding) {
      setShowSidebar(false)
    }
  }, [isOnboarding, isInitialized, showSidebar])

  // During onboarding: no sidebar, centered content
  if (isOnboarding) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="min-h-svh w-full bg-background">
          {children}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
          >
            <AppSidebarContent />
          </motion.div>
        )}
      </AnimatePresence>
      {children && (
        <SidebarInset>
          <motion.div
            initial={!showSidebar ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </SidebarInset>
      )}
    </SidebarProvider>
  )
}

// Mobile bottom nav
export function MobileNav() {
  const pathname = usePathname()

  const mobileItems = [
    { href: "/app", label: "Focus", icon: Target, color: "primary" },
    { href: "/app/domino", label: "Path", icon: GitBranch, color: "violet" },
    { href: "/app/focus", label: "Session", icon: Timer, color: "primary" },
    { href: "/app/habit", label: "Habit", icon: Flame, color: "orange" },
    { href: "/app/review", label: "Review", icon: ClipboardCheck, color: "cyan" },
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
