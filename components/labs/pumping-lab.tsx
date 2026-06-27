'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Interactive demonstration of the pumping lemma for L = { 0ⁿ1ⁿ }.
 * The adversary fixes a pumping length p; we use s = 0ᵖ1ᵖ and let the learner
 * split it as xyz (with |xy| ≤ p, |y| > 0) and pump y to break membership.
 */
export function PumpingLab() {
  const [p, setP] = useState(3)
  const [yStart, setYStart] = useState(0)
  const [yLen, setYLen] = useState(1)
  const [pump, setPump] = useState(2)

  const s = useMemo(() => '0'.repeat(p) + '1'.repeat(p), [p])

  // constrain y to live inside the first p symbols (all 0s)
  const maxYStart = Math.max(0, p - 1)
  const safeYStart = Math.min(yStart, maxYStart)
  const maxYLen = Math.max(1, p - safeYStart)
  const safeYLen = Math.min(Math.max(1, yLen), maxYLen)

  const x = s.slice(0, safeYStart)
  const y = s.slice(safeYStart, safeYStart + safeYLen)
  const z = s.slice(safeYStart + safeYLen)

  const pumped = x + y.repeat(pump) + z
  const zeros = (pumped.match(/0/g) || []).length
  const ones = (pumped.match(/1/g) || []).length
  const inLanguage = zeros === ones && pumped === '0'.repeat(zeros) + '1'.repeat(ones)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          L = {'{ 0ⁿ1ⁿ | n ≥ 0 }'} · choose a split of s = 0ᵖ1ᵖ
        </span>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        {/* the split string */}
        <div>
          <div className="mb-2 flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
            <span className="text-chart-2">x</span>
            <span className="text-primary">y (pumped)</span>
            <span className="text-muted-foreground">z</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[...s].map((c, i) => {
              const inY = i >= safeYStart && i < safeYStart + safeYLen
              const inX = i < safeYStart
              return (
                <span
                  key={i}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md border font-mono text-base',
                    inY
                      ? 'border-primary bg-primary/20 text-primary'
                      : inX
                        ? 'border-chart-2/50 bg-chart-2/10 text-chart-2'
                        : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {c}
                </span>
              )
            })}
          </div>
        </div>

        {/* sliders */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label={`pumping length p = ${p}`} min={1} max={6} value={p} onChange={setP} />
          <Slider
            label={`pump exponent i = ${pump}`}
            min={0}
            max={4}
            value={pump}
            onChange={setPump}
          />
          <Slider
            label={`start of y = ${safeYStart}`}
            min={0}
            max={maxYStart}
            value={safeYStart}
            onChange={setYStart}
          />
          <Slider
            label={`|y| = ${safeYLen}`}
            min={1}
            max={maxYLen}
            value={safeYLen}
            onChange={setYLen}
          />
        </div>

        {/* result */}
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <p className="font-mono text-sm text-muted-foreground">
            xy<sup>{pump}</sup>z ={' '}
            <span className="break-all tracking-[0.15em] text-foreground">
              {pumped || 'ε'}
            </span>
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {zeros} zeros · {ones} ones
          </p>
          <div
            className={cn(
              'mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
              inLanguage
                ? 'bg-muted text-muted-foreground'
                : 'bg-destructive/15 text-destructive',
            )}
          >
            {inLanguage ? (
              <>
                <Check className="size-4" /> Still in L — try pumping with i ≠ 1
                to break it
              </>
            ) : (
              <>
                <AlertTriangle className="size-4" /> Not in L — contradiction!
                This proves 0ⁿ1ⁿ is not regular
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: number
  onChange: (n: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs text-muted-foreground">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-primary)]"
      />
    </label>
  )
}
