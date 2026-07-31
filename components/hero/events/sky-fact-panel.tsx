"use client"

import { CSSProperties, ReactNode, RefObject, useEffect, useState } from "react"
import { createPortal } from "react-dom"

type SkyFactPanelProps = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  eyebrow: string
  title: string
  children: ReactNode
  sourceLabel?: string
  sourceUrl?: string
  accent?: string
  panelId?: string
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

export function SkyFactPanel({
  open,
  anchorRef,
  eyebrow,
  title,
  children,
  sourceLabel,
  sourceUrl,
  accent = "rgba(164, 195, 255, 0.9)",
  panelId,
  onPointerEnter,
  onPointerLeave,
}: SkyFactPanelProps) {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ left: 16, top: 16 })

  useEffect(() => setHost(document.body), [])

  useEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const width = Math.min(270, window.innerWidth - 24)
      const height = 154
      const margin = 12
      const gap = 14
      let left = rect.right + gap
      if (left + width > window.innerWidth - margin) left = rect.left - width - gap
      left = Math.max(margin, Math.min(window.innerWidth - width - margin, left))
      const top = Math.max(
        margin,
        Math.min(window.innerHeight - height - margin, rect.top + rect.height / 2 - height / 2),
      )
      setPosition({ left, top })
    }

    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [anchorRef, open])

  if (!host) return null

  return createPortal(
    <div className="sky-fact-overlay" aria-hidden={!open}>
      <aside
        data-sky-panel={panelId}
        className={`sky-fact-panel${open ? " is-open" : ""}`}
        style={{ left: position.left, top: position.top, "--sky-fact-accent": accent } as CSSProperties}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <span>{eyebrow}</span>
        <strong>{title}</strong>
        <div className="sky-fact-content">{children}</div>
        {sourceUrl && sourceLabel ? (
          <a href={sourceUrl} target="_blank" rel="noreferrer">{sourceLabel}</a>
        ) : null}
      </aside>
    </div>,
    host,
  )
}
