import { LEVELS } from './game/levels'
import TownScene from './scene/TownScene'
import { useGameLoop } from './ui/useGameLoop'

// Temporary shell so every scene task is visually verifiable.
// Task 6 replaces this with the title/night/ending state machine.
export default function App() {
  const { state, controls } = useGameLoop(LEVELS[0])
  return <TownScene state={state} controls={controls} />
}
