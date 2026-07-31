"use client"

import { useEffect, useRef, useState } from "react"
import {
  compassDirection,
  MoonCoastData,
  swellArrowRotation,
} from "./moon-data"

export function AnimatedMetric({ value, suffix = "", decimals = 0 }: { value?: string | null; suffix?: string; decimals?: number }) {
  const target = Number.parseFloat(value ?? "")
  const [display, setDisplay] = useState(Number.isFinite(target) ? target : null)
  const frameRef = useRef(0)

  useEffect(() => {
    setDisplay(Number.isFinite(target) ? target : null)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target])

  const animate = () => {
    if (!Number.isFinite(target)) return

    cancelAnimationFrame(frameRef.current)
    const started = performance.now()
    const duration = 1550
    const animate = (time: number) => {
      const progress = Math.min(1, (time - started) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(target * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    setDisplay(0)
    frameRef.current = requestAnimationFrame(animate)
  }

  if (display === null) return <span className="hero-animated-metric">--</span>
  return (
    <span className="hero-animated-metric" onMouseEnter={animate} onFocus={animate} tabIndex={0}>
      {display.toFixed(decimals)}{suffix}
    </span>
  )
}

export function InteractiveSwell({ swell }: { swell: MoonCoastData["swell"] | null }) {
  const [cursorDegrees, setCursorDegrees] = useState<number | null>(null)
  const sourceDegrees = Number.parseFloat(swell?.directionDegrees ?? "")
  const degrees = cursorDegrees ?? (Number.isFinite(sourceDegrees) ? sourceDegrees : null)
  const direction = cursorDegrees === null ? (swell?.direction ?? "--") : compassDirection(cursorDegrees)

  return (
    <div
      className="hero-moon-bento-item hero-swell-card"
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - (bounds.left + bounds.width / 2)
        const y = event.clientY - (bounds.top + bounds.height / 2)
        setCursorDegrees((Math.atan2(x, -y) * 180 / Math.PI + 360) % 360)
      }}
      onMouseLeave={() => setCursorDegrees(null)}
    >
      <span className="hero-card-title">Swell</span>
      <a
        className="hero-card-value hero-swell-line"
        href={
          swell?.sourceUrl ??
          "https://www.transport.wa.gov.au/marine/charts-warnings-current-conditions/coastal-data-charts/wave-data/cape-naturaliste"
        }
        target="_blank"
        rel="noreferrer"
      >
        <b>{swell?.height ? `${Number.parseFloat(swell.height).toFixed(1)}m` : "--"}</b>
        <b>{swell?.period ? `${Math.round(Number.parseFloat(swell.period))}s` : "--"}</b>
        <i
          className="hero-swell-arrow"
          style={{ transform: `rotate(${swellArrowRotation(degrees?.toString(), cursorDegrees === null)})` }}
          aria-hidden="true"
        />
        <b>{direction}</b>
        <b>{degrees === null ? "--" : `${Math.round(degrees)}°`}</b>
      </a>
    </div>
  )
}

function tideHeightValue(height?: string | null) {
  const value = Number.parseFloat(height ?? "")
  return Number.isFinite(value) ? value : null
}

function perthMinutesNow() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Australia/Perth",
  }).formatToParts(new Date())
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value ?? 0)

  return part("hour") * 60 + part("minute")
}

