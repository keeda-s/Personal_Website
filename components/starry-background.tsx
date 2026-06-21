"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function StarryBackground() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <>
      {/* Container with border radius to clip all images */}
      <div 
        className="fixed pointer-events-none overflow-hidden" 
        style={{ 
          zIndex: 0,
          top: '20px',
          left: '20px',
          right: '20px',
          bottom: '20px',
          borderRadius: '32px'
        }}
      >
        {/* Night Sky - Static */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/Nigh_sky.png"
            alt="Night sky"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Milky Way - Drift */}
        <div className="absolute inset-0 w-full h-full animate-milky-way-drift">
          <Image
            src="/Milky_Way.png"
            alt="Milky way"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Moon - Move slightly right */}
        <div className="absolute inset-0 w-full h-full animate-moon-drift">
          <Image
            src="/moon.png"
            alt="Moon"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Lake Reflection - Glimmer */}
        <div className="absolute inset-0 w-full h-full animate-glimmer">
          <Image
            src="/backgroundpicture/lakereflection_layer5.png"
            alt="Lake reflection"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Stars in Lake - Fade with breath */}
         <div className="absolute inset-0 w-full h-full animate-stars-fade">
         <Image
           src="/milky_way 1.png"
           alt="Stars in lake"
           fill
           className="object-cover"
           priority
           quality={90}
         />
        </div>

        {/* Ground Layer - Static */}
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Image
            src="/Ground_Layer.png"
            alt="Ground"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Foreground Left */}
        <div className="absolute inset-0 w-full h-full animate-foreground-left" style={{ zIndex: 15 }}>
          <Image
            src="/Foreground_Left.png"
            alt="Foreground left"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Foreground Right */}
        <div className="absolute inset-0 w-full h-full animate-foreground-right" style={{ zIndex: 15 }}>
          <Image
            src="/Foreground_Right.png"
            alt="Foreground right"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>
      </div>

      {/* Border frame on top */}
<div 
  className="fixed inset-0 pointer-events-none" 
  style={{ 
    zIndex: 25,
    border: '2px solid #1a1a1a',
    borderRadius: '32px',
    margin: '20px'
  }} 
/>
    </>
  )
}
