import { useEffect, useRef, useState } from 'react'
import { stageOf } from '../game/types'
import type { HouseDef, HouseState, Stage } from '../game/types'

interface WindowRect { x: number; y: number; w: number; h: number }
interface VariantArt { w: number; h: number; roof: string; windows: WindowRect[] }

// Each variant: body rect (w x h), roof polygon points (y=0 is body top),
// window rects in body coordinates. windows[0] is the control window when
// hasWindowControl, and the "one small light" in the nearly-asleep stage.
const VARIANTS: Record<HouseDef['variant'], VariantArt> = {
  cottage: {
    w: 140, h: 90, roof: '-12,0 70,-50 152,0',
    windows: [{ x: 22, y: 32, w: 28, h: 28 }, { x: 90, y: 32, w: 28, h: 28 }],
  },
  tall: {
    w: 100, h: 160, roof: '-10,0 50,-44 110,0',
    windows: [
      { x: 34, y: 18, w: 32, h: 26 },
      { x: 34, y: 62, w: 32, h: 26 },
      { x: 34, y: 106, w: 32, h: 26 },
    ],
  },
  farm: {
    w: 190, h: 100, roof: '-14,0 34,-46 156,-46 204,0',
    windows: [
      { x: 20, y: 34, w: 28, h: 28 },
      { x: 81, y: 34, w: 28, h: 28 },
      { x: 142, y: 34, w: 28, h: 28 },
    ],
  },
  tiny: {
    w: 84, h: 62, roof: '-10,0 42,-36 94,0',
    windows: [{ x: 28, y: 20, w: 28, h: 26 }],
  },
  chimney: {
    w: 130, h: 92, roof: '-12,0 65,-48 142,0',
    windows: [{ x: 20, y: 32, w: 26, h: 26 }, { x: 84, y: 32, w: 26, h: 26 }],
  },
}

function windowFill(stage: Stage, i: number): string {
  if (stage === 'awake') return '#ffd98a'
  if (stage === 'drowsy') return '#b98d4f'
  if (stage === 'nearly' && i === 0) return '#7d6238'
  return '#141a28'
}

function Pane({ wr, fill, restless }: { wr: WindowRect; fill: string; restless?: boolean }) {
  return (
    <g>
      <rect className={`pane${restless ? ' restless' : ''}`} x={wr.x} y={wr.y} width={wr.w} height={wr.h} rx={2}
        fill={fill} stroke="#0d1320" strokeWidth={2} />
      <line x1={wr.x + wr.w / 2} y1={wr.y} x2={wr.x + wr.w / 2} y2={wr.y + wr.h}
        stroke="#0d1320" strokeWidth={2} />
    </g>
  )
}

// Open/closed reads from SHAPE, not color: open = raised sash (dark gap on
// top, half pane below) + curtain flick; closed = full pane with muntin bar.
// No tap-target rect here: it's rendered by TownScene in a top-most overlay
// pass (see windowHitRect below) so it can never be occluded by a streetlight
// or another house's body in this game's dense adjacency layouts.
function ControlWindow({ wr, open, fill, restless }: {
  wr: WindowRect; open: boolean; fill: string; restless?: boolean
}) {
  return (
    <g>
      <rect x={wr.x - 3} y={wr.y - 3} width={wr.w + 6} height={wr.h + 6} rx={2}
        fill="none" stroke="#c8b8a0" strokeWidth={3} />
      {open ? (
        <g>
          <rect x={wr.x} y={wr.y} width={wr.w} height={wr.h / 2} fill="#0a0f1a" />
          <rect className={`pane${restless ? ' restless' : ''}`} x={wr.x} y={wr.y + wr.h / 2} width={wr.w} height={wr.h / 2}
            fill={fill} stroke="#0d1320" strokeWidth={2} />
          <path d={`M ${wr.x} ${wr.y} q 6 10 0 ${wr.h / 2}`}
            stroke="#e8e2d0" strokeWidth={2.5} fill="none" />
        </g>
      ) : (
        <g>
          <rect className={`pane${restless ? ' restless' : ''}`} x={wr.x} y={wr.y} width={wr.w} height={wr.h}
            fill={fill} stroke="#0d1320" strokeWidth={2} />
          <line x1={wr.x} y1={wr.y + wr.h / 2} x2={wr.x + wr.w} y2={wr.y + wr.h / 2}
            stroke="#0d1320" strokeWidth={2} />
        </g>
      )}
    </g>
  )
}

