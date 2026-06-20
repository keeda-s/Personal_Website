"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from './bento-grid-modal';

interface ConstellationProps {
  onStarClick: (project: Project) => void;
  isUIActive: boolean;
  activeProject: Project | null;
  persistedCardName: string | null;
}

export const Constellation = ({ onStarClick, isUIActive, activeProject, persistedCardName }: ConstellationProps) => {
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);

  const projects: Project[] = [
      {
        name: 'Looksy',
        description: 'An AI agent for finding products in social media posts.',
        position: 'top-[15%] left-[25%]',
        longDescription: 'Looksy is a browser extension that uses computer vision to identify and locate fashion, home goods, and other products within images and videos on social media platforms. It provides direct, shoppable links, transforming inspiration into instant commerce.',
        image: '/project-media/looksy for card.png',
        technologies: ['React', 'TypeScript', 'Computer Vision', 'Firebase'],
      },
      {
        name: 'Stories Along The Way',
        description: 'A social network dedicated to myths and legends.',
        position: 'top-[25%] left-[50%] -translate-x-1/2',
        longDescription: 'A platform for storytellers and enthusiasts to share, discover, and map out myths, legends, and folklore from around the world. It features an interactive globe and chronological timelines to explore humanity\'s shared stories.',
        image: '/project-media/SAtW1.png',
        technologies: ['Next.js', 'GraphQL', 'Mapbox', 'PostgreSQL'],
      },
      {
        name: 'InstaNFT',
        description: 'Launch social media posts as NFTs, simply.',
        position: 'top-[15%] right-[25%]',
        longDescription: 'InstaNFT provides a seamless bridge for creators to mint their social media content as NFTs directly from the platform. By using a simple tag, users can initiate a gas-free minting process, making digital ownership accessible to everyone.',
        image: '/project-media/instanft.png',
        technologies: ['Solidity', 'Ethers.js', 'IPFS', 'The Graph'],
      },
  ];

  return (
    <div className="relative w-full h-full">
      {projects.map((project) => {
        const isHovered = hoveredStar === project.name;
        const isActive = activeProject?.name === project.name;
        const isPersistedForExit = persistedCardName === project.name;

        // Show the full hover card if you're hovering (and no UI is active) OR if it's the one currently expanding.
        const shouldShowHoverCard = (isHovered && !isUIActive) || isActive;

        return (
          <motion.button
            key={project.name}
            onClick={() => onStarClick(project)}
            onMouseEnter={() => setHoveredStar(project.name)}
            onMouseLeave={() => setHoveredStar(null)}
            className={`group absolute ${project.position} flex flex-col items-center cursor-pointer text-left`}
          >
            {/* The Star and its Name are the permanent visual anchors */}
            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_3px_rgba(255,255,255,0.8)] animate-twinkle transition-all duration-300 group-hover:scale-125" />
            <h3
              className="mt-3 text-sm text-white/90 font-light tracking-wide transition-opacity"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {project.name}
            </h3>

            {/* A. The "Ghost" Element for the DECOMPRESSION animation */}
            {/* This is a zero-size div at the star's position that only appears during the exit animation to act as a target. */}
            {isPersistedForExit && (
              <motion.div className="absolute top-0" layoutId={`card-${project.name}`} />
            )}

            {/* B. The real Hover Card for the EXPANSION animation */}
            {/* This appears on hover or during the expansion. */}
            {shouldShowHoverCard && (
              <motion.div
                layoutId={`card-${project.name}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-16 w-80 rounded-2xl shadow-2xl p-6 bg-blue-900/40 backdrop-blur-lg border border-blue-400/30 pointer-events-none"
              >
                <motion.h4 layoutId={`title-${project.name}`} className="text-xl font-bold text-white mb-3">{project.name}</motion.h4>
                <motion.p layoutId={`description-${project.name}`} className="text-white/90 text-sm leading-relaxed">{project.description}</motion.p>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
