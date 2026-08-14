import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'

// PLAN 4 BOUNDARY: Plan 4 (nights authoring) replaces this component's body
// with the full night-10 extended ending (dog curls up, traffic gone, the
// tiny lone-window joke). The props are the stable contract: it is mounted
// over the still-rendering, settled scene when the FINAL night completes,
// and calls onDone() when the ending has played out (returns to title).
export default function EndingSequence({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 6000)
    return () => window.clearTimeout(t)
  }, [onDone])
  return (
    <Fade in timeout={1200}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          pointerEvents: 'none',
        }}
      >
        <Typography
          variant="h3"
          sx={{ color: '#e8edfa', fontFamily: 'Georgia, serif', textAlign: 'center', textShadow: '0 2px 12px #000' }}
        >
          Goodnight, Little Town.
        </Typography>
        <Typography sx={{ color: '#b9c4de', textShadow: '0 1px 8px #000' }}>
          Everyone is finally asleep.
        </Typography>
      </Box>
    </Fade>
  )
}
