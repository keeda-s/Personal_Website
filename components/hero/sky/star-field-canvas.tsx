"use client"

import { useEffect, useRef } from "react"
import { cssNumber, mulberry32, watchCanvasControls } from "../canvas-utils"

export function StarFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = canvas?.closest(".hero-frame")

    if (!canvas || !(frame instanceof HTMLElement)) {
      return
    }

    const drawStars = () => {
      const rect = frame.getBoundingClientRect()
      const styles = getComputedStyle(frame)
      const density = cssNumber(styles, "--star-count", 18000)
      const seed = cssNumber(styles, "--star-seed", 113)
      const skyHeight = cssNumber(styles, "--star-sky-height", 0.84)
      const minSize = cssNumber(styles, "--star-min-size", 0.75)
      const maxSize = cssNumber(styles, "--star-max-size", 2.2)
      const minAlpha = cssNumber(styles, "--star-min-alpha", 0.2)
      const maxAlpha = cssNumber(styles, "--star-max-alpha", 0.9)
      const brightChance = cssNumber(styles, "--star-bright-chance", 0.08)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.ceil(rect.width)
      const height = Math.ceil(rect.height)
      const random = mulberry32(seed)
      const context = canvas.getContext("2d")

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      if (!context) {
        return
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = "screen"

      for (let index = 0; index < density; index += 1) {
        const x = random() * width
        const y = random() * height * skyHeight
        const sizeBias = random() ** 2.8
        const radius = minSize + sizeBias * (maxSize - minSize)
        const alpha = minAlpha + random() * (maxAlpha - minAlpha)
        const blue = 226 + Math.floor(random() * 29)
        const isBright = random() < brightChance

        context.beginPath()
        context.fillStyle = `rgba(${blue}, ${blue}, 255, ${Math.min(alpha + (isBright ? 0.18 : 0), 1)})`
        context.arc(x, y, radius * (isBright ? 1.45 : 1), 0, Math.PI * 2)
        context.fill()
      }
    }

    return watchCanvasControls(frame, drawStars, [
      "--star-count",
      "--star-seed",
      "--star-sky-height",
      "--star-min-size",
      "--star-max-size",
      "--star-min-alpha",
      "--star-max-alpha",
      "--star-bright-chance",
    ])
  }, [])

  return <canvas ref={canvasRef} className="hero-random-stars" />
}
