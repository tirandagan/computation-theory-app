'use client'

import { useEffect, useState } from 'react'
import { DFA_EXAMPLES, runAutomaton } from '@/lib/automata'
import { AutomatonGraph } from '@/components/labs/automaton-graph'

const machine = DFA_EXAMPLES[1] // "ends with 01"
const DEMO = '110101'

export function HeroAutomaton() {
  const trace = runAutomaton(machine, DEMO)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (trace.length + 2))
    }, 900)
    return () => clearInterval(id)
  }, [trace.length])

  const clamped = Math.min(step, trace.length - 1)
  const active = trace[clamped].active

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/5 blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-border bg-card/40 p-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="font-mono text-xs text-muted-foreground">
            DFA · ends with 01
          </span>
          <div className="flex gap-1">
            {[...DEMO].map((c, i) => (
              <span
                key={i}
                className={`flex h-6 w-6 items-center justify-center rounded font-mono text-xs ${
                  i < trace[clamped].consumed
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-grid rounded-2xl">
          <AutomatonGraph automaton={machine} active={active} height={300} />
        </div>
      </div>
    </div>
  )
}
