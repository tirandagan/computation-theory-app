import type { ReactNode } from 'react'
import { Lightbulb, BookMarked, Sigma, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-pretty leading-relaxed text-foreground/90">{children}</p>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-serif text-2xl tracking-tight text-foreground">
      {children}
    </h3>
  )
}

export function Definition({
  term,
  children,
}: {
  term: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <BookMarked className="size-4 text-primary" />
        <span className="font-mono text-xs uppercase tracking-widest text-primary">
          Definition · {term}
        </span>
      </div>
      <div className="space-y-2 leading-relaxed text-foreground/90">
        {children}
      </div>
    </div>
  )
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto rounded-xl border border-border bg-background/60 px-5 py-4">
      <Sigma className="size-4 shrink-0 text-muted-foreground" />
      <code className="font-mono text-base text-foreground">{children}</code>
    </div>
  )
}

export function Callout({
  kind = 'tip',
  title,
  children,
}: {
  kind?: 'tip' | 'warning'
  title: string
  children: ReactNode
}) {
  const Icon = kind === 'tip' ? Lightbulb : TriangleAlert
  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        kind === 'tip'
          ? 'border-accent/30 bg-accent/5'
          : 'border-destructive/30 bg-destructive/5',
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <Icon
          className={cn(
            'size-4',
            kind === 'tip' ? 'text-accent' : 'text-destructive',
          )}
        />
        <span
          className={cn(
            'text-sm font-semibold',
            kind === 'tip' ? 'text-accent' : 'text-destructive',
          )}
        >
          {title}
        </span>
      </div>
      <div className="leading-relaxed text-foreground/90">{children}</div>
    </div>
  )
}

/** Inline monospace math-ish token. */
export function M({ children }: { children: ReactNode }) {
  return <span className="font-mono text-primary">{children}</span>
}
