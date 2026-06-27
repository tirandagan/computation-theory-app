'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { NFA_EXAMPLES, type Automaton } from '@/lib/automata'
import { subsetConstruction } from '@/lib/subset-construction'
import { AutomatonGraph } from './automaton-graph'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SubsetLab() {
  const machines = NFA_EXAMPLES
  const [machineId, setMachineId] = useState(machines[0].id)
  const nfa = useMemo<Automaton>(
    () => machines.find((m) => m.id === machineId) ?? machines[0],
    [machineId, machines],
  )
  const steps = useMemo(() => subsetConstruction(nfa), [nfa])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const max = steps.length - 1
  const current = steps[Math.min(step, max)]

  useEffect(() => {
    setStep(0)
    setPlaying(false)
  }, [machineId])

  useEffect(() => {
    if (!playing) return
    if (step >= max) {
      setPlaying(false)
      return
    }
    timer.current = setTimeout(() => setStep((s) => s + 1), 1100)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [playing, step, max])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Source NFA
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

      <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        {/* source NFA */}
        <div className="bg-grid border-b border-border p-2 lg:border-b-0 lg:border-r">
          <p className="px-2 pt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            NFA · {nfa.states.length} states
          </p>
          <AutomatonGraph automaton={nfa} active={[]} />
        </div>

        {/* constructed DFA table */}
        <div className="flex flex-col gap-3 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Equivalent DFA · {current.nodes.length} states so far
          </p>

          {/* discovered DFA states */}
          <div className="flex flex-wrap gap-1.5">
            {current.nodes.map((n) => (
              <span
                key={n.label}
                className={cn(
                  'rounded-md border px-2 py-1 font-mono text-xs transition-colors',
                  n.label === current.produced
                    ? 'border-accent bg-accent/20 text-accent'
                    : n.label === current.processing
                      ? 'border-primary bg-primary/15 text-primary'
                      : n.accept
                        ? 'border-success/40 bg-success/10 text-success'
                        : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {n.label}
                {n.accept ? ' ✓' : ''}
              </span>
            ))}
          </div>

          {/* transition table */}
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full font-mono text-xs">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left">state</th>
                  {nfa.alphabet.map((a) => (
                    <th key={a} className="px-2 py-1.5 text-left">
                      δ(·,{a})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.nodes.map((n) => (
                  <tr
                    key={n.label}
                    className={cn(
                      'border-t border-border',
                      n.label === current.processing && 'bg-primary/10',
                    )}
                  >
                    <td className="px-2 py-1.5 text-foreground">{n.label}</td>
                    {nfa.alphabet.map((a) => {
                      const t = current.transitions.find(
                        (tr) => tr.from === n.label && tr.symbol === a,
                      )
                      return (
                        <td
                          key={a}
                          className="px-2 py-1.5 text-muted-foreground"
                        >
                          {t ? t.to : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* worklist */}
          <div className="font-mono text-[11px] text-muted-foreground">
            worklist:{' '}
            {current.queue.length === 0 ? (
              <span className="text-success">empty</span>
            ) : (
              current.queue.map((q) => (
                <span
                  key={q}
                  className="mr-1 rounded bg-muted px-1.5 py-0.5 text-foreground"
                >
                  {q}
                </span>
              ))
            )}
          </div>

          {/* note */}
          <p className="min-h-[2.5rem] text-pretty text-sm leading-relaxed text-foreground/90">
            {current.note}
          </p>

          {/* transport */}
          <div className="mt-auto flex items-center gap-1.5">
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
                if (step >= max) setStep(0)
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
              disabled={step >= max}
              aria-label="Next step"
            >
              <SkipForward />
            </Button>
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              step {step}/{max}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
