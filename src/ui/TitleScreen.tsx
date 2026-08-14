import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LEVELS } from '../game/levels'

export default function TitleScreen({
  highestNight,
  onStart,
}: {
  highestNight: number
  onStart: (night: number) => void
}) {
  const maxNight = Math.min(highestNight, LEVELS.length)
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        background: 'linear-gradient(#070b1e, #18264a)',
      }}
    >
      <Typography variant="h3" sx={{ color: '#e8edfa', fontFamily: 'Georgia, serif', textAlign: 'center' }}>
        Goodnight, Little Town
      </Typography>
      <Button variant="contained" size="large" onClick={() => onStart(maxNight)}>
        Continue
      </Button>
      <Stack direction="row" spacing={1} useFlexGap sx={{ maxWidth: 480, flexWrap: 'wrap', justifyContent: 'center' }}>
        {LEVELS.slice(0, maxNight).map((lv) => (
          <Button
            key={lv.night}
            variant="outlined"
            onClick={() => onStart(lv.night)}
            sx={{ minWidth: 48, color: '#cfd9f0', borderColor: '#39456b' }}
          >
            {lv.night}
          </Button>
        ))}
      </Stack>
    </Box>
  )
}
