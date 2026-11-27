"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { projects, upcomingStar, type Project } from "@/lib/projects"
import { StatusChip } from "./status-chip"

interface ConstellationProps {
  onStarClick: (project: Project) => void
  isUIActive: boolean
  activeProject: Project | null
  persistedCardName: string | null
}

const HINT_KEY = "keeda-star-hint-seen"

function starStyle(star: Project["star"]): CSSProperties {
  return {
    "--x": `${star.x}%`,
    "--y": `${star.y}%`,
    "--mx": `${star.mobileX}%`,
    "--my": `${star.mobileY}%`,
  } as CSSProperties
}

const starPosition =
  "absolute left-[var(--mx)] top-[var(--my)] -translate-x-1/2 md:left-[var(--x)] md:top-[var(--y)]"

export const Constellation = ({ onStarClick, isUIActive, activeProject, persistedCardName }: ConstellationProps) => {
  const [hoveredStar, setHoveredStar] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = window.localStorage.getItem(HINT_KEY) === "1"
    } catch {}
    if (seen) return
    const show = window.setTimeout(() => setShowHint(true), 2600)
    const hide = window.setTimeout(() => setShowHint(false), 9000)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [])

  const dismissHint = () => {
    setShowHint(false)
    try {
      window.localStorage.setItem(HINT_KEY, "1")
    } catch {}
  }

  return (
    <div className="relative h-full w-full">
      {projects.map((project, index) => {
        const isHovered = hoveredStar === project.slug
        const isActive = activeProject?.slug === project.slug
        const isPersistedForExit = persistedCardName === project.slug
        const shouldShowHoverCard = (isHovered && !isUIActive) || isActive

        return (
          <motion.button
            key={project.slug}
            data-skeleton-interest={project.name}
            onClick={() => {
              dismissHint()
              onStarClick(project)
            }}
            onMouseEnter={() => {
              dismissHint()
              setHoveredStar(project.slug)
            }}
            onMouseLeave={() => setHoveredStar(null)}
            onFocus={() => setHoveredStar(project.slug)}
            onBlur={() => setHoveredStar(null)}
            aria-label={`${project.name}: ${project.tagline}`}
            style={starStyle(project.star)}
            className={`group ${starPosition} flex cursor-pointer flex-col items-center rounded-full text-left focus-visible:outline-none`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.45, duration: 0.9, ease: "easeOut" }}
          >
            {/* Star: bright core with a slow ring pulse so it reads as interactive */}
            <span className="relative grid size-8 place-items-center">
              <span className="project-star-ring absolute inset-0 rounded-full border border-white/50" aria-hidden="true" />
              <span className="size-3 rounded-full bg-white shadow-[0_0_18px_6px_rgba(220,232,255,0.85)] transition-transform duration-300 group-hover:scale-150 group-focus-visible:scale-150" />
            </span>
            <span
              className="mt-1.5 whitespace-nowrap text-base tracking-wide text-white drop-shadow-[0_1px_6px_rgba(10,20,60,0.9)] md:text-lg"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {project.name}
            </span>

            {/* Ghost element for the close animation */}
            {isPersistedForExit && <motion.div className="absolute top-0" layoutId={`card-${project.slug}`} />}

            {shouldShowHoverCard && (
              <motion.div
                layoutId={`card-${project.slug}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-none absolute top-20 hidden w-80 rounded-2xl border border-blue-400/30 bg-blue-900/40 p-6 shadow-2xl backdrop-blur-lg md:block"
              >
                <StatusChip status={project.status} />
                <motion.h4 layoutId={`title-${project.slug}`} className="mb-2 mt-3 text-xl font-bold text-white">
                  {project.name}
                </motion.h4>
                <motion.p layoutId={`description-${project.slug}`} className="text-sm leading-relaxed text-white/90">
                  {project.tagline}
                </motion.p>
                <p className="mt-3 text-xs text-white/60">Click to explore</p>
              </motion.div>
            )}
          </motion.button>
        )
      })}

      {/* A faint star for the next project */}
      <motion.div
        style={starStyle(upcomingStar.star)}
        className={`group ${starPosition} flex flex-col items-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 + projects.length * 0.45, duration: 1.2 }}
        title={upcomingStar.tagline}
      >
        <span className="grid size-8 place-items-center">
          <span className="size-1.5 rounded-full bg-white/60 shadow-[0_0_10px_2px_rgba(220,232,255,0.4)] animate-twinkle" />
        </span>
        <span
          className="mt-1 whitespace-nowrap text-xs tracking-wide text-white/50"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {upcomingStar.name}
        </span>
      </motion.div>

      <AnimatePresence>
        {showHint && !isUIActive && (
          <motion.p
            className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 whitespace-nowrap text-xs text-white/70 sm:text-sm md:top-[56%]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            The bright stars are my projects. Tap one to explore.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
