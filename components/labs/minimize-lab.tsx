'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AutomatonGraph } from '@/components/labs/automaton-graph'
import { minimizeDfa, REDUNDANT_DFA } from '@/lib/minimize'
import { cn } from '@/lib/utils'

const GROUP_COLORS = [
  'text-primary',
  'text-accent',
  'text-success',
  'text-destructive',
  'text-foreground',
]

export function MinimizeLab() {
  const { steps, minimized } = useMemo(() => minimizeDfa(REDUNDANT_DFA), [])
  const [i, setI] = useState(0)
  const step = steps[i]
  const done = i === steps.length - 1

  // which group each original state belongs to in the current step
  const groupOfState = useMemo(() => {
    const m = new Map<string, number>()
    step.groups.forEach((g, idx) => g.forEach((s) => m.set(s, idx)))
    return m
  }, [step])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Partition refinement · step {i + 1}/{steps.length}
        </span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => setI(0)}>
            <RotateCcw /> Reset
          </Button>
          <Button
            size="sm"
            onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))}
            disabled={done}
          >
            Refine <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        {/* left: original DFA with states colored by current group */}
        <div className="bg-grid flex flex-col border-b border-border p-2 lg:border-b-0 lg:border-r">
          <p className="px-2 pt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Original · {REDUNDANT_DFA.states.length} states
          </p>
          <AutomatonGraph automaton={REDUNDANT_DFA} active={[]} />
        </div>

        {/* right: partition list + minimized result */}
        <div className="flex flex-col gap-3 p-4">
          <p className="text-pretty text-sm text-muted-foreground">{step.note}</p>

          <div className="space-y-1.5">
            {step.groups.map((g, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"
              >
                <span
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-widest',
                    GROUP_COLORS[idx % GROUP_COLORS.length],
                  )}
                >
                  G{idx + 1}
                </span>
                <span className="font-mono text-sm text-foreground">
                  {'{ '}
                  {g.join(', ')}
                  {' }'}
                </span>
              </div>
            ))}
          </div>

          {done && (
            <div className="rounded-xl border border-success/40 bg-success/10 p-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-success">
                Minimized · {minimized.states.length} states
              </p>
              <AutomatonGraph automaton={minimized} active={[]} />
            </div>
          )}

          {!done && (
            <p className="font-mono text-xs text-muted-foreground">
              States sharing a group, with identical transition behavior into
              other groups, are indistinguishable and will merge.
            </p>
          )}
        </div>
      </div>

      {/* legend mapping states to group colors in the current partition */}
      <div className="flex flex-wrap gap-2 border-t border-border bg-secondary/30 px-4 py-2.5">
        {REDUNDANT_DFA.states.map((s) => {
          const gi = groupOfState.get(s.id) ?? 0
          return (
            <span
              key={s.id}
              className={cn(
                'rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-xs',
                GROUP_COLORS[gi % GROUP_COLORS.length],
              )}
            >
              {s.id} → G{gi + 1}
            </span>
          )
        })}
      </div>
    </div>
  )
}
