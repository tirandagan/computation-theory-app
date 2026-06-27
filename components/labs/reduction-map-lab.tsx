'use client'

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Literal {
  v: 'x₁' | 'x₂' | 'x₃'
  neg: boolean
}

// (x₁ ∨ x₂ ∨ ¬x₃) ∧ (¬x₁ ∨ x₂ ∨ x₃) ∧ (x₁ ∨ ¬x₂ ∨ x₃)
const CLAUSES: Literal[][] = [
  [
    { v: 'x₁', neg: false },
    { v: 'x₂', neg: false },
    { v: 'x₃', neg: true },
  ],
  [
    { v: 'x₁', neg: true },
    { v: 'x₂', neg: false },
    { v: 'x₃', neg: false },
  ],
  [
    { v: 'x₁', neg: false },
    { v: 'x₂', neg: true },
    { v: 'x₃', neg: false },
  ],
]

const GROUP_CENTERS = [
  { x: 160, y: 120 },
  { x: 500, y: 120 },
  { x: 330, y: 330 },
]
const OFFSETS = [
  { x: -54, y: -8 },
  { x: 54, y: -8 },
  { x: 0, y: 52 },
]

interface Node {
  clause: number
  idx: number
  x: number
  y: number
  lit: Literal
}

function buildNodes(): Node[] {
  const nodes: Node[] = []
  CLAUSES.forEach((clause, c) => {
    clause.forEach((lit, i) => {
      nodes.push({
        clause: c,
        idx: i,
        x: GROUP_CENTERS[c].x + OFFSETS[i].x,
        y: GROUP_CENTERS[c].y + OFFSETS[i].y,
        lit,
      })
    })
  })
  return nodes
}

const contradictory = (a: Literal, b: Literal) => a.v === b.v && a.neg !== b.neg
const literalText = (l: Literal) => (l.neg ? `¬${l.v}` : l.v)
const literalTrue = (l: Literal, a: Record<string, boolean>) =>
  l.neg ? !a[l.v] : a[l.v]

export function ReductionMapLab() {
  const nodes = useMemo(buildNodes, [])
  const edges = useMemo(() => {
    const es: [number, number][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (
          nodes[i].clause !== nodes[j].clause &&
          !contradictory(nodes[i].lit, nodes[j].lit)
        ) {
          es.push([i, j])
        }
      }
    }
    return es
  }, [nodes])

  const [assign, setAssign] = useState<Record<string, boolean>>({
    'x₁': true,
    'x₂': true,
    'x₃': false,
  })

  // pick one satisfied literal per clause (the first), if any
  const chosen = useMemo(() => {
    const sel: (number | null)[] = CLAUSES.map(() => null)
    nodes.forEach((node, n) => {
      if (sel[node.clause] === null && literalTrue(node.lit, assign)) {
        sel[node.clause] = n
      }
    })
    return sel
  }, [nodes, assign])

  const satisfied = chosen.every((c) => c !== null)
  const cliqueSet = new Set(chosen.filter((c): c is number => c !== null))

  const cliqueEdge = (i: number, j: number) =>
    cliqueSet.has(i) && cliqueSet.has(j)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          3SAT ≤ₚ CLIQUE · a satisfying assignment ⇔ a k-clique
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1.3fr]">
        {/* left: formula + toggles */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:border-b-0 lg:border-r">
          <p className="text-pretty text-sm text-muted-foreground">
            Each clause becomes a triple of vertices. We connect two vertices
            when they sit in <em>different</em> clauses and are not
            contradictory. A k-clique (one vertex per clause) is exactly a
            satisfying assignment.
          </p>

          <div className="rounded-lg border border-border bg-background/60 p-3 font-mono text-sm leading-relaxed">
            {CLAUSES.map((clause, c) => (
              <div key={c}>
                <span className="text-muted-foreground">C{c + 1}: </span>(
                {clause.map((l, i) => (
                  <span key={i}>
                    <span
                      className={cn(
                        literalTrue(l, assign) ? 'text-success' : 'text-foreground',
                      )}
                    >
                      {literalText(l)}
                    </span>
                    {i < 2 && <span className="text-muted-foreground"> ∨ </span>}
                  </span>
                ))}
                )
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(['x₁', 'x₂', 'x₃'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setAssign((a) => ({ ...a, [v]: !a[v] }))}
                className={cn(
                  'rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors',
                  assign[v]
                    ? 'border-success/50 bg-success/15 text-success'
                    : 'border-border bg-muted/40 text-muted-foreground',
                )}
              >
                {v} = {assign[v] ? 'T' : 'F'}
              </button>
            ))}
          </div>

          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
              satisfied
                ? 'border-success/40 bg-success/15 text-success'
                : 'border-destructive/40 bg-destructive/15 text-destructive',
            )}
          >
            {satisfied ? (
              <>
                <Check className="size-4" /> Formula satisfied — the 3 green
                vertices form a triangle (3-clique).
              </>
            ) : (
              <>
                <X className="size-4" /> Some clause has no true literal — no
                k-clique yet.
              </>
            )}
          </div>
        </div>

        {/* right: graph */}
        <div className="bg-grid p-2">
          <svg
            viewBox="0 0 660 420"
            className="h-auto w-full select-none"
            role="img"
            aria-label="3SAT to CLIQUE reduction graph"
          >
            {/* edges */}
            {edges.map(([i, j], e) => {
              const inClique = cliqueEdge(i, j)
              return (
                <line
                  key={e}
                  x1={nodes[i].x}
                  y1={nodes[i].y}
                  x2={nodes[j].x}
                  y2={nodes[j].y}
                  className={inClique ? 'stroke-success' : 'stroke-border'}
                  strokeWidth={inClique ? 3 : 1}
                  opacity={inClique ? 1 : 0.5}
                />
              )
            })}

            {/* clause group labels */}
            {GROUP_CENTERS.map((g, c) => (
              <text
                key={c}
                x={g.x}
                y={g.y - 78}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-xs"
              >
                C{c + 1}
              </text>
            ))}

            {/* nodes */}
            {nodes.map((node, n) => {
              const isTrue = literalTrue(node.lit, assign)
              const inClique = cliqueSet.has(n)
              return (
                <g key={n}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={22}
                    className={cn(
                      inClique
                        ? 'fill-success stroke-success'
                        : isTrue
                          ? 'fill-success/20 stroke-success'
                          : 'fill-card stroke-muted-foreground',
                    )}
                    strokeWidth={2}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={cn(
                      'font-mono text-[13px]',
                      inClique
                        ? 'fill-success-foreground font-semibold'
                        : isTrue
                          ? 'fill-success'
                          : 'fill-foreground',
                    )}
                  >
                    {literalText(node.lit)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
