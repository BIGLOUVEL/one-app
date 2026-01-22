"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
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

const mainNavItems = [
  { href: "/app", label: "Dashboard", icon: Target, description: "Your ONE thing" },
  { href: "/app/define", label: "Define", icon: Plus, description: "Set objective", locked: true },
]

const systemNavItems = [
  { href: "/app/domino", label: "Domino", icon: GitBranch, description: "Goal cascade" },
  { href: "/app/411", label: "4-1-1", icon: Calendar, description: "Weekly goals" },
  { href: "/app/gps", label: "GPS", icon: Map, description: "Purpose & goals" },
]

const focusNavItems = [
  { href: "/app/focus", label: "Focus", icon: Timer, description: "Deep work" },
  { href: "/app/habit", label: "66 Days", icon: Flame, description: "Build habit" },
  { href: "/app/shield", label: "Shield", icon: Shield, description: "Block thieves" },
  { href: "/app/review", label: "Review", icon: ClipboardCheck, description: "Reflect" },
]

function NavItem({ item, isActive, isLocked }: {
  item: typeof mainNavItems[0],
  isActive: boolean,
  isLocked: boolean
}) {
  const isDisabled = item.locked && isLocked
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className={cn(
              "group relative rounded-lg transition-all duration-200",
              !isCollapsed && "h-10",
              isCollapsed && "!w-8 !h-8 !p-0 justify-center mx-auto",
              isActive && "bg-secondary font-medium",
              isDisabled && "opacity-40 cursor-not-allowed"
            )}
          >
            <Link
              href={isDisabled ? "#" : item.href}
              onClick={(e) => isDisabled && e.preventDefault()}
              className={cn(isCollapsed && "justify-center")}
            >
              {isDisabled ? (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
              )}

              {!isCollapsed && (
                <span className={cn(
                  "transition-colors",
                  isActive ? "text-foreground" : "text-foreground"
                )}>
                  {item.label}
                </span>
              )}

              {isActive && !isCollapsed && (
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 mb-2 rounded-lg border border-border p-4 bg-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "flex h-5 w-5 items-center justify-center rounded",
          objective.status === "active" ? "bg-foreground" :
          objective.status === "completed" ? "bg-success" : "bg-destructive"
        )}>
          <Lock className={cn(
            "h-3 w-3",
            objective.status === "active" ? "text-background" :
            objective.status === "completed" ? "text-success-foreground" : "text-destructive-foreground"
          )} />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {objective.status === "active" ? "Locked In" :
           objective.status === "completed" ? "Completed" : "Failed"}
        </span>
      </div>

      <p className="text-sm font-medium mb-3 line-clamp-2">{objective.title}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{objective.progress}%</span>
        </div>
        <div className="progress-track">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${objective.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "progress-fill",
              objective.status === "completed" ? "bg-success" :
              objective.status === "failed" ? "bg-destructive" : "bg-foreground"
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}

function AppSidebarContent() {
  const pathname = usePathname()
  const { isLocked } = useAppStore()
  const locked = isLocked()

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="border-0"
    >
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <Link href="/app" className="flex items-center gap-3 group group-data-[collapsible=icon]:justify-center">
          <div className="relative shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
              <span className="text-background font-display font-semibold text-sm">D</span>
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="font-display text-base font-semibold">DeadSign</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">The ONE Thing OS</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="section-header px-2 mb-1">
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

        <SidebarGroup>
          <SidebarGroupLabel className="section-header px-2 mb-1">
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

        <SidebarGroup>
          <SidebarGroupLabel className="section-header px-2 mb-1">
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

      <SidebarFooter className="p-2">
        <ObjectiveCard />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function AppNav({ children }: { children?: React.ReactNode }) {
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
    { href: "/app", label: "Focus", icon: Target },
    { href: "/app/domino", label: "Path", icon: GitBranch },
    { href: "/app/focus", label: "Session", icon: Timer },
    { href: "/app/habit", label: "Habit", icon: Flame },
    { href: "/app/review", label: "Review", icon: ClipboardCheck },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground active:bg-secondary/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-foreground rounded-full"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
              )}
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
