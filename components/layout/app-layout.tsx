"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Topbar } from "./topbar"

interface AppLayoutProps {
  children: React.ReactNode
  onAddDeadline?: () => void
}

export function AppLayout({ children, onAddDeadline }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[hsl(220,20%,4%)]">
        <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <div className="flex-1">
            <Topbar onAddDeadline={onAddDeadline} />
          </div>
        </div>
        <main className="flex-1 overflow-auto p-6 relative">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