function timeToMinutes(value?: string | null) {
  const match = value?.match(/(\d{1,2}):(\d{2})/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function TideCurve({ tide }: { tide: MoonCoastData["tide"] | null }) {
  const [hoverProgress, setHoverProgress] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const high = tideHeightValue(tide?.highHeight)
  const low = tideHeightValue(tide?.lowHeight)
  const min = Math.min(low ?? 0.2, high ?? 1)
  const max = Math.max(low ?? 0.2, high ?? 1)
  const yFor = (value: number | null, fallback: number) => {
    if (value === null || max === min) return fallback
    return 40 - ((value - min) / (max - min)) * 26
  }
  const highY = yFor(high, 13)
  const lowY = yFor(low, 40)
  const highMinutes = timeToMinutes(tide?.highTime)
  const lowMinutes = timeToMinutes(tide?.lowTime)
  const nowMinutes = perthMinutesNow()
  const halfCycle = 6 * 60 + 12
  let progress = 0.5

  if (highMinutes !== null && lowMinutes !== null) {
    if (nowMinutes < highMinutes) {
      progress = 0.5 * ((nowMinutes - (highMinutes - halfCycle)) / halfCycle)
    } else {
      const fallingDuration = Math.max(1, lowMinutes - highMinutes)
      progress = 0.5 + 0.5 * ((nowMinutes - highMinutes) / fallingDuration)
    }
  }

  progress = Math.max(0, Math.min(1, progress))
  const dayCount = 3
  const dayWidth = 136
  const totalWidth = 4 + dayCount * dayWidth
  const curveY = (position: number) => {
    const midpoint = (highY + lowY) / 2
    const amplitude = (lowY - highY) / 2
    return midpoint + amplitude * Math.cos(position * Math.PI * 2)
  }
  const points = Array.from({ length: dayCount * 24 + 1 }, (_, index) => {
    const timelinePosition = index / 24
    return `${4 + timelinePosition * dayWidth} ${curveY(timelinePosition)}`
  })
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point}`).join(" ")
  const liveX = 4 + progress * dayWidth
  const liveY = curveY(progress)
  const hoverDay = hoverProgress === null ? 0 : Math.floor(Math.min(hoverProgress, dayCount - 0.0001))
  const hoverDayProgress = hoverProgress === null ? null : hoverProgress - hoverDay
  const hoverValue = hoverDayProgress === null
    ? null
    : ((low ?? 0.2) + ((high ?? 1) - (low ?? 0.2)) * ((1 - Math.cos(hoverDayProgress * Math.PI * 2)) / 2))
  const hoverX = hoverProgress === null ? null : 4 + hoverProgress * dayWidth
  const hoverY = hoverProgress === null ? null : curveY(hoverProgress)
  const hoverMinutes = hoverDayProgress === null || highMinutes === null || lowMinutes === null
    ? null
    : hoverDayProgress <= 0.5
      ? highMinutes - halfCycle + (hoverDayProgress / 0.5) * halfCycle + hoverDay * 50
      : highMinutes + ((hoverDayProgress - 0.5) / 0.5) * (lowMinutes - highMinutes) + hoverDay * 50
  const roundedHoverMinutes = hoverMinutes === null ? null : Math.round(hoverMinutes)
  const normalizedHoverMinutes = roundedHoverMinutes === null
    ? null
    : ((roundedHoverMinutes % 1440) + 1440) % 1440
  const hoverTime = normalizedHoverMinutes === null
    ? null
    : `${String(Math.floor(normalizedHoverMinutes / 60)).padStart(2, "0")}:${String(normalizedHoverMinutes % 60).padStart(2, "0")}`

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    const frame = requestAnimationFrame(() => {
      const idleScroll = Math.max(0, progress * dayWidth - scroller.clientWidth * 0.35)
      scroller.dataset.idleScroll = `${idleScroll}`
      scroller.scrollLeft = idleScroll
    })
    return () => cancelAnimationFrame(frame)
  }, [dayWidth, progress, tide?.highTime, tide?.lowTime])

  return (
    <div className="hero-tide-curve-wrap">
      <div
        ref={scrollRef}
        className="hero-tide-scroll"
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.currentTarget.scrollLeft += event.deltaY
          }
        }}
      >
        <svg
          className="hero-tide-curve"
          viewBox={`0 0 ${totalWidth} 48`}
          aria-label="Three-day tide estimate. Swipe or scroll horizontally to inspect future tides."
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            setHoverProgress(Math.max(0, Math.min(dayCount, ((event.clientX - rect.left) / rect.width) * dayCount)))
          }}
          onPointerLeave={() => setHoverProgress(null)}
        >
          <path className="hero-tide-path" d={path} />
          <path className="hero-tide-path-glow" d={path} />
          {Array.from({ length: dayCount }, (_, day) => (
            <g key={day}>
              <circle className="hero-tide-point hero-tide-point-high" cx={4 + (day + 0.5) * dayWidth} cy={highY} r="2.8" />
              <circle className="hero-tide-point hero-tide-point-low" cx={4 + (day + 1) * dayWidth} cy={lowY} r="2.4" />
            </g>
          ))}
          <circle className="hero-tide-live-ring" cx={liveX} cy={liveY} r="5.2" />
          <circle className="hero-tide-point hero-tide-point-live" cx={liveX} cy={liveY} r="3.1" />
          {hoverX !== null && hoverY !== null ? (
            <>
              <line className="hero-tide-scrub-line" x1={hoverX} x2={hoverX} y1="5" y2="43" />
              <circle className="hero-tide-scrub-point" cx={hoverX} cy={hoverY} r="2.7" />
            </>
          ) : null}
        </svg>
      </div>
      {hoverProgress !== null ? (
        <span className="hero-tide-readout">
          {hoverDay > 0 ? `+${hoverDay}d · ` : ""}{hoverValue?.toFixed(2) ?? "--"}m · {hoverTime ?? "--"}
        </span>
      ) : null}
    </div>
  )
}


export function WindguruForecastWidget({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container || !active) return

    const widgetId = "wg_fwdg_208626_100_1783863955763"
    const args = [
      "s=208626",
      "m=100",
      "mw=83",
      `uid=${widgetId}`,
      "wj=knots",
      "tj=c",
      "waj=m",
      "tij=cm",
      "odh=0",
      "doh=24",
      "fhours=240",
      "hrsm=2",
      "vt=forecasts",
      "lng=en",
      "idbs=1",
      "ts=1",
      "p=WINDSPD,GUST,SMER,HTSGW,PERPW,DIRPW",
    ]
    const script = document.createElement("script")

    container.replaceChildren()
    script.id = widgetId
    script.src = `https://www.windguru.cz/js/widget.php?${args.join("&")}`
    script.async = true
    container.appendChild(script)

    return () => {
      container.replaceChildren()
    }
  }, [active])

  return <div ref={containerRef} className="hero-forecast-widget" />
}
