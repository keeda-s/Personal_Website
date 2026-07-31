export type MoonCoastData = {
  moon: {
    date: string
    dateLabel: string
    phase: string
    illumination: number
  }
  tide: {
    high: string | null
    low: string | null
    highTime: string | null
    highHeight: string | null
    lowTime: string | null
    lowHeight: string | null
    liveHeight: string | null
    predictedHeight: string | null
    updated: string | null
    sourceUrl: string
  }
  swell: {
    label: string
    detail: string
    height: string | null
    direction: string | null
    directionDegrees: string | null
    period: string | null
    time: string | null
    sourceUrl: string
  }
  wind: {
    latest: string
    direction: string | null
    speed: string | null
    speedKts: string | null
    gust: string | null
    gustKts: string | null
    sourceUrl: string
    forecastUrl: string
  }
}

export function swellArrowRotation(degrees: string | null | undefined, reverse = false) {
  const value = Number.parseFloat(degrees ?? "")
  return Number.isFinite(value) ? `${value + (reverse ? 180 : 0)}deg` : "0deg"
}

export function compassDirection(degrees: number) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  return directions[Math.round(degrees / 22.5) % directions.length]
}


export const moonPhases = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Third Quarter",
  "Waning Crescent",
]
export const moonLoopCycles = 21
export const moonMiddleCycle = Math.floor(moonLoopCycles / 2)

export const moonPhaseStarts: Record<string, number> = {
  "New Moon": 0.97,
  "Waxing Crescent": 0.03,
  "First Quarter": 0.22,
  "Waxing Gibbous": 0.28,
  "Full Moon": 0.47,
  "Waning Gibbous": 0.53,
  "Third Quarter": 0.72,
  "Waning Crescent": 0.78,
}

export const moonPhaseIllumination: Record<string, number> = {
  "New Moon": 0,
  "Waxing Crescent": 25,
  "First Quarter": 50,
  "Waxing Gibbous": 75,
  "Full Moon": 100,
  "Waning Gibbous": 75,
  "Third Quarter": 50,
  "Waning Crescent": 25,
}

export function moonPhaseClassName(phase: string) {
  return phase.toLowerCase().replace(/\s+/g, "-")
}

export function moonPhaseSequence(currentPhase?: string) {
  const normalizedCurrent = currentPhase === "Last Quarter" ? "Third Quarter" : currentPhase
  return Array.from({ length: moonLoopCycles }, (_, cycle) =>
    moonPhases.map((name, index) => ({
      name,
      index,
      cycle,
      isCurrent: name === normalizedCurrent && cycle === moonMiddleCycle,
    })),
  ).flat()
}

export function moonCyclePosition(date = new Date()) {
  const newMoon = Date.UTC(2000, 0, 6, 18, 14)
  const synodicMonth = 29.530588853
  const days = (date.getTime() - newMoon) / 86400000
  return (((days / synodicMonth) % 1) + 1) % 1
}

export function daysUntilMoonPhase(phase: string) {
  const cycle = moonCyclePosition()
  let target = moonPhaseStarts[phase] ?? cycle

  if (target <= cycle) target += 1
  const days = Math.max(1, Math.round((target - cycle) * 29.530588853))
  return `in ${days} day${days === 1 ? "" : "s"}`
}
