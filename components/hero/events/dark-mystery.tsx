"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SkyFactPanel } from "./sky-fact-panel"

const darkFacts = [
  {
    eyebrow: "Black hole",
    title: "The point of no return",
    fact: "The event horizon is the boundary beyond which even light cannot escape a black hole.",
    sourceLabel: "NASA Black Holes",
    sourceUrl: "https://science.nasa.gov/universe/black-holes/",
  },
  {
    eyebrow: "Dark matter",
    title: "The invisible framework",
    fact: "Dark matter does not absorb, reflect, or emit light, yet its gravity helps shape galaxies and galaxy clusters.",
    sourceLabel: "NASA Dark Matter",
    sourceUrl: "https://science.nasa.gov/dark-matter/",
  },
  {
    eyebrow: "Dark universe",
    title: "Most of everything",
    fact: "Current estimates assign about 5% of the universe to ordinary matter, 27% to dark matter, and 68% to dark energy.",
    sourceLabel: "NASA Dark Matter",
    sourceUrl: "https://science.nasa.gov/dark-matter/",
  },
  {
    eyebrow: "Dark energy",
    title: "Expansion accelerates",
    fact: "Dark energy is the name given to the unknown influence associated with the universe’s accelerating expansion.",
    sourceLabel: "NASA Dark Energy",
    sourceUrl: "https://science.nasa.gov/dark-energy/",
  },
]

export function DarkMystery() {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  const [factIndex, setFactIndex] = useState(darkFacts.length - 1)
  const fact = darkFacts[factIndex]

  const keepOpen = useCallback(() => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
    setOpen(true)
  }, [])

  const beginClose = useCallback(() => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 180)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    let wasInside = false
    const within = (x: number, y: number, rect: DOMRect, padding = 0) => (
      x >= rect.left - padding && x <= rect.right + padding &&
      y >= rect.top - padding && y <= rect.bottom + padding
    )
    const onPointerMove = (event: PointerEvent) => {
      const anchor = anchorRef.current
      if (!anchor) return
      const inside = within(event.clientX, event.clientY, anchor.getBoundingClientRect(), 4)
      const panel = document.querySelector<HTMLElement>('[data-sky-panel="dark-mystery"]')
      const insidePanel = panel ? within(event.clientX, event.clientY, panel.getBoundingClientRect(), 4) : false
      if (inside && !wasInside) setFactIndex((current) => (current + 1) % darkFacts.length)
      if (inside || insidePanel) keepOpen()
      else beginClose()
      wasInside = inside
    }
    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: true })
    return () => window.removeEventListener("pointermove", onPointerMove, { capture: true })
  }, [beginClose, keepOpen])

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className={`hero-dark-mystery${open ? " is-awake" : ""}`}
        aria-label="Reveal a mystery of the dark universe"
        aria-expanded={open}
        onFocus={() => {
          setFactIndex((current) => (current + 1) % darkFacts.length)
          keepOpen()
        }}
        onBlur={beginClose}
      >
        <span className="dark-mystery-lensing" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="dark-mystery-disc" aria-hidden="true" />
        <span className="dark-mystery-accretion" aria-hidden="true" />
      </button>
      <SkyFactPanel
        open={open}
        anchorRef={anchorRef}
        eyebrow={fact.eyebrow}
        title={fact.title}
        sourceLabel={fact.sourceLabel}
        sourceUrl={fact.sourceUrl}
        accent="rgba(176, 143, 255, 0.9)"
        panelId="dark-mystery"
      >
        <p>{fact.fact}</p>
        <small>Each return reveals another fragment.</small>
      </SkyFactPanel>
    </>
  )
}
