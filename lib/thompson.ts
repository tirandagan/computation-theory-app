// Thompson's construction: regex -> NFA, recorded as a sequence of build steps.
// Supports symbols, concatenation, union (|), and Kleene star (*), plus
// parentheses. Each step records the fragment built so far so the UI can
// animate the recursive assembly.

export const EPS = 'ε'

export interface TNode {
  id: number
  /** layout column (depth from start), assigned at render time */
  col?: number
  row?: number
}

export interface TEdge {
  from: number
  to: number
  label: string
}

export interface Fragment {
  start: number
  accept: number
  nodes: number[]
  edges: TEdge[]
}

export interface BuildStep {
  /** human description of the rule applied */
  description: string
  /** the regex sub-expression this step realizes */
  expr: string
  /** rule kind for labeling */
  kind: 'symbol' | 'concat' | 'union' | 'star' | 'epsilon'
  fragment: Fragment
}

/* --------------------------- recursive-descent parse ---------------------- */
// Grammar:  union := concat ('|' concat)*
//           concat := star+
//           star := atom '*'?
//           atom := symbol | '(' union ')'

interface ParseState {
  src: string
  pos: number
}

type Ast =
  | { type: 'sym'; value: string }
  | { type: 'concat'; left: Ast; right: Ast }
  | { type: 'union'; left: Ast; right: Ast }
  | { type: 'star'; child: Ast }

function peek(s: ParseState) {
  return s.src[s.pos]
}

function parseUnion(s: ParseState): Ast {
  let left = parseConcat(s)
  while (peek(s) === '|') {
    s.pos++ // consume |
    const right = parseConcat(s)
    left = { type: 'union', left, right }
  }
  return left
}

function parseConcat(s: ParseState): Ast {
  let left = parseStar(s)
  while (peek(s) !== undefined && peek(s) !== '|' && peek(s) !== ')') {
    const right = parseStar(s)
    left = { type: 'concat', left, right }
  }
  return left
}

function parseStar(s: ParseState): Ast {
  let atom = parseAtom(s)
  while (peek(s) === '*') {
    s.pos++ // consume *
    atom = { type: 'star', child: atom }
  }
  return atom
}

function parseAtom(s: ParseState): Ast {
  const c = peek(s)
  if (c === '(') {
    s.pos++ // (
    const inner = parseUnion(s)
    if (peek(s) === ')') s.pos++ // )
    return inner
  }
  // a literal symbol
  s.pos++
  return { type: 'sym', value: c ?? '' }
}

export function parseRegex(src: string): Ast | null {
  const clean = src.replace(/\s+/g, '')
  if (!clean) return null
  const state: ParseState = { src: clean, pos: 0 }
  try {
    const ast = parseUnion(state)
    if (state.pos !== clean.length) return null
    return ast
  } catch {
    return null
  }
}

/* ----------------------------- build with steps --------------------------- */

