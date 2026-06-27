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
import { MinimizeLab } from '@/components/labs/minimize-lab'
import { CykLab } from '@/components/labs/cyk-lab'
import { PcpLab } from '@/components/labs/pcp-lab'
import { ReductionMapLab } from '@/components/labs/reduction-map-lab'
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
    /* --------------------------- Math Foundations ----------------------------- */
    case 'math-prelims':
      return (
        <>
          <Lead>
            Before machines, a shared vocabulary. Everything in the theory is
            built from sets, sequences, functions, and graphs.
          </Lead>
          <Definition term="The essentials">
            <ul className="ml-1 mt-1 space-y-1.5 text-sm">
              <li>
                A <strong>set</strong> is an unordered collection; a{' '}
                <strong>sequence</strong> (or tuple) is ordered.
              </li>
              <li>
                An <strong>alphabet</strong> <M>Σ</M> is a finite set of symbols;
                a <strong>string</strong> is a finite sequence over <M>Σ</M>.
              </li>
              <li>
                A <strong>language</strong> is a set of strings — a subset of{' '}
                <M>Σ*</M>, the set of all strings.
              </li>
              <li>
                A <strong>function</strong> <M>f : A → B</M> maps each input to
                one output; a <strong>relation</strong> relates elements more
                freely.
              </li>
            </ul>
          </Definition>
          <P>
            The empty string <M>ε</M> has length 0. The set <M>Σ*</M> is
            infinite, but every individual string in it is finite — a small
            distinction that quietly powers many later arguments.
          </P>
          <Callout kind="tip" title="Why languages?">
            Recasting every computational problem as “is this string in this
            language?” lets one theory cover parsing, arithmetic, graph
            problems, and logic all at once.
          </Callout>
        </>
      )
    case 'math-proofs':
      return (
        <>
          <Lead>
            Three proof techniques carry almost the entire subject. Recognizing
            which one a theorem calls for is half the battle.
          </Lead>
          <H3>Proof by construction</H3>
          <P>
            To show something exists, build it. Most “X and Y are equivalent”
            results — NFA→DFA, regex→NFA, CFG→PDA — are constructions you can run
            by hand.
          </P>
          <H3>Proof by contradiction</H3>
          <P>
            Assume the opposite of the claim and derive an impossibility. The
            pumping lemma and the undecidability of the halting problem both land
            this way.
          </P>
          <H3>Proof by induction</H3>
          <P>
            Prove a base case, then show each case follows from the previous one.
            Indispensable for reasoning about strings, runs of a machine, and
            recursively defined objects.
          </P>
          <Callout kind="tip" title="Diagonalization, a preview">
            A specialized contradiction argument — building an object that
            differs from every item on a list — reappears for both
            undecidability and the time/space hierarchy theorems.
          </Callout>
        </>
      )

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
    case 're-equiv':
      return (
        <>
          <Lead>
            Kleene&apos;s theorem says regular expressions and finite automata
            describe the same languages. The proof is two constructions that run
            in both directions.
          </Lead>
          <H3>Regex → NFA (Thompson&apos;s construction)</H3>
          <P>
            Build the NFA recursively from the structure of the expression. Each
            operator has a small gadget with fresh start and accept states wired
            together by <M>ε</M>-transitions:
          </P>
          <ul className="ml-1 space-y-1.5 text-sm">
            <li>
              <M>a</M> — one arrow labeled <M>a</M>
            </li>
            <li>
              <M>R₁ ∪ R₂</M> — branch into both gadgets with <M>ε</M>-moves
            </li>
            <li>
              <M>R₁ ∘ R₂</M> — wire R₁&apos;s accept to R₂&apos;s start
            </li>
            <li>
              <M>R*</M> — loop the accept back to the start, and allow skipping
            </li>
          </ul>
          <H3>DFA → Regex (state elimination)</H3>
          <P>
            Convert the automaton into a <strong>GNFA</strong> whose edges carry
            regular expressions, then rip out states one at a time, relabeling
            the edges that routed through each removed state. When only the start
            and accept states remain, the single edge between them is the answer.
          </P>
          <Formula>regex ⟶ NFA ⟶ DFA ⟶ regex</Formula>
          <Callout kind="tip" title="The payoff">
            Three formalisms, provably one class of languages. You can always
            move to whichever representation makes the current problem easiest.
          </Callout>
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

    /* ---------------------------- Minimization --------------------------------- */
    case 'min-intro':
      return (
        <>
          <Lead>
            Among all DFAs recognizing a language, one is smallest — and it is
            unique. The key idea is when two states can be told apart.
          </Lead>
          <Definition term="Distinguishable states">
            <P>
              States <M>p</M> and <M>q</M> are <strong>distinguishable</strong>{' '}
              if some string <M>w</M> drives one to an accept state and the other
              to a reject state. If no such <M>w</M> exists, they are{' '}
              <strong>equivalent</strong> and can be merged.
            </P>
          </Definition>
          <P>
            Partition refinement starts by separating accepting from
            non-accepting states, then repeatedly splits any group whose members
            transition into different groups. When nothing splits further, each
            remaining group becomes a single state of the minimal DFA.
          </P>
          <Callout kind="tip" title="Myhill–Nerode, informally">
            The number of states in the minimal DFA equals the number of classes
            the language carves <M>Σ*</M> into — a finite count exactly when the
            language is regular.
          </Callout>
        </>
      )
    case 'min-lab':
      return (
        <>
          <Lead>
            Take a deliberately bloated DFA and watch partition refinement
            discover which states are redundant, collapsing them into the unique
            minimal machine.
          </Lead>
          <MinimizeLab />
          <P>
            Each refinement step asks the same question of every group: do all
            its states agree on which group each symbol leads to? If not, the
            group splits. Stable groups are the states of the minimal DFA.
          </P>
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
    case 'cnf-intro':
      return (
        <>
          <Lead>
            Parsing is easiest when every rule has a fixed shape. Chomsky normal
            form rewrites any context-free grammar into exactly two rule types.
          </Lead>
          <Definition term="Chomsky normal form">
            <P>Every rule is one of:</P>
            <ul className="ml-1 mt-2 space-y-1.5 text-sm">
              <li>
                <M>A → BC</M> — two variables (neither the start symbol)
              </li>
              <li>
                <M>A → a</M> — a single terminal
              </li>
              <li>
                <M>S → ε</M> — only the start symbol may derive the empty string
              </li>
            </ul>
          </Definition>
          <P>
            Any CFG can be converted by adding a new start symbol and then
            eliminating <M>ε</M>-rules, unit rules, and long right-hand sides.
            The language is unchanged; only the shape of the derivations is.
          </P>
          <Callout kind="tip" title="Why bother?">
            With binary rules, a derivation of a length-<M>n</M> string takes
            exactly <M>2n − 1</M> steps — a bound that makes the CYK parsing
            algorithm possible.
          </Callout>
        </>
      )
    case 'cyk-lab':
      return (
        <>
          <Lead>
            CYK decides membership by dynamic programming. Each cell records
            which variables can generate a given substring; the answer is whether
            the start symbol reaches the top.
          </Lead>
          <CykLab />
          <P>
            Length-1 cells come straight from the <M>A → a</M> rules. Each longer
            cell tries every split of its substring into two parts, looking for a
            rule <M>A → BC</M> with <M>B</M> on the left piece and <M>C</M> on
            the right. The top cell spans the whole string.
          </P>
          <Callout kind="tip" title="Cubic time">
            With <M>O(n²)</M> cells and <M>O(n)</M> splits each, CYK runs in{' '}
            <M>O(n³)</M> — proof that every context-free language is decidable
            efficiently.
          </Callout>
        </>
      )
    case 'cfl-pumping':
      return (
        <>
          <Lead>
            Context-free languages have their own pumping lemma — but with{' '}
            <em>two</em> pumpable pieces, reflecting a parse tree&apos;s repeated
            variable.
          </Lead>
          <Definition term="Pumping lemma for CFLs">
            <P>
              If <M>A</M> is context-free, there is a length <M>p</M> such that
              every <M>s ∈ A</M> with <M>|s| ≥ p</M> splits as{' '}
              <M>s = uvxyz</M> where:
            </P>
            <ul className="ml-1 mt-2 space-y-1.5 text-sm">
              <li>
                <M>uvⁱxyⁱz ∈ A</M> for all <M>i ≥ 0</M>
              </li>
              <li>
                <M>|vy| {'>'} 0</M> and <M>|vxy| ≤ p</M>
              </li>
            </ul>
          </Definition>
          <P>
            A tall enough parse tree must repeat a variable on some root-to-leaf
            path. The subtree between the two copies is what gets pumped — on
            both sides at once.
          </P>
          <Callout kind="warning" title="A language that escapes">
            <M>{'{ aⁿbⁿcⁿ }'}</M> is not context-free: pumping two of the three
            blocks always leaves the third behind, breaking the equal counts.
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
    case 'tm-variants':
      return (
        <>
          <Lead>
            We can add tapes, add nondeterminism, or restrict movement — and the
            class of recognizable languages never changes. The basic Turing
            machine is remarkably robust.
          </Lead>
          <H3>Multitape machines</H3>
          <P>
            A <M>k</M>-tape TM has several tapes with independent heads. It is
            often far more convenient to program, yet a single-tape machine can
            simulate it by storing all tapes interleaved on one — with only a
            polynomial slowdown.
          </P>
          <H3>Nondeterministic machines</H3>
          <P>
            An NTM may branch into several moves at once and accepts if{' '}
            <em>any</em> branch accepts. A deterministic machine simulates it by
            searching the tree of branches breadth-first.
          </P>
          <Formula>single-tape ≡ multitape ≡ nondeterministic</Formula>
          <Callout kind="tip" title="Robustness = the thesis">
            This insensitivity to the details is exactly why the Church–Turing
            thesis is believable: every reasonable model lands on the same class
            of computable functions.
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

    /* -------------------------------- Reducibility ----------------------------- */
    case 'red-mapping':
      return (
        <>
          <Lead>
            Reducibility is how undecidability spreads. If we could solve{' '}
            <M>B</M>, and solving <M>A</M> reduces to solving <M>B</M>, then{' '}
            <M>A</M> is solvable too — so if <M>A</M> is known unsolvable, so is{' '}
            <M>B</M>.
          </Lead>
          <Definition term="Mapping reducibility">
            <P>
              <M>A ≤ₘ B</M> if there is a computable function <M>f</M> with
            </P>
            <Formula>w ∈ A ⟺ f(w) ∈ B</Formula>
            <P className="mt-2">
              If <M>A ≤ₘ B</M> and <M>B</M> is decidable, then <M>A</M> is
              decidable. Contrapositive: if <M>A</M> is undecidable, so is{' '}
              <M>B</M>.
            </P>
          </Definition>
          <P>
            Almost every undecidability proof after the halting problem is a
            reduction from <M>Aᴛᴍ</M>: transform a machine-and-input question
            into an instance of the new problem so that yes maps to yes.
          </P>
          <Callout kind="tip" title="Same idea, new altitude">
            Polynomial-time reductions reuse this exact move in complexity
            theory to define NP-completeness — only with a running-time budget.
          </Callout>
        </>
      )
    case 'rice':
      return (
        <>
          <Lead>
            How much is undecidable? Rice&apos;s theorem gives a sweeping answer:
            essentially every interesting question about what a program{' '}
            <em>does</em> is undecidable.
          </Lead>
          <Definition term="Rice’s theorem">
            <P>
              Any <strong>nontrivial</strong> property of the language recognized
              by a Turing machine is undecidable. “Nontrivial” means some
              machines have the property and some do not.
            </P>
          </Definition>
          <P>
            Does this program ever output 42? Compute a constant function?
            Recognize a regular language? All undecidable — because each is a
            nontrivial property of the machine&apos;s behavior, and each reduces
            from <M>Aᴛᴍ</M>.
          </P>
          <Callout kind="warning" title="Behavior, not syntax">
            Rice&apos;s theorem is about the <em>language</em> a machine
            recognizes, not its source code. Syntactic questions — “does it have
            5 states?” — can of course be decided.
          </Callout>
        </>
      )
    case 'pcp-intro':
      return (
        <>
          <Lead>
            Undecidability is not confined to questions about machines. The Post
            Correspondence Problem is a simple puzzle about strings that is
            nonetheless impossible to solve in general.
          </Lead>
          <Definition term="Post Correspondence Problem">
            <P>
              Given a finite collection of dominoes, each with a top and bottom
              string, is there a non-empty sequence (repeats allowed) whose
              concatenated tops equal its concatenated bottoms?
            </P>
          </Definition>
          <P>
            One can encode the entire computation history of a Turing machine as
            a PCP instance, so that a matching sequence exists exactly when the
            machine accepts. That reduction makes PCP undecidable.
          </P>
          <Callout kind="tip" title="Try the lab next">
            Small instances are fun to solve by hand — but notice there is no
            bound telling you when to give up. That missing bound is the whole
            difficulty.
          </Callout>
        </>
      )
    case 'pcp-lab':
      return (
        <>
          <Lead>
            Build a match by stacking dominoes. The tops and bottoms must spell
            the same string — keep them aligned and watch the green prefix grow.
          </Lead>
          <PcpLab />
          <P>
            A choice that looks good locally can strand you with an overhang that
            never resolves. There is no general algorithm to decide, in advance,
            whether a given pile of dominoes can ever match.
          </P>
        </>
      )

    /* --------------------------- Advanced Computability ------------------------ */
    case 'recursion-thm':
      return (
        <>
          <Lead>
            Can a program use its own source code? The recursion theorem says yes
            — any machine can obtain its own description and compute with it, with
            no paradox.
          </Lead>
          <Definition term="Recursion theorem">
            <P>
              For any computable <M>t(x, y)</M> there is a machine <M>R</M> that,
              on input <M>w</M>, computes <M>t(⟨R⟩, w)</M> — that is, <M>R</M>{' '}
              has access to its own description <M>⟨R⟩</M>.
            </P>
          </Definition>
          <P>
            This legitimizes self-reference as a programming technique. It gives a
            one-line proof that <M>Aᴛᴍ</M> is undecidable, and it is the reason
            quines (programs that print themselves) must exist.
          </P>
          <Callout kind="tip" title="No magic">
            Obtaining your own description is a computable operation — the
            theorem simply guarantees the fixed point always exists.
          </Callout>
        </>
      )
    case 'kolmogorov':
      return (
        <>
          <Lead>
            What is the information content of a string? Kolmogorov complexity
            measures it by the length of the shortest program that prints it.
          </Lead>
          <Definition term="Kolmogorov complexity">
            <P>
              <M>K(x)</M> is the length of the shortest description (program)
              that outputs <M>x</M> and halts. A string is{' '}
              <strong>incompressible</strong> if <M>K(x) ≥ |x|</M>.
            </P>
          </Definition>
          <P>
            A simple counting argument shows most strings are incompressible:
            there are not enough short programs to name them all. Yet{' '}
            <M>K</M> itself is uncomputable — you can never be sure you have found
            the shortest description.
          </P>
          <Callout kind="tip" title="Randomness defined">
            Incompressibility gives a rigorous meaning to “random”: a string is
            random when its shortest description is essentially itself.
          </Callout>
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

    case 'redmap-lab':
      return (
        <>
          <Lead>
            NP-completeness travels by reduction. Here is the classic one:
            turning a Boolean formula into a graph so that a satisfying
            assignment becomes a clique.
          </Lead>
          <ReductionMapLab />
          <P>
            Each clause contributes three vertices; we connect vertices in
            different clauses that do not contradict each other. Choosing one
            true literal per clause picks a vertex per clause — and because none
            contradict, they are all mutually connected, forming a{' '}
            <M>k</M>-clique.
          </P>
          <Callout kind="tip" title="Why it matters">
            A polynomial-time map from 3SAT to CLIQUE means CLIQUE is at least as
            hard as 3SAT. Chaining such reductions from SAT is how thousands of
            problems were shown NP-complete.
          </Callout>
        </>
      )

    /* ----------------------------- Space Complexity ---------------------------- */
    case 'space-intro':
      return (
        <>
          <Lead>
            Time is not the only resource. Space complexity counts the tape cells
            a machine uses — and because memory can be reused, space behaves very
            differently from time.
          </Lead>
          <Definition term="PSPACE">
            <P>
              <M>PSPACE</M> is the class of languages decidable by a Turing
              machine using a polynomial amount of tape, with no limit on time.
            </P>
          </Definition>
          <Formula>P ⊆ NP ⊆ PSPACE ⊆ EXPTIME</Formula>
          <P>
            Many two-player games are PSPACE-complete: deciding whether the first
            player has a winning strategy in generalized geography or Go-style
            games captures the alternation of “there exists a move such that for
            all replies…”.
          </P>
          <Callout kind="tip" title="Quantifiers as memory">
            <M>TQBF</M> — true quantified Boolean formulas — is the canonical
            PSPACE-complete problem, the space-bounded analogue of SAT.
          </Callout>
        </>
      )
    case 'savitch':
      return (
        <>
          <Lead>
            For time, nondeterminism might give an exponential edge (the P vs NP
            question). For space, Savitch&apos;s theorem shows the gap is only
            quadratic.
          </Lead>
          <Definition term="Savitch’s theorem">
            <Formula>NSPACE(f(n)) ⊆ SPACE(f(n)²)</Formula>
            <P className="mt-2">
              In particular <M>NPSPACE = PSPACE</M>: nondeterministic polynomial
              space is no more powerful than deterministic polynomial space.
            </P>
          </Definition>
          <P>
            The proof solves <M>st</M>-connectivity with a recursive
            “can we get from <M>a</M> to <M>b</M> in <M>2ᵏ</M> steps?” procedure
            that reuses the same space across both halves of the path — trading
            time for a quadratic blow-up in space.
          </P>
          <Callout kind="tip" title="Reuse is the secret">
            You cannot reuse time, but you can erase and reuse memory. That single
            asymmetry is why the space hierarchy looks so different.
          </Callout>
        </>
      )
    case 'l-nl':
      return (
        <>
          <Lead>
            Shrink the budget to <em>logarithmic</em> space and a delicate world
            appears — just enough memory for a constant number of pointers into
            the input.
          </Lead>
          <Definition term="L and NL">
            <P>
              <M>L</M> is deterministic log-space; <M>NL</M> is nondeterministic
              log-space. The directed <M>st</M>-connectivity problem is
              NL-complete.
            </P>
          </Definition>
          <P>
            The <strong>Immerman–Szelepcsényi theorem</strong> proved the
            startling <M>NL = coNL</M>: nondeterministic space classes are closed
            under complement, something still unknown for time classes like NP.
          </P>
          <Formula>L ⊆ NL = coNL ⊆ P</Formula>
          <Callout kind="tip" title="Counting trick">
            The proof nondeterministically counts exactly how many vertices are
            reachable, which lets a machine certify <em>non</em>-reachability too.
          </Callout>
        </>
      )

    /* ------------------------------ Intractability ----------------------------- */
    case 'hierarchy-thm':
      return (
        <>
          <Lead>
            Does more time or space actually buy more computational power? The
            hierarchy theorems answer yes — provably, via diagonalization.
          </Lead>
          <Definition term="Time hierarchy theorem">
            <P>
              For reasonable (time-constructible) bounds, there are languages
              decidable in time <M>O(f(n))</M> but not in any meaningfully
              smaller time. More resources ⇒ strictly more decidable languages.
            </P>
          </Definition>
          <P>
            The proof builds a machine that diagonalizes against every machine
            running within the smaller bound — echoing the halting-problem
            argument, now counting steps instead of accept/reject.
          </P>
          <Callout kind="tip" title="A rare certainty">
            Unlike P vs NP, these separations are <em>proved</em>. For example{' '}
            <M>P ⊊ EXPTIME</M> is a theorem, not a conjecture.
          </Callout>
        </>
      )
    case 'beyond':
      return (
        <>
          <Lead>
            The map keeps going. Beyond P, NP, and PSPACE lies a rich landscape
            of complexity classes that refine what “efficient” can mean.
          </Lead>
          <H3>Circuits, randomness, interaction</H3>
          <ul className="ml-1 space-y-1.5 text-sm">
            <li>
              <strong>Circuit complexity</strong> — measure hardware size and
              depth; a possible route to proving lower bounds.
            </li>
            <li>
              <strong>Probabilistic classes (BPP)</strong> — allow coin flips and
              a small error; often fast where determinism struggles.
            </li>
            <li>
              <strong>Interactive proofs (IP = PSPACE)</strong> — a prover
              convinces a skeptical verifier, the foundation of modern
              cryptography.
            </li>
            <li>
              <strong>Approximation & PCP</strong> — when exact NP-hard answers
              are out of reach, how close can we provably get?
            </li>
          </ul>
          <Callout kind="tip" title="Where you are">
            From a machine with no memory to interactive cryptographic proofs —
            the same two ideas, simulation and reduction, run through the entire
            journey.
          </Callout>
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
