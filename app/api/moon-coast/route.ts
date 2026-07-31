import { NextResponse } from "next/server"

const tideUrl =
  "https://www.transport.wa.gov.au/marine/charts-warnings-current-conditions/coastal-data-charts/tide-data/busselton-port-geographe"
const swellUrl =
  "https://www.transport.wa.gov.au/marine/charts-warnings-current-conditions/coastal-data-charts/wave-data/cape-naturaliste"
const marineUrl =
  "https://marine-api.open-meteo.com/v1/marine?latitude=-33.53&longitude=114.76&current=wave_height,wave_direction,wave_period"
const windUrl = "https://www.bom.gov.au/products/IDW60801/IDW60801.94600.shtml"
const windJsonUrl = "https://www.bom.gov.au/fwo/IDW60801/IDW60801.94600.json"
const forecastUrl = "https://www.windguru.cz/208626"

function phaseDetails(date = new Date()) {
  const newMoon = Date.UTC(2000, 0, 6, 18, 14)
  const synodicMonth = 29.530588853
  const days = (date.getTime() - newMoon) / 86400000
  const phase = (((days / synodicMonth) % 1) + 1) % 1
  const illumination = Math.round(((1 - Math.cos(Math.PI * 2 * phase)) / 2) * 100)

  let name = "New Moon"
  if (phase >= 0.03 && phase < 0.22) name = "Waxing Crescent"
  else if (phase >= 0.22 && phase < 0.28) name = "First Quarter"
  else if (phase >= 0.28 && phase < 0.47) name = "Waxing Gibbous"
  else if (phase >= 0.47 && phase < 0.53) name = "Full Moon"
  else if (phase >= 0.53 && phase < 0.72) name = "Waning Gibbous"
  else if (phase >= 0.72 && phase < 0.78) name = "Last Quarter"
  else if (phase >= 0.78 && phase < 0.97) name = "Waning Crescent"

  const perthParts = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "2-digit",
    year: "numeric",
    timeZone: "Australia/Perth",
  }).formatToParts(date)
  const datePart = (type: string) => perthParts.find((part) => part.type === type)?.value ?? ""

  return {
    date: new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      timeZone: "Australia/Perth",
    }).format(date),
    dateLabel: `${Number(datePart("day"))}/${datePart("month")}/${datePart("year")}`,
    phase: name,
    illumination,
  }
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function parseTide(html: string) {
  const widget = html.match(/<div class="tide-data--chart">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="tide-data--graph/)?.[1]

  if (!widget) {
    return {
      high: null,
      low: null,
      highTime: null,
      highHeight: null,
      lowTime: null,
      lowHeight: null,
      liveHeight: null,
      predictedHeight: null,
      updated: null,
      sourceUrl: tideUrl,
    }
  }

  const plain = stripTags(widget)
  const updated = plain.match(/Data updated\s+(.+?)\s*Recorded Tide:/)?.[1] ?? null
  const liveHeight = plain.match(/Recorded Tide:\s*([0-9.]+)/)?.[1] ?? null
  const predictedHeight = plain.match(/Predicted:\s*([0-9.]+m?)/)?.[1] ?? null
  const highMatch = plain.match(/High\s*([0-9]{1,2}:[0-9]{2})\s*([0-9]+\.[0-9]+)/)
  const lowMatch = plain.match(/Low\s*([0-9]{1,2}:[0-9]{2})\s*([0-9]+\.[0-9]+)/)
  const high = highMatch ? { time: highMatch[1], height: `${highMatch[2]}m` } : null
  const low = lowMatch ? { time: lowMatch[1], height: `${lowMatch[2]}m` } : null

  return {
    high: high ? `High ${high.time} · ${high.height}` : null,
    low: low ? `Low ${low.time} · ${low.height}` : null,
    highTime: high?.time ?? null,
    highHeight: high?.height ?? null,
    lowTime: low?.time ?? null,
    lowHeight: low?.height ?? null,
    liveHeight: liveHeight ? `${liveHeight}m` : null,
    predictedHeight: predictedHeight?.endsWith("m") ? predictedHeight : predictedHeight ? `${predictedHeight}m` : null,
    updated,
    sourceUrl: tideUrl,
  }
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",
    },
    next: { revalidate: 15 * 60 },
  })

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}`)
  }

  return response.text()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",
    },
    next: { revalidate: 10 * 60 },
  })

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}`)
  }

  return response.json() as Promise<unknown>
}