// World-space oversized tap target (68x68 >= 60 scene units) for a house's
// control window, i.e. windows[0]. Used by TownScene to render the hit-rect
// in a top-most overlay pass. Returns null for houses without window control.
export function windowHitRect(def: HouseDef): WindowRect | null {
  if (!def.hasWindowControl) return null
  const art = VARIANTS[def.variant]
  const wr = art.windows[0]
  const originX = def.pos.x - art.w / 2
  const originY = def.pos.y - art.h
  return { x: originX + wr.x + wr.w / 2 - 34, y: originY + wr.y + wr.h / 2 - 34, w: 68, h: 68 }
}

function Zzz({ x, y }: { x: number; y: number }) {
  return (
    <g pointerEvents="none">
      {[0, 1, 2].map((i) => (
        <text
          key={i}
          className="zzz-glyph"
          x={x + i * 10}
          y={y - i * 6}
          fontSize={16 + i * 5}
          fill="#cdd8f2"
          fontFamily="Georgia, serif"
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          z
        </text>
      ))}
    </g>
  )
}

function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g pointerEvents="none">
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="smoke-puff"
          cx={x}
          cy={y}
          r={5 + i * 2}
          fill="#9aa4b8"
          style={{ animationDelay: `${i * 1.1}s` }}
        />
      ))}
    </g>
  )
}

export default function House({ hs, now }: { hs: HouseState; now: number }) {
  const def = hs.def
  const art = VARIANTS[def.variant]
  const stage = stageOf(hs.sleep)
  const justWoke = hs.wokeAt !== null && now - hs.wokeAt < 1.6

  // Zen reactive body language: stalled >= 2s -> restless panes; rate recovering
  // from a stall (a toggle helped) -> one-shot content pulse; worsening -> stir.
  const stalledSince = useRef<number | null>(null)
  if (stalledSince.current !== null && stalledSince.current > now) stalledSince.current = now // restart rewinds the clock
  if (hs.sleep < 100 && hs.rate < 0.1) {
    if (stalledSince.current === null) stalledSince.current = now
  } else {
    stalledSince.current = null
  }
  const restless = stalledSince.current !== null && now - stalledSince.current >= 2
  const prevRate = useRef(hs.rate)
  const prevNow = useRef(now)
  const [pulseKey, setPulseKey] = useState(0)
  const [stirKey, setStirKey] = useState(0)
  useEffect(() => {
    // Suppress transition cues when the clock rewinds (restart) and until the
    // first ticked frame (mount renders with rate 0 before the loop starts).
    const rewound = now < prevNow.current
    const preTick = prevNow.current === 0
    if (!rewound && !preTick && hs.sleep < 100) {
      if (prevRate.current < 0.1 && hs.rate > 0.5) setPulseKey((k) => k + 1)
      if (prevRate.current > 0.5 && hs.rate < 0.1) setStirKey((k) => k + 1)
    }
    prevRate.current = hs.rate
    prevNow.current = now
  }, [hs.rate, hs.sleep, now])

  return (
    <g transform={`translate(${def.pos.x - art.w / 2} ${def.pos.y - art.h})`}>
      {def.variant === 'chimney' && (
        <g>
          <rect x={art.w - 36} y={-70} width={18} height={50} fill="#4a3b40" />
          {stage === 'asleep' && <Smoke x={art.w - 27} y={-74} />}
        </g>
      )}
      <rect x={0} y={0} width={art.w} height={art.h} rx={4} fill={def.color} />
      <polygon points={art.roof} fill="#251d29" />
      <rect x={art.w / 2 - 13} y={art.h - 34} width={26} height={34} rx={3} fill="#241d2b" />
      {art.windows.map((wr, i) =>
        def.hasWindowControl && i === 0 ? (
          <ControlWindow key={i} wr={wr} open={hs.windowOpen} fill={windowFill(stage, i)} restless={restless} />
        ) : (
          <Pane key={i} wr={wr} fill={windowFill(stage, i)} restless={restless} />
        ),
      )}
      {stage === 'asleep' && <Zzz x={art.w / 2 + 10} y={-54} />}
      {pulseKey > 0 && (
        <rect
          key={pulseKey}
          className="content-pulse"
          x={-6}
          y={-52}
          width={art.w + 12}
          height={art.h + 56}
          rx={8}
          fill="#bcd0ff"
          pointerEvents="none"
        />
      )}
      {stirKey > 0 && (
        <rect
          key={`stir-${stirKey}`}
          className="stir-flash"
          x={-6}
          y={-52}
          width={art.w + 12}
          height={art.h + 56}
          rx={8}
          fill="#1a1426"
          pointerEvents="none"
        />
      )}
      {justWoke && (
        <rect
          key={hs.wokeAt}
          className="wake-flash"
          x={-10}
          y={-58}
          width={art.w + 20}
          height={art.h + 62}
          rx={10}
          fill="#fff2bd"
          pointerEvents="none"
        />
      )}
    </g>
  )
}
