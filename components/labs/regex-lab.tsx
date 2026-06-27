'use client'

import { useMemo, useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Preset {
  label: string
  pattern: string
  hint: string
  tests: string[]
}

const PRESETS: Preset[] = [
  {
    label: 'Ends with 01',
    pattern: '(0|1)*01',
    hint: 'Any binary string whose final two symbols are 0 then 1.',
    tests: ['01', '1101', '0010', '11', ''],
  },
  {
    label: 'Even # of 0s',
    pattern: '1*(01*01*)*',
    hint: 'Binary strings containing an even number of 0 symbols.',
    tests: ['', '11', '0110', '000', '0101'],
  },
  {
    label: 'Contains 101',
    pattern: '(0|1)*101(0|1)*',
    hint: 'At least one occurrence of the substring 101.',
    tests: ['101', '0010110', '1001', '111'],
  },
]

function compile(pattern: string): RegExp | null {
  try {
    return new RegExp(`^(?:${pattern})$`)
  } catch {
    return null
  }
}

export function RegexLab() {
  const [presetIdx, setPresetIdx] = useState(0)
  const [pattern, setPattern] = useState(PRESETS[0].pattern)
  const [tests, setTests] = useState<string[]>(PRESETS[0].tests)
  const [draft, setDraft] = useState('')

  const regex = useMemo(() => compile(pattern), [pattern])

  function loadPreset(i: number) {
    setPresetIdx(i)
    setPattern(PRESETS[i].pattern)
    setTests(PRESETS[i].tests)
  }

  function addTest() {
    const v = draft.trim()
    if (v === '' && tests.includes('')) return
    setTests((t) => [...t, v])
    setDraft('')
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Pattern
        </span>
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => loadPreset(i)}
            className={cn(
              'rounded-lg px-2.5 py-1 font-mono text-xs transition-colors',
              i === presetIdx
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {PRESETS[presetIdx].hint} Operators: <code className="text-primary">|</code>{' '}
          union, juxtaposition for concatenation, <code className="text-primary">*</code>{' '}
          star, <code className="text-primary">( )</code> grouping.
        </p>

        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Regular expression
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 font-mono text-base focus-within:border-primary">
            <span className="text-muted-foreground">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              className="w-full bg-transparent tracking-wide outline-none"
            />
            <span className="text-muted-foreground">/</span>
          </div>
          {!regex && (
            <p className="mt-1.5 font-mono text-xs text-destructive">
              Invalid expression
            </p>
          )}
        </div>

        {/* test strings */}
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Test strings
          </span>
          <ul className="space-y-1.5">
            {tests.map((t, i) => {
              const ok = regex ? regex.test(t) : false
              return (
                <li
                  key={`${t}-${i}`}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg border px-3 py-2 font-mono text-sm transition-colors',
                    ok
                      ? 'border-success/40 bg-success/10'
                      : 'border-border bg-muted/50',
                  )}
                >
                  <span className="tracking-[0.2em]">
                    {t === '' ? (
                      <span className="text-muted-foreground">ε</span>
                    ) : (
                      t
                    )}
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      ok ? 'text-success' : 'text-muted-foreground',
                    )}
                  >
                    {ok ? (
                      <>
                        <Check className="size-3.5" /> match
                      </>
                    ) : (
                      <>
                        <X className="size-3.5" /> no match
                      </>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2 pt-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTest()}
              placeholder="add a test string…"
              spellCheck={false}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
            />
            <button
              onClick={addTest}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
