'use client'

import { useMemo, useState } from 'react'
import { Check, Lightbulb, RotateCcw, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PCP_INSTANCES,
  commonPrefix,
  solvePcp,
  type PcpInstance,
} from '@/lib/pcp'
import { cn } from '@/lib/utils'

export function PcpLab() {
  const [instanceId, setInstanceId] = useState(PCP_INSTANCES[0].id)
  const instance = useMemo<PcpInstance>(
    () => PCP_INSTANCES.find((p) => p.id === instanceId) ?? PCP_INSTANCES[0],
    [instanceId],
  )
  const [seq, setSeq] = useState<number[]>([])
  const [hint, setHint] = useState<string | null>(null)

  const top = seq.map((i) => instance.dominoes[i].top).join('')
  const bottom = seq.map((i) => instance.dominoes[i].bottom).join('')
  const matchLen = commonPrefix(top, bottom)
  const solved = seq.length > 0 && top === bottom
  // a "dead" state: the shorter string is no longer a prefix of the longer one
  const consistent = matchLen === Math.min(top.length, bottom.length)

  function reset(id: string) {
    setInstanceId(id)
    setSeq([])
    setHint(null)
  }

  function reveal() {
    const sol = solvePcp(instance.dominoes)
    if (sol) {
      setSeq(sol)
      setHint(null)
    } else {
      setHint('No matching sequence exists for this instance.')
      setSeq([])
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Instance
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PCP_INSTANCES.map((p) => (
            <button
              key={p.id}
              onClick={() => reset(p.id)}
              className={cn(
                'rounded-lg px-2.5 py-1 font-mono text-xs transition-colors',
                p.id === instanceId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <p className="text-pretty text-sm text-muted-foreground">
          {instance.description}
        </p>

        {/* available dominoes */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Dominoes · click to append
          </p>
          <div className="flex flex-wrap gap-2">
            {instance.dominoes.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  setSeq((s) => [...s, i])
                  setHint(null)
                }}
                className="group rounded-lg border border-border bg-background/60 p-1.5 transition-colors hover:border-primary"
              >
                <div className="grid min-w-12 gap-0.5 text-center">
                  <span className="rounded bg-primary/10 px-2 py-1 font-mono text-sm text-primary">
                    {d.top}
                  </span>
                  <span className="rounded bg-accent/10 px-2 py-1 font-mono text-sm text-accent">
                    {d.bottom}
                  </span>
                </div>
                <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                  d{i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* current build */}
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Your sequence{' '}
            {seq.length > 0 && (
              <span className="text-foreground">
                [{seq.map((i) => `d${i + 1}`).join(', ')}]
              </span>
            )}
          </p>
          {seq.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">
              Pick dominoes to start building two strings.
            </p>
          ) : (
            <div className="space-y-1 overflow-x-auto">
              <StringRow label="top" str={top} matchLen={matchLen} />
              <StringRow label="bot" str={bottom} matchLen={matchLen} />
            </div>
          )}
        </div>

        {/* verdict */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
            solved
              ? 'border-success/40 bg-success/15 text-success'
              : !consistent
                ? 'border-destructive/40 bg-destructive/15 text-destructive'
                : 'border-border bg-muted/40 text-muted-foreground',
          )}
        >
          {solved ? (
            <>
              <Check className="size-4" /> Match! Tops and bottoms are identical.
            </>
          ) : !consistent ? (
            <>
              <X className="size-4" /> Mismatch — the strings have diverged. Undo
              and try another domino.
            </>
          ) : (
            <>
              Aligned on {matchLen} symbol{matchLen === 1 ? '' : 's'}; keep going
              until the strings are equal.
            </>
          )}
        </div>

        {hint && (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSeq((s) => s.slice(0, -1))}
            disabled={seq.length === 0}
          >
            <Undo2 /> Undo
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSeq([])}>
            <RotateCcw /> Clear
          </Button>
          <Button size="sm" onClick={reveal}>
            <Lightbulb /> Reveal a solution
          </Button>
        </div>
      </div>
    </div>
  )
}

function StringRow({
  label,
  str,
  matchLen,
}: {
  label: string
  str: string
  matchLen: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      <div className="flex">
        {[...str].map((ch, i) => (
          <span
            key={i}
            className={cn(
              'grid h-8 w-7 place-items-center border-b-2 font-mono text-sm',
              i < matchLen
                ? 'border-success text-success'
                : 'border-destructive/50 text-foreground',
            )}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  )
}
