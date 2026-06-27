'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Lock } from 'lucide-react'
import { useProgress } from '@/lib/progress'
import { BADGES, RANKS } from '@/lib/gamification'
import { cn } from '@/lib/utils'

/**
 * The "trophy room": a portaled modal showing the learner's level, XP, rank
 * ladder, study streak, and the full badge case (earned + locked).
 */
export function TrophyDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { levelInfo, xp, badges, stats, streak } = useProgress()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', onKey)
        document.body.style.overflow = prev
      }
    }
  }, [open, onClose])

  if (!open || !mounted) return null
  const earned = new Set(badges)
  const pct = Math.round(levelInfo.progress * 100)

  const statItems = [
    { label: 'Topics done', value: stats.completedCount },
    { label: 'Quiz wins', value: stats.totalCorrect },
    { label: 'Perfect quizzes', value: stats.perfectQuizzes },
    { label: 'Games won', value: stats.gamesWon },
    { label: 'Day streak', value: streak },
    { label: 'Badges', value: `${badges.length}/${BADGES.length}` },
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Trophy room"
    >
      <button
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
      />
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Trophy Room
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* level header */}
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary font-mono text-2xl font-bold text-primary-foreground glow-primary">
              {levelInfo.level}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-2xl tracking-tight text-foreground">
                {levelInfo.rank}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="relative block h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {levelInfo.intoLevel}/{levelInfo.span}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {xp} total XP
              </p>
            </div>
          </div>

          {/* stats grid */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {statItems.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-background/50 p-3 text-center"
              >
                <p className="font-mono text-lg font-bold tabular-nums text-foreground">
                  {s.value}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* badge case */}
          <p className="mb-2 mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Badge case
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BADGES.map((b) => {
              const has = earned.has(b.id)
              const Icon = has ? b.icon : Lock
              return (
                <div
                  key={b.id}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors',
                    has
                      ? 'border-accent/40 bg-accent/5'
                      : 'border-border bg-background/40 opacity-60',
                  )}
                  title={b.description}
                >
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-lg',
                      has ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={cn(
                      'text-xs font-semibold leading-tight',
                      has ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {b.name}
                  </span>
                  <span className="text-pretty text-[10px] leading-tight text-muted-foreground">
                    {b.description}
                  </span>
                </div>
              )
            })}
          </div>

          {/* rank ladder */}
          <p className="mb-2 mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Rank ladder
          </p>
          <div className="flex flex-wrap gap-1.5">
            {RANKS.map((rank, i) => (
              <span
                key={rank}
                className={cn(
                  'rounded-full border px-2.5 py-1 font-mono text-[10px]',
                  i + 1 === levelInfo.level
                    ? 'border-primary bg-primary/15 text-primary'
                    : i + 1 < levelInfo.level
                      ? 'border-success/40 bg-success/10 text-success'
                      : 'border-border text-muted-foreground',
                )}
              >
                {rank}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
