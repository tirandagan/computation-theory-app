'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/* The classic ambiguous expression grammar  E -> E + E | E * E | a
   The string a + a * a has two distinct parse trees, which disagree on
   operator precedence. We hard-code the two trees to keep the focus on the
   concept (ambiguity), not on parser implementation. */

interface Tree {
  label: string
  kind: 'nonterminal' | 'op' | 'leaf'
  children?: Tree[]
}

// (a + a) * a  — '+' binds first
const treeAddFirst: Tree = {
  label: 'E',
  kind: 'nonterminal',
  children: [
    {
      label: 'E',
      kind: 'nonterminal',
      children: [
        { label: 'E', kind: 'nonterminal', children: [{ label: 'a', kind: 'leaf' }] },
        { label: '+', kind: 'op' },
        { label: 'E', kind: 'nonterminal', children: [{ label: 'a', kind: 'leaf' }] },
      ],
    },
    { label: '*', kind: 'op' },
    { label: 'E', kind: 'nonterminal', children: [{ label: 'a', kind: 'leaf' }] },
  ],
}

// a + (a * a) — '*' binds first
const treeMulFirst: Tree = {
  label: 'E',
  kind: 'nonterminal',
  children: [
    { label: 'E', kind: 'nonterminal', children: [{ label: 'a', kind: 'leaf' }] },
    { label: '+', kind: 'op' },
    {
      label: 'E',
      kind: 'nonterminal',
      children: [
        { label: 'E', kind: 'nonterminal', children: [{ label: 'a', kind: 'leaf' }] },
        { label: '*', kind: 'op' },
        { label: 'E', kind: 'nonterminal', children: [{ label: 'a', kind: 'leaf' }] },
      ],
    },
  ],
}

export function AmbiguityLab() {
  const [shown, setShown] = useState<'left' | 'right' | 'both'>('both')

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Ambiguity explorer
        </span>
        <code className="rounded bg-background px-2 py-0.5 font-mono text-xs text-foreground">
          E → E + E | E * E | a
        </code>
      </div>

      <div className="border-b border-border px-4 py-3">
        <p className="text-sm text-foreground/90">
          The string{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
            a + a * a
          </code>{' '}
          has <strong>two different parse trees</strong>. A grammar that allows
          this for any string is <em>ambiguous</em> — and here the two trees
          actually compute different values.
        </p>
        <div className="mt-3 inline-flex overflow-hidden rounded-md border border-border">
          {(
            [
              ['left', 'Tree 1'],
              ['right', 'Tree 2'],
              ['both', 'Both'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setShown(k)}
              className={cn(
                'px-3 py-1 font-mono text-xs transition-colors',
                shown === k
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          'grid gap-4 px-4 py-5',
          shown === 'both' ? 'sm:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {(shown === 'left' || shown === 'both') && (
          <TreeCard
            title="Tree 1 · (a + a) * a"
            subtitle="addition first → evaluates to (a+a)*a"
            tree={treeAddFirst}
          />
        )}
        {(shown === 'right' || shown === 'both') && (
          <TreeCard
            title="Tree 2 · a + (a * a)"
            subtitle="multiplication first → evaluates to a+(a*a)"
            tree={treeMulFirst}
          />
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Real language grammars remove this ambiguity by stratifying the rules
          (e.g. <code className="font-mono">E → E + T</code>,{' '}
          <code className="font-mono">T → T * F</code>,{' '}
          <code className="font-mono">F → a | ( E )</code>), which forces{' '}
          <span className="text-foreground">*</span> to bind tighter than{' '}
          <span className="text-foreground">+</span>.
        </p>
      </div>
    </div>
  )
}

function TreeCard({
  title,
  subtitle,
  tree,
}: {
  title: string
  subtitle: string
  tree: Tree
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="font-mono text-sm font-semibold text-foreground">{title}</p>
      <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>
      <div className="flex justify-center overflow-x-auto pb-2">
        <TreeNode node={tree} />
      </div>
    </div>
  )
}

function TreeNode({ node }: { node: Tree }) {
  const hasChildren = node.children && node.children.length > 0
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'grid size-8 place-items-center rounded-md border font-mono text-sm',
          node.kind === 'nonterminal' && 'border-primary/60 bg-primary/10 text-primary',
          node.kind === 'op' && 'border-accent/60 bg-accent/10 text-accent',
          node.kind === 'leaf' && 'border-border bg-muted text-foreground',
        )}
      >
        {node.label}
      </div>
      {hasChildren && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-start gap-3 border-t border-border pt-3">
            {node.children!.map((c, i) => (
              <TreeNode key={i} node={c} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