export function buildThompson(src: string): {
  steps: BuildStep[]
  fragment: Fragment | null
} {
  const ast = parseRegex(src)
  if (!ast) return { steps: [], fragment: null }

  let nextId = 0
  const steps: BuildStep[] = []
  const newNode = () => nextId++

  function exprToString(a: Ast): string {
    switch (a.type) {
      case 'sym':
        return a.value
      case 'concat':
        return exprToString(a.left) + exprToString(a.right)
      case 'union':
        return `${exprToString(a.left)}|${exprToString(a.right)}`
      case 'star': {
        const inner = exprToString(a.child)
        return a.child.type === 'sym' ? `${inner}*` : `(${inner})*`
      }
    }
  }

  function build(a: Ast): Fragment {
    switch (a.type) {
      case 'sym': {
        const start = newNode()
        const accept = newNode()
        const frag: Fragment = {
          start,
          accept,
          nodes: [start, accept],
          edges: [{ from: start, to: accept, label: a.value || EPS }],
        }
        steps.push({
          description: `Base case: a single transition labeled "${a.value || EPS}".`,
          expr: exprToString(a),
          kind: a.value ? 'symbol' : 'epsilon',
          fragment: cloneFrag(frag),
        })
        return frag
      }
      case 'concat': {
        const f1 = build(a.left)
        const f2 = build(a.right)
        // link f1.accept --ε--> f2.start
        const edges = [
          ...f1.edges,
          ...f2.edges,
          { from: f1.accept, to: f2.start, label: EPS },
        ]
        const frag: Fragment = {
          start: f1.start,
          accept: f2.accept,
          nodes: [...f1.nodes, ...f2.nodes],
          edges,
        }
        steps.push({
          description:
            'Concatenation: wire the first fragment’s accept to the second’s start with an ε-move.',
          expr: exprToString(a),
          kind: 'concat',
          fragment: cloneFrag(frag),
        })
        return frag
      }
      case 'union': {
        const f1 = build(a.left)
        const f2 = build(a.right)
        const start = newNode()
        const accept = newNode()
        const edges = [
          ...f1.edges,
          ...f2.edges,
          { from: start, to: f1.start, label: EPS },
          { from: start, to: f2.start, label: EPS },
          { from: f1.accept, to: accept, label: EPS },
          { from: f2.accept, to: accept, label: EPS },
        ]
        const frag: Fragment = {
          start,
          accept,
          nodes: [start, ...f1.nodes, ...f2.nodes, accept],
          edges,
        }
        steps.push({
          description:
            'Union: a new start branches into both fragments with ε-moves; both ends ε-merge into a new accept.',
          expr: exprToString(a),
          kind: 'union',
          fragment: cloneFrag(frag),
        })
        return frag
      }
      case 'star': {
        const f = build(a.child)
        const start = newNode()
        const accept = newNode()
        const edges = [
          ...f.edges,
          { from: start, to: f.start, label: EPS },
          { from: start, to: accept, label: EPS }, // skip
          { from: f.accept, to: f.start, label: EPS }, // loop
          { from: f.accept, to: accept, label: EPS },
        ]
        const frag: Fragment = {
          start,
          accept,
          nodes: [start, ...f.nodes, accept],
          edges,
        }
        steps.push({
          description:
            'Star: add a loop from accept back to start, plus a skip edge so zero repetitions is allowed.',
          expr: exprToString(a),
          kind: 'star',
          fragment: cloneFrag(frag),
        })
        return frag
      }
    }
  }

  const fragment = build(ast)
  return { steps, fragment }
}

function cloneFrag(f: Fragment): Fragment {
  return {
    start: f.start,
    accept: f.accept,
    nodes: [...f.nodes],
    edges: f.edges.map((e) => ({ ...e })),
  }
}

/* ------------------------------ simple layout ----------------------------- */
// Assign columns by longest-path distance from start over the fragment's edges,
// then spread overlapping nodes into rows. Good enough for small NFAs.

export function layoutFragment(
  frag: Fragment,
): Record<number, { x: number; y: number }> {
  const adj = new Map<number, number[]>()
  for (const n of frag.nodes) adj.set(n, [])
  for (const e of frag.edges) adj.get(e.from)?.push(e.to)

  // longest path depth via DFS with memo (graph may have cycles from star;
  // guard with a visited-in-progress set so we don't loop forever)
  const depth = new Map<number, number>()
  const inProgress = new Set<number>()
  function dfs(n: number): number {
    if (depth.has(n)) return depth.get(n) as number
    if (inProgress.has(n)) return 0
    inProgress.add(n)
    let d = 0
    for (const m of adj.get(n) ?? []) {
      if (m === n) continue
      d = Math.max(d, 1 + dfs(m))
    }
    inProgress.delete(n)
    depth.set(n, d)
    return d
  }
  // depth from start = (maxDepth of start) - (depth remaining)
  const maxFromStart = dfs(frag.start)
  const col = new Map<number, number>()
  for (const n of frag.nodes) {
    col.set(n, maxFromStart - dfs(n))
  }
  // group by column, assign rows
  const byCol = new Map<number, number[]>()
  for (const n of frag.nodes) {
    const c = col.get(n) ?? 0
    if (!byCol.has(c)) byCol.set(c, [])
    byCol.get(c)?.push(n)
  }
  const pos: Record<number, { x: number; y: number }> = {}
  const colGap = 110
  const rowGap = 70
  for (const [c, nodes] of byCol) {
    nodes.forEach((n, i) => {
      const offset = (i - (nodes.length - 1) / 2) * rowGap
      pos[n] = { x: 60 + c * colGap, y: 160 + offset }
    })
  }
  return pos
}
