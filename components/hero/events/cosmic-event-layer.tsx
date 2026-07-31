"use client"

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CosmicEvent, CosmicEventRarity, curatedCosmicEvents } from "@/lib/cosmic-events"

type CosmicEventLayerProps = {
  paused?: boolean
}

type EventPosition = {
  x: number
  y: number
  travelX: number
  travelY: number
  panelSide: "left" | "right"
}

const eventPositions: EventPosition[] = [
  { x: -8, y: 28, travelX: 116, travelY: 18, panelSide: "right" },
  { x: 108, y: 58, travelX: -116, travelY: -34, panelSide: "left" },
  { x: 18, y: 110, travelX: 36, travelY: -124, panelSide: "right" },
  { x: 84, y: 110, travelX: -42, travelY: -128, panelSide: "left" },
  { x: -6, y: 102, travelX: 86, travelY: -116, panelSide: "right" },
]

const rarityWeights: Array<[CosmicEventRarity, number]> = [
  ["common", 0.65],
  ["uncommon", 0.25],
  ["rare", 0.08],
  ["legendary", 0.02],
]

function cssNumber(styles: CSSStyleDeclaration, name: string, fallback: number) {
  const value = Number.parseFloat(styles.getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

function chooseRarity() {
  const roll = Math.random()
  let threshold = 0
  for (const [rarity, weight] of rarityWeights) {
    threshold += weight
    if (roll <= threshold) return rarity
  }
  return "common"
}

function chooseEvent(events: CosmicEvent[]) {
  const recent = JSON.parse(window.localStorage.getItem("cosmic-event-history") ?? "[]") as string[]
  const rarity = chooseRarity()
  const inTier = events.filter((event) => event.rarity === rarity && !recent.includes(event.id))
  const fresh = events.filter((event) => !recent.includes(event.id))
  const pool = inTier.length > 0 ? inTier : fresh.length > 0 ? fresh : events
  const event = pool[Math.floor(Math.random() * pool.length)] ?? events[0]
  if (!event) return null
  window.localStorage.setItem("cosmic-event-history", JSON.stringify([...recent, event.id].slice(-6)))
  return event
}

function EventVisual({ event }: { event: CosmicEvent }) {
  if (event.visual === "living-helix") {
    return (
      <span className="cosmic-visual cosmic-living-helix" aria-hidden="true">
        {Array.from({ length: 11 }, (_, index) => (
          <i className="cosmic-helix-rung" key={index} style={{ "--particle-index": index } as CSSProperties}>
            <b />
            <em />
            <b />
          </i>
        ))}
        <span className="cosmic-helix-web">
          <i />
          <i />
          <i />
        </span>
      </span>
    )
  }

  if (event.visual === "deep-time-dust") {
    return (
      <span className="cosmic-visual cosmic-deep-time-dust" aria-hidden="true">
        {Array.from({ length: 20 }, (_, index) => <i key={index} style={{ "--particle-index": index } as CSSProperties} />)}
        <b className="cosmic-dust-core" />
        <em className="cosmic-dust-shockwave" />
      </span>
    )
  }

  if (event.visual === "constellation-bloom") {
    return (
      <span className="cosmic-visual cosmic-constellation-bloom" aria-hidden="true">
        <i className="cosmic-constellation-line cosmic-line-a" />
        <i className="cosmic-constellation-line cosmic-line-b" />
        <i className="cosmic-constellation-line cosmic-line-c" />
        {Array.from({ length: 5 }, (_, index) => <b key={index} style={{ "--particle-index": index } as CSSProperties} />)}
      </span>
    )
  }

  return (
    <span className="cosmic-visual cosmic-orbital-spark" aria-hidden="true">
      <i className="cosmic-orbit cosmic-orbit-a" />
      <i className="cosmic-orbit cosmic-orbit-b" />
      <i className="cosmic-sonar-pulse" />
      <span className="cosmic-kinetic-wireframe">
        <i />
        <i />
        <i />
        <i />
      </span>
      <b className="cosmic-kinetic-core" />
    </span>
  )
}

export function CosmicEventLayer({ paused = false }: CosmicEventLayerProps) {
  const [events, setEvents] = useState<CosmicEvent[]>(curatedCosmicEvents)
  const [activeEvent, setActiveEvent] = useState<CosmicEvent | null>(null)
  const [positionIndex, setPositionIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [schedulerStatus, setSchedulerStatus] = useState("idle")
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)
  const [panelPosition, setPanelPosition] = useState({ left: 16, top: 16, width: 252, opacity: 0.96 })
  const schedulerRef = useRef<number | null>(null)
  const dismissalRef = useRef<number | null>(null)
  const eventsRef = useRef<CosmicEvent[]>(curatedCosmicEvents)
  const activeRef = useRef<CosmicEvent | null>(null)
  const launchLockedRef = useRef(false)
  const nextEventAtRef = useRef(0)
  const controllerRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<HTMLDivElement>(null)
  const factRef = useRef<HTMLElement>(null)
  const hoveredRef = useRef(false)
  const isRevealed = hovered
  const position = eventPositions[positionIndex]

  const placePanel = useCallback((targetRect: DOMRect, panel: HTMLElement | null) => {
    const frame = document.querySelector<HTMLElement>(".hero-frame")
    const styles = frame ? getComputedStyle(frame) : null
    const fallbackWidth = styles ? cssNumber(styles, "--cosmic-event-panel-width", 252) : 252
    const panelWidth = Math.min(fallbackWidth, window.innerWidth * 0.72)
    const panelOpacity = styles ? cssNumber(styles, "--cosmic-event-panel-opacity", 0.96) : 0.96
    const panelHeight = panel?.offsetHeight || 132
    const gap = 14
    const margin = 12
    let left = position.panelSide === "right"
      ? targetRect.right + gap
      : targetRect.left - panelWidth - gap

    if (left + panelWidth > window.innerWidth - margin) left = targetRect.left - panelWidth - gap
    if (left < margin) left = targetRect.right + gap
    left = Math.max(margin, Math.min(window.innerWidth - panelWidth - margin, left))
    const top = Math.max(
      margin,
      Math.min(window.innerHeight - panelHeight - margin, targetRect.top + targetRect.height / 2 - panelHeight / 2),
    )

    setPanelPosition((current) => (
      Math.abs(current.left - left) < 0.5 &&
      Math.abs(current.top - top) < 0.5 &&
      Math.abs(current.width - panelWidth) < 0.5 &&
      Math.abs(current.opacity - panelOpacity) < 0.001
        ? current
        : { left, top, width: panelWidth, opacity: panelOpacity }
    ))
  }, [position.panelSide])

  const revealFromFocus = () => {
    const interaction = interactionRef.current
    if (interaction) placePanel(interaction.getBoundingClientRect(), factRef.current)
    setHovered(true)
  }

  useEffect(() => {
    setPortalHost(document.body)
  }, [])

  useEffect(() => {
    fetch("/api/cosmic-events")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Events unavailable")))
      .then((data: { events?: CosmicEvent[] }) => {
        if (Array.isArray(data.events) && data.events.length > 0) setEvents(data.events)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    eventsRef.current = events
  }, [events])

  useEffect(() => {
    activeRef.current = activeEvent
  }, [activeEvent])

  useEffect(() => {
    hoveredRef.current = hovered
  }, [hovered])

  useEffect(() => {
    if (!activeEvent) return
    let pointerFrame = 0

    const within = (x: number, y: number, rect: DOMRect, padding = 0) => (
      x >= rect.left - padding && x <= rect.right + padding &&
      y >= rect.top - padding && y <= rect.bottom + padding
    )

    const onPointerMove = (event: PointerEvent) => {
      const pointerX = event.clientX
      const pointerY = event.clientY
      cancelAnimationFrame(pointerFrame)
      pointerFrame = requestAnimationFrame(() => {
        const interaction = interactionRef.current
        if (!interaction) return
        const targetRect = interaction.getBoundingClientRect()
        let nextHovered = within(pointerX, pointerY, targetRect, 5)

        const panel = factRef.current
        if (nextHovered) placePanel(targetRect, panel)
        if (!nextHovered && hoveredRef.current && panel) {
          const panelRect = panel.getBoundingClientRect()
          const bridgeRect = {
            left: Math.min(targetRect.left, panelRect.left),
            right: Math.max(targetRect.right, panelRect.right),
            top: Math.min(targetRect.top, panelRect.top),
            bottom: Math.max(targetRect.bottom, panelRect.bottom),
          } as DOMRect
          nextHovered = within(pointerX, pointerY, bridgeRect, 8)
        }

        hoveredRef.current = nextHovered
        setHovered((current) => current === nextHovered ? current : nextHovered)
      })
    }

    const clearHover = () => {
      hoveredRef.current = false
      setHovered(false)
    }

    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: true })
    window.addEventListener("blur", clearHover)
    return () => {
      cancelAnimationFrame(pointerFrame)
      window.removeEventListener("pointermove", onPointerMove, { capture: true })
      window.removeEventListener("blur", clearHover)
    }
  }, [activeEvent, placePanel])

  useEffect(() => {
    const frame = document.querySelector<HTMLElement>(".hero-frame")
    if (!frame || paused) {
      launchLockedRef.current = false
      setSchedulerStatus(paused ? "paused" : "waiting-for-frame")
      setActiveEvent(null)
      return
    }

    const clearScheduler = () => {
      if (schedulerRef.current !== null) window.clearInterval(schedulerRef.current)
      schedulerRef.current = null
    }

    const styles = getComputedStyle(frame)
    if (cssNumber(styles, "--cosmic-events-enabled", 1) < 0.5) return
    const debugVisual = new URLSearchParams(window.location.search).get("cosmic-debug")
    if (debugVisual !== null) {
      const debugEvent = eventsRef.current.find((event) => (
        event.id === debugVisual || event.category === debugVisual || event.visual === debugVisual
      ))
      launchLockedRef.current = true
      setSchedulerStatus("active")
      setActiveEvent(debugEvent ?? eventsRef.current[0] ?? null)
      return
    }
    const firstDelay = Math.max(4, cssNumber(styles, "--cosmic-event-first-delay", 24))
    nextEventAtRef.current = Date.now() + firstDelay * 1000
    setSchedulerStatus("waiting")

    schedulerRef.current = window.setInterval(() => {
      if (controllerRef.current) {
        controllerRef.current.dataset.cosmicRemaining = String(
          Math.max(0, Math.ceil((nextEventAtRef.current - Date.now()) / 1000)),
        )
      }
      if (
        !document.hidden &&
        !activeRef.current &&
        !launchLockedRef.current &&
        Date.now() >= nextEventAtRef.current
      ) {
        const event = chooseEvent(eventsRef.current)
        if (!event) return
        launchLockedRef.current = true
        setSchedulerStatus("active")
        setHovered(false)
        setPositionIndex((current) => (current + 1 + Math.floor(Math.random() * (eventPositions.length - 1))) % eventPositions.length)
        setActiveEvent(event)
      }
    }, 1000)

    const onVisibilityChange = () => {
      if (!document.hidden && !activeRef.current && Date.now() >= nextEventAtRef.current) {
        nextEventAtRef.current = Date.now() + 5000
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      clearScheduler()
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [paused])

  useEffect(() => {
    const isDebugEvent = new URLSearchParams(window.location.search).has("cosmic-debug")
    if (!activeEvent || isRevealed || isDebugEvent) {
      if (dismissalRef.current !== null) window.clearTimeout(dismissalRef.current)
      return
    }
    const frame = document.querySelector<HTMLElement>(".hero-frame")
    const duration = frame ? Math.max(8, cssNumber(getComputedStyle(frame), "--cosmic-event-duration", 20)) : 20
    dismissalRef.current = window.setTimeout(() => {
      launchLockedRef.current = false
      setActiveEvent(null)
      setSchedulerStatus("waiting")
      const styles = frame ? getComputedStyle(frame) : null
      const minDelay = styles ? Math.max(8, cssNumber(styles, "--cosmic-event-min-delay", 35)) : 35
      const maxDelay = styles ? Math.max(minDelay, cssNumber(styles, "--cosmic-event-max-delay", 75)) : 75
      nextEventAtRef.current = Date.now() + (minDelay + Math.random() * (maxDelay - minDelay)) * 1000
    }, duration * 1000)
    return () => {
      if (dismissalRef.current !== null) window.clearTimeout(dismissalRef.current)
    }
  }, [activeEvent, isRevealed])

  const style = useMemo(() => ({
    "--cosmic-event-x": `${position.x}%`,
    "--cosmic-event-y": `${position.y}%`,
    "--cosmic-event-travel-x": `${position.travelX}vw`,
    "--cosmic-event-travel-y": `${position.travelY}vh`,
  }) as CSSProperties, [position])

  const factPanel = activeEvent ? (
    <div className="cosmic-event-fact-overlay">
      <aside
        ref={factRef}
        id="cosmic-event-fact"
        className={`cosmic-event-fact cosmic-event-fact-${activeEvent.category}${isRevealed ? " is-revealed" : ""}`}
        style={{
          left: panelPosition.left,
          top: panelPosition.top,
          width: panelPosition.width,
          "--cosmic-event-panel-opacity": panelPosition.opacity,
        } as CSSProperties}
        aria-hidden={!isRevealed}
      >
        <span>{activeEvent.live ? "Live · " : ""}{activeEvent.category}</span>
        <strong>{activeEvent.title}</strong>
        <p>{activeEvent.fact}</p>
        <a href={activeEvent.sourceUrl} target="_blank" rel="noreferrer">
          {activeEvent.sourceLabel}
        </a>
      </aside>
    </div>
  ) : null

  return (
    <>
    <div
      ref={controllerRef}
      className="hero-cosmic-events"
      data-cosmic-status={schedulerStatus}
      data-cosmic-event-count={events.length}
    >
      {activeEvent && !paused ? (
      <>
      <div
        className={`cosmic-event-art cosmic-event-${activeEvent.category} cosmic-event-${activeEvent.rarity}${isRevealed ? " is-revealed" : ""}`}
        style={style}
        aria-hidden="true"
      >
        <EventVisual event={activeEvent} />
      </div>
      <div
        ref={interactionRef}
        className={`cosmic-event cosmic-event-${activeEvent.category} cosmic-event-${activeEvent.rarity}${isRevealed ? " is-revealed" : ""}`}
        data-panel-side={position.panelSide}
        style={style}
      >
        <button
          type="button"
          className="cosmic-event-trigger"
          aria-label={`Reveal ${activeEvent.category} fact: ${activeEvent.title}`}
          aria-expanded={isRevealed}
          aria-describedby="cosmic-event-fact"
          onFocus={revealFromFocus}
          onBlur={() => setHovered(false)}
        />
      </div>
      </>
      ) : null}
    </div>
    {portalHost && factPanel ? createPortal(factPanel, portalHost) : null}
    </>
  )
}
