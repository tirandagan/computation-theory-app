/**
 * A tiny context-free grammar engine: leftmost-derivation search via CYK-style
 * bounded BFS, plus a parse-tree builder for display. Kept intentionally small
 * and grammar-specific to the curated examples so it always terminates quickly.
 */

export interface Grammar {
  id: string
  name: string
  description: string
  start: string
  variables: string[]
  terminals: string[]
  /** variable -> list of right-hand sides; each rhs is a list of symbols, [] = ε */
  rules: Record<string, string[][]>
  examples: string[]
}

export interface ParseNode {
  symbol: string
  children?: ParseNode[]
}

export interface DerivationStep {
  /** the sentential form after this step, as a list of symbols */
  form: string[]
  /** index in the previous form that was expanded */
  expanded: number
  /** the variable that was rewritten */
  variable: string
  /** the production used, as a readable string */
  production: string
}

const isVar = (g: Grammar, s: string) => g.variables.includes(s)

/**
 * Attempt to derive `target` from the start symbol using a bounded DFS over
 * leftmost derivations. Returns the derivation steps and a parse tree, or null.
 */
export function deriveLeftmost(
  g: Grammar,
  target: string,
): { steps: DerivationStep[]; tree: ParseNode } | null {
  const terminals = [...target]
  const maxLen = terminals.length
  const maxDepth = maxLen * 2 + 12

  // DFS returning the parse tree for `node.symbol` consuming target[i..j)
  // Memo to keep it fast.
  const memo = new Map<string, ParseNode | null>()

  function parse(symbol: string, i: number, j: number, depth: number): ParseNode | null {
    if (depth > maxDepth) return null
    const key = `${symbol}|${i}|${j}`
    if (memo.has(key)) return memo.get(key)!

    if (!isVar(g, symbol)) {
      // terminal must match exactly one char (or ε if i==j and symbol==='ε')
      const ok = j - i === 1 && target[i] === symbol
      const res = ok ? { symbol } : null
      memo.set(key, res)
      return res
    }

    for (const rhs of g.rules[symbol] ?? []) {
      const tree = parseSeq(rhs, i, j, depth + 1)
      if (tree) {
        const node: ParseNode = {
          symbol,
          children: tree.length ? tree : [{ symbol: 'ε' }],
        }
        memo.set(key, node)
        return node
      }
    }
    memo.set(key, null)
    return null
  }

  function parseSeq(
    seq: string[],
    i: number,
    j: number,
    depth: number,
  ): ParseNode[] | null {
    if (seq.length === 0) return i === j ? [] : null
    const [head, ...rest] = seq
    if (rest.length === 0) {
      const node = parse(head, i, j, depth)
      return node ? [node] : null
    }
    // try every split point for head consuming [i..k)
    for (let k = i; k <= j; k++) {
      const headNode = parse(head, i, k, depth)
      if (!headNode) continue
      const restNodes = parseSeq(rest, k, j, depth)
      if (restNodes) return [headNode, ...restNodes]
    }
    return null
  }

  const tree = parse(g.start, 0, maxLen, 0)
  if (!tree) return null

  // Build a leftmost derivation by maintaining a frontier of tree nodes.
  // Each step expands the leftmost not-yet-expanded variable node.
  const steps: DerivationStep[] = []

  const formOf = (frontier: ParseNode[]) =>
    frontier.map((n) => n.symbol).filter((s) => s !== 'ε')

  let frontier: ParseNode[] = [tree]
  // record the very first sentential form (just the start symbol)
  steps.push({
    form: [g.start],
    expanded: 0,
    variable: g.start,
    production: `start: ${g.start}`,
  })

  while (true) {
    const idx = frontier.findIndex((n) => n.children && n.children.length > 0)
    if (idx === -1) break
    const node = frontier[idx]
    const kids = node.children!
    const rhs = kids.map((c) => c.symbol)
    frontier = [...frontier.slice(0, idx), ...kids, ...frontier.slice(idx + 1)]
    steps.push({
      form: formOf(frontier),
      expanded: idx,
      variable: node.symbol,
      production: `${node.symbol} → ${rhs.join(' ') || 'ε'}`,
    })
  }

  return { steps, tree }
}

export const GRAMMARS: Grammar[] = [
  {
    id: 'anbn',
    name: '0ⁿ1ⁿ',
    description: 'Equal numbers of 0s then 1s — the classic non-regular language.',
    start: 'S',
    variables: ['S'],
    terminals: ['0', '1'],
    rules: { S: [['0', 'S', '1'], []] },
    examples: ['0011', '000111', '01'],
  },
  {
    id: 'balanced',
    name: 'Balanced parentheses',
    description: 'Well-nested strings of ( and ).',
    start: 'S',
    variables: ['S'],
    terminals: ['(', ')'],
    rules: { S: [['S', 'S'], ['(', 'S', ')'], []] },
    examples: ['()', '(())', '()()', '(()())'],
  },
  {
    id: 'palindrome',
    name: 'Even palindromes',
    description: 'Even-length palindromes over {a,b} (w wᴿ).',
    start: 'S',
    variables: ['S'],
    terminals: ['a', 'b'],
    rules: { S: [['a', 'S', 'a'], ['b', 'S', 'b'], []] },
    examples: ['aa', 'abba', 'baab', 'aabbaa'],
  },
]
