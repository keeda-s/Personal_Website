"use client";

import React from 'react';
import { motion, type Transition } from 'framer-motion';
import { X } from 'lucide-react';
import { LooksyStats } from './looksy-stats'; 

export interface Project {
  name: string;
  description: string;
  position?: string;
  starDelay?: number;
  textDelay?: number;
  longDescription: string;
  image: string;
  technologies: string[];
}

interface BentoGridModalProps {
  project: Project;
  onClose: () => void;
}

export const BentoGridModal = ({ project, onClose }: BentoGridModalProps) => {
  const transition: Transition = { type: "tween", ease: "easeInOut", duration: 0.5 };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        layoutId={`card-${project.name}`}
        transition={transition}
        className="relative w-[90%] max-w-7xl h-[85vh] bg-blue-950/25 backdrop-blur-xl border border-blue-400/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        <motion.button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
        >
          <X size={24} />
        </motion.button>
        
        {project.name === 'Looksy' ? (
          <div className="grid grid-cols-3 grid-rows-3 gap-6 h-full text-white p-8 pt-16">
            {/* Top-left: Title, Description, and Logo - UPDATED LAYOUT */}
            <div className="col-span-2 row-span-1 flex justify-between items-center rounded-2xl bg-white/5 p-6 overflow-hidden">
              <div className="pr-6">
                <motion.h2 layoutId={`title-${project.name}`} transition={transition} className="text-4xl font-bold font-serif">{project.name}</motion.h2>
                <motion.p layoutId={`description-${project.name}`} transition={transition} className="mt-2 text-white/80">{project.description}</motion.p>
              </div>
              {/* FIX: The logo container is now a relative frame. */}
              {/* You can adjust the `w-40` class to control the frame's size. */}
              <div className="relative h-full w-40 flex-shrink-0 -mr-6">
                {/* FIX: The image is now absolutely positioned and scaled. */}
                {/* You can adjust the `scale-150` class (e.g., scale-125, scale-200) to control the logo's zoom. */}
                <img src="/project-media/looksy.jpg" alt="Looksy Logo" className="absolute inset-0 h-full w-full object-cover scale-124" />
              </div>
            </div>
            
            <LooksyStats />
          </div>
        ) : (
          <div className="grid grid-cols-3 grid-rows-2 gap-6 h-full text-white p-8 pt-16">
            <div className="col-span-2 row-span-1 flex flex-col justify-center rounded-2xl bg-white/5 p-6">
              <motion.h2 layoutId={`title-${project.name}`} transition={transition} className="text-4xl font-bold font-serif">{project.name}</motion.h2>
              <motion.p layoutId={`description-${project.name}`} transition={transition} className="mt-2 text-white/80">{project.description}</motion.p>
            </div>
            <div className="col-span-1 row-span-2 rounded-2xl bg-white/5 overflow-hidden">
              <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-2 row-span-1 rounded-2xl bg-white/5 p-6 overflow-y-auto">
              <p className="text-white/90">{project.longDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
