import { NextResponse } from "next/server"

type CelesTrakRecord = {
  OBJECT_NAME?: string
  EPOCH?: string
  MEAN_MOTION?: number
  ECCENTRICITY?: number
  INCLINATION?: number
  NORAD_CAT_ID?: number
  REV_AT_EPOCH?: number
}

type LaunchRecord = {
  id?: string
  name?: string
  net?: string
  status?: { name?: string }
  url?: string
  launch_service_provider?: { name?: string }
  rocket?: { configuration?: { full_name?: string; name?: string } }
  mission?: { name?: string; type?: string; orbit?: { name?: string } }
  pad?: { name?: string; location?: { name?: string } }
}

const earthRadiusKm = 6371
const earthGravityKm3PerSecond2 = 398600.4418

function orbitalStats(record: CelesTrakRecord | undefined) {
  const meanMotion = record?.MEAN_MOTION
  if (!record || !meanMotion || meanMotion <= 0) return null
  const radiansPerSecond = meanMotion * Math.PI * 2 / 86400
  const semiMajorAxis = Math.cbrt(earthGravityKm3PerSecond2 / (radiansPerSecond ** 2))
  const eccentricity = record.ECCENTRICITY ?? 0

  return {
    name: record.OBJECT_NAME ?? "ISS (ZARYA)",
    noradId: record.NORAD_CAT_ID ?? 25544,
    altitudeKm: Math.round(semiMajorAxis - earthRadiusKm),
    speedKmh: Math.round(Math.sqrt(earthGravityKm3PerSecond2 / semiMajorAxis) * 3600),
    perigeeKm: Math.round(semiMajorAxis * (1 - eccentricity) - earthRadiusKm),
    apogeeKm: Math.round(semiMajorAxis * (1 + eccentricity) - earthRadiusKm),
    periodMinutes: Number((1440 / meanMotion).toFixed(1)),
    inclinationDegrees: Number((record.INCLINATION ?? 51.6).toFixed(1)),
    orbitNumber: record.REV_AT_EPOCH ?? null,
    updatedAt: record.EPOCH ?? null,
    sourceLabel: "CelesTrak",
    sourceUrl: "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON",
  }
}

function upcomingLaunch(records: LaunchRecord[] | undefined) {
  if (!Array.isArray(records)) return null
  const now = Date.now()
  const deadline = now + 24 * 60 * 60 * 1000
  const launch = records.find((record) => {
    const launchTime = Date.parse(record.net ?? "")
    return Number.isFinite(launchTime) && launchTime >= now && launchTime <= deadline
  })
  if (!launch?.net) return null

  return {
    id: launch.id ?? launch.name ?? launch.net,
    name: launch.name ?? launch.mission?.name ?? "SpaceX launch",
    net: launch.net,
    status: launch.status?.name ?? "Scheduled",
    rocket: launch.rocket?.configuration?.full_name ?? launch.rocket?.configuration?.name ?? "SpaceX vehicle",
    missionType: launch.mission?.type ?? null,
    orbit: launch.mission?.orbit?.name ?? null,
    pad: launch.pad?.name ?? null,
    location: launch.pad?.location?.name ?? null,
    sourceLabel: "Launch Library 2",
    sourceUrl: launch.url ?? "https://thespacedevs.com/llapi",
  }
}

export async function GET() {
  const [satelliteResult, launchResult] = await Promise.allSettled([
    fetch("https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON", {
      next: { revalidate: 7200 },
      headers: { Accept: "application/json" },
    }).then(async (response) => {
      if (!response.ok) throw new Error(`CelesTrak ${response.status}`)
      return response.json() as Promise<CelesTrakRecord[]>
    }),
    fetch("https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=5&ordering=net&lsp__name=SpaceX", {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json" },
    }).then(async (response) => {
      if (!response.ok) throw new Error(`Launch Library ${response.status}`)
      return response.json() as Promise<{ results?: LaunchRecord[] }>
    }),
  ])

  const satellite = satelliteResult.status === "fulfilled"
    ? orbitalStats(satelliteResult.value[0])
    : null
  const launch = launchResult.status === "fulfilled"
    ? upcomingLaunch(launchResult.value.results)
    : null

  return NextResponse.json(
    { satellite, launch, generatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=7200" } },
  )
}
