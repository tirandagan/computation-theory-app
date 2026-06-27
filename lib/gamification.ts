import {
  Award,
  Flame,
  Brain,
  Zap,
  Target,
  Trophy,
  Swords,
  Crown,
  Sparkles,
  GraduationCap,
  Gamepad2,
  Medal,
  type LucideIcon,
} from 'lucide-react'

/**
 * Arcade gamification model. XP is earned for reading topics, acing quizzes,
 * and winning the interactive games. XP maps to levels with named ranks, and
 * badges unlock for specific milestones. All of this is computed from the
 * persisted ProgressState so it survives reloads with no sign-in.
 */

export const XP = {
  topic: 40, // completing a lesson topic
  lab: 60, // visiting an interactive lab topic
  quizPerCorrect: 25, // each correct quiz answer (best attempt)
  quizPerfectBonus: 50, // acing a quiz
  gameWin: 120, // winning a gamified proof game
  gamePerfect: 80, // flawless game bonus
} as const

/** Named ranks. Each level needs `level * 250` cumulative XP to reach. */
export const RANKS = [
  'Novice',
  'Apprentice',
  'Automaton',
  'Logician',
  'Theorist',
  'Complexity Knight',
  'Reduction Master',
  'Grand Theorist',
] as const

/** XP required to *complete* a given level (1-indexed). */
export function xpForLevel(level: number): number {
  return level * 250
}

export interface LevelInfo {
  level: number
  rank: string
  intoLevel: number // xp earned into the current level
  span: number // xp needed to clear the current level
  progress: number // 0..1 fraction through the current level
  total: number // cumulative xp
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1
  let remaining = totalXp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  const span = xpForLevel(level)
  return {
    level,
    rank: RANKS[Math.min(level - 1, RANKS.length - 1)],
    intoLevel: remaining,
    span,
    progress: span === 0 ? 0 : remaining / span,
    total: totalXp,
  }
}

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: LucideIcon
  /** evaluated against a derived stats object */
  test: (s: BadgeStats) => boolean
}

export interface BadgeStats {
  completedCount: number
  perfectQuizzes: number
  totalCorrect: number
  streak: number
  level: number
  gamesWon: number
  pumpingWins: number
  geographyWins: number
  diagonalWins: number
  labsVisited: number
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first topic.',
    icon: Sparkles,
    test: (s) => s.completedCount >= 1,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 10 topics.',
    icon: GraduationCap,
    test: (s) => s.completedCount >= 10,
  },
  {
    id: 'half-way',
    name: 'Trailblazer',
    description: 'Complete 25 topics.',
    icon: Target,
    test: (s) => s.completedCount >= 25,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Ace 5 quizzes with a perfect score.',
    icon: Award,
    test: (s) => s.perfectQuizzes >= 5,
  },
  {
    id: 'sharp-mind',
    name: 'Sharp Mind',
    description: 'Answer 40 quiz questions correctly.',
    icon: Brain,
    test: (s) => s.totalCorrect >= 40,
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Reach a 3-day study streak.',
    icon: Flame,
    test: (s) => s.streak >= 3,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Reach a 7-day study streak.',
    icon: Zap,
    test: (s) => s.streak >= 7,
  },
  {
    id: 'pumping-master',
    name: 'Pumping Master',
    description: 'Defeat the adversary in the Pumping Lemma game.',
    icon: Swords,
    test: (s) => s.pumpingWins >= 1,
  },
  {
    id: 'geographer',
    name: 'Geographer',
    description: 'Win a game of Generalized Geography.',
    icon: Gamepad2,
    test: (s) => s.geographyWins >= 1,
  },
  {
    id: 'diagonalizer',
    name: 'Diagonalizer',
    description: 'Construct a contradiction in the Diagonalization game.',
    icon: Medal,
    test: (s) => s.diagonalWins >= 1,
  },
  {
    id: 'game-master',
    name: 'Game Master',
    description: 'Win all three proof games.',
    icon: Trophy,
    test: (s) => s.pumpingWins >= 1 && s.geographyWins >= 1 && s.diagonalWins >= 1,
  },
  {
    id: 'grand-theorist',
    name: 'Grand Theorist',
    description: 'Reach level 8 — the highest rank.',
    icon: Crown,
    test: (s) => s.level >= 8,
  },
]

export function earnedBadges(stats: BadgeStats): string[] {
  return BADGES.filter((b) => b.test(stats)).map((b) => b.id)
}
