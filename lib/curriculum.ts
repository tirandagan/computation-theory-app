export type TopicId = string

export interface Topic {
  id: TopicId
  title: string
  blurb: string
  /** Optional key for an embedded interactive simulator. */
  lab?:
    | 'dfa'
    | 'nfa'
    | 'regex'
    | 'turing'
    | 'pumping'
    | 'builder'
    | 'subset'
    | 'cfg'
    | 'pda'
    | 'reduction'
    | 'sat'
    | 'minimize'
    | 'cyk'
    | 'pcp'
    | 'redmap'
    | 'pumping-game'
    | 'geography-game'
    | 'diagonal-game'
    | 'thompson'
    | 'product'
    | 'ambiguity'
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
    id: 'math-foundations',
    chapter: 'Chapter 0',
    title: 'Mathematical Foundations',
    summary:
      'The vocabulary the whole theory is written in: sets, sequences, functions, relations, graphs — and the handful of proof techniques used everywhere.',
    part: 'Automata & Languages',
    topics: [
      {
        id: 'math-prelims',
        title: 'Sets, sequences & functions',
        blurb: 'The objects we compute over and the notation for them.',
      },
      {
        id: 'math-proofs',
        title: 'Proof techniques',
        blurb: 'Construction, contradiction, and induction — the working toolkit.',
      },
    ],
  },
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
      {
        id: 'fa-builder',
        title: 'Lab: Design your own machine',
        blurb: 'Draw states and transitions, then beat the language challenges.',
        lab: 'builder',
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
      {
        id: 'nfa-subset',
        title: 'Lab: NFA → DFA conversion',
        blurb: 'Animate the subset construction one worklist step at a time.',
        lab: 'subset',
      },
      {
        id: 'nfa-product',
        title: 'Lab: Product construction',
        blurb: 'Combine two DFAs into one grid machine for intersection and union.',
        lab: 'product',
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
        id: 're-equiv',
        title: 'Equivalence with finite automata',
        blurb: 'Thompson’s construction and GNFA state elimination — Kleene’s theorem.',
      },
      {
        id: 're-lab',
        title: 'Lab: Regex playground',
        blurb: 'Test strings against a regular expression interactively.',
        lab: 'regex',
      },
      {
        id: 're-thompson',
        title: 'Lab: Thompson’s construction',
        blurb: 'Watch a regex assemble into an NFA, one operator gadget at a time.',
        lab: 'thompson',
      },
    ],
  },
  {
    id: 'minimization',
    chapter: 'Chapter 1 · Minimization',
    title: 'DFA Minimization',
    summary:
      'Every regular language has a unique smallest DFA. Partition refinement finds it by merging states no string can tell apart.',
    part: 'Automata & Languages',
    topics: [
      {
        id: 'min-intro',
        title: 'Distinguishable states',
        blurb: 'When two states are equivalent, and why a minimal DFA is unique.',
      },
      {
        id: 'min-lab',
        title: 'Lab: Minimize a DFA',
        blurb: 'Watch partition refinement merge equivalent states step by step.',
        lab: 'minimize',
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
      {
        id: 'pl-game',
        title: 'Game: Pumping Lemma Duel',
        blurb: 'Battle the adversary turn by turn — break the loop to prove nonregularity.',
        lab: 'pumping-game',
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
        id: 'cfg-lab',
        title: 'Lab: Derive with a grammar',
        blurb: 'Watch a leftmost derivation build a parse tree.',
        lab: 'cfg',
      },
      {
        id: 'cfg-ambiguity',
        title: 'Lab: Grammar ambiguity',
        blurb: 'See one string yield two different parse trees in an ambiguous grammar.',
        lab: 'ambiguity',
      },
      {
        id: 'pda-intro',
        title: 'Pushdown automata',
        blurb: 'Finite control plus a stack — the machine for CFLs.',
      },
      {
        id: 'pda-lab',
        title: 'Lab: Run a pushdown automaton',
        blurb: 'Step a PDA across its input and watch the stack grow and shrink.',
        lab: 'pda',
      },
      {
        id: 'cnf-intro',
        title: 'Chomsky normal form',
        blurb: 'Rewriting any CFG into A → BC and A → a rules for clean parsing.',
      },
      {
        id: 'cyk-lab',
        title: 'Lab: CYK parsing',
        blurb: 'Fill the dynamic-programming table that decides membership in cubic time.',
        lab: 'cyk',
      },
      {
        id: 'cfl-pumping',
        title: 'Pumping lemma for CFLs',
        blurb: 'Two pumpable substrings — proving languages are not context-free.',
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
      {
        id: 'tm-variants',
        title: 'Variants of Turing machines',
        blurb: 'Multitape and nondeterministic TMs — all equivalent in power.',
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
        id: 'dec-algorithms',
        title: 'Decidable problems about automata',
        blurb: 'A_DFA, E_DFA, EQ_DFA and A_CFG — the problems we genuinely can decide.',
      },
      {
        id: 'dec-halting',
        title: 'The halting problem',
        blurb: 'A self-referential argument proves Aᵀᴹ is undecidable.',
      },
      {
        id: 'dec-reduction',
        title: 'Lab: The halting argument',
        blurb: 'Step through diagonalization and the self-reference contradiction.',
        lab: 'reduction',
      },
      {
        id: 'dec-game',
        title: 'Game: Build the Impossible Machine',
        blurb: 'Flip the diagonal to construct a language no machine on the list can decide.',
        lab: 'diagonal-game',
      },
    ],
  },
  {
    id: 'reducibility',
    chapter: 'Chapter 5',
    title: 'Reducibility',
    summary:
      'The central technique for spreading undecidability: if solving B would let us solve a known-hard A, then B is hard too.',
    part: 'Computability Theory',
    topics: [
      {
        id: 'red-mapping',
        title: 'Mapping reducibility',
        blurb: 'A computable function f with w ∈ A ⟺ f(w) ∈ B, written A ≤ₘ B.',
      },
      {
        id: 'rice',
        title: 'Rice’s theorem',
        blurb: 'Every nontrivial property of a TM’s language is undecidable.',
      },
      {
        id: 'pcp-intro',
        title: 'The Post Correspondence Problem',
        blurb: 'A deceptively simple domino-matching puzzle that is undecidable.',
      },
      {
        id: 'pcp-lab',
        title: 'Lab: PCP puzzle',
        blurb: 'Match tops and bottoms by hand, then reveal a computer-found solution.',
        lab: 'pcp',
      },
    ],
  },
  {
    id: 'advanced-computability',
    chapter: 'Chapter 6',
    title: 'Advanced Computability',
    summary:
      'Self-reference made rigorous: machines that print themselves, and an absolute notion of information content.',
    part: 'Computability Theory',
    topics: [
      {
        id: 'recursion-thm',
        title: 'The recursion theorem',
        blurb: 'Any machine can obtain its own description and use it.',
      },
      {
        id: 'kolmogorov',
        title: 'Kolmogorov complexity',
        blurb: 'The shortest description of a string, and why most strings are random.',
      },
      {
        id: 'godel',
        title: 'Gödel & the limits of proof',
        blurb: 'Why no consistent, powerful proof system can prove every true statement.',
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
      {
        id: 'np-catalog',
        title: 'The NP-complete zoo',
        blurb: 'CLIQUE, VERTEX-COVER, HAMPATH, SUBSET-SUM — and how reductions connect them.',
      },
      {
        id: 'np-lab',
        title: 'Lab: SAT & the P vs NP gap',
        blurb: 'Verify a certificate instantly, then watch brute-force search blow up.',
        lab: 'sat',
      },
      {
        id: 'redmap-lab',
        title: 'Lab: Reduction map (3SAT → CLIQUE)',
        blurb: 'Turn a Boolean formula into a graph where a clique is a satisfying assignment.',
        lab: 'redmap',
      },
    ],
  },
  {
    id: 'space-complexity',
    chapter: 'Chapter 8',
    title: 'Space Complexity',
    summary:
      'Measure memory instead of time. Space can be reused, which leads to surprising results like PSPACE = NPSPACE.',
    part: 'Complexity Theory',
    topics: [
      {
        id: 'space-intro',
        title: 'Space, PSPACE & games',
        blurb: 'Reusable memory, the class PSPACE, and PSPACE-complete games.',
      },
      {
        id: 'space-game',
        title: 'Game: Generalized Geography',
        blurb: 'Play a PSPACE-complete game on a graph against a perfect opponent.',
        lab: 'geography-game',
      },
      {
        id: 'savitch',
        title: 'Savitch’s theorem',
        blurb: 'Nondeterministic space is only quadratically more powerful.',
      },
      {
        id: 'l-nl',
        title: 'L, NL, and NL = coNL',
        blurb: 'Logarithmic space, st-connectivity, and the Immerman–Szelepcsényi theorem.',
      },
    ],
  },
  {
    id: 'intractability',
    chapter: 'Chapter 9',
    title: 'Intractability',
    summary:
      'Problems we can prove are genuinely hard. The hierarchy theorems guarantee that more time and space really do buy more power.',
    part: 'Complexity Theory',
    topics: [
      {
        id: 'hierarchy-thm',
        title: 'The hierarchy theorems',
        blurb: 'Diagonalization again: strictly more resources decide strictly more languages.',
      },
      {
        id: 'beyond',
        title: 'The wider landscape',
        blurb: 'Circuit, probabilistic, and interactive complexity — where the field goes next.',
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
