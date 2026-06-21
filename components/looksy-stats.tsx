"use client";

import React, { useEffect } from 'react';
import { useInView, useAnimate } from 'framer-motion';
import { Instagram, Star, Users, BarChart2 } from 'lucide-react';
import { TikTokIcon } from './tiktok-icon';

// Custom hook for the number animation
function useAnimatedCounter(targetValue: number) {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(
        scope.current,
        { textContent: Math.round(targetValue) },
        { duration: 1.5, ease: "easeOut" }
      );
    }
  }, [isInView, targetValue, animate, scope]);

  return <span ref={scope}>0</span>;
}

// Simulated data - replace with a real API call
const stats = {
  instagramFollowers: '1.2K',
  tiktokFollowers: '3.4K',
  starRating: 4.8,
  ratingsCount: 256,
  totalUses: 1024,
  uniqueUsers: 512,
};

export const LooksyStats = () => {
  const AnimatedTotalUses = useAnimatedCounter(stats.totalUses);
  const AnimatedUniqueUsers = useAnimatedCounter(stats.uniqueUsers);

  return (
    <>
      {/* Top-right: Social Stats */}
      <div className="col-span-1 row-span-1 bg-white/5 rounded-2xl p-6 flex flex-col justify-around">
        <a href="https://instagram.com/trylooksy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:bg-white/10 p-2 rounded-lg transition-colors">
          <Instagram size={24} />
          <div>
            <p className="font-semibold">{stats.instagramFollowers}</p>
            <p className="text-xs text-white/70">Followers</p>
          </div>
        </a>
        <a href="https://tiktok.com/@trylooksy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:bg-white/10 p-2 rounded-lg transition-colors">
          <TikTokIcon className="h-6 w-6 fill-current" />
          <div>
            <p className="font-semibold">{stats.tiktokFollowers}</p>
            <p className="text-xs text-white/70">Followers</p>
          </div>
        </a>
        <div className="flex items-center gap-4 p-2">
          <Star size={24} className="text-yellow-400" />
          <div>
            <p className="font-semibold">{stats.starRating}</p>
            <p className="text-xs text-white/70">from {stats.ratingsCount} ratings</p>
          </div>
        </div>
      </div>

      {/* Middle: Live Supabase Stats */}
      <div className="col-span-1 row-span-1 bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <BarChart2 size={32} className="mb-2 text-white/80" />
        <p className="text-4xl font-bold">{AnimatedTotalUses}</p>
        <p className="text-sm text-white/70">Total Uses</p>
      </div>
      <div className="col-span-1 row-span-1 bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <Users size={32} className="mb-2 text-white/80" />
        <p className="text-4xl font-bold">{AnimatedUniqueUsers}</p>
        <p className="text-sm text-white/70">Unique Users</p>
      </div>

      {/* Bottom: Thesis/Roadmap */}
      <div className="col-span-3 row-span-1 bg-white/5 rounded-2xl p-6">
        <h3 className="font-bold mb-2">Thesis & Roadmap</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          Looksy is built on the belief that inspiration should be instantly actionable. Our roadmap includes video analysis, integration with more platforms, and personalized style recommendations to seamlessly bridge the gap between content consumption and commerce.
        </p>
      </div>
    </>
  );
};
