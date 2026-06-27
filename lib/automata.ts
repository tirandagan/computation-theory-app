export const EPSILON = 'ε'

export interface AutoState {
  id: string
  x: number
  y: number
  accept?: boolean
}

export interface AutoEdge {
  from: string
  to: string
  /** symbols shown on this edge (already grouped) */
  label: string
}

export interface Automaton {
  id: string
  name: string
  description: string
  /** Plain-English language this machine recognizes. */
  language: string
  alphabet: string[]
  start: string
  states: AutoState[]
  edges: AutoEdge[]
  /** delta[stateId][symbol] -> list of destination states */
  delta: Record<string, Record<string, string[]>>
  nondeterministic?: boolean
}

export interface RunStep {
  /** symbols consumed so far */
  consumed: number
  /** the symbol that triggered this step (undefined for the initial step) */
  symbol?: string
  /** active states after this step */
  active: string[]
}

/** epsilon-closure of a set of states */
function epsilonClosure(
  automaton: Automaton,
  states: string[],
): string[] {
  const stack = [...states]
  const seen = new Set(states)
  while (stack.length) {
    const s = stack.pop() as string
    const next = automaton.delta[s]?.[EPSILON] ?? []
    for (const n of next) {
      if (!seen.has(n)) {
        seen.add(n)
        stack.push(n)
      }
    }
  }
  return [...seen]
}

/**
 * Runs an automaton over the input and returns the full trace of active
 * state sets. Works for both DFAs and NFAs (with ε-moves).
 */
export function runAutomaton(automaton: Automaton, input: string): RunStep[] {
  let active = epsilonClosure(automaton, [automaton.start])
  const steps: RunStep[] = [{ consumed: 0, active }]

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i]
    const next = new Set<string>()
    for (const state of active) {
      const dests = automaton.delta[state]?.[symbol] ?? []
      for (const d of dests) next.add(d)
    }
    active = epsilonClosure(automaton, [...next])
    steps.push({ consumed: i + 1, symbol, active })
  }
  return steps
}

export function isAccepting(automaton: Automaton, active: string[]): boolean {
  const accepts = new Set(
    automaton.states.filter((s) => s.accept).map((s) => s.id),
  )
  return active.some((id) => accepts.has(id))
}

export function validInput(automaton: Automaton, input: string): boolean {
  return [...input].every((c) => automaton.alphabet.includes(c))
}

/* ----------------------------- example machines ---------------------------- */

const DFA_EVEN_ZEROS: Automaton = {
  id: 'even-zeros',
  name: 'Even number of 0s',
  description:
    'Accepts exactly the binary strings that contain an even number of 0s.',
  language: 'Strings over {0,1} with an even count of 0s',
  alphabet: ['0', '1'],
  start: 'even',
  states: [
    { id: 'even', x: 150, y: 150, accept: true },
    { id: 'odd', x: 420, y: 150 },
  ],
  edges: [
    { from: 'even', to: 'odd', label: '0' },
    { from: 'odd', to: 'even', label: '0' },
    { from: 'even', to: 'even', label: '1' },
    { from: 'odd', to: 'odd', label: '1' },
  ],
  delta: {
    even: { '0': ['odd'], '1': ['even'] },
    odd: { '0': ['even'], '1': ['odd'] },
  },
}

const DFA_ENDS_01: Automaton = {
  id: 'ends-01',
  name: 'Ends with 01',
  description: 'Accepts every binary string whose last two symbols are 0 then 1.',
  language: 'Strings over {0,1} ending in 01',
  alphabet: ['0', '1'],
  start: 'q0',
  states: [
    { id: 'q0', x: 110, y: 220 },
    { id: 'q1', x: 320, y: 110 },
    { id: 'q2', x: 520, y: 220, accept: true },
  ],
  edges: [
    { from: 'q0', to: 'q1', label: '0' },
    { from: 'q0', to: 'q0', label: '1' },
    { from: 'q1', to: 'q1', label: '0' },
    { from: 'q1', to: 'q2', label: '1' },
    { from: 'q2', to: 'q1', label: '0' },
    { from: 'q2', to: 'q0', label: '1' },
  ],
  delta: {
    q0: { '0': ['q1'], '1': ['q0'] },
    q1: { '0': ['q1'], '1': ['q2'] },
    q2: { '0': ['q1'], '1': ['q0'] },
  },
}

const NFA_THIRD_FROM_END: Automaton = {
  id: 'third-1',
  name: 'Third symbol from the end is 1',
  description:
    'A nondeterministic machine that "guesses" when the third-to-last symbol arrives. Tiny to describe, but its DFA equivalent needs 8 states.',
  language: 'Strings over {0,1} whose 3rd symbol from the end is 1',
  alphabet: ['0', '1'],
  start: 'a',
  nondeterministic: true,
  states: [
    { id: 'a', x: 90, y: 170 },
    { id: 'b', x: 250, y: 170 },
    { id: 'c', x: 410, y: 170 },
    { id: 'd', x: 570, y: 170, accept: true },
  ],
  edges: [
    { from: 'a', to: 'a', label: '0,1' },
    { from: 'a', to: 'b', label: '1' },
    { from: 'b', to: 'c', label: '0,1' },
    { from: 'c', to: 'd', label: '0,1' },
  ],
  delta: {
    a: { '0': ['a'], '1': ['a', 'b'] },
    b: { '0': ['c'], '1': ['c'] },
    c: { '0': ['d'], '1': ['d'] },
    d: {},
  },
}

const NFA_EPSILON: Automaton = {
  id: 'eps-multiples',
  name: 'Multiples of 2 or 3 (unary)',
  description:
    'Uses ε-transitions to nondeterministically choose between two loops: one counting by 2s, one by 3s.',
  language: 'Strings of a’s whose length is a multiple of 2 or of 3',
  alphabet: ['a'],
  start: 's',
  nondeterministic: true,
  states: [
    { id: 's', x: 90, y: 200 },
    { id: 't0', x: 280, y: 90, accept: true },
    { id: 't1', x: 470, y: 90 },
    { id: 'h0', x: 280, y: 320, accept: true },
    { id: 'h1', x: 430, y: 320 },
    { id: 'h2', x: 580, y: 320 },
  ],
  edges: [
    { from: 's', to: 't0', label: EPSILON },
    { from: 's', to: 'h0', label: EPSILON },
    { from: 't0', to: 't1', label: 'a' },
    { from: 't1', to: 't0', label: 'a' },
    { from: 'h0', to: 'h1', label: 'a' },
    { from: 'h1', to: 'h2', label: 'a' },
    { from: 'h2', to: 'h0', label: 'a' },
  ],
  delta: {
    s: { [EPSILON]: ['t0', 'h0'] },
    t0: { a: ['t1'] },
    t1: { a: ['t0'] },
    h0: { a: ['h1'] },
    h1: { a: ['h2'] },
    h2: { a: ['h0'] },
  },
}

export const DFA_EXAMPLES: Automaton[] = [DFA_EVEN_ZEROS, DFA_ENDS_01]
export const NFA_EXAMPLES: Automaton[] = [NFA_THIRD_FROM_END, NFA_EPSILON]
