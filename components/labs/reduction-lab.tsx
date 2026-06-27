'use client'

import { useState } from 'react'
import { ArrowRight, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* --------------------------- diagonalization grid -------------------------- */

/**
 * Visualizes Cantor/Turing diagonalization. Rows are machines M_i, columns are
 * inputs ⟨M_j⟩. Cell (i,j) = does M_i accept ⟨M_j⟩? We flip the diagonal to
 * build a behavior D that no row can match.
 */
function DiagonalizationGrid() {
  const n = 6
  // a deterministic pseudo-table so it looks "real" but is reproducible
  const table = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (((i + 1) * (j + 2) + i * 3) % 3 === 0 ? 1 : 0)),
  )
  const [revealed, setRevealed] = useState(0) // how many diagonal flips shown

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Diagonalization table · accept = 1
        </p>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRevealed(0)}
            aria-label="Reset"
          >
            <RotateCcw /> Reset
          </Button>
          <Button
            size="sm"
            onClick={() => setRevealed((r) => Math.min(n, r + 1))}
            disabled={revealed >= n}
          >
            Flip next diagonal cell
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th />
              {table.map((_, j) => (
                <th
                  key={j}
                  className="px-1 font-mono text-[10px] text-muted-foreground"
                >
                  ⟨M{j + 1}⟩
                </th>
              ))}
              <th className="px-2 font-mono text-[10px] text-accent">D</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td className="pr-1 font-mono text-[10px] text-muted-foreground">
                  M{i + 1}
                </td>
                {row.map((cell, j) => {
                  const onDiag = i === j
                  return (
                    <td key={j}>
                      <span
                        className={cn(
                          'grid size-7 place-items-center rounded font-mono text-xs',
                          onDiag
                            ? 'bg-primary/20 text-primary ring-1 ring-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {cell}
                      </span>
                    </td>
                  )
                })}
                {/* D column: the flipped diagonal value for this position */}
                <td>
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded font-mono text-xs',
                      i < revealed
                        ? 'bg-accent/20 text-accent ring-1 ring-accent'
                        : 'bg-transparent text-transparent',
                    )}
                  >
                    {i < revealed ? (table[i][i] === 1 ? 0 : 1) : ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-pretty text-sm leading-relaxed text-foreground/90">
        {revealed < n ? (
          <>
            Build behavior <span className="font-mono text-accent">D</span> by
            flipping each diagonal cell:{' '}
            <span className="font-mono">D(i) = 1 − M_i(⟨M_i⟩)</span>. Keep
            flipping…
          </>
        ) : (
          <>
            <span className="font-mono text-accent">D</span> now differs from
            every machine <span className="font-mono">M_i</span> on input{' '}
            <span className="font-mono">⟨M_i⟩</span> — so D is not in the list.
            No enumeration of machines can cover every behavior. This is the
            seed of the undecidability of <span className="font-mono">Aᴛᴍ</span>.
          </>
        )}
      </p>
    </div>
  )
}

/* ----------------------------- reduction stepper --------------------------- */

const REDUCTION_STEPS = [
  {
    title: 'Assume a decider exists',
    body: 'Suppose, for contradiction, that some Turing machine H decides Aᴛᴍ — it always halts and answers "does M accept w?".',
  },
  {
    title: 'Build a contrarian machine D',
    body: 'Construct D that, on input ⟨M⟩, runs H on (M, ⟨M⟩) and then does the opposite: if H says accept, D rejects; if H says reject, D accepts.',
  },
  {
    title: 'Feed D its own description',
    body: 'Now run D on input ⟨D⟩. By construction, D accepts ⟨D⟩ exactly when H reports that D does NOT accept ⟨D⟩.',
  },
  {
    title: 'Contradiction',
    body: 'So D accepts ⟨D⟩ ⟺ D rejects ⟨D⟩. Both cannot hold. The only false assumption was that H exists — therefore Aᴛᴍ is undecidable.',
  },
]

function ReductionStepper() {
  const [i, setI] = useState(0)
  const step = REDUCTION_STEPS[i]
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        The halting argument · step {i + 1}/{REDUCTION_STEPS.length}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {REDUCTION_STEPS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              idx <= i ? 'bg-primary' : 'bg-muted',
            )}
            aria-label={`Go to step ${idx + 1}`}
          />
        ))}
      </div>

      <h4 className="font-serif text-xl text-foreground">{step.title}</h4>
      <p className="mt-2 min-h-[4.5rem] text-pretty leading-relaxed text-foreground/90">
        {step.body}
      </p>

      {i === REDUCTION_STEPS.length - 1 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-sm text-destructive">
          <Zap className="size-4" /> D accepts ⟨D⟩ ⟺ D rejects ⟨D⟩
        </div>
      )}

      <div className="mt-5 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setI((x) => Math.max(0, x - 1))}
          disabled={i === 0}
        >
          Back
        </Button>
        <Button
          size="sm"
          onClick={() => setI((x) => Math.min(REDUCTION_STEPS.length - 1, x + 1))}
          disabled={i === REDUCTION_STEPS.length - 1}
        >
          Next <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function ReductionLab() {
  return (
    <div className="space-y-5">
      <ReductionStepper />
      <DiagonalizationGrid />
    </div>
  )
}
