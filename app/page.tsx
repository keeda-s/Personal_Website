"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MusicPlayer } from "@/components/music-player"
import { StarryBackground } from "@/components/starry-background"
import { Constellation } from "@/components/constellation"
import { BentoGridModal } from "@/components/bento-grid-modal"
import { SocialLinks } from "@/components/social-links"
import { WorkPanel } from "@/components/work-panel"
import { site, type Project } from "@/lib/projects"

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
        <header className="relative z-50 px-4 pt-[16vh] text-center md:pt-[22vh]">
          <motion.div
            className="relative inline-block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <p
              className="absolute top-0 -translate-x-1/2 text-[clamp(0.55rem,1.6vw,0.75rem)] font-semibold tracking-widest text-white/80"
              style={{ fontFamily: "var(--font-open-sans)", left: "28%" }}
            >
              KEEDA&apos;S
            </p>
            <h1
              className="whitespace-nowrap text-[clamp(3.6rem,15vw,8rem)] leading-tight tracking-wider"
              style={{
                fontFamily: "'Dream Avenue', serif",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.9) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))",
              }}
            >
              idea-isms
            </h1>
          </motion.div>
          <motion.p
            className="mt-1 text-sm text-white/85 md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            {site.name} · {site.intro}
          </motion.p>
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
