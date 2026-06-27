/** A literal: variable index plus whether it is negated. */
export interface Literal {
  varIndex: number
  negated: boolean
}

export type Clause = Literal[]

export interface SatFormula {
  id: string
  name: string
  vars: string[]
  clauses: Clause[]
  satisfiable: boolean
}

export function literalString(f: SatFormula, lit: Literal): string {
  return (lit.negated ? '¬' : '') + f.vars[lit.varIndex]
}

export function clauseString(f: SatFormula, clause: Clause): string {
  return '(' + clause.map((l) => literalString(f, l)).join(' ∨ ') + ')'
}

export function formulaString(f: SatFormula): string {
  return f.clauses.map((c) => clauseString(f, c)).join(' ∧ ')
}

export function clauseSatisfied(clause: Clause, assignment: boolean[]): boolean {
  return clause.some((l) =>
    l.negated ? !assignment[l.varIndex] : assignment[l.varIndex],
  )
}

export function isSatisfied(f: SatFormula, assignment: boolean[]): boolean {
  return f.clauses.every((c) => clauseSatisfied(c, assignment))
}

/** Brute-force search; returns the satisfying assignment and #tried, or null. */
export function bruteForce(
  f: SatFormula,
): { assignment: boolean[] | null; tried: number } {
  const n = f.vars.length
  const total = 2 ** n
  for (let mask = 0; mask < total; mask++) {
    const assignment = Array.from(
      { length: n },
      (_, i) => (mask & (1 << i)) !== 0,
    )
    if (isSatisfied(f, assignment)) return { assignment, tried: mask + 1 }
  }
  return { assignment: null, tried: total }
}

const lit = (varIndex: number, negated = false): Literal => ({
  varIndex,
  negated,
})

export const FORMULAS: SatFormula[] = [
  {
    id: 'sat1',
    name: 'Satisfiable 3-CNF',
    vars: ['x₁', 'x₂', 'x₃'],
    clauses: [
      [lit(0), lit(1, true), lit(2)],
      [lit(0, true), lit(1), lit(2)],
      [lit(0), lit(1), lit(2, true)],
      [lit(0, true), lit(1, true), lit(2, true)],
    ],
    satisfiable: true,
  },
  {
    id: 'unsat',
    name: 'Unsatisfiable',
    vars: ['x₁', 'x₂'],
    clauses: [
      [lit(0), lit(1)],
      [lit(0), lit(1, true)],
      [lit(0, true), lit(1)],
      [lit(0, true), lit(1, true)],
    ],
    satisfiable: false,
  },
  {
    id: 'sat2',
    name: 'Tight 4-variable',
    vars: ['x₁', 'x₂', 'x₃', 'x₄'],
    clauses: [
      [lit(0), lit(1), lit(2, true)],
      [lit(1, true), lit(2), lit(3)],
      [lit(0, true), lit(2, true), lit(3, true)],
      [lit(0), lit(1, true), lit(3)],
      [lit(0, true), lit(1), lit(2)],
    ],
    satisfiable: true,
  },
]
