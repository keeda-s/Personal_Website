"use client";

import React from 'react';
import { motion } from 'framer-motion';
// The Twitter icon is replaced with our new custom XIcon
import { XIcon } from './x-icon'; 
import { Instagram } from 'lucide-react';

const socialLinks = [
  {
    name: 'X',
    // We now use the custom XIcon component
    icon: <XIcon />,
    url: 'https://x.com/keedafish',
  },
  {
    name: 'Instagram',
    icon: <Instagram size={18} />,
    url: 'https://instagram.com/keedafish',
  },
];

export const SocialLinks = () => {
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-6 place-items-center text-[rgba(205,222,255,0.74)] transition-all duration-300 hover:scale-110 hover:text-[rgba(244,249,255,0.92)] hover:[filter:drop-shadow(0_0_10px_rgba(190,220,255,0.36))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,249,255,0.55)]"
          aria-label={`Link to my ${link.name} profile`}
        >
          {link.icon}
        </a>
      ))}
    </motion.div>
  );
};
