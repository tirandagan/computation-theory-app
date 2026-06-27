'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Lightweight client-side progress store backed by localStorage.
 * Tracks which topics are completed, per-exercise best scores, and a
 * day-by-day study streak. This keeps the app delightful and zero-friction
 * (no sign-in) while still surviving reloads.
 */

const KEY = 'automata-progress-v1'

export interface ProgressState {
  /** topic ids the learner has finished reading */
  completed: string[]
  /** exerciseId -> { correct, total } best attempt */
  scores: Record<string, { correct: number; total: number }>
  /** ISO date strings (yyyy-mm-dd) on which the learner studied */
  studyDays: string[]
}

const EMPTY: ProgressState = { completed: [], scores: {}, studyDays: [] }

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

/** Compute the current consecutive-day streak ending today (or yesterday). */
export function computeStreak(days: string[]): number {
  if (days.length === 0) return 0
  const set = new Set(days)
  const cursor = new Date()
  // Allow the streak to "hold" if they studied today OR yesterday.
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

export function useProgress() {
  const [state, setState] = useState<ProgressState>(EMPTY)
  const [ready, setReady] = useState(false)

  // hydrate after mount to avoid SSR mismatch
  useEffect(() => {
    setState(load())
    setReady(true)
  }, [])

  // persist on change (only after hydration)
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

  const complete = useCallback(
    (topicId: string) => {
      setState((s) => {
        const day = todayKey()
        const studyDays = s.studyDays.includes(day)
          ? s.studyDays
          : [...s.studyDays, day]
        if (s.completed.includes(topicId)) return { ...s, studyDays }
        return { ...s, completed: [...s.completed, topicId], studyDays }
      })
    },
    [],
  )

  const recordScore = useCallback(
    (exerciseId: string, correct: number, total: number) => {
      setState((s) => {
        const prev = s.scores[exerciseId]
        // keep the best correct count
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

  const reset = useCallback(() => setState(EMPTY), [])

  return {
    ready,
    completed: state.completed,
    scores: state.scores,
    streak: computeStreak(state.studyDays),
    studyDays: state.studyDays,
    complete,
    markStudiedToday,
    recordScore,
    reset,
  }
}
