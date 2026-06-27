/**
 * CYK (Cocke–Younger–Kasami) parsing on grammars in Chomsky Normal Form.
 * Builds the dynamic-programming table cell by cell so the UI can animate it.
 */

export interface CnfGrammar {
  id: string
  name: string
  description: string
  start: string
  variables: string[]
  terminals: string[]
  /** unit rules: variable -> terminals it can produce directly (A → a) */
  unit: Record<string, string[]>
  /** binary rules: variable -> list of [B, C] pairs (A → B C) */
  binary: Record<string, [string, string][]>
  examples: string[]
}

export interface CykCell {
  /** 0-based start index of the substring */
  i: number
  /** substring length (1-based span) */
  span: number
  /** the set of variables deriving substring s[i..i+span) */
  vars: string[]
}

export interface CykResult {
  input: string
  /** cells in fill order (by increasing span, then left to right) */
  cells: CykCell[]
  accepted: boolean
}

/**
 * Run CYK and return every cell in the order the algorithm fills them
 * (all spans of length 1 first, then length 2, and so on).
 */
export function runCyk(g: CnfGrammar, input: string): CykResult {
  const n = input.length
  // table[span-1][i] = Set of variables
  const table: Set<string>[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => new Set<string>()),
  )
  const cells: CykCell[] = []

  if (n === 0) {
    return { input, cells, accepted: false }
  }

  // span 1: unit rules
  for (let i = 0; i < n; i++) {
    const ch = input[i]
    const vars = new Set<string>()
    for (const v of g.variables) {
      if ((g.unit[v] ?? []).includes(ch)) vars.add(v)
    }
    table[0][i] = vars
    cells.push({ i, span: 1, vars: [...vars] })
  }

  // spans 2..n
  for (let span = 2; span <= n; span++) {
    for (let i = 0; i + span <= n; i++) {
      const vars = new Set<string>()
      // split point: left part length k (1..span-1)
      for (let k = 1; k < span; k++) {
        const left = table[k - 1][i]
        const right = table[span - k - 1][i + k]
        if (!left.size || !right.size) continue
        for (const v of g.variables) {
          for (const [b, c] of g.binary[v] ?? []) {
            if (left.has(b) && right.has(c)) vars.add(v)
          }
        }
      }
      table[span - 1][i] = vars
      cells.push({ i, span, vars: [...vars] })
    }
  }

  const top = table[n - 1][0]
  return { input, cells, accepted: top.has(g.start) }
}

export const CNF_GRAMMARS: CnfGrammar[] = [
  {
    id: 'anbn-cnf',
    name: '0ⁿ1ⁿ (n ≥ 1)',
    description:
      'Equal 0s then 1s, written in Chomsky Normal Form. S → A C | A B, C → S B, A → 0, B → 1.',
    start: 'S',
    variables: ['S', 'C', 'A', 'B'],
    terminals: ['0', '1'],
    unit: { A: ['0'], B: ['1'] },
    binary: {
      S: [
        ['A', 'B'],
        ['A', 'C'],
      ],
      C: [['S', 'B']],
    },
    examples: ['01', '0011', '000111'],
  },
  {
    id: 'balanced-cnf',
    name: 'Balanced brackets',
    description:
      'Non-empty balanced strings of ( and ) in CNF. Captures nesting and concatenation.',
    start: 'S',
    variables: ['S', 'T', 'L', 'R'],
    terminals: ['(', ')'],
    unit: { L: ['('], R: [')'] },
    binary: {
      // S → L R | L T | S S
      S: [
        ['L', 'R'],
        ['L', 'T'],
        ['S', 'S'],
      ],
      // T → S R  (an inner group followed by a closing paren)
      T: [['S', 'R']],
    },
    examples: ['()', '(())', '()()', '(()())'],
  },
]
