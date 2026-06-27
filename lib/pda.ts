/**
 * A small deterministic-by-construction pushdown automaton simulator. Each
 * curated PDA is designed so a greedy strategy (prefer an input-reading move,
 * otherwise take an ε-move) follows the unique accepting run, which keeps the
 * visualization clean and always terminating.
 */

export const BOTTOM = '$'

export interface PdaTransition {
  state: string
  /** symbol to read, or '' for an ε-move (consumes no input) */
  read: string
  /** required stack top, or '' to ignore the top */
  pop: string
  /** symbols to push, top-of-stack first; [] pushes nothing */
  push: string[]
  to: string
}

export interface Pda {
  id: string
  name: string
  description: string
  start: string
  accept: string[]
  alphabet: string[]
  transitions: PdaTransition[]
  examples: string[]
}

export interface PdaStep {
  state: string
  /** number of input symbols consumed so far */
  consumed: number
  /** stack, top of stack is the LAST element */
  stack: string[]
  note: string
}

export interface PdaRun {
  steps: PdaStep[]
  accepted: boolean
}

export function runPda(pda: Pda, input: string): PdaRun {
  const steps: PdaStep[] = []
  let state = pda.start
  let pos = 0
  let stack: string[] = []
  steps.push({ state, consumed: 0, stack: [], note: 'Initial configuration.' })

  const LIMIT = 400
  for (let guard = 0; guard < LIMIT; guard++) {
    const top = stack[stack.length - 1] ?? ''
    const symbol = input[pos]

    // prefer an input-reading transition, then an ε-transition
    const candidate =
      pda.transitions.find(
        (t) =>
          t.state === state &&
          t.read !== '' &&
          t.read === symbol &&
          (t.pop === '' || t.pop === top),
      ) ??
      pda.transitions.find(
        (t) =>
          t.state === state &&
          t.read === '' &&
          (t.pop === '' || t.pop === top),
      )

    if (!candidate) break

    if (candidate.pop !== '') stack = stack.slice(0, -1)
    if (candidate.push.length) stack = [...stack, ...[...candidate.push].reverse()]
    if (candidate.read !== '') pos += 1
    state = candidate.to

    const action: string[] = []
    if (candidate.read !== '') action.push(`read '${candidate.read}'`)
    else action.push('ε-move')
    if (candidate.pop !== '') action.push(`pop ${candidate.pop}`)
    if (candidate.push.length) action.push(`push ${candidate.push.join('')}`)

    steps.push({
      state,
      consumed: pos,
      stack: [...stack],
      note: `${action.join(', ')} → ${state}`,
    })
  }

  const accepted =
    pos === input.length && pda.accept.includes(state)
  return { steps, accepted }
}

export const PDAS: Pda[] = [
  {
    id: 'anbn',
    name: '0ⁿ1ⁿ',
    description:
      'Push a marker for each 0, pop one for each 1. If the stack empties exactly as the input ends, the counts matched.',
    start: 'q0',
    accept: ['qacc'],
    alphabet: ['0', '1'],
    transitions: [
      { state: 'q0', read: '', pop: '', push: [BOTTOM], to: 'q1' },
      { state: 'q1', read: '0', pop: '', push: ['0'], to: 'q1' },
      { state: 'q1', read: '1', pop: '0', push: [], to: 'q2' },
      { state: 'q2', read: '1', pop: '0', push: [], to: 'q2' },
      { state: 'q2', read: '', pop: BOTTOM, push: [], to: 'qacc' },
      { state: 'q1', read: '', pop: BOTTOM, push: [], to: 'qacc' },
    ],
    examples: ['0011', '000111', '01', ''],
  },
  {
    id: 'balanced',
    name: 'Balanced ( )',
    description:
      'Push on every "(" and pop on every ")". Accept when the stack returns to empty at end of input.',
    start: 'q0',
    accept: ['qacc'],
    alphabet: ['(', ')'],
    transitions: [
      { state: 'q0', read: '', pop: '', push: [BOTTOM], to: 'q1' },
      { state: 'q1', read: '(', pop: '', push: ['('], to: 'q1' },
      { state: 'q1', read: ')', pop: '(', push: [], to: 'q1' },
      { state: 'q1', read: '', pop: BOTTOM, push: [], to: 'qacc' },
    ],
    examples: ['(())', '()()', '(()())', '(()'],
  },
]
