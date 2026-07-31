import { NextResponse } from "next/server"
import { CosmicEvent, curatedCosmicEvents } from "@/lib/cosmic-events"

export const revalidate = 3600

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "Keeda-Scully-cosmic-events/1.0" },
    next: { revalidate },
  })
  if (!response.ok) throw new Error(`Unable to fetch ${url}`)
  return response.json() as Promise<unknown>
}

async function currentEarthquake(): Promise<CosmicEvent | null> {
  const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const data = await fetchJson(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=1&orderby=magnitude&minmagnitude=5.5&starttime=${encodeURIComponent(startTime)}`,
  )
  if (!isRecord(data) || !Array.isArray(data.features) || !isRecord(data.features[0])) return null
  const feature = data.features[0]
  if (!isRecord(feature.properties)) return null
  const magnitude = feature.properties.mag
  const place = feature.properties.place
  const url = feature.properties.url
  const time = feature.properties.time
  if (typeof magnitude !== "number" || typeof place !== "string" || typeof url !== "string") return null

  return {
    id: `usgs-${String(feature.id ?? time ?? place)}`,
    category: "nature",
    rarity: magnitude >= 7 ? "rare" : "uncommon",
    visual: "deep-time-dust",
    title: "Earth in motion",
    fact: `In the past day, instruments recorded a magnitude ${magnitude.toFixed(1)} earthquake near ${place}.`,
    sourceLabel: "USGS live earthquake data",
    sourceUrl: url,
    live: true,
    observedAt: typeof time === "number" ? new Date(time).toISOString() : undefined,
  }
}

async function currentNaturalEvent(): Promise<CosmicEvent | null> {
  const data = await fetchJson(
    "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20&days=30&category=volcanoes,severeStorms,seaLakeIce,dustHaze",
  )
  if (!isRecord(data) || !Array.isArray(data.events)) return null
  const candidates = data.events.filter(isRecord)
  if (candidates.length === 0) return null
  const day = Math.floor(Date.now() / 86400000)
  const event = candidates[day % candidates.length]
  const title = event.title
  const id = event.id
  const link = event.link
  if (typeof title !== "string" || typeof id !== "string") return null

  return {
    id: `eonet-${id}`,
    category: "nature",
    rarity: "uncommon",
    visual: "constellation-bloom",
    title: "Earth observed",
    fact: `${title} is currently among the natural events being tracked through NASA Earth observations.`,
    sourceLabel: "NASA EONET live events",
    sourceUrl: typeof link === "string" ? link : `https://eonet.gsfc.nasa.gov/api/v3/events/${id}`,
    live: true,
  }
}

export async function GET() {
  const liveResults = await Promise.allSettled([currentEarthquake(), currentNaturalEvent()])
  const liveEvents = liveResults.flatMap((result) =>
    result.status === "fulfilled" && result.value ? [result.value] : [],
  )

  return NextResponse.json({
    events: [...curatedCosmicEvents, ...liveEvents],
    generatedAt: new Date().toISOString(),
  })
}
