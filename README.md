# Automata — An Interactive Theory of Computation Course

A graphical, hands-on learning application that teaches the **Theory of Computation** based on Michael Sipser's *Introduction to the Theory of Computation* (3rd Edition). Instead of reading static definitions, learners run the machines: they draw automata, step Turing machines across an infinite tape, animate algorithmic constructions, and feel the gap between solving and verifying that sits at the heart of P vs NP.

> Created by **Tiran Dagan**, PhD Candidate, Stevens Institute of Technology — `tdagan@stevens.edu`

---

## Table of Contents

- [Overview](#overview)
- [Curriculum](#curriculum)
- [Interactive Labs](#interactive-labs)
- [Practice & Progress](#practice--progress)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [Accessibility & Design](#accessibility--design)
- [Credits & License](#credits--license)

---

## Overview

The application is organized as a structured course that mirrors the three pillars of Sipser's text:

1. **Automata & Languages** — finite automata, nondeterminism, regular expressions, and the limits of regular languages.
2. **Computability Theory** — context-free grammars, pushdown automata, Turing machines, decidability, and the halting problem.
3. **Complexity Theory** — time complexity, the classes P and NP, and NP-completeness.

Every concept is paired with a runnable, visual lab so the theory is something the learner *operates* rather than merely reads.

---

## Curriculum

The course content is data-driven and defined in [`lib/curriculum.ts`](lib/curriculum.ts). Each part contains modules (chapters), and each module contains topics. A topic can optionally embed an interactive lab.

| Part | Topics include |
| --- | --- |
| **Automata & Languages** | Finite automata, formal definitions, NFAs, NFA→DFA conversion, regular expressions, the pumping lemma |
| **Computability** | Context-free grammars, pushdown automata, Turing machines, decidability, the halting problem |
| **Complexity** | Time complexity, P vs NP, NP-completeness, SAT |

---

## Interactive Labs

All labs are written from scratch in TypeScript with no heavyweight simulation dependencies. Each engine lives in `lib/` and is paired with a presentation component in `components/labs/`.

| Lab | What it does | Engine |
| --- | --- | --- |
| **DFA / NFA Simulator** | Pick a machine, type a string, and step the computation while the active state(s) light up. | [`lib/automata.ts`](lib/automata.ts) |
| **Build-Your-Own Automaton** | A drawing canvas to place states and transitions, mark start/accept states, then auto-grade your design against an entire target language via challenges. | [`components/labs/automaton-builder.tsx`](components/labs/automaton-builder.tsx) |
| **NFA → DFA Subset Construction** | Animates the subset construction one worklist step at a time, building the equivalent DFA, transition table, and state set. | [`lib/subset-construction.ts`](lib/subset-construction.ts) |
| **CFG Derivation & Parse Tree** | Choose a grammar, enter a string, and watch a leftmost derivation build a rendered parse tree. | [`lib/cfg.ts`](lib/cfg.ts) |
| **Pushdown Automaton** | Step a PDA across its input with a live, animated stack so you can see markers pushed and popped. | [`lib/pda.ts`](lib/pda.ts) |
| **Turing Machine** | An infinite tape with a moving read/write head; runs deciders such as `0ⁿ1ⁿ` to a halt state. | [`lib/turing.ts`](lib/turing.ts) |
| **Regular Expression Playground** | Match strings against patterns and explore the equivalence of regexes and finite automata. | [`components/labs/regex-lab.tsx`](components/labs/regex-lab.tsx) |
| **Pumping Lemma Lab** | Interactively explore why certain languages cannot be regular. | [`components/labs/pumping-lab.tsx`](components/labs/pumping-lab.tsx) |
| **Halting / Reduction Explorer** | A guided proof walkthrough plus an interactive diagonalization table demonstrating why `Aᴛᴍ` is undecidable. | [`components/labs/reduction-lab.tsx`](components/labs/reduction-lab.tsx) |
| **SAT & the P vs NP Gap** | Verify a certificate instantly (P), then watch brute-force search blow up (NP), inside a nested view of the complexity classes. | [`lib/sat.ts`](lib/sat.ts) |

---

## Practice & Progress

- **Auto-graded quizzes** — per-topic exercises with instant grading and explanations, defined in [`lib/exercises.ts`](lib/exercises.ts) and rendered by [`components/exercise/quiz.tsx`](components/exercise/quiz.tsx).
- **Progress tracking** — completed topics, a course-progress bar, best quiz scores, and a daily **study streak** persist locally via [`lib/progress.ts`](lib/progress.ts) (no account required; data is stored in `localStorage`).

---

## Tech Stack

- **[Next.js 16](https://nextjs.org)** (App Router) + **React 19**
- **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com)** for styling with a themed design-token system
- **[shadcn/ui](https://ui.shadcn.com)** primitives
- **[lucide-react](https://lucide.dev)** icons
- Hand-rolled automata / grammar / Turing / SAT engines — no external simulation libraries

---

## Project Structure

```
app/
  layout.tsx            # Root layout, fonts, metadata
  page.tsx              # Landing page (hero + syllabus map)
  learn/page.tsx        # Learning workspace route
components/
  about-dialog.tsx      # Info popup with credits & repo link
  learn-workspace.tsx   # Sidebar nav, progress, streak, lesson host
  landing/              # Hero automaton and landing visuals
  lesson/               # Lesson content + typographic primitives
  labs/                 # All interactive simulators
  exercise/             # Auto-graded quiz component
lib/
  curriculum.ts         # Course structure (parts → modules → topics)
  automata.ts           # DFA/NFA model + example machines
  subset-construction.ts# NFA→DFA algorithm
  cfg.ts                # Context-free grammar derivations
  pda.ts                # Pushdown automaton engine
  turing.ts             # Turing machine engine
  sat.ts                # SAT verifier / brute-force solver
  exercises.ts          # Quiz data
  progress.ts           # localStorage progress + streak store
```

---

## Getting Started

Install dependencies and run the development server:

```bash
pnpm install
pnpm dev
# or: npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. From the landing page, select **Begin the course** to enter the learning workspace, or jump straight to any lab from the syllabus map.

To create a production build:

```bash
pnpm build
pnpm start
```

---

## How It Works

The course is **data-driven**: `lib/curriculum.ts` describes the entire syllabus as a tree of parts, modules, and topics. The learning workspace (`components/learn-workspace.tsx`) flattens that tree into an ordered sequence, renders the sidebar, and tracks the active topic. Each topic's prose lives in `components/lesson/content.tsx`, which conditionally mounts the matching lab from `components/labs/`. The simulation logic is fully decoupled into pure modules under `lib/`, so each engine can be reasoned about (and unit-tested) independently of its UI.

---

## Accessibility & Design

- Semantic HTML with ARIA roles on dialogs, navigation, and interactive controls.
- Keyboard support (e.g. the info dialog closes on `Escape`).
- A restrained, high-contrast monochrome palette with a serif/mono type pairing for an editorial, focused reading experience.
- Mobile-first responsive layout.

---

## Credits & License

**Created by Tiran Dagan** — PhD Candidate, Stevens Institute of Technology · `tdagan@stevens.edu`

Based on **Michael Sipser**, *Introduction to the Theory of Computation*, 3rd Edition (Cengage Learning). All concepts, definitions, and course structure are derived from Professor Sipser's work. This application is an educational companion and is **not affiliated with or endorsed by** the author or publisher.

Built with [v0](https://v0.app). [Continue working on v0 →](https://v0.app/chat/projects/prj_HwNzuk70kEwSfqlo52QOvgtdR7jO)
