'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Pause, Play, RotateCcw, SkipForward, X } from 'lucide-react'
import {
  BLANK,
  initConfig,
  stepTM,
  TM_EXAMPLES,
  type TMConfig,
} from '@/lib/turing'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const VISIBLE = 13 // odd number of cells around the head

export function TuringLab() {
  const [machineId, setMachineId] = useState(TM_EXAMPLES[0].id)
  const machine = useMemo(
    () => TM_EXAMPLES.find((m) => m.id === machineId) ?? TM_EXAMPLES[0],
    [machineId],
  )
  const [input, setInput] = useState(machine.samples[0])
  const [config, setConfig] = useState<TMConfig>(() =>
    initConfig(machine, machine.samples[0]),
  )
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function reset(value = input, m = machine) {
    setPlaying(false)
    setConfig(initConfig(m, value))
  }

  useEffect(() => {
    if (!playing) return
    if (config.halted || config.steps > 800) {
      setPlaying(false)
      return
    }
    timer.current = setTimeout(() => {
      setConfig((c) => stepTM(machine, c))
    }, 320)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [playing, config, machine])

  function setString(value: string) {
    const cleaned = [...value]
      .filter((c) => machine.inputAlphabet.includes(c))
      .join('')
    setInput(cleaned)
    reset(cleaned)
  }

  function chooseMachine(id: string) {
    const m = TM_EXAMPLES.find((x) => x.id === id) ?? TM_EXAMPLES[0]
    setMachineId(id)
    setInput(m.samples[0])
    reset(m.samples[0], m)
  }

  // window of cells centered on the head
  const start = config.head - Math.floor(VISIBLE / 2)
  const cells = Array.from({ length: VISIBLE }, (_, i) => {
    const idx = start + i
    return { idx, symbol: config.tape[idx] ?? BLANK, isHead: idx === config.head }
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Machine
        </span>
        {TM_EXAMPLES.map((m) => (
          <button
            key={m.id}
            onClick={() => chooseMachine(m.id)}
            className={cn(
              'rounded-lg px-2.5 py-1 font-mono text-xs transition-colors',
              m.id === machineId
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {machine.description}
        </p>

        {/* state + head readout */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
          <span className="text-muted-foreground">state</span>
          <span
            className={cn(
              'rounded-md px-2 py-1 font-semibold',
              config.halted === 'accept'
                ? 'bg-success/20 text-success'
                : config.halted === 'reject'
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-primary/15 text-primary',
            )}
          >
            {config.state}
          </span>
          <span className="text-muted-foreground">· steps {config.steps}</span>
        </div>

        {/* tape */}
        <div className="relative bg-grid rounded-xl border border-border py-6">
          {/* head pointer */}
          <div
            className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-accent"
            aria-hidden
          >
            ▼
          </div>
          <div className="flex justify-center gap-1 overflow-hidden px-2">
            {cells.map(({ idx, symbol, isHead }) => (
              <div
                key={idx}
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-md border font-mono text-lg transition-colors',
                  isHead
                    ? 'border-accent bg-accent/15 text-accent shadow-[0_0_20px_-4px_var(--color-accent)]'
                    : symbol === BLANK
                      ? 'border-border/60 bg-background/40 text-muted-foreground/40'
                      : 'border-border bg-muted text-foreground',
                )}
              >
                {symbol === BLANK ? '␣' : symbol}
              </div>
            ))}
          </div>
        </div>

        {/* input */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Input · Σ = {'{'}
              {machine.inputAlphabet.join(', ')}
              {'}'}
            </label>
            <input
              value={input}
              onChange={(e) => setString(e.target.value)}
              spellCheck={false}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-base tracking-[0.25em] outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {machine.samples.map((s) => (
              <button
                key={s}
                onClick={() => setString(s)}
                className="rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* transport */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => reset()}>
            <RotateCcw />
          </Button>
          <Button
            size="icon"
            onClick={() => {
              if (config.halted) reset()
              else setPlaying((p) => !p)
            }}
            aria-label={playing ? 'Pause' : 'Run'}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setConfig((c) => stepTM(machine, c))}
            disabled={!!config.halted}
            aria-label="Step"
          >
            <SkipForward />
          </Button>

          {config.halted && (
            <span
              className={cn(
                'ml-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                config.halted === 'accept'
                  ? 'bg-success/15 text-success'
                  : 'bg-destructive/15 text-destructive',
              )}
            >
              {config.halted === 'accept' ? (
                <>
                  <Check className="size-4" /> Halted in accept
                </>
              ) : (
                <>
                  <X className="size-4" /> Halted in reject
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
