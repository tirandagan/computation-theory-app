'use client'

import { useEffect, useRef, useState } from 'react'
import { X, ArrowUp } from 'lucide-react'
import { useProgress } from '@/lib/progress'
import { BADGES } from '@/lib/gamification'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  kind: 'level' | 'badge'
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

const byId = Object.fromEntries(BADGES.map((b) => [b.id, b]))

/**
 * Watches the shared progress store and pops celebratory arcade toasts when
 * the learner levels up or unlocks a badge. Badges are acknowledged after they
 * surface so each only celebrates once.
 */
export function UnlockToasts() {
  const { ready, levelInfo, unseenBadges, acknowledgeBadges } = useProgress()
  const [toasts, setToasts] = useState<Toast[]>([])
  const prevLevel = useRef<number | null>(null)

  // level-up detection
  useEffect(() => {
    if (!ready) return
    if (prevLevel.current === null) {
      prevLevel.current = levelInfo.level
      return
    }
    if (levelInfo.level > prevLevel.current) {
      const lvl = levelInfo.level
      setToasts((t) => [
        ...t,
        {
          id: `level-${lvl}-${Date.now()}`,
          kind: 'level',
          title: `Level ${lvl} reached!`,
          subtitle: `You are now a ${levelInfo.rank}`,
          icon: ArrowUp,
        },
      ])
    }
    prevLevel.current = levelInfo.level
  }, [ready, levelInfo.level, levelInfo.rank])

  // badge unlocks
  useEffect(() => {
    if (!ready || unseenBadges.length === 0) return
    const fresh: Toast[] = unseenBadges
      .map((id) => byId[id])
      .filter(Boolean)
      .map((b) => ({
        id: `badge-${b.id}-${Date.now()}`,
        kind: 'badge' as const,
        title: 'Badge unlocked!',
        subtitle: b.name,
        icon: b.icon,
      }))
    if (fresh.length) setToasts((t) => [...t, ...fresh])
    acknowledgeBadges()
  }, [ready, unseenBadges, acknowledgeBadges])

  // auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => {
      setToasts((t) => t.slice(1))
    }, 4200)
    return () => clearTimeout(timer)
  }, [toasts])

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = t.icon
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-2xl border bg-card/95 p-3 shadow-2xl backdrop-blur',
              t.kind === 'level'
                ? 'border-primary/50 glow-primary'
                : 'border-accent/50',
              'animate-in slide-in-from-right-4 fade-in duration-300',
            )}
          >
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-xl',
                t.kind === 'level'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-accent/20 text-accent',
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-mono text-[10px] uppercase tracking-widest',
                  t.kind === 'level' ? 'text-primary' : 'text-accent',
                )}
              >
                {t.title}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={() =>
                setToasts((arr) => arr.filter((x) => x.id !== t.id))
              }
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
