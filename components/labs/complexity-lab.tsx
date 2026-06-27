'use client'

import { useMemo, useState } from 'react'
import { Check, Cpu, Search, X } from 'lucide-react'
import {
  FORMULAS,
  bruteForce,
  clauseSatisfied,
  clauseString,
  formulaString,
  isSatisfied,
  type SatFormula,
} from '@/lib/sat'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ComplexityLab() {
  const [formulaId, setFormulaId] = useState(FORMULAS[0].id)
  const formula = useMemo<SatFormula>(
    () => FORMULAS.find((f) => f.id === formulaId) ?? FORMULAS[0],
    [formulaId],
  )
  const [assignment, setAssignment] = useState<boolean[]>(
    () => FORMULAS[0].vars.map(() => false),
  )
  const [solveResult, setSolveResult] = useState<{
    assignment: boolean[] | null
    tried: number
  } | null>(null)

  // reset assignment when formula changes
  const total = 2 ** formula.vars.length
  function pickFormula(id: string) {
    const f = FORMULAS.find((x) => x.id === id)!
    setFormulaId(id)
    setAssignment(f.vars.map(() => false))
    setSolveResult(null)
  }

  function toggle(i: number) {
    setAssignment((a) => a.map((v, idx) => (idx === i ? !v : v)))
  }

  const satisfied = isSatisfied(formula, assignment)

  return (
    <div className="space-y-5">
      {/* SAT verifier / solver */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Boolean formula
          </span>
          <div className="flex flex-wrap gap-1.5">
            {FORMULAS.map((f) => (
              <button
                key={f.id}
                onClick={() => pickFormula(f.id)}
                className={cn(
                  'rounded-lg px-2.5 py-1 font-mono text-xs transition-colors',
                  f.id === formulaId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          {/* verify side */}
          <div className="flex flex-col gap-4 border-b border-border p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-accent" />
              <h4 className="font-serif text-lg">Verify (easy — in P)</h4>
            </div>
            <p className="text-pretty text-sm text-muted-foreground">
              Flip the switches to propose an assignment. Checking whether it
              satisfies every clause takes time linear in the formula&apos;s
              size.
            </p>

            {/* variable switches */}
            <div className="flex flex-wrap gap-2">
              {formula.vars.map((v, i) => (
                <button
                  key={v}
                  onClick={() => toggle(i)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors',
                    assignment[i]
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {v} ={' '}
                  <span className="font-semibold">
                    {assignment[i] ? 'T' : 'F'}
                  </span>
                </button>
              ))}
            </div>

            {/* clauses */}
            <div className="space-y-1.5">
              {formula.clauses.map((c, i) => {
                const ok = clauseSatisfied(c, assignment)
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-1.5 font-mono text-sm',
                      ok
                        ? 'border-success/40 bg-success/10 text-success'
                        : 'border-destructive/40 bg-destructive/10 text-destructive',
                    )}
                  >
                    <span>{clauseString(formula, c)}</span>
                    {ok ? <Check className="size-4" /> : <X className="size-4" />}
                  </div>
                )
              })}
            </div>

            <div
              className={cn(
                'mt-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
                satisfied
                  ? 'border-success/40 bg-success/15 text-success'
                  : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {satisfied ? (
                <>
                  <Check className="size-4" /> This assignment satisfies the
                  formula
                </>
              ) : (
                'Not all clauses satisfied yet'
              )}
            </div>
          </div>

          {/* solve side */}
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-primary" />
              <h4 className="font-serif text-lg">Solve (hard — in NP)</h4>
            </div>
            <p className="text-pretty text-sm text-muted-foreground">
              Finding a satisfying assignment may require searching all{' '}
              <span className="font-mono text-foreground">
                2^{formula.vars.length} = {total}
              </span>{' '}
              assignments. With <span className="font-mono">n</span> variables
              that is exponential.
            </p>

            <Button onClick={() => setSolveResult(bruteForce(formula))}>
              <Cpu className="size-4" /> Brute-force search
            </Button>

            {solveResult && (
              <div className="rounded-lg border border-border bg-background/60 p-3 text-sm">
                <p className="font-mono text-xs text-muted-foreground">
                  tried {solveResult.tried} / {total} assignments
                </p>
                {solveResult.assignment ? (
                  <>
                    <p className="mt-2 text-success">Satisfiable. Witness:</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {solveResult.assignment.map((v, i) => (
                        <span
                          key={i}
                          className="rounded bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary"
                        >
                          {formula.vars[i]}={v ? 'T' : 'F'}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setAssignment(solveResult.assignment as boolean[])
                      }
                      className="mt-2 font-mono text-xs text-accent hover:underline"
                    >
                      load this witness into the verifier →
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-destructive">
                    Unsatisfiable — every one of the {total} assignments fails.
                  </p>
                )}
              </div>
            )}

            <p className="mt-auto text-pretty text-xs leading-relaxed text-muted-foreground">
              The whole P vs NP question: for problems like SAT, is verifying a
              certificate fundamentally easier than finding one? Nobody knows.
            </p>
          </div>
        </div>
      </div>

      {/* complexity class map */}
      <ClassMap />
    </div>
  )
}

function ClassMap() {
  const layers = [
    {
      label: 'PSPACE',
      note: 'solvable with polynomial memory',
      cls: 'border-border bg-muted/40',
    },
    {
      label: 'NP',
      note: 'verifiable in polynomial time · SAT, TSP, clique',
      cls: 'border-accent/40 bg-accent/10',
    },
    {
      label: 'P',
      note: 'solvable in polynomial time · sorting, shortest path, 2-SAT',
      cls: 'border-primary/50 bg-primary/15',
    },
  ]
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        The class landscape (believed strict)
      </p>
      <div className="mx-auto max-w-md space-y-0">
        {layers.map((l, i) => (
          <div
            key={l.label}
            className={cn(
              'rounded-2xl border p-4 text-center',
              l.cls,
              i > 0 && '-mt-2',
            )}
            style={{
              marginLeft: i * 18,
              marginRight: i * 18,
            }}
          >
            <p className="font-mono text-sm font-semibold text-foreground">
              {l.label}
            </p>
            <p className="text-pretty text-xs text-muted-foreground">{l.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        P ⊆ NP ⊆ PSPACE · whether any containment is strict is open
      </p>
    </div>
  )
}
