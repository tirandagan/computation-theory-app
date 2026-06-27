/** Auto-graded exercises attached to curriculum topics. */

export interface Question {
  id: string
  prompt: string
  options: string[]
  /** index of the correct option */
  answer: number
  /** shown after answering */
  explanation: string
}

export interface ExerciseSet {
  /** matches a topic id in the curriculum */
  topicId: string
  questions: Question[]
}

export const EXERCISES: ExerciseSet[] = [
  {
    topicId: 'fa-formal',
    questions: [
      {
        id: 'fa-q1',
        prompt: 'In the 5-tuple (Q, Σ, δ, q₀, F), what is δ?',
        options: [
          'the set of accept states',
          'the transition function Q × Σ → Q',
          'the input alphabet',
          'the start state',
        ],
        answer: 1,
        explanation:
          'δ is the transition function: given a state and an input symbol, it returns the next state.',
      },
      {
        id: 'fa-q2',
        prompt: 'A language is called regular exactly when…',
        options: [
          'it is finite',
          'it contains the empty string',
          'some finite automaton recognizes it',
          'it can be sorted',
        ],
        answer: 2,
        explanation:
          'Regular is defined as “recognized by some finite automaton” — equivalently by an NFA or a regular expression.',
      },
      {
        id: 'fa-q3',
        prompt: 'A DFA accepts a string w when…',
        options: [
          'it visits an accept state at some point while reading w',
          'it ends in an accept state after reading all of w',
          'every state it visits is an accept state',
          'it never gets stuck',
        ],
        answer: 1,
        explanation:
          'Acceptance is about the final state after consuming the entire input, not intermediate states.',
      },
    ],
  },
  {
    topicId: 'nfa-equiv',
    questions: [
      {
        id: 'nfa-q1',
        prompt: 'An NFA with n states can blow up to a DFA with at most…',
        options: ['n states', 'n² states', '2ⁿ states', 'n! states'],
        answer: 2,
        explanation:
          'The subset construction makes DFA states out of subsets of the n NFA states — up to 2ⁿ of them.',
      },
      {
        id: 'nfa-q2',
        prompt: 'Compared with DFAs, NFAs recognize…',
        options: [
          'strictly more languages',
          'strictly fewer languages',
          'exactly the same class (the regular languages)',
          'only finite languages',
        ],
        answer: 2,
        explanation:
          'Nondeterminism adds convenience, not power, for finite automata: NFAs and DFAs both recognize the regular languages.',
      },
    ],
  },
  {
    topicId: 're-intro',
    questions: [
      {
        id: 're-q1',
        prompt: 'Which string is NOT matched by (0 ∪ 1)*01 ?',
        options: ['01', '0001', '1101', '10'],
        answer: 3,
        explanation:
          'The expression requires the string to end in 01. “10” does not end in 01, so it is rejected.',
      },
      {
        id: 're-q2',
        prompt: 'The star operation R* always includes…',
        options: [
          'at least one copy of R',
          'the empty string ε',
          'exactly two copies of R',
          'nothing',
        ],
        answer: 1,
        explanation:
          'R* means zero or more repetitions, so ε (zero copies) is always in R*.',
      },
    ],
  },
  {
    topicId: 'pl-intro',
    questions: [
      {
        id: 'pl-q1',
        prompt: 'The pumping lemma is used to prove that a language is…',
        options: [
          'regular',
          'not regular',
          'context-free',
          'decidable',
        ],
        answer: 1,
        explanation:
          'We use its contrapositive: if a language fails the pumping condition, it cannot be regular.',
      },
      {
        id: 'pl-q2',
        prompt: 'In s = xyz with |s| ≥ p, which condition must hold?',
        options: ['|y| = 0', '|xy| ≤ p and |y| > 0', 'x = ε', '|z| ≤ p'],
        answer: 1,
        explanation:
          'The lemma guarantees a pumpable middle y with |y| > 0 located within the first p symbols, so |xy| ≤ p.',
      },
    ],
  },
  {
    topicId: 'cfg-intro',
    questions: [
      {
        id: 'cfg-q1',
        prompt: 'The grammar S → 0S1 | ε generates exactly…',
        options: [
          'all binary strings',
          'strings 0ⁿ1ⁿ for n ≥ 0',
          'palindromes',
          'strings with equal 0s and 1s in any order',
        ],
        answer: 1,
        explanation:
          'Each use of S → 0S1 adds a matching 0 and 1 around the recursion, yielding 0ⁿ1ⁿ.',
      },
    ],
  },
  {
    topicId: 'tm-intro',
    questions: [
      {
        id: 'tm-q1',
        prompt: 'What distinguishes a Turing machine from a PDA?',
        options: [
          'it has more states',
          'it can read input',
          'it has an unbounded tape it can read AND write, with two-way head movement',
          'it is nondeterministic',
        ],
        answer: 2,
        explanation:
          'The read/write tape with a head that moves both directions is what gives the TM its full power.',
      },
      {
        id: 'tm-q2',
        prompt: 'The Church–Turing thesis claims that…',
        options: [
          'all problems are decidable',
          'Turing machines capture exactly the intuitive notion of algorithm',
          'P = NP',
          'every language is regular',
        ],
        answer: 1,
        explanation:
          'It identifies “algorithm” with “what a Turing machine can do” — a thesis, not a theorem.',
      },
    ],
  },
  {
    topicId: 'dec-halting',
    questions: [
      {
        id: 'halt-q1',
        prompt: 'The acceptance problem Aᴛᴍ is…',
        options: [
          'decidable',
          'undecidable but Turing-recognizable',
          'regular',
          'context-free',
        ],
        answer: 1,
        explanation:
          'Aᴛᴍ is recognizable (simulate M on w) but undecidable, shown via diagonalization.',
      },
      {
        id: 'halt-q2',
        prompt: 'The contradiction in the halting proof comes from…',
        options: [
          'a machine running out of tape',
          'a machine D being asked about its own description ⟨D⟩',
          'an infinite alphabet',
          'two DFAs being equivalent',
        ],
        answer: 1,
        explanation:
          'Self-reference: D on ⟨D⟩ must do the opposite of what it does, which is impossible.',
      },
    ],
  },
  {
    topicId: 'p-np',
    questions: [
      {
        id: 'pnp-q1',
        prompt: 'NP is the class of languages whose membership can be…',
        options: [
          'solved in polynomial time',
          'verified in polynomial time given a certificate',
          'recognized by a DFA',
          'solved in constant time',
        ],
        answer: 1,
        explanation:
          'NP = verifiable in polynomial time. Whether that equals polynomial-time solvable (P) is the open question.',
      },
      {
        id: 'pnp-q2',
        prompt: 'A problem is NP-complete if it is in NP and…',
        options: [
          'every NP problem reduces to it in polynomial time',
          'it is also in P',
          'it has no certificate',
          'it is undecidable',
        ],
        answer: 0,
        explanation:
          'NP-complete = in NP and NP-hard (everything in NP reduces to it). SAT was the first, via Cook–Levin.',
      },
    ],
  },
  {
    topicId: 'min-intro',
    questions: [
      {
        id: 'min-q1',
        prompt: 'Two DFA states are distinguishable when…',
        options: [
          'they have different names',
          'some string leads one to accept and the other to reject',
          'they are both accept states',
          'they have the same transitions',
        ],
        answer: 1,
        explanation:
          'Distinguishable means some suffix tells them apart — accept from one, reject from the other. Indistinguishable states can be merged.',
      },
      {
        id: 'min-q2',
        prompt: 'The minimal DFA for a regular language is…',
        options: [
          'never unique',
          'unique up to renaming states',
          'always larger than an equivalent NFA',
          'undefined',
        ],
        answer: 1,
        explanation:
          'Every regular language has a unique minimal DFA (up to renaming), a consequence of the Myhill–Nerode theorem.',
      },
    ],
  },
  {
    topicId: 'cnf-intro',
    questions: [
      {
        id: 'cnf-q1',
        prompt: 'Which rule shape is allowed in Chomsky normal form?',
        options: ['A → BCD', 'A → aB', 'A → BC', 'A → ε for any A'],
        answer: 2,
        explanation:
          'CNF permits A → BC (two variables) and A → a (one terminal), plus S → ε only for the start symbol.',
      },
      {
        id: 'cnf-q2',
        prompt: 'Why convert a grammar to CNF before CYK parsing?',
        options: [
          'it makes the language smaller',
          'binary rules give derivations a fixed length and enable the DP table',
          'it removes all variables',
          'it is required for the grammar to be context-free',
        ],
        answer: 1,
        explanation:
          'Binary right-hand sides let each table cell combine exactly two smaller cells, which is what makes CYK’s O(n³) dynamic program work.',
      },
    ],
  },
  {
    topicId: 'red-mapping',
    questions: [
      {
        id: 'redm-q1',
        prompt: 'If A ≤ₘ B and B is decidable, then…',
        options: [
          'A is undecidable',
          'A is decidable',
          'B is undecidable',
          'nothing can be concluded',
        ],
        answer: 1,
        explanation:
          'A mapping reduction transfers decidability downward: solving B (plus computing f) solves A.',
      },
      {
        id: 'redm-q2',
        prompt: 'Mapping reductions are most often used to prove a problem is…',
        options: [
          'regular',
          'undecidable, by reducing from Aᴛᴍ',
          'context-free',
          'in P',
        ],
        answer: 1,
        explanation:
          'After Aᴛᴍ is shown undecidable, new undecidability proofs reduce from it: if B were decidable, so would Aᴛᴍ be.',
      },
    ],
  },
  {
    topicId: 'rice',
    questions: [
      {
        id: 'rice-q1',
        prompt: 'Rice’s theorem says that nontrivial properties of…',
        options: [
          'a Turing machine’s source code are undecidable',
          'the language a Turing machine recognizes are undecidable',
          'finite automata are undecidable',
          'regular languages are undecidable',
        ],
        answer: 1,
        explanation:
          'Rice’s theorem is about semantic properties — the recognized language — not syntactic features of the machine itself.',
      },
    ],
  },
  {
    topicId: 'space-intro',
    questions: [
      {
        id: 'space-q1',
        prompt: 'Which containment is known to hold?',
        options: [
          'PSPACE ⊆ NP',
          'P ⊆ NP ⊆ PSPACE',
          'PSPACE ⊆ P',
          'EXPTIME ⊆ P',
        ],
        answer: 1,
        explanation:
          'P ⊆ NP ⊆ PSPACE ⊆ EXPTIME. Whether any of these containments is strict (besides P ⊊ EXPTIME) is largely open.',
      },
      {
        id: 'space-q2',
        prompt: 'The canonical PSPACE-complete problem is…',
        options: ['SAT', 'TQBF (true quantified Boolean formulas)', 'CLIQUE', 'st-connectivity'],
        answer: 1,
        explanation:
          'TQBF — fully quantified Boolean formulas — is to PSPACE what SAT is to NP.',
      },
    ],
  },
  {
    topicId: 'savitch',
    questions: [
      {
        id: 'sav-q1',
        prompt: 'Savitch’s theorem establishes that…',
        options: [
          'NPSPACE = PSPACE',
          'P = NP',
          'NL = P',
          'space cannot be reused',
        ],
        answer: 0,
        explanation:
          'NSPACE(f) ⊆ SPACE(f²), so nondeterministic polynomial space collapses to deterministic: NPSPACE = PSPACE.',
      },
    ],
  },
  {
    topicId: 'dec-algorithms',
    questions: [
      {
        id: 'deca-q1',
        prompt: 'Which problem is decidable?',
        options: [
          'A_TM — does a Turing machine accept a string?',
          'A_DFA — does a DFA accept a string?',
          'HALT — does a TM halt on an input?',
          'E_TM — is a TM’s language empty?',
        ],
        answer: 1,
        explanation:
          'A_DFA is decidable: just simulate the DFA on the string. The Turing-machine versions are all undecidable.',
      },
      {
        id: 'deca-q2',
        prompt: 'How do we decide EQ_DFA (do two DFAs accept the same language)?',
        options: [
          'run both on every string',
          'test the symmetric difference for emptiness',
          'minimize both and compare names',
          'it is undecidable',
        ],
        answer: 1,
        explanation:
          'Build a DFA for the symmetric difference; the languages are equal exactly when that DFA accepts nothing (E_DFA).',
      },
    ],
  },
  {
    topicId: 'np-catalog',
    questions: [
      {
        id: 'npc-q1',
        prompt: 'If one NP-complete problem had a polynomial-time algorithm, then…',
        options: [
          'only that problem would be easy',
          'every problem in NP would be solvable in polynomial time',
          'nothing would change',
          'P would be larger than NP',
        ],
        answer: 1,
        explanation:
          'All NP problems reduce to any NP-complete one in polynomial time, so solving one fast solves them all — P = NP.',
      },
      {
        id: 'npc-q2',
        prompt: 'Reductions among NP-complete problems typically start from…',
        options: ['HAMPATH', '3SAT', 'SUBSET-SUM', 'EQ_DFA'],
        answer: 1,
        explanation:
          '3SAT is the usual launching point; from it CLIQUE, VERTEX-COVER, and many others are derived.',
      },
    ],
  },
  {
    topicId: 'godel',
    questions: [
      {
        id: 'godel-q1',
        prompt: 'The computability route to incompleteness relies on the fact that…',
        options: [
          'the halting problem is undecidable',
          'all proofs are short',
          'arithmetic is finite',
          'NP = P',
        ],
        answer: 0,
        explanation:
          'If every truth were provable, searching proofs would decide truth — and thus decide halting, which is impossible.',
      },
    ],
  },
]

export function exercisesFor(topicId: string): ExerciseSet | undefined {
  return EXERCISES.find((e) => e.topicId === topicId)
}
