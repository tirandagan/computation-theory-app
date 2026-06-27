'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Circle,
  Link2,
  MousePointer2,
  Eraser,
  Play,
  Trophy,
  Check,
  X,
} from 'lucide-react'
import {
  isAccepting,
  runAutomaton,
  type Automaton,
  type AutoState,
} from '@/lib/automata'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Tool = 'select' | 'state' | 'link' | 'erase'

interface BuilderState extends AutoState {
  start?: boolean
}
interface BuilderEdge {
  id: string
  from: string
  to: string
  symbols: string[]
}

interface Challenge {
  id: string
  title: string
  description: string
  alphabet: string[]
  /** strings that MUST be accepted */
  accept: string[]
  /** strings that MUST be rejected */
  reject: string[]
}

const CHALLENGES: Challenge[] = [
  {
    id: 'contains-101',
    title: 'Contains 101',
    description: 'Accept exactly the strings that contain 101 as a substring.',
    alphabet: ['0', '1'],
    accept: ['101', '0101', '1010101', '111101', '101000'],
    reject: ['', '0', '1', '100', '110', '0011', '111'],
  },
  {
    id: 'even-length',
    title: 'Even length',
    description: 'Accept every string of even length (including ε).',
    alphabet: ['0', '1'],
    accept: ['', '00', '01', '1111', '0110'],
    reject: ['0', '1', '010', '11111'],
  },
  {
    id: 'starts-end-same',
    title: 'Starts and ends with the same symbol',
    description:
      'Accept nonempty strings whose first and last symbol are equal.',
    alphabet: ['0', '1'],
    accept: ['0', '1', '010', '1001', '00', '11'],
    reject: ['01', '10', '011', '100'],
  },
]

let uid = 0
const nextId = () => `s${uid++}`

