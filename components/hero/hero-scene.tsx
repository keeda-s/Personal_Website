"use client"

import { LandscapeLayers } from "./landscape-layers"
import { MoonSystem } from "./moon/moon-system"
import { StarFieldCanvas } from "./sky/star-field-canvas"
import { VolumetricMilkyWay } from "./sky/volumetric-milky-way"

type HeroSceneProps = {
  /** Kept for compatibility; the event layers that used it are currently off. */
  eventsPaused?: boolean
  /** Show the private moon and coast panel (used on the hidden /tides page). */
  coastPanel?: boolean
}

// Kept deliberately calm: stars, the Milky Way, the odd shooting star and the
// horizon glow. The busier layers (sky-event facts, flow fields, the dark-universe
// object, the seasonal constellation, sparkles) still live in ./events and ./sky
// and can be added back here one at a time.
function AmbientSkyDetails() {
  return (
    <>
      <div className="hero-shooting-star hero-shooting-star-a" />
      <div className="hero-shooting-star hero-shooting-star-b" />
      <div className="hero-horizon-glow" />
    </>
  )
}

export function HeroScene({ coastPanel = false }: HeroSceneProps) {
  return (
    <>
      <div className="hero-frame fixed overflow-hidden">
        <div className="hero-sky-background" />
        <StarFieldCanvas />

        <VolumetricMilkyWay />
        <AmbientSkyDetails />
        <LandscapeLayers />
      </div>

      <div className="hero-moon-layer fixed overflow-visible">
        <MoonSystem coastPanel={coastPanel} />
      </div>

      <div className="hero-border-frame fixed inset-0 pointer-events-none" aria-hidden="true" />
    </>
  )
}
