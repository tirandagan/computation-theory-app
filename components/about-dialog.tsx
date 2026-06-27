'use client'

import { useEffect, useState } from 'react'
import { Info, X, BookMarked, Mail, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AboutDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="About this app"
        className={cn(
          'grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className,
        )}
      >
        <Info className="size-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
        >
          <button
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-md bg-primary font-serif text-lg text-primary-foreground">
                  A
                </span>
                <div>
                  <h2
                    id="about-title"
                    className="font-serif text-xl tracking-tight text-foreground"
                  >
                    About Automata
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground">
                    an interactive course
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                An interactive learning application for the theory of
                computation, featuring runnable automata, Turing machines, and
                regular-expression labs.
              </p>

              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Code2 className="size-3" /> Created by
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Tiran Dagan
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  PhD Candidate, Stevens Institute of Technology
                </p>
                <a
                  href="mailto:tdagan@stevens.edu"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:underline"
                >
                  <Mail className="size-3.5" /> tdagan@stevens.edu
                </a>
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <BookMarked className="size-3" /> Based on the book
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Introduction to the Theory of Computation
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  by Michael Sipser — 3rd Edition, Cengage Learning.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  All concepts, definitions, and the course structure are
                  derived from Professor Sipser&apos;s work. This app is an
                  educational companion and is not affiliated with or endorsed
                  by the author or publisher.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
