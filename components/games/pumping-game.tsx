'use client'

import { useMemo, useState } from 'react'
import { Swords, Shield, Zap, RotateCcw, Trophy } from 'lucide-react'
import { useProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'

/**
 * Pumping Lemma Adversary Battle.
 *
 * The pumping lemma proof of non-regularity *is* a two-player game:
 *   1. The Adversary (defending "L is regular") commits to a pumping length p.
 *   2. The Prover (you) picks a string s in L with |s| ≥ p.
 *   3. The Adversary splits s = xyz with |xy| ≤ p and |y| ≥ 1.
 *   4. The Prover picks a pump exponent i so that x·yⁱ·z is NOT in L.
 * Because each language here is non-regular, the Prover can always win — the
 * game makes that inevitability concrete.
 */

interface Lang {
  id: string
  name: string
  desc: string
  /** canonical witness string of "size" n (the Prover's safe choice) */
  witness: (n: number) => string
  /** membership test used to resolve a pumped string */
  member: (s: string) => boolean
}

const LANGS: Lang[] = [
  {
    id: 'eq',
    name: '0ⁿ1ⁿ',
    desc: 'equal blocks of 0s then 1s',
    witness: (n) => '0'.repeat(n) + '1'.repeat(n),
    member: (s) =>
      /^0*1*$/.test(s) &&
      (s.match(/0/g)?.length ?? 0) === (s.match(/1/g)?.length ?? 0),
  },
  {
    id: 'ww',
    name: 'ww',
    desc: 'a string repeated twice',
    witness: (n) => {
      const w = '0'.repeat(n) + '1'
      return w + w
    },
    member: (s) =>
      s.length % 2 === 0 &&
      s.slice(0, s.length / 2) === s.slice(s.length / 2),
  },
]

interface Split {
  x: string
  y: string
  z: string
}

const ROUNDS = 3

export function PumpingGame() {
  const { recordGame } = useProgress()
  const [langId, setLangId] = useState(LANGS[0].id)
  const lang = useMemo(() => LANGS.find((l) => l.id === langId)!, [langId])

  const [round, setRound] = useState(1)
  const [p, setP] = useState(3)
  const [n, setN] = useState(3)
  const [split, setSplit] = useState<Split | null>(null)
  const [phase, setPhase] = useState<'choose' | 'split' | 'pump' | 'resolved'>(
    'choose',
  )
  const [log, setLog] = useState<string[]>([
    'The adversary commits to a pumping length p (shown below). Beat them.',
  ])
  const [wins, setWins] = useState(0)
  const [flawless, setFlawless] = useState(true)
  const [matchOver, setMatchOver] = useState(false)
  const [lastResult, setLastResult] = useState<null | 'win' | 'fail'>(null)

  // re-seed p when the displayed log's first line should match
  const s = lang.witness(n)
  const sLongEnough = s.length >= p

  function pushLog(line: string) {
    setLog((l) => [...l, line])
  }

  function commitString() {
    if (!sLongEnough) return
    setPhase('split')
    pushLog(`You submit s = ${s} (length ${s.length} ≥ ${p}). ✓ in ${lang.name}`)
  }

  function adversarySplits() {
    // Adversary must keep y inside the first p symbols (|xy| ≤ p, |y| ≥ 1).
    // It picks the "meanest" legal split it can — but for a non-regular
    // language every legal split is still breakable.
    const yLen = 1 + Math.floor(Math.random() * Math.min(2, p - 0))
    const xLen = Math.floor(Math.random() * (p - yLen + 1))
    const sp: Split = {
      x: s.slice(0, xLen),
      y: s.slice(xLen, xLen + yLen),
      z: s.slice(xLen + yLen),
    }
    setSplit(sp)
    setPhase('pump')
    pushLog(
      `Adversary splits: x="${sp.x || 'ε'}", y="${sp.y}", z="${sp.z || 'ε'}".`,
    )
  }

  function pump(i: number) {
    if (!split) return
    const pumped = split.x + split.y.repeat(i) + split.z
    const stillIn = lang.member(pumped)
    if (stillIn) {
      // i = 1 (or an unlucky pick) keeps it in L — not a knockout.
      setFlawless(false)
      pushLog(
        `xy${sup(i)}z = ${pumped || 'ε'} — still in ${lang.name}. The adversary survives. Try i ≠ 1.`,
      )
      setLastResult('fail')
      return
    }
    // broke it!
    pushLog(
      `xy${sup(i)}z = ${pumped || 'ε'} — NOT in ${lang.name}. Contradiction! Round won.`,
    )
    setLastResult('win')
    const newWins = wins + 1
    setWins(newWins)
    if (round >= ROUNDS) {
      setMatchOver(true)
      setPhase('resolved')
      recordGame('pumping', { won: true, score: newWins, perfect: flawless })
      pushLog('You proved non-regularity every round. Match won!')
    } else {
      setPhase('resolved')
    }
  }

  function nextRound() {
    const np = p + 1 + Math.floor(Math.random() * 2)
    setRound((r) => r + 1)
    setP(np)
    setN(Math.max(np, 3))
    setSplit(null)
    setLastResult(null)
    setPhase('choose')
    pushLog(`— Round ${round + 1} — Adversary commits to p = ${np}.`)
  }

  function restart() {
    const np = 2 + Math.floor(Math.random() * 2)
    setRound(1)
    setP(np)
    setN(3)
    setSplit(null)
    setPhase('choose')
    setWins(0)
    setFlawless(true)
    setMatchOver(false)
    setLastResult(null)
    setLog([`Adversary commits to pumping length p = ${np}.`])
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      {/* arena header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Swords className="size-3.5" /> Pumping Lemma Battle
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          Round {Math.min(round, ROUNDS)}/{ROUNDS} · Wins {wins}
        </span>
      </div>

      {/* combatants */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <Combatant
          side="You (Prover)"
          subtitle="Claim: L is NOT regular"
          icon={<Zap className="size-5" />}
          tone="primary"
          active={phase !== 'split'}
        />
        <Combatant
          side="Adversary"
          subtitle="Defends: L is regular"
          icon={<Shield className="size-5" />}
          tone="accent"
          active={phase === 'split'}
        />
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* language picker (only before the match starts moving) */}
        {round === 1 && phase === 'choose' && wins === 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Choose the battlefield (a non-regular language)
            </p>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLangId(l.id)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-left text-sm transition-colors',
                    l.id === langId
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span className="font-mono text-primary">{l.name}</span>{' '}
                  <span className="text-xs">— {l.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* the adversary's p */}
        <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <Shield className="size-4 shrink-0 text-accent" />
          <p className="text-sm text-foreground/90">
            Adversary&apos;s pumping length:{' '}
            <span className="font-mono font-bold text-accent">p = {p}</span>
          </p>
        </div>

        {/* phase: choose s */}
        {phase === 'choose' && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-muted-foreground">
              Pick a string s ∈ {lang.name} with |s| ≥ p by choosing n:
            </p>
            <input
              type="range"
              min={1}
              max={8}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
            <StringRibbon s={s} highlightUpTo={-1} />
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'font-mono text-xs',
                  sLongEnough ? 'text-success' : 'text-destructive',
                )}
              >
                |s| = {s.length} {sLongEnough ? '≥' : '<'} p = {p}{' '}
                {sLongEnough ? '✓' : '— too short!'}
              </span>
              <button
                disabled={!sLongEnough}
                onClick={commitString}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
              >
                Submit s
              </button>
            </div>
          </div>
        )}

        {/* phase: adversary splits */}
        {phase === 'split' && (
          <div className="space-y-3">
            <StringRibbon s={s} highlightUpTo={p} />
            <p className="font-mono text-xs text-muted-foreground">
              The adversary will split s = xyz inside the first p symbols.
            </p>
            <button
              onClick={adversarySplits}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent"
            >
              <Shield className="size-4" /> Let the adversary split
            </button>
          </div>
        )}

        {/* phase: pump */}
        {(phase === 'pump' || phase === 'resolved') && split && (
          <div className="space-y-3">
            <SplitRibbon split={split} />
            {phase === 'pump' && (
              <>
                <p className="font-mono text-xs text-muted-foreground">
                  Choose a pump exponent i to launch your attack (i = 1 leaves s
                  unchanged):
                </p>
                <div className="flex flex-wrap gap-2">
                  {[0, 2, 3].map((i) => (
                    <button
                      key={i}
                      onClick={() => pump(i)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
                    >
                      <Zap className="size-4" /> Pump i = {i}
                    </button>
                  ))}
                </div>
                {lastResult === 'fail' && (
                  <p className="font-mono text-xs text-destructive">
                    That kept it in the language — pick a different i.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* battle log */}
        <div className="rounded-xl border border-border bg-background/50 p-3">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Battle log
          </p>
          <ul className="space-y-1 font-mono text-xs leading-relaxed text-foreground/80">
            {log.slice(-6).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        {/* round / match controls */}
        {phase === 'resolved' && !matchOver && (
          <button
            onClick={nextRound}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Next round → (adversary powers up)
          </button>
        )}

        {matchOver && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-5 text-center">
            <Trophy className="size-8 text-success" />
            <p className="font-serif text-2xl text-foreground">Victory!</p>
            <p className="text-pretty text-sm text-muted-foreground">
              You proved {lang.name} is non-regular {wins} rounds running
              {flawless ? ' — flawlessly!' : '.'} The pumping lemma never fails
              the Prover against a non-regular language.
            </p>
            <button
              onClick={restart}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-1.5 text-sm text-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" /> Play again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function sup(i: number): string {
  const map: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
  }
  return String(i)
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
}

function Combatant({
  side,
  subtitle,
  icon,
  tone,
  active,
}: {
  side: string
  subtitle: string
  icon: React.ReactNode
  tone: 'primary' | 'accent'
  active: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-card px-4 py-3 transition-opacity',
        active ? 'opacity-100' : 'opacity-50',
      )}
    >
      <span
        className={cn(
          'grid size-10 place-items-center rounded-xl',
          tone === 'primary'
            ? 'bg-primary/20 text-primary'
            : 'bg-accent/20 text-accent',
          active && tone === 'primary' && 'glow-primary',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{side}</p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function StringRibbon({
  s,
  highlightUpTo,
}: {
  s: string
  highlightUpTo: number
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {[...s].map((c, i) => (
        <span
          key={i}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md border font-mono text-sm',
            highlightUpTo >= 0 && i < highlightUpTo
              ? 'border-accent/50 bg-accent/10 text-accent'
              : 'border-border bg-muted text-foreground',
          )}
        >
          {c}
        </span>
      ))}
      {highlightUpTo > 0 && (
        <span className="ml-1 self-center font-mono text-[10px] text-accent">
          ← first p
        </span>
      )}
    </div>
  )
}

function SplitRibbon({ split }: { split: Split }) {
  const parts: { c: string; part: 'x' | 'y' | 'z' }[] = [
    ...[...split.x].map((c) => ({ c, part: 'x' as const })),
    ...[...split.y].map((c) => ({ c, part: 'y' as const })),
    ...[...split.z].map((c) => ({ c, part: 'z' as const })),
  ]
  return (
    <div>
      <div className="mb-2 flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-chart-2">x</span>
        <span className="text-primary">y (your target)</span>
        <span className="text-muted-foreground">z</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {parts.map((p, i) => (
          <span
            key={i}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md border font-mono text-base',
              p.part === 'y'
                ? 'border-primary bg-primary/20 text-primary'
                : p.part === 'x'
                  ? 'border-chart-2/50 bg-chart-2/10 text-chart-2'
                  : 'border-border bg-muted text-muted-foreground',
            )}
          >
            {p.c}
          </span>
        ))}
      </div>
    </div>
  )
}
