'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { allTopics } from './curriculum'
import {
  levelFromXp,
  earnedBadges,
  XP,
  type BadgeStats,
  type LevelInfo,
} from './gamification'

/**
 * Shared client-side progress + gamification store backed by localStorage.
 * Exposed through React Context so the HUD, lessons, quizzes, and arcade
 * games all read and mutate one synchronized source of truth. Zero-friction:
 * no sign-in, survives reloads.
 */

const KEY = 'automata-progress-v1'

export interface GameResult {
  won: boolean
  bestScore: number
  perfect: boolean
}

export interface ProgressState {
  completed: string[]
  scores: Record<string, { correct: number; total: number }>
  studyDays: string[]
  lastTopic: string | null
  games: Record<string, GameResult>
  /** badge ids already celebrated, so we only toast new unlocks */
  seenBadges: string[]
}

const EMPTY: ProgressState = {
  completed: [],
  scores: {},
  studyDays: [],
  lastTopic: null,
  games: {},
  seenBadges: [],
}

/** topic ids that are interactive labs/games (earn the lab XP rate) */
const LAB_TOPIC_IDS = new Set(
  allTopics()
    .filter(({ topic }) => Boolean(topic.lab))
    .map(({ topic }) => topic.id),
)

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function load(): ProgressState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      completed: parsed.completed ?? [],
      scores: parsed.scores ?? {},
      studyDays: parsed.studyDays ?? [],
      lastTopic: parsed.lastTopic ?? null,
      games: parsed.games ?? {},
      seenBadges: parsed.seenBadges ?? [],
    }
  } catch {
    return EMPTY
  }
}

function save(state: ProgressState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function computeStreak(days: string[]): number {
  if (days.length === 0) return 0
  const set = new Set(days)
  const cursor = new Date()
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!set.has(cursor.toISOString().slice(0, 10))) return 0
  }
  let streak = 0
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function computeXp(state: ProgressState): number {
  let xp = 0
  for (const id of state.completed) {
    xp += LAB_TOPIC_IDS.has(id) ? XP.lab : XP.topic
  }
  for (const score of Object.values(state.scores)) {
    xp += score.correct * XP.quizPerCorrect
    if (score.total > 0 && score.correct === score.total) {
      xp += XP.quizPerfectBonus
    }
  }
  for (const g of Object.values(state.games)) {
    if (g.won) {
      xp += XP.gameWin
      if (g.perfect) xp += XP.gamePerfect
    }
  }
  return xp
}

export function computeStats(state: ProgressState): BadgeStats {
  const streak = computeStreak(state.studyDays)
  const level = levelFromXp(computeXp(state)).level
  const scores = Object.values(state.scores)
  return {
    completedCount: state.completed.length,
    perfectQuizzes: scores.filter((s) => s.total > 0 && s.correct === s.total)
      .length,
    totalCorrect: scores.reduce((n, s) => n + s.correct, 0),
    streak,
    level,
    gamesWon: Object.values(state.games).filter((g) => g.won).length,
    pumpingWins: state.games['pumping']?.won ? 1 : 0,
    geographyWins: state.games['geography']?.won ? 1 : 0,
    diagonalWins: state.games['diagonal']?.won ? 1 : 0,
    labsVisited: state.completed.filter((id) => LAB_TOPIC_IDS.has(id)).length,
  }
}

interface ProgressContextValue {
  ready: boolean
  completed: string[]
  scores: ProgressState['scores']
  games: ProgressState['games']
  streak: number
  studyDays: string[]
  lastTopic: string | null
  xp: number
  levelInfo: LevelInfo
  stats: BadgeStats
  badges: string[]
  /** badges unlocked but not yet acknowledged (for toasts) */
  unseenBadges: string[]
  complete: (topicId: string) => void
  markStudiedToday: () => void
  recordScore: (exerciseId: string, correct: number, total: number) => void
  recordGame: (
    gameId: string,
    result: { won: boolean; score?: number; perfect?: boolean },
  ) => void
  setLastTopic: (topicId: string) => void
  acknowledgeBadges: () => void
  reset: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(load())
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) save(state)
  }, [state, ready])

  const markStudiedToday = useCallback(() => {
    setState((s) => {
      const day = todayKey()
      if (s.studyDays.includes(day)) return s
      return { ...s, studyDays: [...s.studyDays, day] }
    })
  }, [])

  const complete = useCallback((topicId: string) => {
    setState((s) => {
      const day = todayKey()
      const studyDays = s.studyDays.includes(day)
        ? s.studyDays
        : [...s.studyDays, day]
      if (s.completed.includes(topicId)) return { ...s, studyDays }
      return { ...s, completed: [...s.completed, topicId], studyDays }
    })
  }, [])

  const recordScore = useCallback(
    (exerciseId: string, correct: number, total: number) => {
      setState((s) => {
        const prev = s.scores[exerciseId]
        if (prev && prev.correct >= correct) return s
        const day = todayKey()
        const studyDays = s.studyDays.includes(day)
          ? s.studyDays
          : [...s.studyDays, day]
        return {
          ...s,
          scores: { ...s.scores, [exerciseId]: { correct, total } },
          studyDays,
        }
      })
    },
    [],
  )

  const recordGame = useCallback(
    (
      gameId: string,
      result: { won: boolean; score?: number; perfect?: boolean },
    ) => {
      setState((s) => {
        const prev = s.games[gameId]
        const bestScore = Math.max(prev?.bestScore ?? 0, result.score ?? 0)
        const won = (prev?.won ?? false) || result.won
        const perfect = (prev?.perfect ?? false) || Boolean(result.perfect)
        const day = todayKey()
        const studyDays = s.studyDays.includes(day)
          ? s.studyDays
          : [...s.studyDays, day]
        return {
          ...s,
          games: { ...s.games, [gameId]: { won, bestScore, perfect } },
          studyDays,
        }
      })
    },
    [],
  )

  const setLastTopic = useCallback((topicId: string) => {
    setState((s) => (s.lastTopic === topicId ? s : { ...s, lastTopic: topicId }))
  }, [])

  const xp = useMemo(() => computeXp(state), [state])
  const levelInfo = useMemo(() => levelFromXp(xp), [xp])
  const stats = useMemo(() => computeStats(state), [state])
  const badges = useMemo(() => earnedBadges(stats), [stats])
  const unseenBadges = useMemo(
    () => badges.filter((b) => !state.seenBadges.includes(b)),
    [badges, state.seenBadges],
  )

  const acknowledgeBadges = useCallback(() => {
    setState((s) => {
      const current = earnedBadges(computeStats(s))
      const missing = current.filter((b) => !s.seenBadges.includes(b))
      if (missing.length === 0) return s
      return { ...s, seenBadges: [...s.seenBadges, ...missing] }
    })
  }, [])

  const reset = useCallback(() => setState(EMPTY), [])

  const value: ProgressContextValue = {
    ready,
    completed: state.completed,
    scores: state.scores,
    games: state.games,
    streak: computeStreak(state.studyDays),
    studyDays: state.studyDays,
    lastTopic: state.lastTopic,
    xp,
    levelInfo,
    stats,
    badges,
    unseenBadges,
    complete,
    markStudiedToday,
    recordScore,
    recordGame,
    setLastTopic,
    acknowledgeBadges,
    reset,
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return ctx
}
