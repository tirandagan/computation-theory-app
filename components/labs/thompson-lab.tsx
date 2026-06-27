'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import {
  buildThompson,
  layoutFragment,
  EPS,
  type BuildStep,
} from '@/lib/thompson'
import { PinchZoom } from '@/components/ui/pinch-zoom'
import { cn } from '@/lib/utils'

const PRESETS = ['ab', 'a|b', 'a*', '(a|b)*', 'ab|a', '(ab)*a']

export function ThompsonLab() {
  const [regex, setRegex] = useState('(a|b)*')
  const [stepIdx, setStepIdx] = useState(0)

  const { steps, error } = useMemo(() => {
    const trimmed = regex.trim()
    if (!trimmed) return { steps: [] as BuildStep[], error: 'Enter a regex.' }
    const { steps } = buildThompson(trimmed)
    if (!steps.length)
      return { steps: [] as BuildStep[], error: 'Could not parse that regex.' }
    return { steps, error: null }
  }, [regex])

  const clampedIdx = Math.min(stepIdx, Math.max(0, steps.length - 1))
  const current = steps[clampedIdx]

  function reset() {
    setStepIdx(0)
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Regex → NFA
        </span>
        <div className="ml-auto flex items-center gap-2">
          <label className="font-mono text-xs text-muted-foreground">r =</label>
          <input
            value={regex}
            onChange={(e) => {
              setRegex(e.target.value)
              setStepIdx(0)
            }}
            className="w-36 rounded-md border border-border bg-background px-2 py-1 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="(a|b)*"
            aria-label="Regular expression"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setRegex(p)
              setStepIdx(0)
            }}
            className={cn(
              'rounded-md border px-2 py-1 font-mono text-xs transition-colors',
              regex === p
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {error ? (
        <div className="px-4 py-10 text-center font-mono text-sm text-muted-foreground">
          {error}
        </div>
      ) : current ? (
        <>
          <div className="bg-grid relative">
            <PinchZoom className="flex min-h-[280px] flex-col justify-center">
              <FragmentSvg step={current} />
            </PinchZoom>
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                Step {clampedIdx + 1} / {steps.length}
              </span>
              <span className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-xs text-accent">
                building: {current.expr}
              </span>
            </div>
            <p className="min-h-[2.5rem] text-sm leading-relaxed text-foreground/90">
              {current.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                disabled={clampedIdx === 0}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="size-4" /> Prev
              </button>
              <button
                onClick={() =>
                  setStepIdx((i) => Math.min(steps.length - 1, i + 1))
                }
                disabled={clampedIdx >= steps.length - 1}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Next <ChevronRight className="size-4" />
              </button>
              <button
                onClick={reset}
                className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function FragmentSvg({ step }: { step: BuildStep }) {
  const frag = step.fragment
  const pos = useMemo(() => layoutFragment(frag), [frag])

  const xs = frag.nodes.map((n) => pos[n]?.x ?? 0)
  const ys = frag.nodes.map((n) => pos[n]?.y ?? 0)
  const maxX = Math.max(...xs, 200) + 60
  const minY = Math.min(...ys, 120) - 40
  const maxY = Math.max(...ys, 200) + 40
  const height = maxY - minY

  return (
    <svg
      viewBox={`0 ${minY} ${maxX} ${height}`}
      className="h-auto w-full select-none"
      style={{ maxHeight: 360 }}
      role="img"
      aria-label={`Thompson NFA fragment for ${step.expr}`}
    >
      <defs>
        <marker
          id="th-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
        </marker>
      </defs>

      {frag.edges.map((e, i) => {
        const a = pos[e.from]
        const b = pos[e.to]
        if (!a || !b) return null
        return (
          <EdgeArc
            key={`${e.from}-${e.to}-${i}`}
            ax={a.x}
            ay={a.y}
            bx={b.x}
            by={b.y}
            label={e.label}
            selfish={e.from === e.to}
          />
        )
      })}

      {frag.nodes.map((n) => {
        const p = pos[n]
        if (!p) return null
        const isStart = n === frag.start
        const isAccept = n === frag.accept
        return (
          <g key={n}>
            {isStart && (
              <line
                x1={p.x - 34}
                y1={p.y}
                x2={p.x - 19}
                y2={p.y}
                className="stroke-primary"
                strokeWidth={2}
                markerEnd="url(#th-arrow)"
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={16}
              className={cn(
                isAccept
                  ? 'fill-primary/15 stroke-primary'
                  : 'fill-card stroke-muted-foreground',
              )}
              strokeWidth={2}
            />
            {isAccept && (
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                className="fill-none stroke-primary"
                strokeWidth={1.5}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

function EdgeArc({
  ax,
  ay,
  bx,
  by,
  label,
  selfish,
}: {
  ax: number
  ay: number
  bx: number
  by: number
  label: string
  selfish?: boolean
}) {
  const r = 16
  if (selfish) {
    return (
      <g>
        <path
          d={`M ${ax - 6} ${ay - r} C ${ax - 40} ${ay - 56}, ${ax + 40} ${ay - 56}, ${ax + 6} ${ay - r}`}
          className="fill-none stroke-muted-foreground"
          strokeWidth={1.5}
          markerEnd="url(#th-arrow)"
        />
        <text
          x={ax}
          y={ay - 52}
          textAnchor="middle"
          className="fill-foreground font-mono text-[11px]"
        >
          {label}
        </text>
      </g>
    )
  }
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  // shrink endpoints to node edges
  const sx = ax + ux * r
  const sy = ay + uy * r
  const ex = bx - ux * (r + 4)
  const ey = by - uy * (r + 4)
  // curve control offset for parallel separation
  const curve = Math.abs(dy) < 1 ? 0 : 18
  const mx = (sx + ex) / 2 - uy * curve
  const my = (sy + ey) / 2 + ux * curve
  const isEps = label === EPS
  return (
    <g>
      <path
        d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`}
        className={cn(
          'fill-none',
          isEps ? 'stroke-muted-foreground/50' : 'stroke-muted-foreground',
        )}
        strokeWidth={1.5}
        strokeDasharray={isEps ? '4 3' : undefined}
        markerEnd="url(#th-arrow)"
      />
      <text
        x={mx}
        y={my - 4}
        textAnchor="middle"
        className={cn(
          'font-mono text-[11px]',
          isEps ? 'fill-muted-foreground' : 'fill-foreground',
        )}
      >
        {label}
      </text>
    </g>
  )
}
