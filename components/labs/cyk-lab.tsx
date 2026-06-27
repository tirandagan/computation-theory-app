'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CNF_GRAMMARS, runCyk, type CnfGrammar } from '@/lib/cyk'
import { cn } from '@/lib/utils'

export function CykLab() {
  const [grammarId, setGrammarId] = useState(CNF_GRAMMARS[0].id)
  const grammar = useMemo<CnfGrammar>(
    () => CNF_GRAMMARS.find((g) => g.id === grammarId) ?? CNF_GRAMMARS[0],
    [grammarId],
  )
  const [input, setInput] = useState(grammar.examples[1] ?? grammar.examples[0])
  const result = useMemo(() => runCyk(grammar, input), [grammar, input])
  // how many cells of the fill order are revealed
  const [revealed, setRevealed] = useState(result.cells.length)

  const n = input.length
  // lookup: cell vars by (i, span) once revealed
  const revealedCells = result.cells.slice(0, revealed)
  const cellVars = (i: number, span: number): string[] | null => {
    const found = revealedCells.find((c) => c.i === i && c.span === span)
    return found ? found.vars : null
  }
  const allRevealed = revealed >= result.cells.length

  function reset(toInput: string) {
    setInput(toInput)
    // recompute reveal to full for the new input length
    const r = runCyk(grammar, toInput)
    setRevealed(r.cells.length)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          CNF grammar
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CNF_GRAMMARS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setGrammarId(g.id)
                reset(g.examples[1] ?? g.examples[0])
              }}
              className={cn(
                'rounded-lg px-2.5 py-1 font-mono text-xs transition-colors',
                g.id === grammarId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1.2fr]">
        {/* left: rules + input */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:border-b-0 lg:border-r">
          <p className="text-pretty text-sm text-muted-foreground">
            {grammar.description}
          </p>

          <div className="rounded-lg border border-border bg-background/60 p-3 font-mono text-sm leading-relaxed">
            {grammar.variables.map((v) => {
              const units = grammar.unit[v] ?? []
              const bins = grammar.binary[v] ?? []
              const rhs = [
                ...bins.map(([b, c]) => `${b} ${c}`),
                ...units.map((t) => t),
              ].join('  |  ')
              if (!rhs) return null
              return (
                <div key={v}>
                  <span className="text-primary">{v}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="text-foreground">{rhs}</span>
                </div>
              )
            })}
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Test string · examples:{' '}
              {grammar.examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => reset(ex)}
                  className="mr-1 rounded bg-muted px-1.5 py-0.5 text-foreground hover:text-primary"
                >
                  {ex}
                </button>
              ))}
            </label>
            <input
              value={input}
              onChange={(e) =>
                reset(
                  [...e.target.value]
                    .filter((c) => grammar.terminals.includes(c))
                    .join(''),
                )
              }
              spellCheck={false}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg tracking-[0.2em] outline-none focus:border-primary"
            />
          </div>

          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
              !allRevealed
                ? 'border-border bg-muted/40 text-muted-foreground'
                : result.accepted
                  ? 'border-success/40 bg-success/15 text-success'
                  : 'border-destructive/40 bg-destructive/15 text-destructive',
            )}
          >
            {!allRevealed ? (
              <>Fill the table to see the verdict…</>
            ) : result.accepted ? (
              <>
                <Check className="size-4" /> Accepted — start symbol{' '}
                {grammar.start} reaches the top cell
              </>
            ) : (
              <>
                <X className="size-4" /> Rejected — {grammar.start} never reaches
                the top cell
              </>
            )}
          </div>

          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRevealed(n > 0 ? n : 0)}
            >
              <RotateCcw /> Restart fill
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setRevealed((r) => Math.min(result.cells.length, r + 1))
              }
              disabled={allRevealed}
            >
              Fill next cell <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* right: CYK triangular table */}
        <div className="bg-grid overflow-x-auto p-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            CYK table · cell (i, span) holds variables deriving that substring
          </p>
          {n === 0 ? (
            <p className="text-sm text-muted-foreground">Type a string.</p>
          ) : (
            <div className="inline-flex flex-col gap-1">
              {/* rows from span = n (top) down to span = 1 (bottom) */}
              {Array.from({ length: n }, (_, r) => {
                const span = n - r
                return (
                  <div key={span} className="flex gap-1">
                    {Array.from({ length: n - span + 1 }, (_, i) => {
                      const vars = cellVars(i, span)
                      const isTop = span === n && i === 0
                      const hasStart = vars?.includes(grammar.start)
                      return (
                        <div
                          key={i}
                          className={cn(
                            'grid h-11 w-11 place-items-center rounded-md border text-center font-mono text-xs transition-colors',
                            vars === null
                              ? 'border-dashed border-border bg-transparent text-transparent'
                              : vars.length === 0
                                ? 'border-border bg-muted/40 text-muted-foreground'
                                : isTop && hasStart
                                  ? 'border-success bg-success/20 text-success'
                                  : 'border-primary/40 bg-primary/10 text-primary',
                          )}
                        >
                          {vars === null
                            ? '·'
                            : vars.length === 0
                              ? '∅'
                              : vars.join(',')}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              {/* the input characters along the bottom */}
              <div className="mt-1 flex gap-1">
                {[...input].map((ch, i) => (
                  <div
                    key={i}
                    className="grid h-7 w-11 place-items-center font-mono text-sm text-foreground"
                  >
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
