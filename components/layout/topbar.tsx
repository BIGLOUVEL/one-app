"use client"

import { useState, useEffect } from "react"
import { Search, Plus, User, LogOut, Settings, Bell, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface TopbarProps {
  onAddDeadline?: () => void
}

export function Topbar({ onAddDeadline }: TopbarProps) {
  const [time, setTime] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="flex h-full items-center justify-between bg-transparent w-full">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-sm">
        <motion.div
          className={`relative w-full transition-all duration-300 ${
            searchFocused ? "scale-[1.02]" : ""
          }`}
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anythings..."
            className="w-full h-10 pl-11 pr-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </motion.div>
      </div>

      {/* Center - Time & Date */}
      <div className="hidden md:flex items-center gap-8 text-sm">
        <span className="font-mono text-muted-foreground tracking-wider">
          {formatTime(time)}
        </span>
        <span className="text-primary font-medium">
          {formatDate(time)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onAddDeadline && (
          <Button
            onClick={onAddDeadline}
            className="gap-2 bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-xl h-9 px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Deadline</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/[0.04]">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[hsl(220,15%,8%)] border-white/[0.08]">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Ghost Hunter</span>
                <span className="text-xs text-muted-foreground">
                  ghost@one.app
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="focus:bg-white/[0.04]">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-white/[0.04]">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