function parseWind(data: unknown) {
  if (!isRecord(data) || !isRecord(data.observations)) {
    return null
  }

  const observations = data.observations
  if (!Array.isArray(observations.data) || !isRecord(observations.data[0])) {
    return null
  }

  const latest = observations.data[0]
  const direction = typeof latest.wind_dir === "string" ? latest.wind_dir : ""
  const speed = latest.wind_spd_kmh
  const gust = latest.gust_kmh

  if (typeof speed !== "number" && typeof speed !== "string") {
    return null
  }

  const speedLabel = `${direction ? `${direction} ` : ""}${speed} km/h`
  const gustLabel = typeof gust === "number" || typeof gust === "string" ? `${gust} km/h` : null
  return {
    latest: `${speedLabel}${gustLabel ? ` · gust ${gust}` : ""}`,
    direction: direction || null,
    speed: `${speed} km/h`,
    speedKts: `${Math.round(Number(speed) / 1.852)} kts`,
    gust: gustLabel,
    gustKts: typeof gust === "number" || typeof gust === "string" ? `${Math.round(Number(gust) / 1.852)} kts` : null,
  }
}

function formatDirection(degrees: unknown) {
  if (typeof degrees !== "number" || !Number.isFinite(degrees)) {
    return null
  }

  const labels = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  return labels[Math.round(normalizedDegrees / 22.5) % labels.length]
}

function parseMarine(data: unknown) {
  if (!isRecord(data) || !isRecord(data.current)) {
    return null
  }

  const current = data.current
  const height = current.wave_height
  const direction = current.wave_direction
  const period = current.wave_period
  const time = typeof current.time === "string" ? current.time : null
  const directionLabel = formatDirection(direction)

  if (typeof height !== "number") {
    return null
  }

  return {
    label: `${height.toFixed(1)} m`,
    detail: `${directionLabel ?? "--"}${typeof period === "number" ? ` · ${period.toFixed(0)}s` : ""}`,
    height: `${height.toFixed(1)} m`,
    direction: directionLabel,
    directionDegrees: typeof direction === "number" ? `${Math.round(direction)}deg` : null,
    period: typeof period === "number" ? `${period.toFixed(0)}s` : null,
    time,
  }
}

export async function GET() {
  let tide = {
    high: null as string | null,
    low: null as string | null,
    highTime: null as string | null,
    highHeight: null as string | null,
    lowTime: null as string | null,
    lowHeight: null as string | null,
    liveHeight: null as string | null,
    predictedHeight: null as string | null,
    updated: null as string | null,
    sourceUrl: tideUrl,
  }
  let wind = {
    latest: "Open BOM latest",
    direction: null as string | null,
    speed: null as string | null,
    speedKts: null as string | null,
    gust: null as string | null,
    gustKts: null as string | null,
  }
  let swell = {
    label: "Live chart",
    detail: "Cape Naturaliste",
    height: null as string | null,
    direction: null as string | null,
    directionDegrees: null as string | null,
    period: null as string | null,
    time: null as string | null,
  }

  try {
    tide = parseTide(await fetchText(tideUrl))
  } catch {
    tide = {
      high: null,
      low: null,
      highTime: null,
      highHeight: null,
      lowTime: null,
      lowHeight: null,
      liveHeight: null,
      predictedHeight: null,
      updated: null,
      sourceUrl: tideUrl,
    }
  }

  try {
    wind = parseWind(await fetchJson(windJsonUrl)) ?? wind
  } catch {
    wind = { latest: "Open BOM latest", direction: null, speed: null, speedKts: null, gust: null, gustKts: null }
  }

  try {
    swell = parseMarine(await fetchJson(marineUrl)) ?? swell
  } catch {
    swell = {
      label: "Live chart",
      detail: "Cape Naturaliste",
      height: null,
      direction: null,
      directionDegrees: null,
      period: null,
      time: null,
    }
  }

  return NextResponse.json({
    moon: phaseDetails(),
    tide,
    swell: {
      ...swell,
      sourceUrl: swellUrl,
    },
    wind: {
      ...wind,
      sourceUrl: windUrl,
      forecastUrl,
    },
  })
}
