/**
 * Post Correspondence Problem: given a set of dominoes (top/bottom string
 * pairs), find a non-empty sequence (repetition allowed) whose concatenated
 * tops equal its concatenated bottoms. Undecidable in general; here we provide
 * curated instances plus a bounded BFS solver for the "reveal solution" button.
 */

export interface Domino {
  top: string
  bottom: string
}

export interface PcpInstance {
  id: string
  name: string
  description: string
  dominoes: Domino[]
  /** whether a match exists (for curated instances) */
  solvable: boolean
}

/** does string a start with b, or b start with a? returns the leftover + side */
function compatible(top: string, bottom: string): boolean {
  const min = Math.min(top.length, bottom.length)
  return top.slice(0, min) === bottom.slice(0, min)
}

/**
 * Bounded breadth-first search for a matching sequence. Returns indices into
 * `dominoes`, or null if none is found within the limits.
 */
export function solvePcp(
  dominoes: Domino[],
  maxDepth = 14,
  maxNodes = 200_000,
): number[] | null {
  // state: the current "overhang" — the surplus string and which side it's on
  // We track (diff, side) where side = 'top' means top is ahead.
  interface Node {
    seq: number[]
    top: string
    bottom: string
  }
  const queue: Node[] = []
  // seed with each domino
  for (let i = 0; i < dominoes.length; i++) {
    const d = dominoes[i]
    if (compatible(d.top, d.bottom)) {
      queue.push({ seq: [i], top: d.top, bottom: d.bottom })
    }
  }

  let nodes = 0
  while (queue.length) {
    const cur = queue.shift() as Node
    nodes++
    if (nodes > maxNodes) return null
    if (cur.top === cur.bottom) return cur.seq
    if (cur.seq.length >= maxDepth) continue

    for (let i = 0; i < dominoes.length; i++) {
      const d = dominoes[i]
      const top = cur.top + d.top
      const bottom = cur.bottom + d.bottom
      if (compatible(top, bottom)) {
        queue.push({ seq: [...cur.seq, i], top, bottom })
      }
    }
  }
  return null
}

/** longest common prefix length of two strings */
export function commonPrefix(a: string, b: string): number {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

export const PCP_INSTANCES: PcpInstance[] = [
  {
    id: 'classic',
    name: 'A solvable classic',
    description:
      'The textbook instance. Try to line the tops and bottoms up by hand before revealing the matching sequence.',
    dominoes: [
      { top: 'a', bottom: 'baa' },
      { top: 'ab', bottom: 'aa' },
      { top: 'bba', bottom: 'bb' },
    ],
    solvable: true,
  },
  {
    id: 'simple',
    name: 'Warm-up',
    description:
      'A short instance whose dominoes interlock into a repeating pattern. A gentle first match.',
    dominoes: [
      { top: '1', bottom: '111' },
      { top: '10111', bottom: '10' },
      { top: '10', bottom: '0' },
    ],
    solvable: true,
  },
  {
    id: 'unsolvable',
    name: 'No match exists',
    description:
      'Every top is strictly longer than its bottom, so the tops can never be caught up to. A reminder that some instances simply have no solution.',
    dominoes: [
      { top: '00', bottom: '0' },
      { top: '11', bottom: '1' },
      { top: '01', bottom: '0' },
    ],
    solvable: false,
  },
]
