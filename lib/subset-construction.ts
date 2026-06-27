import { EPSILON, type Automaton } from './automata'

/** epsilon-closure of a set of NFA state ids */
function epsilonClosure(nfa: Automaton, ids: string[]): string[] {
  const stack = [...ids]
  const seen = new Set(ids)
  while (stack.length) {
    const s = stack.pop() as string
    for (const n of nfa.delta[s]?.[EPSILON] ?? []) {
      if (!seen.has(n)) {
        seen.add(n)
        stack.push(n)
      }
    }
  }
  return [...seen].sort()
}

function move(nfa: Automaton, ids: string[], symbol: string): string[] {
  const out = new Set<string>()
  for (const id of ids) {
    for (const d of nfa.delta[id]?.[symbol] ?? []) out.add(d)
  }
  return [...out]
}

export interface DfaNode {
  /** sorted NFA state ids that make up this DFA state */
  members: string[]
  /** display label like {a,b} */
  label: string
  accept: boolean
}

export interface SubsetStep {
  /** human description of what happened in this step */
  note: string
  /** the DFA state being processed (label), null for the initial step */
  processing: string | null
  /** symbol being followed in this step, if any */
  symbol?: string
  /** the resulting DFA state label produced, if any */
  produced?: string
  /** snapshot of all DFA nodes discovered so far */
  nodes: DfaNode[]
  /** snapshot of DFA transitions discovered: [from,symbol,to] */
  transitions: { from: string; symbol: string; to: string }[]
  /** labels still waiting to be processed after this step */
  queue: string[]
}

const labelOf = (members: string[]) =>
  members.length === 0 ? '∅' : `{${members.join(',')}}`

/**
 * Runs the subset construction on an NFA and records every step so the UI can
 * animate the worklist algorithm exactly as it appears in Sipser.
 */
export function subsetConstruction(nfa: Automaton): SubsetStep[] {
  const acceptSet = new Set(
    nfa.states.filter((s) => s.accept).map((s) => s.id),
  )
  const symbols = nfa.alphabet
  const steps: SubsetStep[] = []

  const nodes: DfaNode[] = []
  const transitions: { from: string; symbol: string; to: string }[] = []
  const byLabel = new Map<string, DfaNode>()
  const queue: string[] = []

  function ensure(members: string[]): string {
    const label = labelOf(members)
    if (!byLabel.has(label)) {
      const node: DfaNode = {
        members,
        label,
        accept: members.some((m) => acceptSet.has(m)),
      }
      byLabel.set(label, node)
      nodes.push(node)
      queue.push(label)
    }
    return label
  }

  const startMembers = epsilonClosure(nfa, [nfa.start])
  const startLabel = ensure(startMembers)

  steps.push({
    note: `Start DFA state = ε-closure of {${nfa.start}} = ${startLabel}. Add it to the worklist.`,
    processing: null,
    produced: startLabel,
    nodes: nodes.map((n) => ({ ...n })),
    transitions: [...transitions],
    queue: [...queue],
  })

  while (queue.length) {
    const label = queue.shift() as string
    const node = byLabel.get(label)!
    for (const symbol of symbols) {
      const reached = epsilonClosure(nfa, move(nfa, node.members, symbol))
      const toLabel = ensure(reached)
      transitions.push({ from: label, symbol, to: toLabel })
      const isNew =
        byLabel.get(toLabel)!.members === reached &&
        queue.includes(toLabel)
      steps.push({
        note: `From ${label}, read '${symbol}': move then ε-close → ${toLabel}.${
          isNew ? ' This is a new DFA state — enqueue it.' : ''
        }`,
        processing: label,
        symbol,
        produced: toLabel,
        nodes: nodes.map((n) => ({ ...n })),
        transitions: [...transitions],
        queue: [...queue],
      })
    }
  }

  steps.push({
    note: `Done. The worklist is empty, so every reachable subset has been processed. The DFA has ${nodes.length} states.`,
    processing: null,
    nodes: nodes.map((n) => ({ ...n })),
    transitions: [...transitions],
    queue: [],
  })

  return steps
}
