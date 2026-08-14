import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

// Timeline (ms from mount) over the completed night-10 scene:
//   0     — let the finished town breathe
//   2500  — "Goodnight, Little Town."
//   5500  — "Everyone is finally asleep."
//   10500 — the joke: one tiny upstairs light clicks ON
//   12000 — …clicks OFF
//   15000 — onDone() → title
const TIMELINE: Array<{ at: number; phase: number }> = [
  { at: 2500, phase: 1 },
  { at: 5500, phase: 2 },
  { at: 10500, phase: 3 },
  { at: 12000, phase: 4 },
  { at: 15000, phase: 5 },
]

// Upstairs window of the Last Lamp House (night10.ts: last-lamp at 900,590).
// If that house moves, move this with it.
const JOKE = { x: 892, y: 512, w: 16, h: 12 }

const fade = (visible: boolean): CSSProperties => ({
  opacity: visible ? 1 : 0,
  transition: 'opacity 1.2s ease',
})

export default function EndingSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = TIMELINE.map(({ at, phase: p }) =>
      window.setTimeout(() => (p === 5 ? onDone() : setPhase(p)), at),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '12vh',
        textAlign: 'center',
        color: '#e8e6f0',
        fontFamily: 'Georgia, "Times New Roman", serif',
        textShadow: '0 1px 8px rgba(0,0,0,0.8)',
      }}
    >
      {/* Joke light: shares the scene viewBox so town coordinates align. */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <rect
          x={JOKE.x}
          y={JOKE.y}
          width={JOKE.w}
          height={JOKE.h}
          rx={2}
          fill="#ffdf8a"
          opacity={phase === 3 ? 1 : 0}
          style={{ transition: 'opacity 0.15s linear' }} // a click, not a fade
        />
      </svg>
      <div style={{ ...fade(phase >= 1), fontSize: 'clamp(1.6rem, 4vw, 2.6rem)' }}>
        Goodnight, Little Town.
      </div>
      <div
        style={{
          ...fade(phase >= 2),
          fontSize: 'clamp(1rem, 2.2vw, 1.4rem)',
          marginTop: '0.8em',
          opacity: phase >= 2 ? 0.85 : 0,
        }}
      >
        Everyone is finally asleep.
      </div>
    </div>
  )
}
