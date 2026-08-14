import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import type { GameState, WeatherId } from '../game/types'
import type { GameControls } from './useGameLoop'

const WEATHER_ICON: Record<WeatherId, string> = { clear: '☾', wind: '🍃', rain: '🌧' }
const WEATHER_LABEL: Record<WeatherId, string> = { clear: 'Clear', wind: 'Wind', rain: 'Rain' }
const PANEL = 'rgba(20, 26, 44, 0.8)'
const INK = '#dfe6f5'

export default function Hud({ state, controls }: { state: GameState; controls: GameControls }) {
  const level = state.level
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pointerEvents: 'none',
          '& > *': { pointerEvents: 'auto' },
        }}
      >
        <Chip label={`Night ${level.night}`} sx={{ bgcolor: PANEL, color: INK }} />
        {level.weatherOptions.length > 1 && (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={state.weather}
            onChange={(_e, w: WeatherId | null) => {
              if (w) controls.setWeather(w)
            }}
            sx={{ bgcolor: PANEL }}
          >
            {level.weatherOptions.map((w) => (
              <ToggleButton key={w} value={w} aria-label={WEATHER_LABEL[w]} sx={{ color: INK, px: 1.5 }}>
                {WEATHER_ICON[w]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        <Box sx={{ flex: 1 }} />
        <IconButton aria-label="Restart night" onClick={controls.restart} sx={{ color: INK, bgcolor: PANEL }}>
          ⟲
        </IconButton>
        {/* Mute placeholder: Plan 5 (audio) makes this functional */}
        <IconButton aria-label="Sound (coming in a later plan)" disabled sx={{ color: INK, bgcolor: 'rgba(20,26,44,0.4)' }}>
          ♪
        </IconButton>
      </Box>
      <Fade in={state.time < 8} timeout={{ enter: 400, exit: 1500 }}>
        <Typography
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#cfd9f0',
            fontStyle: 'italic',
            textShadow: '0 1px 6px #000',
            pointerEvents: 'none',
          }}
        >
          {level.hint}
        </Typography>
      </Fade>
    </>
  )
}
