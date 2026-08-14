export type WeatherId = 'clear' | 'wind' | 'rain'
export type TraitId =
  | 'deepSleeper' | 'lightSleeper' | 'needsLight' | 'lovesDark'
  | 'rainSleeper' | 'stormWorrier' | 'freshAir' | 'quietHouse'
export type DisturbanceType = 'bark' | 'car' | 'owl' | 'cans' | 'gate' | 'thunder' | 'tv'

export interface Vec2 { x: number; y: number }

export interface HouseDef {
  id: string
  label: string
  pos: Vec2
  color: string
  variant: 'cottage' | 'tall' | 'farm' | 'tiny' | 'chimney'
  traits: TraitId[]
  hasWindowControl: boolean
  windowStartsOpen?: boolean
}

export interface StreetlightDef { id: string; pos: Vec2; startsOn: boolean }

export interface ScheduleEntry {
  type: DisturbanceType
  pos?: Vec2
  minGap: number
  maxGap: number
  firstAt?: number
}

export interface LevelDef {
  night: number
  title: string
  hint: string
  settleSeconds: number
  weatherOptions: WeatherId[]
  startWeather: WeatherId
  thunder: boolean
  dog?: { pos: Vec2 }
  owl?: { perches: Vec2[]; start: number }
  houses: HouseDef[]
  streetlights: StreetlightDef[]
  schedule: ScheduleEntry[]
}

export interface Disturbance {
  id: number
  type: DisturbanceType
  pos: Vec2
  loudness: number
  age: number
  duration: number
  masked: boolean
}

export interface HouseState {
  def: HouseDef
  sleep: number
  windowOpen: boolean
  wokeAt: number | null
  rate: number
}

export type Stage = 'awake' | 'drowsy' | 'nearly' | 'asleep'

export function stageOf(sleep: number): Stage {
  if (sleep < 40) return 'awake'
  if (sleep < 75) return 'drowsy'
  if (sleep < 100) return 'nearly'
  return 'asleep'
}

export interface GameState {
  level: LevelDef
  time: number
  status: 'playing' | 'settling' | 'complete'
  settleProgress: number
  weather: WeatherId
  houses: HouseState[]
  lights: { def: StreetlightDef; on: boolean }[]
  disturbances: Disturbance[]
  car: { x: number; dir: 1 | -1 } | null
  owl: { perch: number; pos: Vec2; movedAt: number } | null
  shhh: { pos: Vec2 } | null
  seed: number
  // --- internal sim fields (additive; the view only reads the fields above) ---
  rng: () => number
  nextAt: number[]        // per-schedule-entry next fire time
  severeUntil: number     // no severe disturbance may start before this time
  lastThunderAt: number
  nextId: number
}
