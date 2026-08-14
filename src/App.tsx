import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import { LEVELS } from './game/levels'
import { loadProgress, saveProgress } from './progress'
import TownScene from './scene/TownScene'
import EndingSequence from './ui/EndingSequence'
import Hud from './ui/Hud'
import TitleScreen from './ui/TitleScreen'
import { useGameLoop } from './ui/useGameLoop'

const GOODNIGHT_PAUSE_MS = 3000 // "Goodnight." breathes ~3 s before the next night

// DEV-only deep link for playtesting: ?night=N jumps straight to night N.
function initialNight(): number | null {
  if (import.meta.env.DEV) {
    const n = Number(new URLSearchParams(window.location.search).get('night'))
    if (Number.isInteger(n) && n >= 1 && n <= LEVELS.length) return n
  }
  return null
}

function Night({ night, onAdvance }: { night: number; onAdvance: (next: number | null) => void }) {
  const level = LEVELS[night - 1]
  const { state, controls } = useGameLoop(level)
  const isFinal = night === LEVELS.length
  const complete = state.status === 'complete'

  // Record progress the moment the night settles.
  useEffect(() => {
    if (!complete) return
    const p = loadProgress()
    const unlocked = Math.min(night + 1, LEVELS.length)
    if (unlocked > p.highestNight) saveProgress({ highestNight: unlocked })
  }, [complete, night])

  // Ordinary nights: let the dark town breathe under "Goodnight.", then advance.
  useEffect(() => {
    if (!complete || isFinal) return
    const t = window.setTimeout(() => onAdvance(night + 1), GOODNIGHT_PAUSE_MS)
    return () => window.clearTimeout(t)
  }, [complete, isFinal, night, onAdvance])

  // Stable identity: Night re-renders every sim tick (even after 'complete'),
  // so an inline arrow here would reset EndingSequence's timeout each frame.
  const onEndingDone = useCallback(() => onAdvance(null), [onAdvance])

  return (
    <>
      <TownScene state={state} controls={controls} />
      <Hud state={state} controls={controls} />
      {complete && !isFinal && (
        <Fade in timeout={800}>
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="h3"
              sx={{ color: '#e8edfa', fontFamily: 'Georgia, serif', textShadow: '0 2px 12px #000' }}
            >
              Goodnight.
            </Typography>
          </Box>
        </Fade>
      )}
      {complete && isFinal && <EndingSequence onDone={onEndingDone} />}
    </>
  )
}

export default function App() {
  const [night, setNight] = useState<number | null>(initialNight)
  if (night === null) {
    return <TitleScreen highestNight={loadProgress().highestNight} onStart={setNight} />
  }
  return <Night key={night} night={night} onAdvance={setNight} />
}
