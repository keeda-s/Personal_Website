"use client"

import { CosmicEventLayer } from "./events/cosmic-event-layer"
import { DarkMystery } from "./events/dark-mystery"
import { LiveSkyEvents } from "./events/live-sky-events"
import { LandscapeLayers } from "./landscape-layers"
import { MoonSystem } from "./moon/moon-system"
import { StarFlowFieldCanvas, VanGoghFlowCanvas } from "./sky/flow-field-canvases"
import { StarFieldCanvas } from "./sky/star-field-canvas"
import { SeasonalConstellation } from "./sky/seasonal-constellation"
import { VolumetricMilkyWay } from "./sky/volumetric-milky-way"

type HeroSceneProps = {
  eventsPaused?: boolean
}

function AmbientSkyDetails() {
  return (
    <>
      <div className="hero-shooting-star hero-shooting-star-a" />
      <div className="hero-shooting-star hero-shooting-star-b" />
      <div className="hero-shooting-star hero-shooting-star-c" />
      <div className="hero-geometric-anomaly" />
      <div className="hero-star-sparkle hero-star-sparkle-a" />
      <div className="hero-star-sparkle hero-star-sparkle-b" />
      <div className="hero-star-sparkle hero-star-sparkle-c" />
      <div className="hero-star-sparkle hero-star-sparkle-d" />
      <div className="hero-horizon-glow" />
    </>
  )
}

export function HeroScene({ eventsPaused = false }: HeroSceneProps) {
  return (
    <>
      <div className="hero-frame fixed overflow-hidden">
        <div className="hero-sky-background" />
        <StarFieldCanvas />
        <SeasonalConstellation />

        <VolumetricMilkyWay />
        <DarkMystery />
        <VanGoghFlowCanvas />
        <StarFlowFieldCanvas />
        <CosmicEventLayer paused={eventsPaused} />
        <LiveSkyEvents />
        <AmbientSkyDetails />
        <LandscapeLayers />
      </div>

      <div className="hero-moon-layer fixed overflow-visible">
        <MoonSystem />
      </div>

      <div className="hero-border-frame fixed inset-0 pointer-events-none" aria-hidden="true" />
    </>
  )
}
