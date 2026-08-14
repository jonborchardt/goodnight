const KEY = 'goodnight.progress'

export interface Progress {
  highestNight: number
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p: unknown = JSON.parse(raw)
      if (
        typeof p === 'object' &&
        p !== null &&
        typeof (p as Progress).highestNight === 'number'
      ) {
        return { highestNight: Math.max(1, Math.min(10, (p as Progress).highestNight)) }
      }
    }
  } catch {
    // corrupted or unavailable storage: fall through to a fresh start
  }
  return { highestNight: 1 }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // storage unavailable (private mode etc.) - progress just won't persist
  }
}
