'use client'

import { useState } from 'react'
import { Check, X, GraduationCap, RotateCcw } from 'lucide-react'
import { exercisesFor } from '@/lib/exercises'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  topicId: string
  onScored?: (topicId: string, correct: number, total: number) => void
}

export function Quiz({ topicId, onScored }: Props) {
  const set = exercisesFor(topicId)
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!set) return null
  const total = set.questions.length
  const correct = set.questions.filter(
    (q) => picked[q.id] === q.answer,
  ).length
  const allAnswered = set.questions.every((q) => picked[q.id] !== undefined)

  function submit() {
    setSubmitted(true)
    onScored?.(topicId, correct, total)
  }

  function reset() {
    setPicked({})
    setSubmitted(false)
  }

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Check your understanding
          </span>
        </div>
        {submitted && (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold',
              correct === total
                ? 'bg-success/20 text-success'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {correct}/{total}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {set.questions.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-2 text-pretty font-medium text-foreground">
              {qi + 1}. {q.prompt}
            </p>
            <div className="grid gap-1.5">
              {q.options.map((opt, oi) => {
                const isPicked = picked[q.id] === oi
                const isCorrect = q.answer === oi
                const showState = submitted && (isPicked || isCorrect)
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() =>
                      setPicked((p) => ({ ...p, [q.id]: oi }))
                    }
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      showState
                        ? isCorrect
                          ? 'border-success/50 bg-success/10 text-success'
                          : 'border-destructive/50 bg-destructive/10 text-destructive'
                        : isPicked
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    <span>{opt}</span>
                    {showState &&
                      (isCorrect ? (
                        <Check className="size-4 shrink-0" />
                      ) : isPicked ? (
                        <X className="size-4 shrink-0" />
                      ) : null)}
                  </button>
                )
              })}
            </div>
            {submitted && (
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        {!submitted ? (
          <Button onClick={submit} disabled={!allAnswered}>
            Submit answers
          </Button>
        ) : (
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="size-3.5" /> Try again
          </Button>
        )}
        {!submitted && !allAnswered && (
          <span className="font-mono text-xs text-muted-foreground">
            answer all {total} to submit
          </span>
        )}
      </div>
    </div>
  )
}
