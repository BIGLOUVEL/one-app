"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ghost, LayoutDashboard, Target, BarChart3, Settings, HelpCircle, AlertTriangle } from "lucide-react"

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
  SidebarSeparator,
} from "@/components/ui/sidebar"

const mainNav = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Deadlines", href: "/app/deadlines", icon: Target },
  { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { name: "Settings", href: "/app/settings", icon: Settings },
]

const bottomNav = [
  { name: "Help Center", href: "#", icon: HelpCircle },
  { name: "Report", href: "#", icon: AlertTriangle },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* Header with Logo */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20">
              <Ghost className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">ONE</h1>
            <p className="text-[11px] text-sidebar-foreground/60">Deadline Tracker</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground glow-green"
                          : "hover:bg-sidebar-accent"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className={isActive ? "drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" : ""} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Card */}
        <div className="mx-2 mb-2 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-medium text-primary">System Active</p>
          </div>
          <p className="text-[11px] text-sidebar-foreground/60 leading-relaxed">
            Tracking 5 deadlines
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
