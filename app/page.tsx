"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MusicPlayer } from "@/components/music-player"
import { StarryBackground } from "@/components/starry-background"
import { Constellation } from "@/components/constellation"
import { BentoGridModal } from "@/components/bento-grid-modal"
import { SocialLinks } from "@/components/social-links"
import { WorkPanel } from "@/components/work-panel"
import type { Project } from "@/lib/projects"

export default function Home() {
  const [showWork, setShowWork] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [persistedCardName, setPersistedCardName] = useState<string | null>(null)

  const handleCloseModal = () => {
    if (selectedProject) {
      setPersistedCardName(selectedProject.slug)
      setSelectedProject(null)
    }
  }

  const isUIActive = !!selectedProject || showWork

  return (
    <main className="relative h-dvh overflow-hidden">
      <StarryBackground eventsPaused={isUIActive} />

      <div className="relative z-10 flex h-full flex-col">
        <header className="fixed left-[clamp(2.25rem,6vw,4.5rem)] top-[clamp(2rem,4.5vh,2.75rem)] z-50">
          <motion.a
            href="/"
            aria-label="Keeda's idea-isms, home"
            className="block leading-none"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span
              className="block pl-[0.15rem] text-[0.6rem] font-semibold tracking-[0.3em] text-white/70"
              style={{ fontFamily: "var(--font-open-sans)" }}
            >
              KEEDA&apos;S
            </span>
            <h1
              className="whitespace-nowrap text-[clamp(1.9rem,4vw,2.6rem)] leading-none tracking-wide"
              style={{
                fontFamily: "'Dream Avenue', serif",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.62) 50%, rgba(255,255,255,0.92) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 14px rgba(255, 255, 255, 0.18))",
              }}
            >
              idea-isms
            </h1>
          </motion.a>
        </header>

        <section className="relative flex-1">
          <Constellation
            onStarClick={setSelectedProject}
            isUIActive={isUIActive}
            activeProject={selectedProject}
            persistedCardName={persistedCardName}
          />
        </section>

        <div className="fixed bottom-8 left-[clamp(1.5rem,8vw,5rem)] z-50">
          <SocialLinks />
        </div>
      </div>

      <motion.button
        onClick={() => setShowWork(true)}
        className="fixed right-[clamp(2.25rem,6vw,4.5rem)] top-[clamp(2.25rem,5vh,3rem)] z-50 rounded-full border border-white/30 bg-white/5 px-5 py-2 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-white/15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        My work
      </motion.button>

      <MusicPlayer />

      <AnimatePresence>
        {showWork && (
          <WorkPanel
            onClose={() => setShowWork(false)}
            onOpenProject={(project) => {
              setShowWork(false)
              setSelectedProject(project)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence onExitComplete={() => setPersistedCardName(null)}>
        {selectedProject && (
          <BentoGridModal key={selectedProject.slug} project={selectedProject} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </main>
  )
}
