'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Minus, Plus, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const MIN_SCALE = 1
const MAX_SCALE = 5

interface Transform {
  scale: number
  tx: number
  ty: number
}

const IDENTITY: Transform = { scale: 1, tx: 0, ty: 0 }

function clampScale(s: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
}

/**
 * Wraps a diagram (e.g. an <svg>) and adds pinch-to-zoom (touch), trackpad
 * pinch / ctrl+wheel zoom, and drag-to-pan when zoomed in. Includes on-screen
 * zoom controls and a reset button. Purely presentational — it never mutates
 * its children, only the CSS transform of a wrapper element.
 */
export function PinchZoom({
  children,
  className,
  label = 'Pinch, scroll, or use the controls to zoom',
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [t, setT] = useState<Transform>(IDENTITY)

  // refs holding gesture state so handlers stay stable
  const gesture = useRef<{
    mode: 'none' | 'pan' | 'pinch'
    startDist: number
    startScale: number
    startTx: number
    startTy: number
    focalX: number
    focalY: number
    lastX: number
    lastY: number
  }>({
    mode: 'none',
    startDist: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    focalX: 0,
    focalY: 0,
    lastX: 0,
    lastY: 0,
  })

  const rect = () => containerRef.current?.getBoundingClientRect()

  // Zoom toward a focal point (in container-local coordinates).
  const zoomTo = useCallback(
    (nextScale: number, focalX: number, focalY: number) => {
      setT((prev) => {
        const scale = clampScale(nextScale)
        // keep the content point under the focal point fixed
        const cx = (focalX - prev.tx) / prev.scale
        const cy = (focalY - prev.ty) / prev.scale
        let tx = focalX - cx * scale
        let ty = focalY - cy * scale
        if (scale === 1) {
          tx = 0
          ty = 0
        }
        return { scale, tx, ty }
      })
    },
    [],
  )

  const reset = useCallback(() => setT(IDENTITY), [])

  const zoomByButton = useCallback(
    (factor: number) => {
      const r = rect()
      const fx = r ? r.width / 2 : 0
      const fy = r ? r.height / 2 : 0
      setT((prev) => {
        const scale = clampScale(prev.scale * factor)
        const cx = (fx - prev.tx) / prev.scale
        const cy = (fy - prev.ty) / prev.scale
        let tx = fx - cx * scale
        let ty = fy - cy * scale
        if (scale === 1) {
          tx = 0
          ty = 0
        }
        return { scale, tx, ty }
      })
    },
    [],
  )

  // wheel / trackpad pinch (ctrl or meta held) — attached non-passively so we
  // can preventDefault and stop the page from scrolling while zooming.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const fx = e.clientX - r.left
      const fy = e.clientY - r.top
      const factor = Math.exp(-e.deltaY * 0.01)
      setT((prev) => {
        const scale = clampScale(prev.scale * factor)
        const cx = (fx - prev.tx) / prev.scale
        const cy = (fy - prev.ty) / prev.scale
        let tx = fx - cx * scale
        let ty = fy - cy * scale
        if (scale === 1) {
          tx = 0
          ty = 0
        }
        return { scale, tx, ty }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const dist = (a: React.Touch, b: React.Touch) =>
    Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

  const onTouchStart = (e: React.TouchEvent) => {
    const r = rect()
    if (!r) return
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]]
      gesture.current = {
        ...gesture.current,
        mode: 'pinch',
        startDist: dist(a, b),
        startScale: t.scale,
        focalX: (a.clientX + b.clientX) / 2 - r.left,
        focalY: (a.clientY + b.clientY) / 2 - r.top,
      }
    } else if (e.touches.length === 1 && t.scale > 1) {
      gesture.current = {
        ...gesture.current,
        mode: 'pan',
        lastX: e.touches[0].clientX,
        lastY: e.touches[0].clientY,
      }
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const g = gesture.current
    if (g.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault()
      const ratio = dist(e.touches[0], e.touches[1]) / (g.startDist || 1)
      zoomTo(g.startScale * ratio, g.focalX, g.focalY)
    } else if (g.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault()
      const touch = e.touches[0]
      const dx = touch.clientX - g.lastX
      const dy = touch.clientY - g.lastY
      g.lastX = touch.clientX
      g.lastY = touch.clientY
      setT((prev) => ({ ...prev, tx: prev.tx + dx, ty: prev.ty + dy }))
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) gesture.current.mode = 'none'
    else if (e.touches.length === 1) {
      gesture.current.mode = 'pan'
      gesture.current.lastX = e.touches[0].clientX
      gesture.current.lastY = e.touches[0].clientY
    }
  }

  // mouse drag to pan when zoomed in
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || t.scale <= 1) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    gesture.current.mode = 'pan'
    gesture.current.lastX = e.clientX
    gesture.current.lastY = e.clientY
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || gesture.current.mode !== 'pan') return
    const dx = e.clientX - gesture.current.lastX
    const dy = e.clientY - gesture.current.lastY
    gesture.current.lastX = e.clientX
    gesture.current.lastY = e.clientY
    setT((prev) => ({ ...prev, tx: prev.tx + dx, ty: prev.ty + dy }))
  }

  const onPointerUp = () => {
    if (gesture.current.mode === 'pan') gesture.current.mode = 'none'
  }

  const zoomed = t.scale > 1.001

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative touch-none overflow-hidden',
        zoomed ? 'cursor-grab active:cursor-grabbing' : '',
        className,
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={reset}
    >
      <div
        style={{
          transform: `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})`,
          transformOrigin: '0 0',
          transition: gesture.current.mode === 'none' ? 'transform 0.1s ease-out' : 'none',
        }}
      >
        {children}
      </div>

      {/* controls */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg border border-border bg-card/90 p-1 backdrop-blur">
        <button
          type="button"
          onClick={() => zoomByButton(1 / 1.4)}
          disabled={!zoomed}
          aria-label="Zoom out"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-9 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
          {Math.round(t.scale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => zoomByButton(1.4)}
          aria-label="Zoom in"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!zoomed}
          aria-label="Reset zoom"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      <span className="sr-only">{label}</span>
    </div>
  )
}
