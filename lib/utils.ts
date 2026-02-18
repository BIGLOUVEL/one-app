import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getDaysUntil(date: string | Date) {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export function getRelativeTime(date: string | Date) {
  const days = getDaysUntil(date)

  if (days < 0) {
    return `${Math.abs(days)} days ago`
  }

  if (days === 0) {
    return "Today"
  }

  if (days === 1) {
    return "Tomorrow"
  }

  if (days <= 7) {
    return `In ${days} days`
  }

  if (days <= 30) {
    const weeks = Math.floor(days / 7)
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`
  }

  const months = Math.floor(days / 30)
  return `In ${months} month${months > 1 ? 's' : ''}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}
