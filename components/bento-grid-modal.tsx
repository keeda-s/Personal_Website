"use client"

import { useEffect } from "react"
import { motion, type Transition } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"
import type { Project } from "@/lib/projects"
import { ProjectStats } from "./project-stats"
import { ProjectEmblem } from "./project-emblem"
import { StatusChip } from "./status-chip"

interface BentoGridModalProps {
  project: Project
  onClose: () => void
}

export const BentoGridModal = ({ project, onClose }: BentoGridModalProps) => {
  const transition: Transition = { type: "tween", ease: "easeInOut", duration: 0.5 }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] flex items-center justify-center p-5 sm:p-6">
      <motion.div
        onClick={(event) => event.stopPropagation()}
        layoutId={`card-${project.slug}`}
        transition={transition}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        className="relative max-h-[85dvh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-blue-400/20 bg-blue-950/30 shadow-2xl backdrop-blur-xl"
      >
        <motion.button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 text-white/70 transition-colors hover:text-white sm:right-6 sm:top-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
        >
          <X size={24} />
        </motion.button>

        <motion.div
          className="grid grid-cols-1 gap-4 p-4 pt-14 text-white sm:grid-cols-3 sm:gap-6 sm:p-8 sm:pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.25, duration: 0.3 } }}
        >
          {/* Header */}
          <div className="flex flex-col justify-center rounded-2xl bg-white/5 p-6 sm:col-span-2">
            <StatusChip status={project.status} />
            <motion.h2
              layoutId={`title-${project.slug}`}
              transition={transition}
              className="mt-3 font-serif text-3xl font-bold sm:text-4xl"
            >
              {project.name}
            </motion.h2>
            <motion.p layoutId={`description-${project.slug}`} transition={transition} className="mt-2 text-white/80">
              {project.tagline}
            </motion.p>
          </div>

          {/* Image or emblem */}
          <div className="relative hidden aspect-square overflow-hidden rounded-2xl bg-white/5 sm:block sm:aspect-auto sm:min-h-48">
            {project.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.image} alt={`${project.name} logo`} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <ProjectEmblem className="absolute inset-0 h-full w-full p-6" />
            )}
          </div>

          {/* Live stats (renders nothing until real numbers arrive) */}
          {project.stats ? <ProjectStats source={project.stats} /> : null}

          {/* About */}
          <div className="rounded-2xl bg-white/5 p-6 sm:col-span-2">
            <h3 className="mb-2 font-semibold">What it is</h3>
            <p className="leading-relaxed text-white/85">{project.about}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col justify-center gap-3 rounded-2xl bg-white/5 p-6">
            {project.links.length > 0 ? (
              project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/20 px-4 py-3 text-sm transition-colors hover:bg-white/10"
                >
                  {link.label}
                  <ArrowUpRight size={16} />
                </a>
              ))
            ) : (
              <p className="text-sm text-white/70">
                {project.status === "In development"
                  ? "Being built now. A public demo is on the way."
                  : "Links coming soon."}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
