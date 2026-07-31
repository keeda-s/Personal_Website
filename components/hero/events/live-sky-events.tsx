"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SkyFactPanel } from "./sky-fact-panel"

type SatelliteData = {
  name: string
  noradId: number
  altitudeKm: number
  speedKmh: number
  perigeeKm: number
  apogeeKm: number
  periodMinutes: number
  inclinationDegrees: number
  orbitNumber: number | null
  updatedAt: string | null
  sourceLabel: string
  sourceUrl: string
}

type LaunchData = {
  id: string
  name: string
  net: string
  status: string
  rocket: string
  missionType: string | null
  orbit: string | null
  pad: string | null
  location: string | null
  sourceLabel: string
  sourceUrl: string
}

type SkyEventData = {
  satellite: SatelliteData | null
  launch: LaunchData | null
}

function cssSeconds(name: string, fallback: number) {
  const frame = document.querySelector<HTMLElement>(".hero-frame")
  if (!frame) return fallback
  const value = Number.parseFloat(getComputedStyle(frame).getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

function launchCountdown(date: string) {
  const milliseconds = Math.max(0, Date.parse(date) - Date.now())
  const totalMinutes = Math.floor(milliseconds / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `T-${hours}h ${minutes}m` : `T-${minutes}m`
}

export function LiveSkyEvents() {
  const [data, setData] = useState<SkyEventData>({ satellite: null, launch: null })
  const [satellitePass, setSatellitePass] = useState(0)
  const [rocketPass, setRocketPass] = useState(0)
  const [inspected, setInspected] = useState<"satellite" | "launch" | null>(null)
  const satelliteRef = useRef<HTMLButtonElement>(null)
  const rocketRef = useRef<HTMLButtonElement>(null)
  const satelliteTimerRef = useRef<number | null>(null)
  const rocketTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    fetch("/api/sky-events")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Sky data unavailable")))
      .then((nextData: SkyEventData) => setData(nextData))
      .catch(() => undefined)
  }, [])

  const scheduleSatellite = useCallback((initial = false) => {
    if (satelliteTimerRef.current !== null) window.clearTimeout(satelliteTimerRef.current)
    const debug = new URLSearchParams(window.location.search).get("sky-debug")
    const delay = debug === "satellite"
      ? 80
      : cssSeconds(initial ? "--satellite-first-delay" : "--satellite-repeat-delay", initial ? 22 : 150) * 1000
    satelliteTimerRef.current = window.setTimeout(() => setSatellitePass((current) => current + 1), delay)
  }, [])

  const scheduleRocket = useCallback(() => {
    if (rocketTimerRef.current !== null) window.clearTimeout(rocketTimerRef.current)
    const debug = new URLSearchParams(window.location.search).get("sky-debug")
    const delay = debug === "rocket" ? 80 : cssSeconds("--rocket-first-delay", 12) * 1000
    rocketTimerRef.current = window.setTimeout(() => setRocketPass((current) => current + 1), delay)
  }, [])

  useEffect(() => {
    if (data.satellite) scheduleSatellite(true)
    return () => {
      if (satelliteTimerRef.current !== null) window.clearTimeout(satelliteTimerRef.current)
    }
  }, [data.satellite, scheduleSatellite])

  useEffect(() => {
    if (data.launch) scheduleRocket()
    return () => {
      if (rocketTimerRef.current !== null) window.clearTimeout(rocketTimerRef.current)
    }
  }, [data.launch, scheduleRocket])

  const keepOpen = useCallback((kind: "satellite" | "launch") => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
    setInspected(kind)
  }, [])

  const beginClose = useCallback(() => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setInspected(null), 180)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    const within = (x: number, y: number, rect: DOMRect, padding = 0) => (
      x >= rect.left - padding && x <= rect.right + padding &&
      y >= rect.top - padding && y <= rect.bottom + padding
    )
    const onPointerMove = (event: PointerEvent) => {
      const satelliteElement = satelliteRef.current
      const rocketElement = rocketRef.current
      const satellitePanel = document.querySelector<HTMLElement>('[data-sky-panel="satellite"]')
      const launchPanel = document.querySelector<HTMLElement>('[data-sky-panel="launch"]')
      if (
        satelliteElement &&
        within(event.clientX, event.clientY, satelliteElement.getBoundingClientRect(), 5)
      ) {
        keepOpen("satellite")
        return
      }
      if (rocketElement && within(event.clientX, event.clientY, rocketElement.getBoundingClientRect(), 5)) {
        keepOpen("launch")
        return
      }
      if (
        satellitePanel &&
        within(event.clientX, event.clientY, satellitePanel.getBoundingClientRect(), 5)
      ) {
        keepOpen("satellite")
        return
      }
      if (launchPanel && within(event.clientX, event.clientY, launchPanel.getBoundingClientRect(), 5)) {
        keepOpen("launch")
        return
      }
      beginClose()
    }
    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: true })
    return () => window.removeEventListener("pointermove", onPointerMove, { capture: true })
  }, [beginClose, keepOpen])

  const satellite = data.satellite
  const launch = data.launch

  return (
    <>
      <div className="hero-live-sky-events">
        {satellite && satellitePass > 0 ? (
          <button
            key={`satellite-${satellitePass}`}
            ref={satelliteRef}
            type="button"
            className={`sky-satellite-pass${inspected === "satellite" ? " is-inspected" : ""}`}
            aria-label="Inspect live International Space Station statistics"
            onFocus={() => keepOpen("satellite")}
            onBlur={beginClose}
            onAnimationEnd={(event) => {
              if (event.animationName !== "sky-satellite-crossing") return
              setSatellitePass(0)
              setInspected(null)
              scheduleSatellite(false)
            }}
          >
            <span className="satellite-trail" />
            <span className="satellite-body">
              <i />
              <b />
              <i />
            </span>
          </button>
        ) : null}

        {launch && rocketPass > 0 ? (
          <button
            key={`rocket-${rocketPass}`}
            ref={rocketRef}
            type="button"
            className={`sky-rocket-launch${inspected === "launch" ? " is-inspected" : ""}`}
            aria-label={`Inspect ${launch.name} launch information`}
            onFocus={() => keepOpen("launch")}
            onBlur={beginClose}
            onAnimationEnd={(event) => {
              if (event.animationName !== "sky-rocket-rising") return
              setRocketPass(0)
              setInspected(null)
            }}
          >
            <span className="rocket-trail" />
            <span className="rocket-body"><i /><b /></span>
          </button>
        ) : null}
      </div>

      {satellite ? (
        <SkyFactPanel
          open={inspected === "satellite"}
          anchorRef={satelliteRef}
          eyebrow="Live orbit"
          title="International Space Station"
          sourceLabel={satellite.sourceLabel}
          sourceUrl={satellite.sourceUrl}
          accent="rgba(137, 210, 255, 0.92)"
          panelId="satellite"
        >
          <div className="sky-fact-stat-grid">
            <span><b>{satellite.altitudeKm} km</b> altitude</span>
            <span><b>{Math.round(satellite.speedKmh / 100) / 10}k km/h</b> velocity</span>
            <span><b>{satellite.periodMinutes} min</b> orbit</span>
            <span><b>{satellite.inclinationDegrees}°</b> inclination</span>
          </div>
        </SkyFactPanel>
      ) : null}

      {launch ? (
        <SkyFactPanel
          open={inspected === "launch"}
          anchorRef={rocketRef}
          eyebrow={`SpaceX · ${launchCountdown(launch.net)}`}
          title={launch.name}
          sourceLabel={launch.sourceLabel}
          sourceUrl={launch.sourceUrl}
          accent="rgba(255, 194, 138, 0.94)"
          panelId="launch"
        >
          <p>{launch.rocket} · {launch.status}</p>
          <small>{new Date(launch.net).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}</small>
          {launch.location ? <small>{launch.location}</small> : null}
        </SkyFactPanel>
      ) : null}
    </>
  )
}
