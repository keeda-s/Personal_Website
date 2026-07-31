"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { cssNumber, watchCanvasControls } from "../canvas-utils"
import { AnimatedMetric, InteractiveSwell, TideCurve, WindguruForecastWidget } from "./coast-cards"
import {
  daysUntilMoonPhase,
  moonLoopCycles,
  moonMiddleCycle,
  moonPhaseClassName,
  moonPhaseIllumination,
  moonPhases,
  moonPhaseSequence,
  MoonCoastData,
} from "./moon-data"

export function MoonSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [coastData, setCoastData] = useState<MoonCoastData | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isForecastOpen, setIsForecastOpen] = useState(false)
  const [hoveredMoonPhase, setHoveredMoonPhase] = useState<string | null>(null)
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const moonPhaseRowRef = useRef<HTMLDivElement>(null)
  const moonPhaseTrackRef = useRef<HTMLDivElement>(null)
  const moonEntranceAnimationRef = useRef<Animation | null>(null)
  const moonScrollTimerRef = useRef<number | null>(null)
  const moonPreviewPhaseRef = useRef<string | null>(null)
  const moonTrackOffsetRef = useRef(0)
  const moonDragRef = useRef<{ pointerId: number; startX: number; startOffset: number } | null>(null)
  const nowPanelRef = useRef<HTMLDivElement>(null)
  const forecastPanelRef = useRef<HTMLDivElement>(null)
  const activeMoonPhase = coastData?.moon.phase === "Last Quarter" ? "Third Quarter" : coastData?.moon.phase
  const displayedMoonPhase = hoveredMoonPhase ?? activeMoonPhase ?? "Loading"
  const displayedIllumination = hoveredMoonPhase && hoveredMoonPhase !== activeMoonPhase
    ? moonPhaseIllumination[hoveredMoonPhase]
    : coastData?.moon.illumination

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false)
      closeTimerRef.current = null
    }, 160)
  }

  const moonTrackElements = () => {
    const row = moonPhaseRowRef.current
    const track = moonPhaseTrackRef.current
    return { row, track }
  }

  const setMoonTrackOffset = (offset: number, duration = 0) => {
    const { track } = moonTrackElements()
    if (!track) return
    moonTrackOffsetRef.current = offset
    track.style.transition = duration > 0
      ? `transform ${duration}ms cubic-bezier(0.22, 0.76, 0.22, 1)`
      : "none"
    track.style.transform = `translate3d(${offset}px, 0, 0)`
  }

  const normalizedMoonOffset = (offset: number) => {
    const { row, track } = moonTrackElements()
    if (!row || !track) return offset
    const phases = Array.from(track.children) as HTMLElement[]
    if (phases.length < 2) return offset

    const step = phases[1].offsetLeft - phases[0].offsetLeft
    const firstCenter = phases[0].offsetLeft + phases[0].offsetWidth / 2
    const position = (row.clientWidth / 2 - offset - firstCenter) / step
    const buffer = moonPhases.length * 2
    if (position >= buffer && position <= phases.length - buffer) return offset

    const nearest = Math.round(position)
    const fraction = position - nearest
    const phaseIndex = ((nearest % moonPhases.length) + moonPhases.length) % moonPhases.length
    const middlePosition = moonMiddleCycle * moonPhases.length + phaseIndex + fraction
    return row.clientWidth / 2 - (firstCenter + middlePosition * step)
  }

  const settleMoonTrack = (returnToCurrent = false) => {
    const { row, track } = moonTrackElements()
    if (!row || !track) return
    const phases = Array.from(track.children) as HTMLElement[]
    if (phases.length < moonPhases.length * moonLoopCycles) return

    if (returnToCurrent) {
      const current = track.querySelector<HTMLElement>(`.hero-moon-phase.is-current[data-cycle="${moonMiddleCycle}"]`)
      if (current) {
        const target = row.clientWidth / 2 - (current.offsetLeft + current.offsetWidth / 2)
        setMoonTrackOffset(target, 900)
      }
      return
    }

    const normalizedOffset = normalizedMoonOffset(moonTrackOffsetRef.current)
    if (normalizedOffset !== moonTrackOffsetRef.current) setMoonTrackOffset(normalizedOffset)
    const step = phases[1].offsetLeft - phases[0].offsetLeft
    const localCenter = row.clientWidth / 2 - moonTrackOffsetRef.current
    const firstCenter = phases[0].offsetLeft + phases[0].offsetWidth / 2
    const nearestIndex = Math.max(0, Math.min(phases.length - 1, Math.round((localCenter - firstCenter) / step)))
    const nearest = phases[nearestIndex]
    const phaseName = nearest.dataset.phase ?? null
    const phaseIndex = Number(nearest.dataset.index ?? 0)
    const middleMatch = phases[moonMiddleCycle * moonPhases.length + phaseIndex]

    if (phaseName && moonPreviewPhaseRef.current !== phaseName) {
      moonPreviewPhaseRef.current = phaseName
      setHoveredMoonPhase(phaseName)
    }
    if (middleMatch) {
      setMoonTrackOffset(moonTrackOffsetRef.current + nearest.offsetLeft - middleMatch.offsetLeft)
    }
  }

  const scheduleMoonSettle = (delay = 520) => {
    if (moonScrollTimerRef.current !== null) window.clearTimeout(moonScrollTimerRef.current)
    moonScrollTimerRef.current = window.setTimeout(() => {
      moonScrollTimerRef.current = null
      settleMoonTrack()
    }, delay)
  }

  useEffect(() => {
    let active = true

    fetch("/api/moon-coast", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: MoonCoastData | null) => {
        if (active && data) {
          setCoastData(data)
        }
      })
      .catch(() => {
        if (active) {
          setCoastData(null)
        }
      })

    return () => {
      clearCloseTimer()
      active = false
    }
  }, [])

  useLayoutEffect(() => {
    const row = moonPhaseRowRef.current
    if (!isOpen || !row || !activeMoonPhase) return

    const track = moonPhaseTrackRef.current
    const current = track?.querySelector<HTMLElement>(`.hero-moon-phase.is-current[data-cycle="${moonMiddleCycle}"]`)
    const items = track ? Array.from(track.children) as HTMLElement[] : []
    if (!track || !current || items.length < 2) return

    const step = items[1].offsetLeft - items[0].offsetLeft
    const target = row.clientWidth / 2 - (current.offsetLeft + current.offsetWidth / 2)
    moonTrackOffsetRef.current = target
    track.style.transition = "none"
    track.style.transform = `translate3d(${target}px, 0, 0)`
    moonEntranceAnimationRef.current?.cancel()
    moonEntranceAnimationRef.current = track.animate(
      [
        { transform: `translate3d(${target - step * 2}px, 0, 0)` },
        { transform: `translate3d(${target}px, 0, 0)` },
      ],
      { duration: 2200, easing: "cubic-bezier(0.22, 0.76, 0.22, 1)", fill: "none" },
    )

    return () => {
      moonEntranceAnimationRef.current?.cancel()
      moonEntranceAnimationRef.current = null
    }
  }, [activeMoonPhase, isOpen])

  useEffect(() => () => {
    if (moonScrollTimerRef.current !== null) window.clearTimeout(moonScrollTimerRef.current)
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return

    const panel = isForecastOpen ? forecastPanelRef.current : nowPanelRef.current
    if (!panel) return

    const updateHeight = () => setViewportHeight(Math.ceil(panel.scrollHeight))
    const observer = new ResizeObserver(updateHeight)

    updateHeight()
    observer.observe(panel)
    window.addEventListener("resize", updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateHeight)
    }
  }, [isForecastOpen, isOpen])

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = canvas?.closest(".hero-frame, .hero-moon-layer")

    if (!canvas || !(frame instanceof HTMLElement)) {
      return
    }

    const drawMoon = () => {
      const styles = getComputedStyle(frame)
      const size = cssNumber(styles, "--moon-size", 46)
      const earthshine = cssNumber(styles, "--moon-earthshine", 0.11)
      const outline = cssNumber(styles, "--moon-outline", 0.16)
      const crescentAlpha = cssNumber(styles, "--moon-crescent-alpha", 0.92)
      const mariaOpacity = cssNumber(styles, "--moon-maria-opacity", 0.58)
      const mariaScale = cssNumber(styles, "--moon-maria-scale", 1)
      const mariaX = cssNumber(styles, "--moon-maria-x", 0)
      const mariaY = cssNumber(styles, "--moon-maria-y", 0)
      const mariaRotation = cssNumber(styles, "--moon-maria-rotation", -8) * (Math.PI / 180)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pixelSize = Math.max(1, Math.round(size * dpr))
      const center = pixelSize / 2
      const radius = pixelSize * 0.42
      const context = canvas.getContext("2d")

      canvas.width = pixelSize
      canvas.height = pixelSize
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`

      if (!context) {
        return
      }

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, pixelSize, pixelSize)

      const newMoon = Date.UTC(2000, 0, 6, 18, 14)
      const synodicMonth = 29.530588853
      const days = (Date.now() - newMoon) / 86400000
      const phase = (((days / synodicMonth) % 1) + 1) % 1
      const sunAngle = Math.PI * 2 * phase
      const southernHemisphere = true
      const side = southernHemisphere ? -1 : 1
      const sunX = side * Math.sin(sunAngle)
      const sunZ = -Math.cos(sunAngle)
      const image = context.createImageData(pixelSize, pixelSize)
      const mariaCos = Math.cos(mariaRotation)
      const mariaSin = Math.sin(mariaRotation)
      const mariaPatches = [
        [-0.38, 0.18, 0.25, 0.36, 0.92],
        [-0.12, -0.08, 0.34, 0.23, 0.82],
        [0.08, -0.42, 0.18, 0.13, 0.72],
        [0.36, -0.2, 0.2, 0.25, 0.66],
        [0.26, 0.36, 0.29, 0.2, 0.86],
        [-0.16, 0.52, 0.22, 0.14, 0.64],
        [-0.5, -0.36, 0.14, 0.17, 0.5],
      ]

      for (let y = 0; y < pixelSize; y += 1) {
        for (let x = 0; x < pixelSize; x += 1) {
          const nx = (x + 0.5 - center) / radius
          const ny = (y + 0.5 - center) / radius
          const distance = nx * nx + ny * ny

          if (distance > 1) {
            continue
          }

          const z = Math.sqrt(1 - distance)
          const light = nx * sunX + z * sunZ
          const edge = Math.min(1, Math.max(0, (1 - distance) * 16))
          const index = (y * pixelSize + x) * 4
          const shiftedX = (nx - mariaX) / Math.max(0.1, mariaScale)
          const shiftedY = (ny - mariaY) / Math.max(0.1, mariaScale)
          const mariaNX = shiftedX * mariaCos + shiftedY * mariaSin
          const mariaNY = -shiftedX * mariaSin + shiftedY * mariaCos
          let maria = 0

          for (const [patchX, patchY, patchWidth, patchHeight, strength] of mariaPatches) {
            const patchDX = (mariaNX - patchX) / patchWidth
            const patchDY = (mariaNY - patchY) / patchHeight
            maria += Math.exp(-(patchDX * patchDX + patchDY * patchDY) * 1.7) * strength
          }

          const fineMottle = (
            Math.sin(mariaNX * 23 + mariaNY * 17) +
            Math.sin(mariaNX * 41 - mariaNY * 29) + 2
          ) * 0.035
          maria = Math.min(1, Math.max(0, maria + fineMottle - 0.08))
          const earthshineShade = 1 - maria * mariaOpacity

          image.data[index] = Math.round(172 * earthshineShade)
          image.data[index + 1] = Math.round(204 * earthshineShade)
          image.data[index + 2] = Math.round(232 * earthshineShade)
          image.data[index + 3] = Math.round(255 * earthshine * edge)

          if (light > 0) {
            const terminatorSoftness = Math.min(1, light * 18)
            const alpha = crescentAlpha * terminatorSoftness * edge

            const litShade = 1 - maria * mariaOpacity * 0.7
            image.data[index] = Math.round(255 * litShade)
            image.data[index + 1] = Math.round(246 * litShade)
            image.data[index + 2] = Math.round(224 * litShade)
            image.data[index + 3] = Math.max(image.data[index + 3], Math.round(255 * alpha))
          }
        }
      }

      context.putImageData(image, 0, 0)

      context.beginPath()
      context.arc(center, center, radius, 0, Math.PI * 2)
      context.strokeStyle = `rgba(215, 231, 248, ${outline})`
      context.lineWidth = Math.max(1, dpr)
      context.stroke()
    }

    const cleanup = watchCanvasControls(frame, drawMoon, [
      "--moon-size",
      "--moon-earthshine",
      "--moon-outline",
      "--moon-crescent-alpha",
      "--moon-maria-opacity",
      "--moon-maria-scale",
      "--moon-maria-x",
      "--moon-maria-y",
      "--moon-maria-rotation",
    ])
    const interval = window.setInterval(drawMoon, 60 * 60 * 1000)

    return () => {
      cleanup()
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div className={`hero-moon-cluster${isOpen ? " is-open" : ""}`}>
      <div
        className="hero-moon-trigger"
        data-skeleton-interest="moon"
        aria-label="Show Yallingup moon and coast conditions"
        onMouseEnter={() => {
          clearCloseTimer()
          setHoveredMoonPhase(null)
          setIsOpen(true)
        }}
        onMouseLeave={scheduleClose}
      >
        <canvas ref={canvasRef} className="hero-moon" />
      </div>
      {isOpen ? (
        <div
          className={`hero-moon-bento${isForecastOpen ? " is-forecast-open" : ""}`}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="hero-moon-bento-header">
            <button className={!isForecastOpen ? "is-active" : ""} type="button" onClick={() => setIsForecastOpen(false)}>
              Yallingup Now
            </button>
            <button className={isForecastOpen ? "is-active" : ""} type="button" onClick={() => setIsForecastOpen(true)}>
              Forecast
            </button>
          </div>
          <div
            className="hero-moon-bento-viewport"
            style={viewportHeight === null ? undefined : { height: `${viewportHeight}px` }}
          >
            <div className="hero-moon-bento-track">
              <div ref={nowPanelRef} className="hero-moon-bento-panel">
                <div className="hero-moon-bento-grid">
                  <div
                    className="hero-moon-bento-item hero-moon-phase-card"
                    onMouseLeave={() => {
                      if (moonScrollTimerRef.current !== null) {
                        window.clearTimeout(moonScrollTimerRef.current)
                        moonScrollTimerRef.current = null
                      }
                      moonPreviewPhaseRef.current = null
                      setHoveredMoonPhase(null)
                      settleMoonTrack(true)
                    }}
                  >
                    <span className="hero-card-title">Moon Phase</span>
                    <div
                      ref={moonPhaseRowRef}
                      className="hero-moon-phase-row"
                      aria-label="Moon phase sequence"
                      onWheel={(event) => {
                        event.preventDefault()
                        moonEntranceAnimationRef.current?.cancel()
                        const delta = Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY
                        const baseOffset = normalizedMoonOffset(moonTrackOffsetRef.current)
                        if (baseOffset !== moonTrackOffsetRef.current) setMoonTrackOffset(baseOffset)
                        setMoonTrackOffset(baseOffset - delta * 0.72, 420)
                        scheduleMoonSettle()
                      }}
                      onPointerDown={(event) => {
                        moonEntranceAnimationRef.current?.cancel()
                        moonDragRef.current = {
                          pointerId: event.pointerId,
                          startX: event.clientX,
                          startOffset: moonTrackOffsetRef.current,
                        }
                        event.currentTarget.setPointerCapture(event.pointerId)
                      }}
                      onPointerMove={(event) => {
                        const drag = moonDragRef.current
                        if (!drag || drag.pointerId !== event.pointerId) return
                        setMoonTrackOffset(drag.startOffset + event.clientX - drag.startX)
                      }}
                      onPointerUp={(event) => {
                        if (moonDragRef.current?.pointerId !== event.pointerId) return
                        moonDragRef.current = null
                        event.currentTarget.releasePointerCapture(event.pointerId)
                        scheduleMoonSettle(120)
                      }}
                      onPointerCancel={() => {
                        moonDragRef.current = null
                        scheduleMoonSettle(120)
                      }}
                    >
                      <div ref={moonPhaseTrackRef} className="hero-moon-phase-track">
                        {moonPhaseSequence(coastData?.moon.phase).map((phase) => (
                          <div
                            key={`${phase.cycle}-${phase.name}`}
                            aria-label={phase.name}
                            data-phase={phase.name}
                            data-cycle={phase.cycle}
                            data-index={phase.index}
                            className={`hero-moon-phase${phase.isCurrent ? " is-current" : ""}`}
                            onMouseEnter={() => {
                              moonPreviewPhaseRef.current = phase.name
                              setHoveredMoonPhase(phase.name)
                            }}
                          >
                            <span className={`hero-moon-phase-orb hero-moon-phase-${moonPhaseClassName(phase.name)}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <strong className="hero-moon-phase-name">
                      <span>
                        {displayedMoonPhase}
                        {hoveredMoonPhase && hoveredMoonPhase !== activeMoonPhase ? ` · ${daysUntilMoonPhase(hoveredMoonPhase)}` : ""}
                      </span>
                    </strong>
                    <small className="hero-moon-percent">
                      {displayedIllumination === undefined ? "Western Australia" : `${displayedIllumination}% illuminated`}
                    </small>
                  </div>
                  <div
                    className="hero-moon-bento-item hero-tide-card"
                    onMouseLeave={(event) => {
                      const scroller = event.currentTarget.querySelector<HTMLElement>(".hero-tide-scroll")
                      if (!scroller) return
                      scroller.scrollTo({
                        left: Number(scroller.dataset.idleScroll ?? 0),
                        behavior: "smooth",
                      })
                    }}
                  >
                    <span className="hero-card-title">Tide</span>
                    <TideCurve tide={coastData?.tide ?? null} />
                    <div className="hero-data-pair">
                      <strong>High</strong>
                      <b>{coastData?.tide.highHeight ?? "--"}</b>
                      <small>{coastData?.tide.highTime ?? "--"}</small>
                    </div>
                    <div className="hero-data-pair">
                      <strong>Low</strong>
                      <b>{coastData?.tide.lowHeight ?? "--"}</b>
                      <small>{coastData?.tide.lowTime ?? "--"}</small>
                    </div>
                  </div>
                  <InteractiveSwell swell={coastData?.swell ?? null} />
                  <div className="hero-moon-bento-item hero-wind-card">
                    <span className="hero-card-title">Wind</span>
                    <a
                      className="hero-card-value hero-wind-line"
                      href={coastData?.wind.sourceUrl ?? "https://www.bom.gov.au/products/IDW60801/IDW60801.94600.shtml"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <b>
                        {coastData?.wind.direction ?? "--"} <AnimatedMetric value={coastData?.wind.speedKts} suffix="kts" />
                        {coastData?.wind.gustKts ? <> - <AnimatedMetric value={coastData.wind.gustKts} suffix="kts" /></> : ""}
                      </b>
                    </a>
                  </div>
                </div>
                <div className="hero-moon-bento-footer">
                  <a
                    href={
                      coastData?.swell.sourceUrl ??
                      "https://www.transport.wa.gov.au/marine/charts-warnings-current-conditions/coastal-data-charts/wave-data/cape-naturaliste"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live Wave Buoy
                  </a>
                </div>
              </div>
              <div ref={forecastPanelRef} className="hero-moon-bento-panel hero-forecast-panel">
                <div className="hero-forecast-card">
                  <WindguruForecastWidget active={isForecastOpen} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