export function AutomatonBuilder() {
  const [tool, setTool] = useState<Tool>('state')
  const [states, setStates] = useState<BuilderState[]>([])
  const [edges, setEdges] = useState<BuilderEdge[]>([])
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [pending, setPending] = useState<{ from: string; to: string } | null>(
    null,
  )
  const [symbolDraft, setSymbolDraft] = useState('')
  const [challengeId, setChallengeId] = useState(CHALLENGES[0].id)
  const [testInput, setTestInput] = useState('')
  const [report, setReport] = useState<
    | null
    | {
        passed: boolean
        rows: { s: string; expected: boolean; got: boolean }[]
      }
  >(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const challenge = CHALLENGES.find((c) => c.id === challengeId)!
  const alphabet = challenge.alphabet

  const automaton: Automaton | null = useMemo(() => {
    const start = states.find((s) => s.start)
    if (!start) return null
    const delta: Record<string, Record<string, string[]>> = {}
    for (const s of states) delta[s.id] = {}
    for (const e of edges) {
      for (const sym of e.symbols) {
        delta[e.from][sym] = [...(delta[e.from][sym] ?? []), e.to]
      }
    }
    const nondeterministic = edges.some((e) =>
      e.symbols.some((sym) => (delta[e.from][sym]?.length ?? 0) > 1),
    )
    return {
      id: 'user',
      name: 'Your machine',
      description: '',
      language: '',
      alphabet,
      start: start.id,
      states,
      edges: edges.map((e) => ({
        from: e.from,
        to: e.to,
        label: e.symbols.join(','),
      })),
      delta,
      nondeterministic,
    }
  }, [states, edges, alphabet])

  const liveTrace = useMemo(() => {
    if (!automaton) return null
    return runAutomaton(automaton, testInput)
  }, [automaton, testInput])
  const liveActive = liveTrace?.[liveTrace.length - 1].active ?? []
  const liveAccepts =
    automaton && testInput !== undefined
      ? isAccepting(automaton, liveActive)
      : false

  function handleCanvasClick(e: React.MouseEvent) {
    if (tool !== 'state' || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 640
    const y = ((e.clientY - rect.top) / rect.height) * 360
    setStates((prev) => [
      ...prev,
      { id: nextId(), x, y, start: prev.length === 0 },
    ])
    setReport(null)
  }

  function handleStateClick(id: string) {
    setReport(null)
    if (tool === 'erase') {
      setStates((prev) => prev.filter((s) => s.id !== id))
      setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id))
      return
    }
    if (tool === 'link') {
      if (linkFrom == null) {
        setLinkFrom(id)
      } else {
        setPending({ from: linkFrom, to: id })
        setSymbolDraft('')
        setLinkFrom(null)
      }
      return
    }
    // select tool
    setSelected(id)
  }

  function commitEdge() {
    if (!pending) return
    const symbols = symbolDraft
      .split(/[\s,]+/)
      .filter((s) => alphabet.includes(s) || s === 'ε')
    if (symbols.length === 0) {
      setPending(null)
      return
    }
    setEdges((prev) => {
      const existing = prev.find(
        (e) => e.from === pending.from && e.to === pending.to,
      )
      if (existing) {
        return prev.map((e) =>
          e === existing
            ? { ...e, symbols: Array.from(new Set([...e.symbols, ...symbols])) }
            : e,
        )
      }
      return [
        ...prev,
        { id: `e${uid++}`, from: pending.from, to: pending.to, symbols },
      ]
    })
    setPending(null)
  }

  function setStart(id: string) {
    setStates((prev) => prev.map((s) => ({ ...s, start: s.id === id })))
    setReport(null)
  }
  function toggleAccept(id: string) {
    setStates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, accept: !s.accept } : s)),
    )
    setReport(null)
  }
  function clearAll() {
    setStates([])
    setEdges([])
    setReport(null)
    setSelected(null)
  }

  function gradeChallenge() {
    if (!automaton) {
      setReport({ passed: false, rows: [] })
      return
    }
    const rows = [
      ...challenge.accept.map((s) => ({ s, expected: true })),
      ...challenge.reject.map((s) => ({ s, expected: false })),
    ].map(({ s, expected }) => {
      const trace = runAutomaton(automaton, s)
      const got = isAccepting(automaton, trace[trace.length - 1].active)
      return { s, expected, got }
    })
    setReport({ passed: rows.every((r) => r.expected === r.got), rows })
  }

  const selectedState = states.find((s) => s.id === selected)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex gap-1">
          {(
            [
              { t: 'select', icon: MousePointer2, label: 'Select' },
              { t: 'state', icon: Circle, label: 'Add state' },
              { t: 'link', icon: Link2, label: 'Add transition' },
              { t: 'erase', icon: Eraser, label: 'Erase' },
            ] as const
          ).map(({ t, icon: Icon, label }) => (
            <button
              key={t}
              onClick={() => {
                setTool(t)
                setLinkFrom(null)
              }}
              title={label}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs transition-colors',
                tool === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
        <button
          onClick={clearAll}
          className="ml-auto rounded-lg bg-muted px-2.5 py-1.5 font-mono text-xs text-muted-foreground hover:text-destructive"
        >
          Clear
        </button>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
        {/* canvas */}
        <div className="relative border-b border-border lg:border-b-0 lg:border-r">
          <svg
            ref={svgRef}
            viewBox="0 0 640 360"
            className="bg-grid h-full max-h-[420px] w-full cursor-crosshair touch-none"
            onClick={handleCanvasClick}
          >
            <defs>
              <marker
                id="builder-arrow"
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

            {/* edges */}
            {edges.map((e) => {
              const from = states.find((s) => s.id === e.from)
              const to = states.find((s) => s.id === e.to)
              if (!from || !to) return null
              const label = e.symbols.join(',')
              if (e.from === e.to) {
                // self loop
                return (
                  <g key={e.id}>
                    <path
                      d={`M ${from.x - 12} ${from.y - 18} C ${from.x - 60} ${
                        from.y - 80
                      }, ${from.x + 60} ${from.y - 80}, ${from.x + 12} ${
                        from.y - 18
                      }`}
                      className="fill-none stroke-muted-foreground"
                      strokeWidth={1.5}
                      markerEnd="url(#builder-arrow)"
                    />
                    <text
                      x={from.x}
                      y={from.y - 72}
                      textAnchor="middle"
                      className="fill-accent font-mono text-[13px]"
                    >
                      {label}
                    </text>
                  </g>
                )
              }
              const dx = to.x - from.x
              const dy = to.y - from.y
              const len = Math.hypot(dx, dy) || 1
              const ux = dx / len
              const uy = dy / len
              const r = 26
              const x1 = from.x + ux * r
              const y1 = from.y + uy * r
              const x2 = to.x - ux * r
              const y2 = to.y - uy * r
              const mx = (x1 + x2) / 2 - uy * 16
              const my = (y1 + y2) / 2 + ux * 16
              return (
                <g key={e.id}>
                  <path
                    d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                    className="fill-none stroke-muted-foreground"
                    strokeWidth={1.5}
                    markerEnd="url(#builder-arrow)"
                  />
                  <text
                    x={mx}
                    y={my - 4}
                    textAnchor="middle"
                    className="fill-accent font-mono text-[13px]"
                  >
                    {label}
                  </text>
                </g>
              )
            })}

            {/* states */}
            {states.map((s) => {
              const isActive = liveActive.includes(s.id)
              const isLinkSource = linkFrom === s.id
              return (
                <g
                  key={s.id}
                  onClick={(ev) => {
                    ev.stopPropagation()
                    handleStateClick(s.id)
                  }}
                  className="cursor-pointer"
                >
                  {s.start && (
                    <line
                      x1={s.x - 46}
                      y1={s.y}
                      x2={s.x - 28}
                      y2={s.y}
                      className="stroke-foreground"
                      strokeWidth={1.5}
                      markerEnd="url(#builder-arrow)"
                    />
                  )}
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={24}
                    className={cn(
                      'transition-colors',
                      isActive
                        ? 'fill-primary/25 stroke-primary'
                        : isLinkSource
                          ? 'fill-accent/20 stroke-accent'
                          : 'fill-card stroke-muted-foreground',
                    )}
                    strokeWidth={2}
                  />
                  {s.accept && (
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={19}
                      className={cn(
                        'fill-none',
                        isActive ? 'stroke-primary' : 'stroke-muted-foreground',
                      )}
                      strokeWidth={1.5}
                    />
                  )}
                  <text
                    x={s.x}
                    y={s.y + 4}
                    textAnchor="middle"
                    className={cn(
                      'font-mono text-xs',
                      isActive ? 'fill-primary' : 'fill-foreground',
                    )}
                  >
                    {s.id}
                  </text>
                </g>
              )
            })}
          </svg>

          {states.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
              <p className="text-pretty text-sm text-muted-foreground">
                Click anywhere to drop your first state. The first one becomes
                the start state.
              </p>
            </div>
          )}

          {/* hint bar */}
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur">
            {tool === 'state' && 'Click empty space to add a state.'}
            {tool === 'link' &&
              (linkFrom
                ? 'Now click the destination state (or the same state for a self-loop).'
                : 'Click a source state to begin a transition.')}
            {tool === 'erase' && 'Click a state to delete it and its transitions.'}
            {tool === 'select' && 'Click a state to select and edit it.'}
          </div>
        </div>

        {/* side panel */}
        <div className="flex flex-col gap-4 p-4">
          {/* selected-state editor */}
          {selectedState ? (
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <p className="mb-2 font-mono text-xs text-muted-foreground">
                State <span className="text-primary">{selectedState.id}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedState.start ? 'default' : 'outline'}
                  onClick={() => setStart(selectedState.id)}
                >
                  Start state
                </Button>
                <Button
                  size="sm"
                  variant={selectedState.accept ? 'default' : 'outline'}
                  onClick={() => toggleAccept(selectedState.id)}
                >
                  Accept state
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              Use <strong className="text-foreground">Select</strong> to mark a
              state as start or accepting, then test a string or take on a
              challenge below.
            </p>
          )}

          {/* live test */}
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Test a string · Σ = {'{'}
              {alphabet.join(', ')}
              {'}'}
            </label>
            <input
              value={testInput}
              onChange={(e) =>
                setTestInput(
                  [...e.target.value]
                    .filter((c) => alphabet.includes(c))
                    .join(''),
                )
              }
              placeholder="type to simulate live…"
              spellCheck={false}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg tracking-[0.3em] outline-none focus:border-primary"
            />
            {automaton ? (
              <div
                className={cn(
                  'mt-2 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm',
                  liveAccepts
                    ? 'border-success/40 bg-success/15 text-success'
                    : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {liveAccepts ? (
                  <>
                    <Check className="size-4" /> accepted
                  </>
                ) : (
                  <>
                    <X className="size-4" /> rejected
                  </>
                )}
              </div>
            ) : (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Add a start state to simulate.
              </p>
            )}
          </div>

          {/* challenge */}
          <div className="mt-auto rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Trophy className="size-3.5 text-primary" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary">
                Challenge
              </span>
            </div>
            <select
              value={challengeId}
              onChange={(e) => {
                setChallengeId(e.target.value)
                setReport(null)
              }}
              className="mb-2 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
            >
              {CHALLENGES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <p className="mb-3 text-pretty text-xs leading-relaxed text-muted-foreground">
              {challenge.description}
            </p>
            <Button size="sm" className="w-full" onClick={gradeChallenge}>
              <Play className="size-3.5" /> Grade my machine
            </Button>

            {report && (
              <div className="mt-3">
                <p
                  className={cn(
                    'mb-2 text-sm font-semibold',
                    report.passed ? 'text-success' : 'text-destructive',
                  )}
                >
                  {report.passed
                    ? 'Solved — every test passed!'
                    : report.rows.length === 0
                      ? 'Add a start state first.'
                      : 'Not yet — some tests failed.'}
                </p>
                <div className="grid max-h-32 grid-cols-2 gap-1 overflow-y-auto">
                  {report.rows.map((r, i) => (
                    <span
                      key={i}
                      className={cn(
                        'flex items-center justify-between gap-1 rounded px-1.5 py-0.5 font-mono text-[11px]',
                        r.expected === r.got
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive',
                      )}
                    >
                      <span>{r.s === '' ? 'ε' : r.s}</span>
                      {r.expected === r.got ? (
                        <Check className="size-3" />
                      ) : (
                        <X className="size-3" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* symbol prompt for a new transition */}
      {pending && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-xl">
            <p className="mb-1 font-serif text-lg">Transition symbols</p>
            <p className="mb-3 text-sm text-muted-foreground">
              Which symbols trigger{' '}
              <span className="font-mono text-primary">
                {pending.from} → {pending.to}
              </span>
              ? Separate with commas. Use ε for an empty move.
            </p>
            <input
              autoFocus
              value={symbolDraft}
              onChange={(e) => setSymbolDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdge()
                if (e.key === 'Escape') setPending(null)
              }}
              placeholder={`e.g. ${alphabet.join(', ')}`}
              className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={commitEdge}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
