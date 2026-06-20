"use client"

import { AnimatePresence, motion } from 'framer-motion';
import { X } from "lucide-react"
import { MusicPlayer } from "@/components/music-player"
import { ManifestoModal } from "@/components/manifesto-modal"
import { useState } from "react"
// Button is no longer needed
// import { Button } from "@/components/ui/button"
import { StarryBackground } from "@/components/starry-background"
// ContactForm is no longer needed
// import { ContactForm } from "@/components/contact-form"
import { Constellation } from "@/components/constellation"
// Mail icon is no longer needed
// import { Mail } from "lucide-react"
import { BentoGridModal, Project } from "@/components/bento-grid-modal"
// Import the new SocialLinks component
import { SocialLinks } from "@/components/social-links"

export default function Home() {
  // State for ContactForm is removed
  // const [showContactForm, setShowContactForm] = useState(false)
  const [showManifesto, setShowManifesto] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [persistedCardName, setPersistedCardName] = useState<string | null>(null);

  const handleStarClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    if (selectedProject) {
      setPersistedCardName(selectedProject.name);
      setSelectedProject(null);
    }
  };

  const isUIActive = !!selectedProject || showManifesto;

  return (
    <main className="relative h-screen overflow-hidden">
      <StarryBackground />

      <div className="relative z-10 h-full flex flex-col">
  
        <header 
          className="relative z-50 px-8 text-center transition-all duration-500" 
          style={{ paddingTop: showManifesto ? '8vh' : '28vh' }}
        >
          <div className="flex flex-col items-center relative">
            <p 
              className="text-xs font-semibold tracking-widest text-white/80 absolute"
              style={{ 
                fontFamily: 'var(--font-open-sans)',
                left: '40.8%',
                transform: 'translateX(-50%)',
                top: '0px'
              }}
            >
              KEEDA&apos;S
            </p>
            <h1 
              className="text-9xl tracking-wider" 
              style={{ 
                fontFamily: "'Dream Avenue', serif",
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))'
              }}
            >
              idea-isms
            </h1>
          </div>
          
          <motion.button 
            onClick={() => setShowManifesto(!showManifesto)}
            aria-label={showManifesto ? "Close manifesto" : "Open manifesto"}
            aria-expanded={showManifesto}
            layout
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={`relative mt-8 inline-flex h-10 items-center justify-center overflow-hidden rounded-full border text-sm text-gray-200 transition-colors duration-300 ${
              showManifesto
                ? "w-34 border-white/45 bg-white/15 shadow-[0_0_24px_rgba(255,255,255,0.18)]"
                : "w-28 border-white/30 hover:bg-white/10"
            }`}
          >
            <motion.span
              animate={{ x: showManifesto ? -10 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              Manifesto
            </motion.span>
            <motion.span
              aria-hidden="true"
              className="absolute right-3.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/35 bg-white/15"
              initial={false}
              animate={{
                opacity: showManifesto ? 1 : 0,
                x: showManifesto ? 0 : -14,
                scale: showManifesto ? 1 : 0.75,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <X className="h-3.5 w-3.5" />
            </motion.span>
          </motion.button>
        </header>

        <ManifestoModal isOpen={showManifesto} />

        <section className={`relative flex-1 transition-opacity duration-500 ${showManifesto ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Constellation 
            onStarClick={handleStarClick} 
            isUIActive={isUIActive}
            activeProject={selectedProject}
            persistedCardName={persistedCardName}
          />
        </section>

        {/* The Get in Touch button is replaced with the new SocialLinks component */}
        <div className={`flex justify-center pb-8 transition-opacity duration-500 ${showManifesto ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <SocialLinks />
        </div>
      </div>

      {/* The ContactForm is removed from here */}
      <MusicPlayer />

      <AnimatePresence
        onExitComplete={() => setPersistedCardName(null)}
      >
        {selectedProject && (
          <BentoGridModal 
            key={selectedProject.name} 
            project={selectedProject} 
            onClose={handleCloseModal} 
          />
        )}
      </AnimatePresence>
    </main>
  )
}
