import Image from "next/image"
import { SkeletonRiveCharacter } from "./character/skeleton-rive-character"

const imageClass = "absolute inset-0 h-full w-full object-cover select-none"

type LandscapeImageProps = {
  src: string
  layerClassName: string
}

function LandscapeImage({ src, layerClassName }: LandscapeImageProps) {
  return (
    <Image
      src={src}
      alt=""
      fill
      className={`${imageClass} hero-layer ${layerClassName}`}
      priority
      sizes="100vw"
    />
  )
}

export function LandscapeLayers() {
  return (
    <div className="hero-camera">
      <LandscapeImage src="/hero-layers/Left Mountain Far.png" layerClassName="hero-mountain-left-far" />
      <LandscapeImage src="/hero-layers/Right Mountain Far.png" layerClassName="hero-mountain-right-far" />

      <div className="hero-mist-layer hero-mist-layer-far" />

      <LandscapeImage src="/hero-layers/Left Mountain Close.png" layerClassName="hero-mountain-left-close" />
      <LandscapeImage src="/hero-layers/Right Mountain Close.png" layerClassName="hero-mountain-right-close" />

      <div className="hero-mist-layer hero-mist-layer-close" />

      <LandscapeImage src="/hero-layers/Lake expanded.png" layerClassName="hero-lake-expanded" />
      <LandscapeImage src="/hero-layers/Righthand Bank w human.png" layerClassName="hero-right-bank" />
      <LandscapeImage src="/hero-layers/lefthand bank.png" layerClassName="hero-left-bank" />

      <SkeletonRiveCharacter />

      <LandscapeImage src="/hero-layers/foreground.png" layerClassName="hero-foreground" />
    </div>
  )
}
