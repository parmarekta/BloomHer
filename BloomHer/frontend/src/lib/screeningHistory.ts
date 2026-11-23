import type { ScreeningResult } from './screening'

export interface ScreeningHistoryEntry extends ScreeningResult {
  id: string
  date: string
}

const STORAGE_KEY = 'bloomher_screening_history'

export function getScreeningHistory(): ScreeningHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

export function saveScreeningResult(
  result: ScreeningResult,
): ScreeningHistoryEntry {
  const entry: ScreeningHistoryEntry = {
    ...result,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  }

  const history = getScreeningHistory()

  history.unshift(entry)

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history),
  )

  return entry
}

export function clearScreeningHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}