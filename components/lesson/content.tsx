'use client'

import { DFA_EXAMPLES, NFA_EXAMPLES } from '@/lib/automata'
import { AutomatonLab } from '@/components/labs/automaton-lab'
import { AutomatonBuilder } from '@/components/labs/automaton-builder'
import { SubsetLab } from '@/components/labs/subset-lab'
import { CfgLab } from '@/components/labs/cfg-lab'
import { PdaLab } from '@/components/labs/pda-lab'
import { ReductionLab } from '@/components/labs/reduction-lab'
import { ComplexityLab } from '@/components/labs/complexity-lab'
import { TuringLab } from '@/components/labs/turing-lab'
import { RegexLab } from '@/components/labs/regex-lab'
import { PumpingLab } from '@/components/labs/pumping-lab'
import {
  Callout,
  Definition,
  Formula,
  H3,
  Lead,
  M,
  P,
} from './primitives'

export function LessonBody({ topicId }: { topicId: string }) {
  switch (topicId) {
    /* ----------------------------- Finite Automata ---------------------------- */
    case 'fa-intro':
      return (
        <>
          <Lead>
            A finite automaton is the simplest useful model of a computer. It has
            a fixed, finite amount of memory — just a current state — and reads
            its input one symbol at a time, left to right.
          </Lead>
          <P>
            Think of an automatic door controller, an elevator, or a vending
            machine. None of them need to remember the entire history of what
            happened; they only need to know which <em>state</em> they are in
            right now. That is exactly the power and the limitation of a finite
            automaton.
          </P>
          <H3>The anatomy of a machine</H3>
          <P>
            A machine is drawn as a graph. Circles are <strong>states</strong>.
            An arrow coming from nowhere marks the <strong>start state</strong>.
            Double circles are <strong>accept states</strong>. Labeled arrows are{' '}
            <strong>transitions</strong>: they tell the machine which state to
            move to when it reads a particular symbol.
          </P>
          <Callout kind="tip" title="The central question">
            After reading the whole input, is the machine sitting in an accept
            state? If yes, the string is <em>accepted</em>; if not, it is{' '}
            <em>rejected</em>. The set of all accepted strings is the machine&apos;s{' '}
            <em>language</em>.
          </Callout>
        </>
      )
    case 'fa-formal':
      return (
        <>
          <Lead>
            Pictures are great for intuition, but proofs need precision. We define
            a finite automaton as a 5-tuple.
          </Lead>
          <Definition term="Finite automaton">
            <P>
              A finite automaton is a 5-tuple <M>(Q, Σ, δ, q₀, F)</M> where:
            </P>
            <ul className="ml-1 mt-2 space-y-1.5 text-sm">
              <li>
                <M>Q</M> is a finite set of <strong>states</strong>
              </li>
              <li>
                <M>Σ</M> is a finite <strong>alphabet</strong>
              </li>
              <li>
                <M>δ : Q × Σ → Q</M> is the <strong>transition function</strong>
              </li>
              <li>
                <M>q₀ ∈ Q</M> is the <strong>start state</strong>
              </li>
              <li>
                <M>F ⊆ Q</M> is the set of <strong>accept states</strong>
              </li>
            </ul>
          </Definition>
          <P>
            The machine <M>M</M> accepts a string{' '}
            <M>w = w₁w₂…wₙ</M> if there is a sequence of states{' '}
            <M>r₀, r₁, …, rₙ</M> with <M>r₀ = q₀</M>, each{' '}
            <M>rᵢ₊₁ = δ(rᵢ, wᵢ₊₁)</M>, and <M>rₙ ∈ F</M>.
          </P>
          <Formula>L(M) = {'{ w | M accepts w }'}</Formula>
          <P>
            A language is called <strong>regular</strong> if some finite
            automaton recognizes it. This single definition anchors the entire
            first third of the theory.
          </P>
        </>
      )
    case 'fa-lab':
      return (
        <>
          <Lead>
            Time to drive a machine yourself. Pick a DFA, type a string over its
            alphabet, then step through the computation and watch the active
            state light up.
          </Lead>
          <AutomatonLab machines={DFA_EXAMPLES} />
          <Callout kind="tip" title="Try this">
            On the &ldquo;Ends with 01&rdquo; machine, feed it{' '}
            <M>1101</M> versus <M>1100</M>. Notice how a single trailing symbol
            decides acceptance, yet the machine never needs more than three
            states.
          </Callout>
        </>
      )

    case 'fa-builder':
      return (
        <>
          <Lead>
            Now build a machine from scratch. Drop states onto the canvas, wire
            up transitions, pick which states start and accept — then let the
            grader test your design against an entire language.
          </Lead>
          <AutomatonBuilder />
          <Callout kind="tip" title="How to play">
            Add a few states, mark one as the start and one or more as accepting,
            then connect them with transitions for each symbol. Pick a challenge
            and press <em>Grade my machine</em>: it runs your automaton on dozens
            of strings it should accept and reject.
          </Callout>
        </>
      )

    /* ------------------------------ Nondeterminism ----------------------------- */
    case 'nfa-intro':
      return (
        <>
          <Lead>
            In a nondeterministic finite automaton (NFA), a state may have zero,
            one, or many outgoing arrows for the same symbol — and it may take an
            ε-transition that consumes no input at all.
          </Lead>
          <P>
            Picture the computation as a tree of parallel possibilities. At each
            symbol the machine forks into every legal next state. The string is
            accepted if <em>any</em> branch ends in an accept state.
          </P>
          <Definition term="NFA">
            <P>
              An NFA is a 5-tuple <M>(Q, Σ, δ, q₀, F)</M> where the transition
              function returns a <em>set</em> of states:
            </P>
            <Formula>δ : Q × (Σ ∪ {'{ε}'}) → P(Q)</Formula>
          </Definition>
          <Callout kind="tip" title="Why bother?">
            Nondeterminism never adds computational power for finite automata,
            but it makes machines dramatically smaller and easier to design — a
            theme that returns with full force in complexity theory (P vs NP).
          </Callout>
        </>
      )
    case 'nfa-equiv':
      return (
        <>
          <Lead>
            Surprisingly, NFAs recognize exactly the regular languages — the same
            class as DFAs. The proof is a construction you can run by hand.
          </Lead>
          <H3>The subset construction</H3>
          <P>
            Given an NFA with states <M>Q</M>, build a DFA whose states are{' '}
            <em>sets</em> of NFA states, i.e. elements of the power set{' '}
            <M>P(Q)</M>. The DFA start state is the ε-closure of{' '}
            <M>{'{q₀}'}</M>, and a DFA state is accepting if it contains any NFA
            accept state.
          </P>
          <Formula>NFA with n states ⟶ DFA with up to 2ⁿ states</Formula>
          <P>
            That exponential blow-up is exactly the price of removing
            nondeterminism. Combined with closure under union, concatenation, and
            star, this gives us a clean algebra of regular languages.
          </P>
        </>
      )
    case 'nfa-lab':
      return (
        <>
          <Lead>
            Run an NFA and watch the set of active states grow and shrink. Several
            circles can glow at once — that is nondeterminism made visible.
          </Lead>
          <AutomatonLab machines={NFA_EXAMPLES} />
          <Callout kind="tip" title="Try this">
            The &ldquo;third symbol from the end&rdquo; NFA has only four states,
            but its equivalent DFA needs eight. Feed it <M>10100</M> and watch how
            the machine keeps multiple guesses alive simultaneously.
          </Callout>
        </>
      )

    case 'nfa-subset':
      return (
        <>
          <Lead>
            Theorems are best understood by running them. Watch the subset
            construction turn a small NFA into an equivalent DFA, one worklist
            step at a time.
          </Lead>
          <SubsetLab />
          <P>
            Each DFA state is a <em>set</em> of NFA states. We start from the
            ε-closure of the NFA start state and repeatedly ask: for each input
            symbol, which set of NFA states could we be in next? Every new set we
            discover gets added to the worklist until nothing new appears.
          </P>
          <Callout kind="tip" title="Watch for the blow-up">
            The &ldquo;third symbol from the end&rdquo; NFA has 4 states; its DFA
            needs 8. That doubling is the <M>2ⁿ</M> worst case made concrete.
          </Callout>
        </>
      )

    /* ---------------------------- Regular Expressions -------------------------- */
    case 're-intro':
      return (
        <>
          <Lead>
            Regular expressions describe languages with an algebra built from
            three operations. Kleene&apos;s theorem says they capture precisely
            the regular languages.
          </Lead>
          <Definition term="Regular expression">
            <P>R is a regular expression if R is:</P>
            <ul className="ml-1 mt-2 space-y-1.5 text-sm">
              <li>
                a symbol <M>a ∈ Σ</M>, or the empty string{' '}
                <M>ε</M>, or the empty language <M>∅</M>
              </li>
              <li>
                a union <M>R₁ ∪ R₂</M>
              </li>
              <li>
                a concatenation <M>R₁ ∘ R₂</M>
              </li>
              <li>
                a star <M>R₁*</M> (zero or more repetitions)
              </li>
            </ul>
          </Definition>
          <P>
            Every regular expression can be converted to an NFA, and every DFA
            can be converted back to a regular expression (via the GNFA
            state-elimination method). Three formalisms, one class of languages.
          </P>
        </>
      )
    case 're-lab':
      return (
        <>
          <Lead>
            Write a regular expression and test strings against it instantly. Use{' '}
            <M>|</M> for union, juxtaposition for concatenation, and <M>*</M> for
            star.
          </Lead>
          <RegexLab />
        </>
      )

    /* ---------------------------- Nonregular Languages ------------------------- */
    case 'pl-intro':
      return (
        <>
          <Lead>
            Not every language is regular. A finite automaton has finite memory,
            so it cannot count without bound — it cannot recognize{' '}
            <M>{'{ 0ⁿ1ⁿ }'}</M>.
          </Lead>
          <Definition term="Pumping lemma">
            <P>
              If <M>A</M> is regular, there is a length <M>p</M> (the pumping
              length) such that every string <M>s ∈ A</M> with{' '}
              <M>|s| ≥ p</M> can be split as <M>s = xyz</M> where:
            </P>
            <ul className="ml-1 mt-2 space-y-1.5 text-sm">
              <li>
                <M>xyⁱz ∈ A</M> for every <M>i ≥ 0</M>
              </li>
              <li>
                <M>|y| {'>'} 0</M>
              </li>
              <li>
                <M>|xy| ≤ p</M>
              </li>
            </ul>
          </Definition>
          <Callout kind="warning" title="It only proves non-regularity">
            The pumping lemma is a necessary condition, not a sufficient one. We
            use its <em>contrapositive</em>: if pumping breaks membership, the
            language cannot be regular.
          </Callout>
        </>
      )
    case 'pl-lab':
      return (
        <>
          <Lead>
            Play the adversary&apos;s game on <M>{'{ 0ⁿ1ⁿ }'}</M>. Fix a pumping
            length, split <M>s = 0ᵖ1ᵖ</M> into <M>xyz</M>, then pump <M>y</M> and
            watch the count of 0s and 1s fall out of balance.
          </Lead>
          <PumpingLab />
          <P>
            Because <M>|xy| ≤ p</M>, the middle <M>y</M> lands entirely in the
            block of 0s. Pumping it changes the number of 0s without touching the
            1s — so the string leaves the language. Contradiction.
          </P>
        </>
      )

    /* ---------------------------- Context-Free --------------------------------- */
    case 'cfg-intro':
      return (
        <>
          <Lead>
            Context-free grammars add recursion. They describe nested, balanced
            structures — arithmetic expressions, matched parentheses, programming
            language syntax.
          </Lead>
          <Definition term="Context-free grammar">
            <P>
              A CFG is a 4-tuple <M>(V, Σ, R, S)</M>: variables <M>V</M>,
              terminals <M>Σ</M>, rules <M>R</M> of the form{' '}
              <M>A → w</M>, and a start variable <M>S</M>.
            </P>
          </Definition>
          <P>A grammar for the non-regular language {'{ 0ⁿ1ⁿ }'}:</P>
          <Formula>S → 0 S 1 | ε</Formula>
          <P>
            Each application of the recursive rule adds one 0 on the left and one
            1 on the right, guaranteeing they stay balanced — something no finite
            automaton can do.
          </P>
        </>
      )
    case 'cfg-lab':
      return (
        <>
          <Lead>
            Pick a grammar, type a string, and watch a leftmost derivation unfold
            into a parse tree. If the string is in the language, every rewrite is
            shown; if not, no parse tree exists.
          </Lead>
          <CfgLab />
          <Callout kind="tip" title="Try this">
            On the balanced-parentheses grammar, compare <M>(())</M> with{' '}
            <M>(()</M>. The first builds a clean nested tree; the second simply
            cannot be derived.
          </Callout>
        </>
      )
    case 'pda-intro':
      return (
        <>
          <Lead>
            A pushdown automaton is a finite automaton equipped with a stack. That
            unbounded last-in-first-out memory is exactly what is needed to
            recognize context-free languages.
          </Lead>
          <Formula>PDA = finite control + stack</Formula>
          <P>
            To accept <M>{'{ 0ⁿ1ⁿ }'}</M>, a PDA pushes a marker for every 0 it
            reads, then pops one for every 1. If the stack empties exactly as the
            input ends, the counts matched.
          </P>
          <Callout kind="tip" title="The hierarchy so far">
            Regular ⊊ Context-free. Each new memory model — no memory, then a
            stack, then a full tape — recognizes strictly more languages.
          </Callout>
        </>
      )
    case 'pda-lab':
      return (
        <>
          <Lead>
            Drive a pushdown automaton and keep your eye on the stack. The marker{' '}
            <M>$</M> sits at the bottom so the machine can tell when the stack is
            empty again.
          </Lead>
          <PdaLab />
          <Callout kind="tip" title="Try this">
            Run the <M>{'{ 0ⁿ1ⁿ }'}</M> PDA on <M>000111</M>: the stack rises to
            three markers as 0s arrive, then drains back to empty as the 1s are
            matched. Feed it <M>0011 1</M> and watch it reject.
          </Callout>
        </>
      )

    /* ------------------------------ Turing Machines ---------------------------- */
    case 'tm-intro':
      return (
        <>
          <Lead>
            The Turing machine is the model that defines computation itself. It
            has an unbounded tape it can both read and write, and a head that
            moves left or right.
          </Lead>
          <Definition term="Turing machine">
            <P>
              A TM is a 7-tuple{' '}
              <M>(Q, Σ, Γ, δ, q₀, q_accept, q_reject)</M> where the transition
              function both moves the head and rewrites the tape:
            </P>
            <Formula>δ : Q × Γ → Q × Γ × {'{L, R}'}</Formula>
          </Definition>
          <Callout kind="tip" title="The Church–Turing thesis">
            Every model of computation anyone has devised — multi-tape machines,
            nondeterministic machines, λ-calculus, your laptop — is equivalent in
            power to this one. &ldquo;Algorithm&rdquo; just means &ldquo;Turing
            machine.&rdquo;
          </Callout>
        </>
      )
    case 'tm-lab':
      return (
        <>
          <Lead>
            Watch a Turing machine compute. The head reads the highlighted cell,
            writes a new symbol, and shuffles left or right according to its
            transition function.
          </Lead>
          <TuringLab />
          <Callout kind="tip" title="Try this">
            Run the <M>{'{ 0ⁿ1ⁿ }'}</M> decider on <M>000111</M> and step slowly:
            you can see it cross off a 0 (→x) and its matching 1 (→y) on each
            sweep across the tape.
          </Callout>
        </>
      )

    /* -------------------------------- Decidability ----------------------------- */
    case 'dec-intro':
      return (
        <>
          <Lead>
            A language is <strong>decidable</strong> if some Turing machine halts
            on every input and correctly answers yes or no. If it might loop
            forever on rejects, it is merely <strong>recognizable</strong>.
          </Lead>
          <P>
            Many problems about automata are decidable: does a DFA accept a given
            string? Is its language empty? Are two DFAs equivalent? We answer
            these by building a machine that simulates and analyzes the input
            automaton.
          </P>
          <Formula>decidable ⊊ Turing-recognizable</Formula>
          <Callout kind="tip" title="The plan">
            Establishing decidability is constructive — we exhibit an algorithm.
            Establishing <em>un</em>decidability requires a cleverer, indirect
            argument: diagonalization.
          </Callout>
        </>
      )
    case 'dec-halting':
      return (
        <>
          <Lead>
            Some problems cannot be solved by any algorithm. The acceptance
            problem <M>Aᴛᴍ</M> — does machine M accept string w? — is undecidable.
          </Lead>
          <H3>Diagonalization in one breath</H3>
          <P>
            Suppose a decider <M>H</M> for <M>Aᴛᴍ</M> existed. Build <M>D</M>{' '}
            that runs <M>H</M> on <M>(M, ⟨M⟩)</M> and then does the{' '}
            <em>opposite</em>. Now ask: does <M>D</M> accept its own
            description?
          </P>
          <Formula>D accepts ⟨D⟩ ⟺ D rejects ⟨D⟩</Formula>
          <Callout kind="warning" title="Contradiction">
            Either answer contradicts itself, so <M>H</M> cannot exist. This is
            the same self-reference at the heart of Russell&apos;s paradox and
            Gödel&apos;s incompleteness theorems.
          </Callout>
        </>
      )

    case 'dec-reduction':
      return (
        <>
          <Lead>
            The undecidability of <M>Aᴛᴍ</M> rests on two moves: a self-referential
            machine, and a diagonal that escapes every row. Step through both.
          </Lead>
          <ReductionLab />
          <P>
            The grid makes the counting argument tangible: list every machine as
            a row and every machine&apos;s description as a column. The flipped
            diagonal describes a behavior that disagrees with row{' '}
            <M>i</M> at column <M>i</M>, so it equals no machine in the list.
          </P>
        </>
      )

    /* -------------------------------- Complexity ------------------------------- */
    case 'p-np':
      return (
        <>
          <Lead>
            Computability asks <em>whether</em> a problem can be solved.
            Complexity asks whether it can be solved <em>efficiently</em> — in
            time polynomial in the input size.
          </Lead>
          <Definition term="P and NP">
            <P>
              <M>P</M> is the class of languages decidable in polynomial time on
              a deterministic TM. <M>NP</M> is the class whose &ldquo;yes&rdquo;
              answers can be <em>verified</em> in polynomial time given a
              certificate.
            </P>
          </Definition>
          <Formula>P ⊆ NP · (P = NP?) is open</Formula>
          <P>
            Sudoku, the traveling salesman decision problem, and Boolean
            satisfiability all live in NP: a proposed solution is easy to check,
            even if finding one seems hard.
          </P>
        </>
      )
    case 'np-complete':
      return (
        <>
          <Lead>
            NP-complete problems are the hardest in NP: if any one of them has a
            polynomial-time algorithm, then <M>P = NP</M> and all of them do.
          </Lead>
          <Definition term="NP-completeness">
            <P>
              A language <M>B</M> is NP-complete if <M>B ∈ NP</M> and every{' '}
              <M>A ∈ NP</M> reduces to <M>B</M> in polynomial time.
            </P>
          </Definition>
          <P>
            The <strong>Cook–Levin theorem</strong> proved <M>SAT</M> is
            NP-complete by encoding an entire NP computation as a Boolean formula.
            Thousands of problems have since been shown NP-complete by reduction
            from SAT.
          </P>
          <Callout kind="tip" title="Where the course leads">
            From a machine with no memory to the frontier of what we believe is
            tractable — the same idea of reduction that proved undecidability now
            charts the landscape of hardness.
          </Callout>
        </>
      )
    case 'np-lab':
      return (
        <>
          <Lead>
            Feel the P vs NP gap directly. On the left, <em>verifying</em> an
            assignment is instant. On the right, <em>finding</em> one may force a
            search through all <M>2ⁿ</M> possibilities.
          </Lead>
          <ComplexityLab />
          <P>
            SAT is the canonical NP-complete problem. A satisfying assignment is a
            short certificate anyone can check quickly — yet no one knows a
            general way to find one without, in the worst case, exponential
            search. That gap is the million-dollar question.
          </P>
        </>
      )

    default:
      return (
        <P>
          Select a topic from the syllabus to begin.
        </P>
      )
  }
}
