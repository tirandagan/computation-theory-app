'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Check,
  X,
} from 'lucide-react'
import {
  isAccepting,
  runAutomaton,
  validInput,
  type Automaton,
} from '@/lib/automata'
import { AutomatonGraph } from './automaton-graph'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  machines: Automaton[]
}

export function AutomatonLab({ machines }: Props) {
  const [machineId, setMachineId] = useState(machines[0].id)
  const machine = useMemo(
    () => machines.find((m) => m.id === machineId) ?? machines[0],
    [machineId, machines],
  )
  const [input, setInput] = useState('')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trace = useMemo(
    () => runAutomaton(machine, input),
    [machine, input],
  )
  const maxStep = trace.length - 1
  const current = trace[Math.min(step, maxStep)]
  const finished = step >= maxStep
  const accepted = finished && isAccepting(machine, current.active)

  // reset when machine or input changes
  useEffect(() => {
    setStep(0)
    setPlaying(false)
  }, [machineId, input])

  // autoplay
  useEffect(() => {
    if (!playing) return
    if (step >= maxStep) {
      setPlaying(false)
      return
    }
    timer.current = setTimeout(() => setStep((s) => s + 1), 700)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [playing, step, maxStep])

  function setString(value: string) {
    const cleaned = [...value].filter((c) => machine.alphabet.includes(c)).join('')
    setInput(cleaned)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      {/* header / machine picker */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Machine
        </span>
        <div className="flex flex-wrap gap-1.5">
          {machines.map((m) => (
            <button
              key={m.id}
              onClick={() => setMachineId(m.id)}
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
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
        {/* graph */}
        <div className="bg-grid relative flex border-b border-border p-2 lg:border-b-0 lg:border-r">
          <AutomatonGraph automaton={machine} active={current.active} />
          {machine.nondeterministic && (
            <span className="absolute left-3 top-3 rounded-md bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              Nondeterministic
            </span>
          )}
        </div>

        {/* controls */}
        <div className="flex flex-col gap-4 p-4">
          <div>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {machine.description}
            </p>
            <p className="mt-2 font-mono text-xs text-primary">
              L = {'{ '}
              {machine.language}
              {' }'}
            </p>
          </div>

          {/* input */}
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Input string · Σ = {'{'}
              {machine.alphabet.join(', ')}
              {'}'}
            </label>
            <input
              value={input}
              onChange={(e) => setString(e.target.value)}
              placeholder="type a string…"
              spellCheck={false}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg tracking-[0.3em] outline-none focus:border-primary"
            />
          </div>

          {/* tape ribbon */}
          <div className="flex flex-wrap gap-1">
            {input.length === 0 && (
              <span className="font-mono text-sm text-muted-foreground">
                ε (empty string)
              </span>
            )}
            {[...input].map((c, i) => (
              <span
                key={i}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-md border font-mono text-base transition-colors',
                  i < current.consumed
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : i === current.consumed
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {c}
              </span>
            ))}
          </div>

          {/* transport */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep(0)}
              aria-label="Reset to start"
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
              onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
              disabled={finished}
              aria-label="Next step"
            >
              <SkipForward />
            </Button>
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              step {step}/{maxStep}
            </span>
          </div>

          {/* active states + verdict */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="uppercase tracking-widest">Active</span>
              <span className="flex flex-wrap gap-1">
                {current.active.length === 0 ? (
                  <span className="text-destructive">∅ (dead)</span>
                ) : (
                  current.active.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-primary/15 px-1.5 py-0.5 text-primary"
                    >
                      {s}
                    </span>
                  ))
                )}
              </span>
            </div>
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                !finished
                  ? 'border-border bg-muted text-muted-foreground'
                  : accepted
                    ? 'border-success/40 bg-success/15 text-success'
                    : 'border-destructive/40 bg-destructive/15 text-destructive',
              )}
            >
              {!finished ? (
                'Run the machine to the end to see the verdict'
              ) : accepted ? (
                <>
                  <Check className="size-4" /> Accepted — the string is in the
                  language
                </>
              ) : (
                <>
                  <X className="size-4" /> Rejected — not in the language
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
