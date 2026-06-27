'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react'
import { PDAS, runPda, type Pda } from '@/lib/pda'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PdaLab() {
  const [pdaId, setPdaId] = useState(PDAS[0].id)
  const pda = useMemo<Pda>(
    () => PDAS.find((p) => p.id === pdaId) ?? PDAS[0],
    [pdaId],
  )
  const [input, setInput] = useState(pda.examples[0])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const run = useMemo(() => runPda(pda, input), [pda, input])
  const max = run.steps.length - 1
  const current = run.steps[Math.min(step, max)]
  const finished = step >= max

  useEffect(() => {
    setStep(0)
    setPlaying(false)
  }, [pdaId, input])

  useEffect(() => {
    if (!playing) return
    if (step >= max) {
      setPlaying(false)
      return
    }
    timer.current = setTimeout(() => setStep((s) => s + 1), 750)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [playing, step, max])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          PDA
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PDAS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPdaId(p.id)
                setInput(p.examples[0])
              }}
              className={cn(
                'rounded-lg px-2.5 py-1 font-mono text-xs transition-colors',
                p.id === pdaId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.3fr_1fr]">
        {/* left: tape + stack */}
        <div className="bg-grid flex flex-col gap-5 border-b border-border p-5 lg:border-b-0 lg:border-r">
          {/* input tape */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Input · state{' '}
              <span className="text-primary">{current.state}</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {input.length === 0 && (
                <span className="font-mono text-sm text-muted-foreground">
                  ε
                </span>
              )}
              {[...input].map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md border font-mono text-base',
                    i < current.consumed
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : i === current.consumed
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* stack */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Stack · top on top
            </p>
            <div className="flex w-16 flex-col-reverse gap-1">
              {current.stack.length === 0 ? (
                <span className="font-mono text-sm text-muted-foreground">
                  empty
                </span>
              ) : (
                current.stack.map((sym, i) => (
                  <span
                    key={i}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md border font-mono text-base',
                      i === current.stack.length - 1
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-border bg-card text-foreground',
                    )}
                  >
                    {sym}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* right: controls */}
        <div className="flex flex-col gap-4 p-4">
          <p className="text-pretty text-sm text-muted-foreground">
            {pda.description}
          </p>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Input · examples:{' '}
              {pda.examples.map((ex) => (
                <button
                  key={ex || 'eps'}
                  onClick={() => setInput(ex)}
                  className="mr-1 rounded bg-muted px-1.5 py-0.5 text-foreground hover:text-primary"
                >
                  {ex === '' ? 'ε' : ex}
                </button>
              ))}
            </label>
            <input
              value={input}
              onChange={(e) =>
                setInput(
                  [...e.target.value]
                    .filter((c) => pda.alphabet.includes(c))
                    .join(''),
                )
              }
              placeholder="type a string…"
              spellCheck={false}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg tracking-[0.2em] outline-none focus:border-primary"
            />
          </div>

          <p className="min-h-[1.5rem] font-mono text-xs text-foreground/90">
            {current.note}
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep(0)}
              aria-label="Reset"
            >
              <RotateCcw />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              aria-label="Previous step"
            >
              <SkipBack />
            </Button>
            <Button
              size="icon"
              onClick={() => {
                if (finished) setStep(0)
                setPlaying((p) => !p)
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep((s) => Math.min(max, s + 1))}
              disabled={finished}
              aria-label="Next step"
            >
              <SkipForward />
            </Button>
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              step {step}/{max}
            </span>
          </div>

          <div
            className={cn(
              'mt-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
              !finished
                ? 'border-border bg-muted text-muted-foreground'
                : run.accepted
                  ? 'border-success/40 bg-success/15 text-success'
                  : 'border-destructive/40 bg-destructive/15 text-destructive',
            )}
          >
            {!finished ? (
              'Run to the end to see the verdict'
            ) : run.accepted ? (
              <>
                <Check className="size-4" /> Accepted — input consumed, stack
                cleared
              </>
            ) : (
              <>
                <X className="size-4" /> Rejected — stuck or stack not empty
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
