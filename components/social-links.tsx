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
    icon: <Instagram size={23} />,
    url: 'https://instagram.com/keedafish',
  },
];

export const SocialLinks = () => {
  return (
    <motion.div 
      className="flex items-center gap-4"
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
          className="p-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:scale-110 transition-all duration-300 text-white/80 hover:text-white"
          aria-label={`Link to my ${link.name} profile`}
        >
          {link.icon}
        </a>
      ))}
    </motion.div>
  );
};
