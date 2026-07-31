"use client"

import { useState, useRef, useEffect } from "react"
import { Music, VolumeX } from "lucide-react"

const tracks = [
  {
    title: "Return to your Center (1 hour handpan music)",
    artist: "Malte Marten",
    file: "/music/Return to your Center (1 hour handpan music)  Malte Marten.mp3",
  },
  { title: "Surrenderism", artist: "Jon Kennedy", file: "/music/Jon Kennedy- Surrenderism.mp3" },
  { title: "Highness (Superlover Remix)", artist: "Tube & Berger, In.deed", file: "/music/Tube & Berger, In.deed - Highness (Superlover Remix).mp3" },
]

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    const audio = audioRef.current

    if (audio) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {
          setIsPlaying(false)
        })
      }
    }
  }

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [currentTrack, isPlaying])

  return (
    <div className="fixed bottom-8 right-[clamp(1.5rem,8vw,5rem)] z-50">
      <audio
        ref={audioRef}
        src={tracks[currentTrack].file}
        onEnded={nextTrack}
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Turn music off" : "Turn music on"}
        title={isPlaying ? "Music off" : "Music on"}
        className="grid size-6 place-items-center bg-transparent p-0 text-[rgba(205,222,255,0.74)] transition-all duration-300 hover:scale-110 hover:text-[rgba(244,249,255,0.92)] hover:[filter:drop-shadow(0_0_10px_rgba(190,220,255,0.36))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,249,255,0.55)]"
      >
        {isPlaying ? <Music size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
  )
}
