'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

/* Two tiny DFAs over {0,1}:
   A: accepts strings with an even number of 1s
   B: accepts strings ending in 0
   The product machine runs both at once; intersection/union just changes
   which product states are accepting. */

type Sym = '0' | '1'

interface MiniDfa {
  name: string
  language: string
  states: string[]
  start: string
  accept: string[]
  delta: Record<string, Record<Sym, string>>
}

const A: MiniDfa = {
  name: 'A',
  language: 'even number of 1s',
  states: ['even', 'odd'],
  start: 'even',
  accept: ['even'],
  delta: {
    even: { '0': 'even', '1': 'odd' },
    odd: { '0': 'odd', '1': 'even' },
  },
}

const B: MiniDfa = {
  name: 'B',
  language: 'ends in 0',
  states: ['no', 'yes'],
  start: 'yes', // empty string does not end in 0 -> start non-accepting; use 'no'
  accept: ['yes'],
  delta: {
    no: { '0': 'yes', '1': 'no' },
    yes: { '0': 'yes', '1': 'no' },
  },
}
// fix B start: empty string shouldn't be accepted
B.start = 'no'

type Mode = 'and' | 'or'

export function ProductLab() {
  const [mode, setMode] = useState<Mode>('and')
  const [input, setInput] = useState('0110')

  const symbols = useMemo(
    () => input.split('').filter((c): c is Sym => c === '0' || c === '1'),
    [input],
  )

  // run both machines, collecting the product path
  const path = useMemo(() => {
    let a = A.start
    let b = B.start
    const steps: { a: string; b: string; sym?: Sym }[] = [{ a, b }]
    for (const s of symbols) {
      a = A.delta[a][s]
      b = B.delta[b][s]
      steps.push({ a, b, sym: s })
    }
    return steps
  }, [symbols])

  const finalA = path[path.length - 1].a
  const finalB = path[path.length - 1].b
  const accA = A.accept.includes(finalA)
  const accB = B.accept.includes(finalB)
  const accepted = mode === 'and' ? accA && accB : accA || accB

  function isAcceptProduct(a: string, b: string) {
    const ia = A.accept.includes(a)
    const ib = B.accept.includes(b)
    return mode === 'and' ? ia && ib : ia || ib
  }

  const activeCell = `${finalA}|${finalB}`
  const pathCells = new Set(path.map((p) => `${p.a}|${p.b}`))

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Product construction
        </span>
        <div className="ml-auto inline-flex overflow-hidden rounded-md border border-border">
          <button
            onClick={() => setMode('and')}
            className={cn(
              'px-3 py-1 font-mono text-xs transition-colors',
              mode === 'and'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            A ∩ B
          </button>
          <button
            onClick={() => setMode('or')}
            className={cn(
              'px-3 py-1 font-mono text-xs transition-colors',
              mode === 'or'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            A ∪ B
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <MachineCard machine={A} active={finalA} />
        <MachineCard machine={B} active={finalB} />
      </div>

      {/* product grid */}
      <div className="border-t border-border px-4 py-4">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Product machine A × B
        </p>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th />
                {B.states.map((bs) => (
                  <th
                    key={bs}
                    className="px-2 font-mono text-xs text-muted-foreground"
                  >
                    B:{bs}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {A.states.map((as) => (
                <tr key={as}>
                  <th className="pr-2 text-right font-mono text-xs text-muted-foreground">
                    A:{as}
                  </th>
                  {B.states.map((bs) => {
                    const cell = `${as}|${bs}`
                    const isAcc = isAcceptProduct(as, bs)
                    const isActive = cell === activeCell
                    const onPath = pathCells.has(cell)
                    return (
                      <td key={bs}>
                        <div
                          className={cn(
                            'grid h-14 w-20 place-items-center rounded-md border text-center font-mono text-[11px] transition-colors',
                            isActive
                              ? 'border-primary bg-primary/20 text-foreground'
                              : isAcc
                                ? 'border-success/60 bg-success/10 text-success'
                                : 'border-border text-muted-foreground',
                            onPath && !isActive && 'ring-1 ring-accent/40',
                          )}
                        >
                          <span>
                            ({as},{bs})
                          </span>
                          {isAcc && <span className="text-[9px]">accept</span>}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Highlighted cells are accepting under{' '}
          <span className="font-mono text-foreground">
            {mode === 'and' ? 'A ∩ B' : 'A ∪ B'}
          </span>
          . The product state simply tracks both machines at once.
        </p>
      </div>

      {/* input runner */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="font-mono text-xs text-muted-foreground">
            input
          </label>
          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value.replace(/[^01]/g, '').slice(0, 12))
            }
            className="w-40 rounded-md border border-border bg-background px-2 py-1 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="0110"
            aria-label="Input string"
          />
          <span
            className={cn(
              'ml-auto rounded-md px-3 py-1 font-mono text-xs font-semibold',
              accepted
                ? 'bg-success/15 text-success'
                : 'bg-destructive/15 text-destructive',
            )}
          >
            {accepted ? 'ACCEPTED' : 'REJECTED'}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {path.map((p, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
            >
              {p.sym && <span className="text-accent">{p.sym}→</span>}(
              {p.a},{p.b})
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          A ends in{' '}
          <span className={accA ? 'text-success' : 'text-destructive'}>
            {finalA} {accA ? '(accept)' : '(reject)'}
          </span>
          , B ends in{' '}
          <span className={accB ? 'text-success' : 'text-destructive'}>
            {finalB} {accB ? '(accept)' : '(reject)'}
          </span>
          .
        </p>
      </div>
    </div>
  )
}

function MachineCard({ machine, active }: { machine: MiniDfa; active: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="font-mono text-sm font-semibold text-foreground">
        {machine.name}
      </p>
      <p className="mb-2 text-xs text-muted-foreground">{machine.language}</p>
      <div className="flex flex-wrap gap-1.5">
        {machine.states.map((s) => (
          <span
            key={s}
            className={cn(
              'rounded-md border px-2 py-1 font-mono text-[11px] transition-colors',
              s === active
                ? 'border-primary bg-primary/20 text-foreground'
                : machine.accept.includes(s)
                  ? 'border-success/50 text-success'
                  : 'border-border text-muted-foreground',
            )}
          >
            {s}
            {machine.accept.includes(s) ? ' ✓' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
