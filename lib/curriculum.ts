export type TopicId = string

export interface Topic {
  id: TopicId
  title: string
  blurb: string
  /** Optional key for an embedded interactive simulator. */
  lab?: 'dfa' | 'nfa' | 'regex' | 'turing' | 'pumping'
}

export interface Module {
  id: string
  /** Chapter label as it appears in Sipser. */
  chapter: string
  title: string
  summary: string
  /** part of the book this belongs to */
  part: 'Automata & Languages' | 'Computability Theory' | 'Complexity Theory'
  topics: Topic[]
}

export const CURRICULUM: Module[] = [
  {
    id: 'finite-automata',
    chapter: 'Chapter 1.1',
    title: 'Finite Automata',
    summary:
      'The simplest model of computation: a machine with finitely many states that reads input one symbol at a time.',
    part: 'Automata & Languages',
    topics: [
      {
        id: 'fa-intro',
        title: 'What is a finite automaton?',
        blurb: 'States, transitions, and the idea of reading a string.',
      },
      {
        id: 'fa-formal',
        title: 'Formal definition',
        blurb: 'The 5-tuple (Q, Σ, δ, q₀, F) and the language of a machine.',
      },
      {
        id: 'fa-lab',
        title: 'Lab: Build & run a DFA',
        blurb: 'Trace a deterministic finite automaton symbol by symbol.',
        lab: 'dfa',
      },
    ],
  },
  {
    id: 'nondeterminism',
    chapter: 'Chapter 1.2',
    title: 'Nondeterminism',
    summary:
      'Allow a machine to be in several states at once. NFAs are no more powerful than DFAs — but far easier to design.',
    part: 'Automata & Languages',
    topics: [
      {
        id: 'nfa-intro',
        title: 'Nondeterministic computation',
        blurb: 'Multiple branches, ε-moves, and acceptance by any path.',
      },
      {
        id: 'nfa-equiv',
        title: 'NFAs = DFAs',
        blurb: 'The subset construction and closure under regular operations.',
      },
      {
        id: 'nfa-lab',
        title: 'Lab: Explore an NFA',
        blurb: 'Watch nondeterminism explore many states simultaneously.',
        lab: 'nfa',
      },
    ],
  },
  {
    id: 'regular-expressions',
    chapter: 'Chapter 1.3',
    title: 'Regular Expressions',
    summary:
      'A compact algebra for describing languages. Kleene’s theorem: regular expressions and finite automata describe exactly the same class.',
    part: 'Automata & Languages',
    topics: [
      {
        id: 're-intro',
        title: 'The regular operations',
        blurb: 'Union, concatenation, and star — building languages up.',
      },
      {
        id: 're-lab',
        title: 'Lab: Regex playground',
        blurb: 'Test strings against a regular expression interactively.',
        lab: 'regex',
      },
    ],
  },
  {
    id: 'nonregular',
    chapter: 'Chapter 1.4',
    title: 'Nonregular Languages',
    summary:
      'Some languages need unbounded memory. The pumping lemma is our tool for proving a language is not regular.',
    part: 'Automata & Languages',
    topics: [
      {
        id: 'pl-intro',
        title: 'The pumping lemma',
        blurb: 'Why long strings in a regular language must contain a loop.',
      },
      {
        id: 'pl-lab',
        title: 'Lab: Pump a string',
        blurb: 'Decompose a string into xyz and pump the middle.',
        lab: 'pumping',
      },
    ],
  },
  {
    id: 'context-free',
    chapter: 'Chapter 2',
    title: 'Context-Free Languages',
    summary:
      'Grammars with recursive structure. They power programming-language parsers and describe nested, balanced patterns.',
    part: 'Automata & Languages',
    topics: [
      {
        id: 'cfg-intro',
        title: 'Context-free grammars',
        blurb: 'Variables, terminals, rules, and derivations.',
      },
      {
        id: 'pda-intro',
        title: 'Pushdown automata',
        blurb: 'Finite control plus a stack — the machine for CFLs.',
      },
    ],
  },
  {
    id: 'turing-machines',
    chapter: 'Chapter 3',
    title: 'Turing Machines',
    summary:
      'The definitive model of computation. An infinite tape and a head that reads, writes, and moves — the basis of the Church–Turing thesis.',
    part: 'Computability Theory',
    topics: [
      {
        id: 'tm-intro',
        title: 'The Turing machine model',
        blurb: 'Tape, head, and the transition function.',
      },
      {
        id: 'tm-lab',
        title: 'Lab: Run a Turing machine',
        blurb: 'Step a TM across its tape and watch it compute.',
        lab: 'turing',
      },
    ],
  },
  {
    id: 'decidability',
    chapter: 'Chapter 4',
    title: 'Decidability',
    summary:
      'Which problems can a computer solve at all? Diagonalization reveals languages no machine can decide.',
    part: 'Computability Theory',
    topics: [
      {
        id: 'dec-intro',
        title: 'Decidable languages',
        blurb: 'Deciders, recognizers, and what it means to "solve" a problem.',
      },
      {
        id: 'dec-halting',
        title: 'The halting problem',
        blurb: 'A self-referential argument proves Aᵀᴹ is undecidable.',
      },
    ],
  },
  {
    id: 'complexity',
    chapter: 'Chapter 7',
    title: 'Time Complexity',
    summary:
      'Not just what is computable, but what is feasible. The classes P and NP, and the most famous open problem in computer science.',
    part: 'Complexity Theory',
    topics: [
      {
        id: 'p-np',
        title: 'P and NP',
        blurb: 'Polynomial-time solving versus polynomial-time verifying.',
      },
      {
        id: 'np-complete',
        title: 'NP-completeness',
        blurb: 'The hardest problems in NP and the Cook–Levin theorem.',
      },
    ],
  },
]

export const PARTS = [
  'Automata & Languages',
  'Computability Theory',
  'Complexity Theory',
] as const

export function findTopic(topicId: string) {
  for (const mod of CURRICULUM) {
    const topic = mod.topics.find((t) => t.id === topicId)
    if (topic) return { module: mod, topic }
  }
  return null
}

export function allTopics(): { module: Module; topic: Topic }[] {
  return CURRICULUM.flatMap((module) =>
    module.topics.map((topic) => ({ module, topic })),
  )
}
