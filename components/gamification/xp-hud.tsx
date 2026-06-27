'use client'

import { Flame } from 'lucide-react'
import { useProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'

/**
 * Compact arcade heads-up display for the workspace header: current level
 * badge, rank, an animated XP bar, and the study-streak flame.
 */
export function XpHud({ onOpenTrophies }: { onOpenTrophies?: () => void }) {
  const { ready, levelInfo, xp, streak } = useProgress()
  if (!ready) return null

  const pct = Math.round(levelInfo.progress * 100)

  return (
    <button
      onClick={onOpenTrophies}
      className="group ml-auto flex items-center gap-3 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3 transition-colors hover:border-primary/50"
      title="View your trophies and stats"
    >
      {/* level medallion */}
      <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground glow-primary">
        {levelInfo.level}
      </span>

      <span className="hidden flex-col items-start sm:flex">
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {levelInfo.rank}
        </span>
        <span className="flex items-center gap-2">
          <span className="relative block h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {xp} XP
          </span>
        </span>
      </span>

      {streak > 0 && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-accent',
          )}
          title={`${streak}-day study streak`}
        >
          <Flame className="size-3.5" /> {streak}
        </span>
      )}
    </button>
  )
}
