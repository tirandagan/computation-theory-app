'use client'

import { useMemo, useState } from 'react'
import { Grid3x3, RotateCcw, Trophy, Check } from 'lucide-react'
import { useProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'

/**
 * Diagonalization: "Build the Impossible Machine."
 *
 * Rows are machines M₁..Mₙ, columns are inputs w₁..wₙ, and each cell is whether
 * Mᵢ accepts wⱼ (1) or rejects it (0). The learner constructs a new row D that
 * flips every diagonal entry, so D differs from machine Mᵢ exactly on input wᵢ.
 * Therefore D matches no row — the contradiction at the heart of Cantor's
 * theorem and the undecidability of Aᴛᴍ.
 */

// fixed matrix (deterministic for SSR safety)
const M = [
  [1, 0, 1, 0, 0],
  [0, 0, 1, 1, 0],
  [1, 1, 0, 0, 1],
  [0, 1, 1, 1, 0],
  [1, 0, 0, 1, 1],
]
const N = M.length

export function DiagonalGame() {
  const { recordGame } = useProgress()
  const [d, setD] = useState<(0 | 1 | null)[]>(Array(N).fill(null))
  const [checked, setChecked] = useState(false)

  // correct anti-diagonal: flip M[i][i]
  const target = useMemo(() => M.map((row, i) => (row[i] === 1 ? 0 : 1)), [])

  const allSet = d.every((v) => v !== null)
  const isAntiDiagonal = d.every((v, i) => v === target[i])
  const won = checked && isAntiDiagonal

  function toggle(j: number) {
    if (checked) return
    setD((prev) => {
      const next = [...prev]
      next[j] = prev[j] === null ? 1 : prev[j] === 1 ? 0 : 1
      return next
    })
  }

  function verify() {
    setChecked(true)
    if (isAntiDiagonal) {
      recordGame('diagonal', { won: true, perfect: true })
    }
  }

  function reset() {
    setD(Array(N).fill(null))
    setChecked(false)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Grid3x3 className="size-3.5" /> Build the Impossible Machine
        </span>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-pretty text-sm text-muted-foreground">
          Each row is a machine; each column an input. A cell is{' '}
          <span className="font-mono text-success">1</span> if that machine
          accepts that input, <span className="font-mono">0</span> if it rejects.
          Flip every diagonal cell to build a row <strong>D</strong> that no
          machine can equal.
        </p>

        {/* the matrix */}
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th />
                {Array.from({ length: N }, (_, j) => (
                  <th
                    key={j}
                    className="px-1 font-mono text-[10px] font-normal text-muted-foreground"
                  >
                    w{sub(j + 1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {M.map((row, i) => (
                <tr key={i}>
                  <td className="pr-1 font-mono text-[10px] text-muted-foreground">
                    M{sub(i + 1)}
                  </td>
                  {row.map((cell, j) => {
                    const onDiag = i === j
                    return (
                      <td key={j}>
                        <span
                          className={cn(
                            'flex size-8 items-center justify-center rounded-md border font-mono text-sm',
                            onDiag
                              ? 'border-accent bg-accent/15 text-accent'
                              : 'border-border bg-background/60 text-foreground/70',
                            won && onDiag && 'ring-2 ring-success',
                          )}
                        >
                          {cell}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* constructed row D */}
              <tr>
                <td className="pr-1 font-mono text-[10px] font-bold text-primary">
                  D
                </td>
                {d.map((v, j) => {
                  const correct = v === target[j]
                  return (
                    <td key={j}>
                      <button
                        onClick={() => toggle(j)}
                        disabled={checked}
                        className={cn(
                          'flex size-8 items-center justify-center rounded-md border font-mono text-sm transition-colors',
                          v === null
                            ? 'border-dashed border-primary/50 bg-primary/5 text-muted-foreground hover:bg-primary/10'
                            : 'border-primary bg-primary/15 text-primary',
                          checked &&
                            (correct
                              ? 'border-success bg-success/15 text-success'
                              : 'border-destructive bg-destructive/15 text-destructive'),
                        )}
                        title={`Flip M${j + 1}'s answer on w${j + 1}`}
                      >
                        {v === null ? '?' : v}
                      </button>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-3 font-mono text-xs text-muted-foreground">
          Rule: set <span className="text-primary">D[i]</span> ={' '}
          <span className="text-foreground">NOT M{sub('i')}(w{sub('i')})</span> —
          the opposite of each highlighted diagonal cell.
        </div>

        {!checked ? (
          <button
            onClick={verify}
            disabled={!allSet}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {allSet ? 'Verify D against every machine' : 'Fill in all of D first'}
          </button>
        ) : won ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-5 text-center">
            <Trophy className="size-8 text-success" />
            <p className="font-serif text-2xl text-foreground">
              Contradiction achieved!
            </p>
            <p className="text-pretty text-sm text-muted-foreground">
              D differs from every machine Mᵢ on input wᵢ, so no machine in the
              list computes D. The same diagonal trick proves the languages are
              uncountable and that Aᴛᴍ is undecidable.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5">
              {M.map((_, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success"
                >
                  <Check className="size-3" /> D ≠ M{sub(i + 1)}
                </span>
              ))}
            </div>
            <button
              onClick={reset}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-1.5 text-sm text-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
            <p className="text-pretty text-sm text-foreground/90">
              Not quite — for a guaranteed contradiction, every cell of D must be
              the <em>opposite</em> of the diagonal value directly above it. The
              red cells don&apos;t yet differ from their machine.
            </p>
            <button
              onClick={() => setChecked(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-1.5 text-sm text-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" /> Keep flipping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function sub(v: number | string): string {
  const map: Record<string, string> = {
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    i: 'ᵢ',
  }
  return String(v)
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
}
