"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, X } from "lucide-react"
import { projects, site, type Project } from "@/lib/projects"
import { StatusChip } from "./status-chip"
import { SocialLinks } from "./social-links"

interface WorkPanelProps {
  onClose: () => void
  onOpenProject: (project: Project) => void
}

/** The plain, skimmable view of everything: projects, about and contact. */
export function WorkPanel({ onClose, onOpenProject }: WorkPanelProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="My work"
        onClick={(event) => event.stopPropagation()}
        className="glass-panel h-full w-full max-w-xl overflow-y-auto border-y-0 border-r-0 bg-[rgba(10,16,48,0.35)] px-6 py-8 text-white sm:px-10"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/60">MY WORK</p>
            <h2 className="mt-1 font-serif text-3xl">{site.name}</h2>
            <p className="mt-1 text-white/75">{site.intro}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/70 transition-colors hover:text-white">
            <X size={24} />
          </button>
        </div>

        <section className="mt-10">
          <h3 className="text-sm font-semibold tracking-wide text-white/60">Projects</h3>
          <ul className="mt-4 space-y-3">
            {projects.map((project) => (
              <li key={project.slug}>
                <button
                  onClick={() => onOpenProject(project)}
                  className="group w-full glass-tile rounded-2xl p-5 text-left transition-colors hover:border-white/25 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold">{project.name}</span>
                    <StatusChip status={project.status} />
                  </div>
                  <p className="mt-1.5 text-sm text-white/75">{project.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-white/60 transition-colors group-hover:text-white">
                    See details <ArrowRight size={14} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h3 className="text-sm font-semibold tracking-wide text-white/60">About</h3>
          <div className="mt-4 space-y-4 leading-relaxed text-white/85">
            <p>This is a space to share what I&apos;m building and what inspires me.</p>
            <p>
              At the heart of it is creativity and a burning desire to build something new and meaningful. A new
              era in technology means I can finally build these ideas.
            </p>
            <p className="italic text-white/70">
              &ldquo;The future belongs to those bold enough to dream big and brave enough to act on it.&rdquo;
            </p>
          </div>
        </section>

        <section className="mt-10 pb-6">
          <h3 className="text-sm font-semibold tracking-wide text-white/60">Contact</h3>
          <div className="mt-4">
            <SocialLinks />
          </div>
        </section>
      </motion.aside>
    </motion.div>
  )
}
