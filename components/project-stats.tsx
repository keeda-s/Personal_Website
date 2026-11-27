"use client"

import { useEffect, useState } from "react"
import { animate, useInView } from "framer-motion"
import { useRef } from "react"
import type { Project } from "@/lib/projects"

type Stat = { label: string; value: number | string; note?: string }

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const node = ref.current
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toLocaleString("en-US")
      },
    })
    return () => controls.stop()
  }, [inView, value])

  return <span ref={ref}>0</span>
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? "a month ago" : `${months} months ago`
}

async function loadStats(source: NonNullable<Project["stats"]>): Promise<Stat[] | null> {
  if (source === "looksy") {
    const response = await fetch("/api/looksy-stats")
    if (!response.ok) return null
    const data = await response.json()
    if (typeof data.searches !== "number") return null
    return [
      { label: "Searches", value: data.searches },
      { label: "People", value: data.people },
      { label: "Products spotted", value: data.productsSpotted },
    ]
  }

  const response = await fetch("/api/rig2rescue-progress")
  if (!response.ok) return null
  const data = await response.json()
  if (typeof data.commitsLast30Days !== "number") return null
  const stats: Stat[] = [{ label: "Updates in the last 30 days", value: data.commitsLast30Days }]
  if (data.lastUpdate) {
    stats.push({ label: "Last update", value: timeAgo(data.lastUpdate), note: data.latestChange ?? undefined })
  }
  return stats
}

/**
 * Live stats for a project. Renders nothing until real numbers arrive,
 * so the site never shows placeholder or zero values.
 */
export function ProjectStats({ source }: { source: NonNullable<Project["stats"]> }) {
  const [stats, setStats] = useState<Stat[] | null>(null)

  useEffect(() => {
    let active = true
    loadStats(source)
      .then((result) => active && setStats(result))
      .catch(() => active && setStats(null))
    return () => {
      active = false
    }
  }, [source])

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:col-span-3">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-tile rounded-2xl p-5 text-center sm:p-6">
          <p className="text-3xl font-semibold tabular-nums sm:text-4xl">
            {typeof stat.value === "number" ? <AnimatedNumber value={stat.value} /> : stat.value}
          </p>
          <p className="mt-1 text-sm text-white/70">{stat.label}</p>
          {stat.note ? <p className="mt-2 line-clamp-2 text-xs text-white/50">{stat.note}</p> : null}
        </div>
      ))}
    </div>
  )
}
