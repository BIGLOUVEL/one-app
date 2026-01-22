"use client"

import { motion } from "framer-motion"
import { useAppStore } from "@/store/useAppStore"

interface DominoChainProps {
  maxVisible?: number
  showLabel?: boolean
}

export function DominoChain({ maxVisible = 20, showLabel = true }: DominoChainProps) {
  const { getDominoProgress } = useAppStore()
  const { completed, total, percentage } = getDominoProgress()

  if (total === 0) return null

  // Calculate how many dominos to show
  const visibleTotal = Math.min(total, maxVisible)
  const visibleCompleted = Math.min(completed, visibleTotal)

  // If we have more than maxVisible, we show a compressed view
  const isCompressed = total > maxVisible

  return (
    <div className="space-y-3">
      {/* Domino visualization */}
      <div className="flex items-center gap-1">
        {Array.from({ length: visibleTotal }).map((_, index) => {
          const isCompleted = index < visibleCompleted
          const isNext = index === visibleCompleted

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateZ: isCompleted ? -8 : 0,
              }}
              transition={{
                delay: index * 0.02,
                duration: 0.3,
                rotateZ: { duration: 0.4, ease: "easeOut" }
              }}
              className={`
                relative h-6 w-2.5 rounded-sm transition-all duration-300
                ${isCompleted
                  ? "bg-foreground/80"
                  : isNext
                    ? "bg-foreground/30 border border-foreground/40"
                    : "bg-foreground/10"
                }
              `}
              style={{
                transformOrigin: "bottom center",
              }}
            >
              {/* Dot pattern on domino */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <div className={`w-1 h-1 rounded-full ${isCompleted ? "bg-background/30" : "bg-foreground/20"}`} />
              </div>
            </motion.div>
          )
        })}

        {/* Overflow indicator */}
        {isCompressed && (
          <span className="text-xs text-muted-foreground ml-2">
            +{total - maxVisible}
          </span>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {completed === 0
              ? "No momentum yet"
              : completed === 1
                ? "One domino closer"
                : `${completed} dominos fallen`
            }
          </span>
          <span className="text-muted-foreground tabular-nums">
            {completed}/{total}
          </span>
        </div>
      )}
    </div>
  )
}

// Compact version for smaller spaces
export function DominoChainCompact() {
  const { getDominoProgress } = useAppStore()
  const { completed, total, percentage } = getDominoProgress()

  if (total === 0) return null

  return (
    <div className="flex items-center gap-3">
      {/* Mini progress bar */}
      <div className="flex-1 h-1 bg-foreground/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-foreground/60 rounded-full"
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  )
}
