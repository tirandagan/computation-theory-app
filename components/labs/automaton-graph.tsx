'use client'

import { useMemo } from 'react'
import type { Automaton } from '@/lib/automata'
import { PinchZoom } from '@/components/ui/pinch-zoom'

const R = 28 // state radius

interface Props {
  automaton: Automaton
  active: string[]
  /** states that just became active this step (for a pulse) */
  width?: number
  height?: number
}

interface RenderedEdge {
  from: string
  to: string
  label: string
  curved?: boolean
}

function mergeEdges(automaton: Automaton): RenderedEdge[] {
  const map = new Map<string, RenderedEdge>()
  for (const e of automaton.edges) {
    const key = `${e.from}->${e.to}`
    const existing = map.get(key)
    if (existing) {
      existing.label = `${existing.label},${e.label}`
    } else {
      map.set(key, { ...e })
    }
  }
  // mark curved when a reverse edge also exists (and it's not a self loop)
  for (const edge of map.values()) {
    if (edge.from === edge.to) continue
    if (map.has(`${edge.to}->${edge.from}`)) edge.curved = true
  }
  return [...map.values()]
}

export function AutomatonGraph({
  automaton,
  active,
  width = 660,
  height = 400,
}: Props) {
  const edges = useMemo(() => mergeEdges(automaton), [automaton])
  const pos = useMemo(() => {
    const m: Record<string, { x: number; y: number }> = {}
    for (const s of automaton.states) m[s.id] = { x: s.x, y: s.y }
    return m
  }, [automaton])
  const activeSet = new Set(active)

  return (
    <PinchZoom className="flex min-h-full flex-1 flex-col justify-center">
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label={`State diagram for ${automaton.name}`}
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
        </marker>
        <marker
          id="arrow-active"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-primary" />
        </marker>
      </defs>

      {/* edges */}
      {edges.map((edge) => {
        const a = pos[edge.from]
        const b = pos[edge.to]
        const edgeActive =
          activeSet.has(edge.from) && activeSet.has(edge.to)

        if (edge.from === edge.to) {
          // self-loop arc above the node
          const cx = a.x
          const cy = a.y - R
          const path = `M ${cx - 12} ${cy - 4} C ${cx - 30} ${cy - 48}, ${
            cx + 30
          } ${cy - 48}, ${cx + 12} ${cy - 4}`
          return (
            <g key={`${edge.from}-self`}>
              <path
                d={path}
                fill="none"
                className={
                  edgeActive ? 'stroke-primary' : 'stroke-muted-foreground'
                }
                strokeWidth={edgeActive ? 2.5 : 1.5}
                markerEnd={`url(#${edgeActive ? 'arrow-active' : 'arrow'})`}
              />
              <text
                x={cx}
                y={cy - 52}
                textAnchor="middle"
                className="fill-foreground font-mono text-[15px]"
              >
                {edge.label}
              </text>
            </g>
          )
        }

        // straight or curved edge between two nodes
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy) || 1
        const ux = dx / dist
        const uy = dy / dist
        // perpendicular offset for curved bidirectional edges
        const off = edge.curved ? 26 : 0
        const px = -uy * off
        const py = ux * off

        const startX = a.x + ux * R + px * 0.3
        const startY = a.y + uy * R + py * 0.3
        const endX = b.x - ux * R + px * 0.3
        const endY = b.y - uy * R + py * 0.3
        const midX = (startX + endX) / 2 + px
        const midY = (startY + endY) / 2 + py

        const d = edge.curved
          ? `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
          : `M ${startX} ${startY} L ${endX} ${endY}`

        const labelX = edge.curved ? midX : (startX + endX) / 2
        const labelY = (edge.curved ? midY : (startY + endY) / 2) - 8

        return (
          <g key={`${edge.from}-${edge.to}`}>
            <path
              d={d}
              fill="none"
              className={
                edgeActive ? 'stroke-primary' : 'stroke-muted-foreground'
              }
              strokeWidth={edgeActive ? 2.5 : 1.5}
              markerEnd={`url(#${edgeActive ? 'arrow-active' : 'arrow'})`}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              className="fill-foreground font-mono text-[15px]"
            >
              {edge.label}
            </text>
          </g>
        )
      })}

      {/* start arrow */}
      {(() => {
        const s = pos[automaton.start]
        return (
          <line
            x1={s.x - R - 34}
            y1={s.y}
            x2={s.x - R - 4}
            y2={s.y}
            className="stroke-accent"
            strokeWidth={2}
            markerEnd="url(#arrow)"
          />
        )
      })()}

      {/* states */}
      {automaton.states.map((s) => {
        const isActive = activeSet.has(s.id)
        return (
          <g key={s.id}>
            {isActive && (
              <circle
                cx={s.x}
                cy={s.y}
                r={R + 8}
                className="fill-primary/15"
              />
            )}
            <circle
              cx={s.x}
              cy={s.y}
              r={R}
              className={
                isActive
                  ? 'fill-primary stroke-primary'
                  : 'fill-card stroke-muted-foreground'
              }
              strokeWidth={2}
            />
            {s.accept && (
              <circle
                cx={s.x}
                cy={s.y}
                r={R - 5}
                fill="none"
                className={
                  isActive ? 'stroke-primary-foreground' : 'stroke-muted-foreground'
                }
                strokeWidth={1.5}
              />
            )}
            <text
              x={s.x}
              y={s.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={
                isActive
                  ? 'fill-primary-foreground font-mono text-[15px] font-semibold'
                  : 'fill-foreground font-mono text-[15px]'
              }
            >
              {s.id}
            </text>
          </g>
        )
      })}
    </svg>
    </PinchZoom>
  )
}
