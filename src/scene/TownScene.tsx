import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { GameState, Vec2 } from '../game/types'
import type { GameControls } from '../ui/useGameLoop'
import Sky from './Sky'
import Ground from './Ground'
import Trees from './Trees'
import House from './House'
import Streetlight from './Streetlight'
import Dog from './Dog'
import Car from './Car'
import Ripple from './Ripple'
import ShhhCircle from './ShhhCircle'
import RainLayer from './RainLayer'
import './scene.css'

const HOLD_MS = 250 // released sooner over a target = tap; held longer = Shhh
const DRAG_PX = 20 // client px of movement that promotes a press to Shhh

interface PointerHold {
  pointerId: number
  downX: number
  downY: number
  lastX: number
  lastY: number
  toggle: string | null // data-toggle payload under the finger, e.g. "light:l1"
  timer: number
  shhhing: boolean
}

export default function TownScene({ state, controls }: { state: GameState; controls: GameControls }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const holdRef = useRef<PointerHold | null>(null)

  // Client px -> scene units; getScreenCTM handles the letterboxed viewBox.
  const sceneFromClient = (cx: number, cy: number): Vec2 => {
    const svg = svgRef.current!
    const p = new DOMPoint(cx, cy).matrixTransform(svg.getScreenCTM()!.inverse())
    return { x: p.x, y: p.y }
  }

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (state.status === 'complete') return // Shhh disabled once the town settles
    if (holdRef.current) return // one pointer at a time
    e.currentTarget.setPointerCapture(e.pointerId)
    const toggleEl = (e.target as Element).closest('[data-toggle]')
    const h: PointerHold = {
      pointerId: e.pointerId,
      downX: e.clientX,
      downY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      toggle: toggleEl ? toggleEl.getAttribute('data-toggle') : null,
      timer: 0,
      shhhing: false,
    }
    h.timer = window.setTimeout(() => {
      h.shhhing = true
      controls.shhh(sceneFromClient(h.lastX, h.lastY))
    }, HOLD_MS)
    holdRef.current = h
  }

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const h = holdRef.current
    if (!h || e.pointerId !== h.pointerId) return
    h.lastX = e.clientX
    h.lastY = e.clientY
    if (
      !h.shhhing &&
      (Math.abs(e.clientX - h.downX) > DRAG_PX || Math.abs(e.clientY - h.downY) > DRAG_PX)
    ) {
      window.clearTimeout(h.timer)
      h.shhhing = true
      h.toggle = null
    }
    if (h.shhhing) controls.shhh(sceneFromClient(e.clientX, e.clientY))
  }

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    const h = holdRef.current
    if (!h || e.pointerId !== h.pointerId) return
    window.clearTimeout(h.timer)
    holdRef.current = null
    if (h.shhhing) {
      controls.shhh(null)
      return
    }
    if (h.toggle) {
      const [kind, id] = h.toggle.split(':')
      if (kind === 'light') controls.toggleLight(id)
      else if (kind === 'window') controls.toggleWindow(id)
    }
  }

  const onPointerCancel = (e: ReactPointerEvent<SVGSVGElement>) => {
    const h = holdRef.current
    if (!h || e.pointerId !== h.pointerId) return
    window.clearTimeout(h.timer)
    if (h.shhhing) controls.shhh(null)
    holdRef.current = null
  }

  return (
    <div className="town-root">
      <svg
        ref={svgRef}
        className="town-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <Sky state={state} />
        <Ground />
        <Trees swaying={state.weather !== 'clear'} />
        {state.lights.map((l) => (
          <Streetlight key={l.def.id} def={l.def} on={l.on} />
        ))}
        {state.houses.map((h) => (
          <House key={h.def.id} hs={h} now={state.time} />
        ))}
        {state.level.dog && (
          <Dog
            pos={state.level.dog.pos}
            barking={state.disturbances.some((d) => d.type === 'bark')}
          />
        )}
        {state.car && <Car x={state.car.x} dir={state.car.dir} />}
        {state.disturbances.map((d) => (
          <Ripple key={d.id} d={d} />
        ))}
        {state.shhh && <ShhhCircle pos={state.shhh.pos} />}
        <RainLayer weather={state.weather} />
        {/* Brief thunder flash so storms read even when muted */}
        {state.disturbances.some((d) => d.type === 'thunder' && d.age < 0.35) && (
          <rect x={0} y={0} width={1600} height={900} fill="#dfe6ff" opacity={0.22} pointerEvents="none" />
        )}
      </svg>
    </div>
  )
}
