export const BLANK = '_'

export type Move = 'L' | 'R'

export interface TMTransition {
  write: string
  move: Move
  next: string
}

export interface TuringMachine {
  id: string
  name: string
  description: string
  task: string
  inputAlphabet: string[]
  accept: string
  reject: string
  start: string
  /** delta[state][symbol] -> transition; missing entries reject */
  delta: Record<string, Record<string, TMTransition>>
  samples: string[]
}

export interface TMConfig {
  tape: string[]
  head: number
  state: string
  halted: 'accept' | 'reject' | null
  steps: number
}

export function initConfig(tm: TuringMachine, input: string): TMConfig {
  const tape = input.length ? [...input] : [BLANK]
  return { tape, head: 0, state: tm.start, halted: null, steps: 0 }
}

/** Advances the machine by one step, returning a new immutable config. */
export function stepTM(tm: TuringMachine, c: TMConfig): TMConfig {
  if (c.halted) return c
  const tape = [...c.tape]
  if (c.head < 0) {
    tape.unshift(BLANK)
  }
  let head = c.head < 0 ? 0 : c.head
  if (head >= tape.length) tape.push(BLANK)

  const symbol = tape[head] ?? BLANK
  const rule = tm.delta[c.state]?.[symbol]

  if (!rule) {
    return { ...c, tape, head, halted: 'reject' }
  }

  tape[head] = rule.write
  head = rule.move === 'R' ? head + 1 : head - 1
  if (head < 0) {
    tape.unshift(BLANK)
    head = 0
  }
  if (head >= tape.length) tape.push(BLANK)

  const halted =
    rule.next === tm.accept
      ? 'accept'
      : rule.next === tm.reject
        ? 'reject'
        : null

  return {
    tape,
    head,
    state: rule.next,
    halted,
    steps: c.steps + 1,
  }
}

/* ------------------------------- examples -------------------------------- */

const TM_ANBN: TuringMachine = {
  id: 'anbn',
  name: '{ 0ⁿ1ⁿ }',
  description:
    'Decides the classic non-regular language of equal numbers of 0s followed by 1s. It crosses off one 0 (→x) and one matching 1 (→y) on each pass.',
  task: 'Accept exactly the strings 0ⁿ1ⁿ for n ≥ 0',
  inputAlphabet: ['0', '1'],
  accept: 'qACC',
  reject: 'qREJ',
  start: 'q0',
  delta: {
    q0: {
      '0': { write: 'x', move: 'R', next: 'q1' },
      y: { write: 'y', move: 'R', next: 'q3' },
      [BLANK]: { write: BLANK, move: 'R', next: 'qACC' },
    },
    q1: {
      '0': { write: '0', move: 'R', next: 'q1' },
      y: { write: 'y', move: 'R', next: 'q1' },
      '1': { write: 'y', move: 'L', next: 'q2' },
    },
    q2: {
      '0': { write: '0', move: 'L', next: 'q2' },
      y: { write: 'y', move: 'L', next: 'q2' },
      x: { write: 'x', move: 'R', next: 'q0' },
    },
    q3: {
      y: { write: 'y', move: 'R', next: 'q3' },
      [BLANK]: { write: BLANK, move: 'R', next: 'qACC' },
    },
  },
  samples: ['0011', '000111', '001', '0101'],
}

const TM_INCREMENT: TuringMachine = {
  id: 'increment',
  name: 'Binary +1',
  description:
    'A transducer that adds one to a binary number. It runs to the right end, then ripples a carry leftward, accepting when the new value is written.',
  task: 'Compute n + 1 on a binary input, then halt',
  inputAlphabet: ['0', '1'],
  accept: 'qACC',
  reject: 'qREJ',
  start: 'qR',
  delta: {
    qR: {
      '0': { write: '0', move: 'R', next: 'qR' },
      '1': { write: '1', move: 'R', next: 'qR' },
      [BLANK]: { write: BLANK, move: 'L', next: 'qADD' },
    },
    qADD: {
      '1': { write: '0', move: 'L', next: 'qADD' },
      '0': { write: '1', move: 'L', next: 'qDONE' },
      [BLANK]: { write: '1', move: 'L', next: 'qDONE' },
    },
    qDONE: {
      '0': { write: '0', move: 'L', next: 'qDONE' },
      '1': { write: '1', move: 'L', next: 'qDONE' },
      [BLANK]: { write: BLANK, move: 'R', next: 'qACC' },
    },
  },
  samples: ['1011', '111', '0', '10011'],
}

export const TM_EXAMPLES: TuringMachine[] = [TM_ANBN, TM_INCREMENT]
