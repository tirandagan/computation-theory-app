'use client'

import { useCallback, useMemo, useState } from 'react'
import { Gamepad2, RotateCcw, Trophy, Skull, Bot, User } from 'lucide-react'
import { useProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'

/**
 * Generalized Geography — a PSPACE-complete two-player game.
 *
 * Players alternately move a single token along directed edges to a vertex
 * that has not been visited yet. The first player unable to move loses. The AI
 * opponent plays perfectly via memoized minimax over (node, visited) states,
 * so the game faithfully embodies the alternating ∃/∀ structure that makes
 * deciding the winner PSPACE-complete.
 */

interface Node {
  id: number
  label: string
  x: number
  y: number
}

const NODES: Node[] = [
  { id: 0, label: 'S', x: 80, y: 140 },
  { id: 1, label: 'A', x: 200, y: 60 },
  { id: 2, label: 'B', x: 200, y: 220 },
  { id: 3, label: 'C', x: 330, y: 60 },
  { id: 4, label: 'D', x: 330, y: 220 },
  { id: 5, label: 'E', x: 450, y: 140 },
  { id: 6, label: 'F', x: 560, y: 140 },
]

// directed adjacency
const EDGES: Record<number, number[]> = {
  0: [1, 2],
  1: [3, 4],
  2: [4],
  3: [5],
  4: [3, 5],
  5: [6],
  6: [2],
}

const START = 0

export function GeographyGame() {
  const { recordGame } = useProgress()
  const [visited, setVisited] = useState<number[]>([START])
  const [current, setCurrent] = useState(START)
  const [turn, setTurn] = useState<'you' | 'ai'>('you')
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [log, setLog] = useState<string[]>([
    'Move the token along an arrow to an unvisited vertex. Whoever cannot move loses.',
  ])
  const [mistakes, setMistakes] = useState(0)

  // memoized minimax: can the player to move from `node` force a win?
  const canWin = useCallback((node: number, vis: Set<number>) => {
    const memo = new Map<string, boolean>()
    function rec(n: number, v: Set<number>): boolean {
      const key = `${n}|${[...v].sort((a, b) => a - b).join(',')}`
      const cached = memo.get(key)
      if (cached !== undefined) return cached
      const moves = (EDGES[n] ?? []).filter((m) => !v.has(m))
      let win = false
      for (const m of moves) {
        const nv = new Set(v)
        nv.add(m)
        if (!rec(m, nv)) {
          win = true
          break
        }
      }
      memo.set(key, win)
      return win
    }
    return rec(node, vis)
  }, [])

  const legalMoves = useMemo(
    () => (EDGES[current] ?? []).filter((m) => !visited.includes(m)),
    [current, visited],
  )

  const startIsWin = useMemo(
    () => canWin(START, new Set([START])),
    [canWin],
  )

  function pushLog(line: string) {
    setLog((l) => [...l, line])
  }

  function aiTurn(fromNode: number, vis: number[]) {
    const v = new Set(vis)
    const moves = (EDGES[fromNode] ?? []).filter((m) => !v.has(m))
    if (moves.length === 0) {
      // AI cannot move → you win
      setStatus('won')
      recordGame('geography', { won: true, perfect: mistakes === 0 })
      pushLog('The AI is stuck with nowhere to go. You win!')
      return
    }
    // prefer a move that leaves the opponent (you) unable to win
    let choice = moves[0]
    for (const m of moves) {
      const nv = new Set(v)
      nv.add(m)
      if (!canWin(m, nv)) {
        choice = m
        break
      }
    }
    const nextVis = [...vis, choice]
    setVisited(nextVis)
    setCurrent(choice)
    pushLog(`AI moves to ${NODES[choice].label}.`)
    // does the AI move leave you any move?
    const yourMoves = (EDGES[choice] ?? []).filter((m) => !nextVis.includes(m))
    if (yourMoves.length === 0) {
      setStatus('lost')
      pushLog('You have no legal move. The AI wins this round.')
      return
    }
    setTurn('you')
  }

  function youMove(target: number) {
    if (turn !== 'you' || status !== 'playing') return
    if (!legalMoves.includes(target)) return
    // was this an optimal move?
    const vis = new Set(visited)
    vis.add(target)
    if (canWin(target, vis)) {
      // moving into a position where the *mover from target* (the AI) can win
      setMistakes((m) => m + 1)
    }
    const nextVis = [...visited, target]
    setVisited(nextVis)
    setCurrent(target)
    pushLog(`You move to ${NODES[target].label}.`)
    setTurn('ai')
    // let the AI respond shortly after for readability
    setTimeout(() => aiTurn(target, nextVis), 550)
  }

  function reset() {
    setVisited([START])
    setCurrent(START)
    setTurn('you')
    setStatus('playing')
    setMistakes(0)
    setLog([
      'Move the token along an arrow to an unvisited vertex. Whoever cannot move loses.',
    ])
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Gamepad2 className="size-3.5" /> Generalized Geography
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-mono text-xs',
            turn === 'you' ? 'text-primary' : 'text-accent',
          )}
        >
          {turn === 'you' ? (
            <>
              <User className="size-3.5" /> your move
            </>
          ) : (
            <>
              <Bot className="size-3.5" /> AI thinking…
            </>
          )}
        </span>
      </div>

      {/* board */}
      <div className="bg-grid">
        <svg
          viewBox="0 0 640 280"
          className="h-auto w-full select-none"
          role="img"
          aria-label="Generalized geography game board"
        >
          <defs>
            <marker
              id="gg-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-muted-foreground)" />
            </marker>
          </defs>

          {/* edges */}
          {Object.entries(EDGES).flatMap(([from, tos]) =>
            tos.map((to) => {
              const a = NODES[Number(from)]
              const b = NODES[to]
              const dx = b.x - a.x
              const dy = b.y - a.y
              const len = Math.hypot(dx, dy)
              const ux = dx / len
              const uy = dy / len
              const r = 22
              const isLegal =
                Number(from) === current &&
                turn === 'you' &&
                status === 'playing' &&
                !visited.includes(to)
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x + ux * r}
                  y1={a.y + uy * r}
                  x2={b.x - ux * r}
                  y2={b.y - uy * r}
                  stroke={
                    isLegal
                      ? 'var(--color-primary)'
                      : 'var(--color-muted-foreground)'
                  }
                  strokeWidth={isLegal ? 2.5 : 1.25}
                  strokeOpacity={isLegal ? 1 : 0.4}
                  markerEnd="url(#gg-arrow)"
                />
              )
            }),
          )}

          {/* nodes */}
          {NODES.map((node) => {
            const isCurrent = node.id === current
            const isVisited = visited.includes(node.id)
            const isLegal = legalMoves.includes(node.id) && turn === 'you'
            return (
              <g
                key={node.id}
                onClick={() => isLegal && youMove(node.id)}
                className={isLegal ? 'cursor-pointer' : ''}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill={
                    isCurrent
                      ? 'var(--color-primary)'
                      : isVisited
                        ? 'var(--color-muted)'
                        : 'var(--color-card)'
                  }
                  stroke={
                    isLegal
                      ? 'var(--color-primary)'
                      : isCurrent
                        ? 'var(--color-primary)'
                        : 'var(--color-border)'
                  }
                  strokeWidth={isLegal ? 3 : 1.5}
                  className={isLegal ? 'animate-pulse' : ''}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="font-mono text-sm font-bold"
                  fill={
                    isCurrent
                      ? 'var(--color-primary-foreground)'
                      : isVisited
                        ? 'var(--color-muted-foreground)'
                        : 'var(--color-foreground)'
                  }
                >
                  {node.label}
                </text>
              </g>
            )
          })}

          {/* token marker on current node */}
          <circle
            cx={NODES[current].x}
            cy={NODES[current].y - 34}
            r={5}
            fill="var(--color-accent)"
          />
        </svg>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {startIsWin
              ? 'Theory: the first player (you) has a winning strategy from S.'
              : 'Theory: the second player wins from S with perfect play.'}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-3">
          <ul className="space-y-1 font-mono text-xs leading-relaxed text-foreground/80">
            {log.slice(-5).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        {status === 'won' && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-5 text-center">
            <Trophy className="size-8 text-success" />
            <p className="font-serif text-2xl text-foreground">You win!</p>
            <p className="text-pretty text-sm text-muted-foreground">
              You forced the perfect-playing AI into a dead end
              {mistakes === 0 ? ' without a single misstep.' : '.'} That search
              over alternating moves is exactly why deciding this game is
              PSPACE-complete.
            </p>
            <button
              onClick={reset}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-1.5 text-sm text-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" /> Play again
            </button>
          </div>
        )}

        {status === 'lost' && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-center">
            <Skull className="size-8 text-destructive" />
            <p className="font-serif text-2xl text-foreground">Cornered!</p>
            <p className="text-pretty text-sm text-muted-foreground">
              The AI trapped you. Hint: from S a winning first move exists — work
              backwards from positions where your opponent has no escape.
            </p>
            <button
              onClick={reset}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-1.5 text-sm text-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" /> Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
