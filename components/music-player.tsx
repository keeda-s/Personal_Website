"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react"

const tracks = [
  { title: "Surrenderism", artist: "Jon Kennedy", file: "/music/Jon Kennedy- Surrenderism.mp3" },
  { title: "Highness (Superlover Remix)", artist: "Tube & Berger, In.deed", file: "/music/Tube & Berger, In.deed - Highness (Superlover Remix).mp3" }
]

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length)
    setIsPlaying(false)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play()
    }
  }, [currentTrack])

  return (
    <div className="fixed bottom-8 right-8 z-50 bg-black/60 backdrop-blur-md rounded-full px-6 py-4 border border-white/20 shadow-lg">
      <audio
        ref={audioRef}
        src={tracks[currentTrack].file}
        onEnded={nextTrack}
      />
      
      <div className="flex items-center gap-4">
        <div className="text-right mr-2">
          <p className="text-white text-xs font-medium">{tracks[currentTrack].title}</p>
          <p className="text-gray-400 text-xs">{tracks[currentTrack].artist}</p>
        </div>
        
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
        </button>
        
        <button
          onClick={nextTrack}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <SkipForward size={20} className="text-white" />
        </button>
        
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
        </button>
      </div>
    </div>
  )
}