"use client"

import { useEffect, useRef } from "react"

function mulberry32(seed: number) {
  return () => {
    seed += 0x6d2b79f5
    let value = seed
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function cssNumber(styles: CSSStyleDeclaration, name: string, fallback: number) {
  const value = Number.parseFloat(styles.getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0))
  return amount * amount * (3 - 2 * amount)
}

function hash2d(x: number, y: number, seed: number) {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295
}

function valueNoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = x - x0
  const ty = y - y0
  const sx = tx * tx * (3 - 2 * tx)
  const sy = ty * ty * (3 - 2 * ty)
  const top = hash2d(x0, y0, seed) + (hash2d(x0 + 1, y0, seed) - hash2d(x0, y0, seed)) * sx
  const bottom = hash2d(x0, y0 + 1, seed) + (hash2d(x0 + 1, y0 + 1, seed) - hash2d(x0, y0 + 1, seed)) * sx
  return top + (bottom - top) * sy
}

function fbm(x: number, y: number, seed: number, octaves: number) {
  let value = 0
  let amplitude = 0.55
  let frequency = 1
  let normalization = 0

  for (let octave = 0; octave < octaves; octave += 1) {
    value += valueNoise(x * frequency, y * frequency, seed + octave * 97) * amplitude
    normalization += amplitude
    amplitude *= 0.5
    frequency *= 2.03
  }

  return value / normalization
}

function watchControls(frame: HTMLElement, draw: () => void, controls: string[]) {
  let animationFrame = 0
  let drawScheduled = false
  let signature = ""

  const currentSignature = () => {
    const styles = getComputedStyle(frame)
    const rect = frame.getBoundingClientRect()
    return [
      Math.ceil(rect.width),
      Math.ceil(rect.height),
      ...controls.map((name) => styles.getPropertyValue(name).trim()),
    ].join("|")
  }

  const schedule = () => {
    if (drawScheduled) return
    drawScheduled = true
    animationFrame = requestAnimationFrame(() => {
      drawScheduled = false
      draw()
    })
  }

  signature = currentSignature()
  schedule()

  const resizeObserver = new ResizeObserver(() => {
    const nextSignature = currentSignature()
    if (nextSignature === signature) return
    signature = nextSignature
    schedule()
  })
  resizeObserver.observe(frame)

  const controlPoll = window.setInterval(() => {
    const nextSignature = currentSignature()
    if (nextSignature === signature) return
    signature = nextSignature
    schedule()
  }, 350)

  return () => {
    cancelAnimationFrame(animationFrame)
    clearInterval(controlPoll)
    resizeObserver.disconnect()
  }
}

function createGlowStamp(red: number, green: number, blue: number) {
  const stamp = document.createElement("canvas")
  stamp.width = 96
  stamp.height = 96
  const context = stamp.getContext("2d")
  if (!context) return stamp
  const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48)
  gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 1)`)
  gradient.addColorStop(0.2, `rgba(${red}, ${green}, ${blue}, 0.7)`)
  gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`)
  context.fillStyle = gradient
  context.fillRect(0, 0, 96, 96)
  return stamp
}

type FieldSet = {
  outer: Float32Array
  light: Float32Array
  shadow: Float32Array
  rim: Float32Array
  colorPhase: Float32Array
}

const milkyControls = [
  "--milky-dust-seed",
  "--milky-dust-center-x",
  "--milky-dust-center-y",
  "--milky-dust-rotation",
  "--milky-dust-length",
  "--milky-dust-width",
  "--milky-dust-opacity",
  "--milky-dust-x",
  "--milky-dust-y",
  "--milky-dust-scale",
  "--milky-canvas-overscan-x",
  "--milky-canvas-overscan-y",
  "--milky-field-resolution",
  "--milky-noise-detail",
  "--milky-noise-warp",
  "--milky-cloud-contrast",
  "--milky-cloud-taper",
  "--milky-cloud-clump-scale",
  "--milky-evolution-warp-step",
  "--milky-evolution-contrast-step",
  "--milky-evolution-rise-step",
  "--milky-light-opacity",
  "--milky-outer-haze-opacity",
  "--milky-shadow-opacity",
  "--milky-shadow-depth",
  "--milky-shadow-fine-detail",
  "--milky-shadow-fine-opacity",
  "--milky-shadow-star-occlusion",
  "--milky-rim-width",
  "--milky-rim-intensity",
  "--milky-cyan-strength",
  "--milky-violet-strength",
  "--milky-rose-strength",
  "--milky-outer-star-count",
  "--milky-outer-star-min-size",
  "--milky-outer-star-max-size",
  "--milky-outer-star-alpha",
  "--milky-outer-star-spread",
  "--milky-outer-star-core-gap",
  "--milky-star-render-dpr",
  "--milky-star-rise-y",
  "--milky-star-rise-duration",
  "--milky-knot-count",
  "--milky-knot-min-size",
  "--milky-knot-max-size",
  "--milky-knot-intensity",
  "--milky-knot-spread",
  "--milky-knot-core-brightness",
  "--milky-render-dpr",
  "--milky-detail-scale",
]

type CloudCanvases = {
  outer: HTMLCanvasElement
  core: HTMLCanvasElement
  shadow: HTMLCanvasElement
}

export function VolumetricMilkyWay() {
  const systemRef = useRef<HTMLDivElement>(null)
  const outerARef = useRef<HTMLCanvasElement>(null)
  const coreARef = useRef<HTMLCanvasElement>(null)
  const shadowARef = useRef<HTMLCanvasElement>(null)
  const outerBRef = useRef<HTMLCanvasElement>(null)
  const coreBRef = useRef<HTMLCanvasElement>(null)
  const shadowBRef = useRef<HTMLCanvasElement>(null)
  const outerStarsRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const system = systemRef.current
    const outerA = outerARef.current
    const coreA = coreARef.current
    const shadowA = shadowARef.current
    const outerB = outerBRef.current
    const coreB = coreBRef.current
    const shadowB = shadowBRef.current
    const outerStarsCanvas = outerStarsRef.current
    const frame = system?.closest(".hero-frame")

    if (
      !system || !outerA || !coreA || !shadowA || !outerB || !coreB || !shadowB ||
      !outerStarsCanvas ||
      !(frame instanceof HTMLElement)
    ) return

    const cloudBanks: [CloudCanvases, CloudCanvases] = [
      { outer: outerA, core: coreA, shadow: shadowA },
      { outer: outerB, core: coreB, shadow: shadowB },
    ]
    const bankLayers = (bank: number) => Object.values(cloudBanks[bank] ?? cloudBanks[0])

    let renderCount = 0
    let activeBank = 0
    let evolutionPhase = 0
    let currentNoiseWarp: number | null = null
    let currentCloudContrast: number | null = null
    let starAnimationFrame = 0
    let starCycleStartedAt = performance.now()
    let starCycleDuration = 10000
    let starCycleDistance = 0
    let currentStarDpr = 1

    const render = (clouds: CloudCanvases, phase = 0, redrawStars = false) => {
      const startedAt = performance.now()
      const rect = frame.getBoundingClientRect()
      const styles = getComputedStyle(frame)
      const frameWidth = Math.max(1, Math.ceil(rect.width))
      const frameHeight = Math.max(1, Math.ceil(rect.height))
      const overscanX = Math.max(0, Math.min(0.4, cssNumber(styles, "--milky-canvas-overscan-x", 0.16)))
      const overscanY = Math.max(0, Math.min(0.5, cssNumber(styles, "--milky-canvas-overscan-y", 0.24)))
      const paddingX = Math.ceil(frameWidth * overscanX)
      const paddingY = Math.ceil(frameHeight * overscanY)
      const width = frameWidth + paddingX * 2
      const height = frameHeight + paddingY * 2
      const seed = Math.round(cssNumber(styles, "--milky-dust-seed", 711))
      const evolutionRandom = mulberry32(seed + phase * 7919)
      const centerX = cssNumber(styles, "--milky-dust-center-x", 0.36)
      const centerY = cssNumber(styles, "--milky-dust-center-y", 0.34)
      const rotation = cssNumber(styles, "--milky-dust-rotation", 70) * (Math.PI / 180)
      const length = cssNumber(styles, "--milky-dust-length", 1.5)
      const widthControl = cssNumber(styles, "--milky-dust-width", 0.38)
      const detailScale = Math.max(0.25, Math.min(1, cssNumber(styles, "--milky-detail-scale", 1)))
      const renderDpr = Math.max(1, cssNumber(styles, "--milky-render-dpr", 1.25))
      const dpr = Math.min(window.devicePixelRatio || 1, renderDpr)
      const fieldResolution = Math.max(0.1, Math.min(0.42, cssNumber(styles, "--milky-field-resolution", 0.14)))
      const overscanAreaScale = width * height / (frameWidth * frameHeight)
      const effectiveFieldResolution = fieldResolution / Math.sqrt(overscanAreaScale)
      const fieldWidth = Math.max(80, Math.ceil(width * effectiveFieldResolution))
      const fieldHeight = Math.max(60, Math.ceil(height * effectiveFieldResolution))
      const noiseDetail = Math.max(1, cssNumber(styles, "--milky-noise-detail", 4.8))
      const baseNoiseWarp = cssNumber(styles, "--milky-noise-warp", 0.68)
      const warpMin = cssNumber(styles, "--milky-evolution-warp-min", 0.5)
      const warpMax = Math.max(warpMin, cssNumber(styles, "--milky-evolution-warp-max", 0.95))
      const warpStep = Math.max(0.02, cssNumber(styles, "--milky-evolution-warp-step", 0.22))
      const targetNoiseWarp = phase === 0 ? baseNoiseWarp : warpMin + evolutionRandom() * (warpMax - warpMin)
      currentNoiseWarp = phase === 0 || currentNoiseWarp === null
        ? baseNoiseWarp
        : currentNoiseWarp + Math.max(-warpStep, Math.min(warpStep, targetNoiseWarp - currentNoiseWarp))
      const noiseWarp = currentNoiseWarp
      const baseCloudContrast = Math.max(0.5, cssNumber(styles, "--milky-cloud-contrast", 1.8))
      const contrastMin = Math.max(0.5, cssNumber(styles, "--milky-evolution-contrast-min", 1.2))
      const contrastMax = Math.max(contrastMin, cssNumber(styles, "--milky-evolution-contrast-max", 6))
      const contrastStep = Math.max(0.05, cssNumber(styles, "--milky-evolution-contrast-step", 0.48))
      const targetCloudContrast = phase === 0
        ? baseCloudContrast
        : contrastMin + evolutionRandom() ** 1.7 * (contrastMax - contrastMin)
      currentCloudContrast = phase === 0 || currentCloudContrast === null
        ? baseCloudContrast
        : currentCloudContrast + Math.max(-contrastStep, Math.min(contrastStep, targetCloudContrast - currentCloudContrast))
      const cloudContrast = currentCloudContrast
      const cloudTaper = Math.max(0.04, cssNumber(styles, "--milky-cloud-taper", 0.18))
      const cloudClumpScale = Math.max(0.3, cssNumber(styles, "--milky-cloud-clump-scale", 1))
      const lightOpacity = cssNumber(styles, "--milky-light-opacity", 0.88)
      const hazeOpacity = cssNumber(styles, "--milky-outer-haze-opacity", 0.24)
      const shadowOpacity = cssNumber(styles, "--milky-shadow-opacity", 0.86)
      const shadowDepth = Math.max(0.3, cssNumber(styles, "--milky-shadow-depth", 1.22))
      const shadowFineDetail = Math.max(1, cssNumber(styles, "--milky-shadow-fine-detail", 2.8))
      const shadowFineOpacity = clamp01(cssNumber(styles, "--milky-shadow-fine-opacity", 0.48))
      const shadowStarOcclusion = Math.max(1, cssNumber(styles, "--milky-shadow-star-occlusion", 4.2))
      const rimWidth = Math.max(1, Math.round(cssNumber(styles, "--milky-rim-width", 2)))
      const rimIntensity = cssNumber(styles, "--milky-rim-intensity", 0.86)
      const cyanStrength = Math.max(0, cssNumber(styles, "--milky-cyan-strength", 1))
      const violetStrength = Math.max(0, cssNumber(styles, "--milky-violet-strength", 0.9))
      const roseStrength = Math.max(0, cssNumber(styles, "--milky-rose-strength", 0.32))
      const bandLength = Math.hypot(frameWidth, frameHeight) * length
      const bandWidth = frameHeight * widthControl
      const originX = paddingX + frameWidth * centerX
      const originY = paddingY + frameHeight * centerY
      const cos = Math.cos(rotation)
      const sin = Math.sin(rotation)

      const fields: FieldSet = {
        outer: new Float32Array(fieldWidth * fieldHeight),
        light: new Float32Array(fieldWidth * fieldHeight),
        shadow: new Float32Array(fieldWidth * fieldHeight),
        rim: new Float32Array(fieldWidth * fieldHeight),
        colorPhase: new Float32Array(fieldWidth * fieldHeight),
      }

      for (let fieldY = 0; fieldY < fieldHeight; fieldY += 1) {
        const screenY = (fieldY + 0.5) / fieldHeight * height
        for (let fieldX = 0; fieldX < fieldWidth; fieldX += 1) {
          const screenX = (fieldX + 0.5) / fieldWidth * width
          const dx = screenX - originX
          const dy = screenY - originY
          const along = dx * cos + dy * sin
          const across = -dx * sin + dy * cos
          const t = along / bandLength + 0.5
          const pathWobble = (valueNoise(t * 5.8, seed * 0.0007, seed + 11) - 0.5) * 0.72
          const normalizedAcross = across / Math.max(1, bandWidth * cloudClumpScale) - pathWobble
          const endEnvelope = smoothstep(0, cloudTaper, t) * smoothstep(0, cloudTaper, 1 - t)
          const widthNoise = valueNoise(t * 4.1, seed * 0.001, seed + 19)
          const localWidth = 0.54 + widthNoise * 0.72
          const crossEnvelope = Math.exp(-Math.pow(normalizedAcross / localWidth, 2) * 1.52)
          const frameY = (screenY - paddingY) / frameHeight
          const verticalFade = 1 - smoothstep(0.66, 0.84, frameY)
          const envelope = endEnvelope * crossEnvelope * verticalFade
          const index = fieldY * fieldWidth + fieldX
          if (envelope < 0.001) continue
          const riseStep = cssNumber(styles, "--milky-evolution-rise-step", 0.16)
          const riseDistance = phase * riseStep * frameHeight
          const riseAlong = riseDistance * sin / Math.max(1, bandLength) * noiseDetail
          const riseAcross = riseDistance * cos / Math.max(1, bandWidth * cloudClumpScale) * noiseDetail * 0.23
          const baseU = t * noiseDetail + riseAlong
          const baseV = normalizedAcross * noiseDetail * 0.23 + riseAcross
          const warpX = fbm(baseU * 0.5, baseV * 0.5, seed + 43, 2) - 0.5
          const warpY = fbm(baseU * 0.5 + 13.7, baseV * 0.5 - 9.2, seed + 67, 2) - 0.5
          const warpedU = baseU + warpX * noiseWarp * 2.7
          const warpedV = baseV + warpY * noiseWarp * 2.2
          const lightNoise = fbm(warpedU, warpedV, seed + 131, 3)
          const shadowNoise = fbm(warpedU * 1.16 + 17.3, warpedV * 1.28 - 6.8, seed + 307, 3)
          const fineShadowNoise = fbm(
            warpedU * shadowFineDetail + 29.4,
            warpedV * shadowFineDetail - 18.7,
            seed + 911,
            2,
          )
          const fineDustVeins = Math.pow(1 - Math.abs(fineShadowNoise * 2 - 1), 3.4)
          const outerNoise = valueNoise(warpedU * 0.58 - 4.1, warpedV * 0.64 + 12.6, seed + 503)
          const colorPhase = valueNoise(warpedU * 0.68 + 31.2, warpedV * 0.74, seed + 701)
          const outer = envelope * smoothstep(0.2, 0.76, outerNoise * 0.7 + lightNoise * 0.3)
          const outerShadowMask = smoothstep(0.04, 0.62, outerNoise)
          const shadowStructure = shadowNoise
            + (fineShadowNoise - 0.5) * shadowFineOpacity * 0.62
            + fineDustVeins * shadowFineOpacity * 0.34
          const broadShadow = envelope * smoothstep(0.33, 0.63, shadowStructure + (1 - lightNoise) * 0.16) * outerShadowMask
          const granularShadow = envelope
            * (smoothstep(0.48, 0.74, fineShadowNoise) * 0.34 + fineDustVeins * 0.24)
            * shadowFineOpacity
            * outerShadowMask
          const shadow = clamp01(broadShadow * (0.9 + fineDustVeins * 0.16) + granularShadow)
          const cloudBody = smoothstep(0.29, 0.66, lightNoise * 0.76 + outerNoise * 0.24)
          const rawLight = envelope * (0.055 + cloudBody * 0.945)
          const light = Math.pow(clamp01(rawLight * (1 - shadow * 0.62)), cloudContrast)

          fields.outer[index] = outer
          fields.shadow[index] = shadow
          fields.light[index] = light
          fields.colorPhase[index] = colorPhase
        }
      }

      for (let fieldY = 0; fieldY < fieldHeight; fieldY += 1) {
        for (let fieldX = 0; fieldX < fieldWidth; fieldX += 1) {
          const index = fieldY * fieldWidth + fieldX
          let expandedShadow = 0
          for (let offsetY = -rimWidth; offsetY <= rimWidth; offsetY += rimWidth) {
            for (let offsetX = -rimWidth; offsetX <= rimWidth; offsetX += rimWidth) {
              const sampleX = Math.max(0, Math.min(fieldWidth - 1, fieldX + offsetX))
              const sampleY = Math.max(0, Math.min(fieldHeight - 1, fieldY + offsetY))
              expandedShadow = Math.max(expandedShadow, fields.shadow[sampleY * fieldWidth + sampleX])
            }
          }
          fields.rim[index] = Math.max(0, expandedShadow - fields.shadow[index] * 0.82) * fields.outer[index]
        }
      }

      const outerImage = new ImageData(fieldWidth, fieldHeight)
      const coreImage = new ImageData(fieldWidth, fieldHeight)
      const shadowImage = new ImageData(fieldWidth, fieldHeight)

      for (let index = 0; index < fields.outer.length; index += 1) {
        const dither = (hash2d(index % fieldWidth, Math.floor(index / fieldWidth), seed + 991) - 0.5) * 0.035
        const outerAlpha = clamp01(Math.pow(fields.outer[index], 0.68) * hazeOpacity + dither * 0.35)
        const light = fields.light[index]
        const rim = fields.rim[index] * rimIntensity
        const denseCore = smoothstep(0.48, 0.92, light)
        const phase = fields.colorPhase[index]
        const cyanMix = cyanStrength * (0.42 + (1 - phase) * 0.58)
        const violetMix = violetStrength * (0.38 + phase * 0.62)
        const roseMix = roseStrength * denseCore * smoothstep(0.48, 0.88, phase)
        const whiteMix = denseCore * 0.36 + rim * 0.28
        const colorTotal = Math.max(0.001, cyanMix + violetMix + roseMix + whiteMix)
        const pixel = index * 4
        const colorDither = dither * 70

        outerImage.data[pixel] = Math.round(42 + 28 * phase + colorDither)
        outerImage.data[pixel + 1] = Math.round(91 + 35 * (1 - phase) + colorDither)
        outerImage.data[pixel + 2] = Math.round(172 + 42 * phase + colorDither)
        outerImage.data[pixel + 3] = Math.round(255 * outerAlpha)

        coreImage.data[pixel] = Math.round((86 * cyanMix + 157 * violetMix + 224 * roseMix + 238 * whiteMix) / colorTotal + colorDither)
        coreImage.data[pixel + 1] = Math.round((167 * cyanMix + 121 * violetMix + 126 * roseMix + 235 * whiteMix) / colorTotal + colorDither)
        coreImage.data[pixel + 2] = Math.round((238 * cyanMix + 239 * violetMix + 203 * roseMix + 255 * whiteMix) / colorTotal + colorDither)
        coreImage.data[pixel + 3] = Math.round(255 * clamp01(Math.pow(light, 0.62) * lightOpacity + rim + dither * 0.22))

        const shadow = Math.pow(fields.shadow[index], shadowDepth)
        shadowImage.data[pixel] = 3 + Math.round(10 * phase)
        shadowImage.data[pixel + 1] = 5 + Math.round(8 * phase)
        shadowImage.data[pixel + 2] = 18 + Math.round(18 * phase)
        shadowImage.data[pixel + 3] = Math.round(255 * clamp01(shadow * shadowOpacity + dither * 0.08))
      }

      const imageCanvas = (image: ImageData) => {
        const surface = document.createElement("canvas")
        surface.width = fieldWidth
        surface.height = fieldHeight
        surface.getContext("2d")?.putImageData(image, 0, 0)
        return surface
      }

      const outerSurface = imageCanvas(outerImage)
      const coreSurface = imageCanvas(coreImage)
      const shadowSurface = imageCanvas(shadowImage)

      const configureCanvas = (canvas: HTMLCanvasElement, canvasDpr = dpr) => {
        canvas.style.left = `${-paddingX}px`
        canvas.style.top = `${-paddingY}px`
        canvas.style.right = "auto"
        canvas.style.bottom = "auto"
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        canvas.width = Math.ceil(width * canvasDpr)
        canvas.height = Math.ceil(height * canvasDpr)
        const context = canvas.getContext("2d")
        if (!context) return null
        context.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0)
        context.clearRect(0, 0, width, height)
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = "high"
        return context
      }

      const outerContext = configureCanvas(clouds.outer)
      const coreContext = configureCanvas(clouds.core)
      const shadowContext = configureCanvas(clouds.shadow)
      if (!outerContext || !coreContext || !shadowContext) return

      outerContext.drawImage(outerSurface, 0, 0, width, height)
      coreContext.drawImage(coreSurface, 0, 0, width, height)
      shadowContext.drawImage(shadowSurface, 0, 0, width, height)

      const sampleField = (field: Float32Array, x: number, y: number) => {
        const fieldX = Math.max(0, Math.min(fieldWidth - 1, Math.floor(x / width * fieldWidth)))
        const fieldY = Math.max(0, Math.min(fieldHeight - 1, Math.floor(y / height * fieldHeight)))
        return field[fieldY * fieldWidth + fieldX]
      }

      const pointInBand = (random: () => number, spread: number, centerGap = 0) => {
        const t = random() - 0.5
        const lumpyWidth = bandWidth * (0.34 + 0.66 * (1 - Math.abs(t * 1.55)))
        const rawNormal = (random() + random() + random() - 1.5) / 1.5
        const signedGap = rawNormal < 0 ? -centerGap : centerGap
        const normal = centerGap > 0
          ? signedGap + rawNormal * Math.max(0, spread - centerGap)
          : rawNormal * spread
        const along = t * bandLength
        const across = normal * lumpyWidth
        return {
          x: originX + along * cos - across * sin,
          y: originY + along * sin + across * cos,
        }
      }

      const drawStars = (
        context: CanvasRenderingContext2D,
        count: number,
        randomSeed: number,
        minSize: number,
        maxSize: number,
        opacity: number,
        canvasDpr: number,
      ) => {
        const random = mulberry32(randomSeed)
        const targetCount = Math.max(0, Math.round(count * detailScale))
        const starSpread = cssNumber(styles, "--milky-outer-star-spread", 1.18)
        const starCoreGap = cssNumber(styles, "--milky-outer-star-core-gap", 0.28)
        const image = context.createImageData(context.canvas.width, context.canvas.height)
        const pixels = image.data
        const pixelWidth = image.width
        const pixelHeight = image.height
        const plot = (x: number, y: number, red: number, green: number, alpha: number) => {
          if (x < 0 || x >= pixelWidth || y < 0 || y >= pixelHeight) return
          const index = (y * pixelWidth + x) * 4
          const alphaByte = Math.round(clamp01(alpha) * 255)
          pixels[index] = Math.max(pixels[index], red)
          pixels[index + 1] = Math.max(pixels[index + 1], green)
          pixels[index + 2] = 255
          pixels[index + 3] = Math.min(255, pixels[index + 3] + alphaByte)
        }

        for (let drawn = 0; drawn < targetCount; drawn += 1) {
          let point = pointInBand(random, starSpread, starCoreGap)
          for (let retry = 0; retry < 5 && (point.x < 0 || point.x > width || point.y < 0 || point.y > height); retry += 1) {
            point = pointInBand(random, starSpread, starCoreGap)
          }
          if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) continue
          const light = sampleField(fields.outer, point.x, point.y)
          const shadow = sampleField(fields.shadow, point.x, point.y)
          const shadowVisibility = Math.pow(1 - shadow, shadowStarOcclusion * 0.42)
          const density = clamp01((light * 0.62 + 0.12) * shadowVisibility)

          const sizeBias = random() ** 2.8
          const radius = minSize + sizeBias * Math.max(0, maxSize - minSize)
          const frameY = (point.y - paddingY) / frameHeight
          const verticalVisibility = clamp01(1 - smoothstep(0.66, 0.84, frameY))
          const alpha = opacity * shadowVisibility * verticalVisibility * (0.42 + density * 0.58) * (0.72 + random() * 0.28)
          const colorStep = Math.min(3, Math.floor(random() * 4))
          const red = 205 + colorStep * 11
          const green = 218 + colorStep * 8
          const pixelX = Math.round(point.x * canvasDpr)
          const pixelY = Math.round(point.y * canvasDpr)
          const pixelRadius = radius * canvasDpr

          plot(pixelX, pixelY, red, green, alpha)
          if (pixelRadius >= 0.48) {
            const haloAlpha = alpha * Math.min(0.34, pixelRadius * 0.3)
            plot(pixelX - 1, pixelY, red, green, haloAlpha)
            plot(pixelX + 1, pixelY, red, green, haloAlpha)
            plot(pixelX, pixelY - 1, red, green, haloAlpha)
            plot(pixelX, pixelY + 1, red, green, haloAlpha)
          }
          if (pixelRadius >= 0.82) {
            const cornerAlpha = alpha * 0.16
            plot(pixelX - 1, pixelY - 1, red, green, cornerAlpha)
            plot(pixelX + 1, pixelY - 1, red, green, cornerAlpha)
            plot(pixelX - 1, pixelY + 1, red, green, cornerAlpha)
            plot(pixelX + 1, pixelY + 1, red, green, cornerAlpha)
          }
        }

        context.save()
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.putImageData(image, 0, 0)
        context.restore()
      }

      if (redrawStars) {
        const starsStartedAt = performance.now()
        const starDpr = Math.max(0.6, Math.min(dpr, cssNumber(styles, "--milky-star-render-dpr", 0.9)))
        const outerStarsContext = configureCanvas(outerStarsCanvas, starDpr)
        if (outerStarsContext) {
          drawStars(
            outerStarsContext,
            cssNumber(styles, "--milky-outer-star-count", 6000),
            seed + 1201,
            cssNumber(styles, "--milky-outer-star-min-size", 0.24),
            cssNumber(styles, "--milky-outer-star-max-size", 0.82),
            cssNumber(styles, "--milky-outer-star-alpha", 0.52),
            starDpr,
          )
        }
        currentStarDpr = starDpr
        starCycleDistance = Math.max(8, Math.abs(cssNumber(styles, "--milky-star-rise-y", -7.2)) * height / 100)
        starCycleDuration = Math.max(1000, cssNumber(styles, "--milky-star-rise-duration", 10) * 1000)
        starCycleStartedAt = performance.now()
        outerStarsCanvas.style.setProperty("--milky-star-offset-y", "0px")
        system.dataset.starRenderMs = (performance.now() - starsStartedAt).toFixed(1)
      }

      const knotCount = Math.max(0, Math.round(cssNumber(styles, "--milky-knot-count", 12)))
      const knotMinSize = cssNumber(styles, "--milky-knot-min-size", 18)
      const knotMaxSize = cssNumber(styles, "--milky-knot-max-size", 68)
      const knotIntensity = cssNumber(styles, "--milky-knot-intensity", 0.58)
      const knotSpread = cssNumber(styles, "--milky-knot-spread", 0.58)
      const knotCoreBrightness = cssNumber(styles, "--milky-knot-core-brightness", 0.72)
      const knotRandom = mulberry32(seed + 1901)
      const cyanStamp = createGlowStamp(118, 190, 255)
      const violetStamp = createGlowStamp(190, 145, 255)
      const roseStamp = createGlowStamp(240, 145, 210)
      const knotCores = new Path2D()

      coreContext.save()
      coreContext.globalCompositeOperation = "screen"
      for (let index = 0; index < knotCount; index += 1) {
        let point = pointInBand(knotRandom, knotSpread)
        for (let attempt = 0; attempt < 8 && sampleField(fields.light, point.x, point.y) < 0.18; attempt += 1) {
          point = pointInBand(knotRandom, knotSpread)
        }
        const radius = knotMinSize + knotRandom() ** 1.6 * Math.max(0, knotMaxSize - knotMinSize)
        const phase = sampleField(fields.colorPhase, point.x, point.y)
        const stamp = phase > 0.72 && roseStrength > 0.1 ? roseStamp : phase > 0.42 ? violetStamp : cyanStamp
        coreContext.globalAlpha = knotIntensity * (0.46 + knotRandom() * 0.5)
        coreContext.drawImage(stamp, point.x - radius, point.y - radius, radius * 2, radius * 2)
        const coreRadius = Math.max(0.65, radius * 0.025 * knotCoreBrightness)
        knotCores.moveTo(point.x + coreRadius, point.y)
        knotCores.arc(point.x, point.y, coreRadius, 0, Math.PI * 2)
      }
      coreContext.globalAlpha = knotCoreBrightness
      coreContext.fillStyle = "rgba(242, 238, 255, 0.96)"
      coreContext.fill(knotCores)
      coreContext.restore()

      renderCount += 1
      system.dataset.renderCount = String(renderCount)
      system.dataset.renderMs = (performance.now() - startedAt).toFixed(1)
      system.dataset.noiseWarp = noiseWarp.toFixed(3)
      system.dataset.cloudContrast = cloudContrast.toFixed(3)
    }

    const renderBase = () => {
      render(cloudBanks[activeBank], evolutionPhase, true)
    }
    const stopWatching = watchControls(frame, renderBase, milkyControls)
    let evolutionTimer = 0
    let evolutionPaintFrame = 0
    let evolutionSwapFrame = 0
    let bankCleanupTimer = 0

    const startBankDrift = (bank: number, durationMs: number) => {
      const layers = bankLayers(bank)
      layers.forEach((layer) => {
        layer.classList.remove("is-milky-bank-drifting")
        layer.style.setProperty("--milky-bank-drift-duration", `${durationMs}ms`)
      })
      // Flush the removed animation so reusing a bank starts from its new field.
      void system.offsetWidth
      layers.forEach((layer) => layer.classList.add("is-milky-bank-drifting"))
    }

    const scheduleEvolution = () => {
      const styles = getComputedStyle(frame)
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reducedMotion || cssNumber(styles, "--milky-evolution-enabled", 1) < 0.5) return

      const crossfadeSeconds = Math.max(0.5, cssNumber(styles, "--milky-evolution-crossfade-duration", 12))
      // Keep the next bank arriving as the previous crossfade settles so the
      // volume advances continuously instead of waiting motionless between states.
      const minSeconds = Math.max(crossfadeSeconds + 0.75, cssNumber(styles, "--milky-evolution-min-duration", 32))
      const maxSeconds = Math.max(minSeconds, cssNumber(styles, "--milky-evolution-max-duration", 58))
      const seed = Math.round(cssNumber(styles, "--milky-dust-seed", 711))
      const intervalRandom = mulberry32(seed + (evolutionPhase + 1) * 3571)
      const delay = (minSeconds + intervalRandom() * (maxSeconds - minSeconds)) * 1000
      startBankDrift(activeBank, delay)

      evolutionTimer = window.setTimeout(() => {
        const previousBank = activeBank
        const nextBank = activeBank === 0 ? 1 : 0
        evolutionPhase += 1
        render(cloudBanks[nextBank], evolutionPhase, false)

        // Let the newly rendered canvas reach the compositor before fading it in.
        // Switching banks in the render task can otherwise flash on slower GPUs.
        evolutionPaintFrame = requestAnimationFrame(() => {
          evolutionSwapFrame = requestAnimationFrame(() => {
            system.classList.toggle("hero-milky-bank-b-active", nextBank === 1)
            activeBank = nextBank
            scheduleEvolution()
            clearTimeout(bankCleanupTimer)
            bankCleanupTimer = window.setTimeout(() => {
              bankLayers(previousBank).forEach((layer) => layer.classList.remove("is-milky-bank-drifting"))
            }, crossfadeSeconds * 1000)
          })
        })
      }, delay)
    }

    scheduleEvolution()

    const shiftStarPixelsUp = () => {
      const context = outerStarsCanvas.getContext("2d")
      if (!context || outerStarsCanvas.width < 1 || outerStarsCanvas.height < 1) return
      const pixelShift = Math.max(
        1,
        Math.min(outerStarsCanvas.height - 1, Math.round(starCycleDistance * currentStarDpr)),
      )
      const buffer = document.createElement("canvas")
      buffer.width = outerStarsCanvas.width
      buffer.height = outerStarsCanvas.height
      const bufferContext = buffer.getContext("2d")
      if (!bufferContext) return
      bufferContext.drawImage(outerStarsCanvas, 0, 0)

      context.save()
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, outerStarsCanvas.width, outerStarsCanvas.height)
      context.drawImage(
        buffer,
        0,
        pixelShift,
        buffer.width,
        buffer.height - pixelShift,
        0,
        0,
        buffer.width,
        buffer.height - pixelShift,
      )
      context.drawImage(
        buffer,
        0,
        0,
        buffer.width,
        pixelShift,
        0,
        buffer.height - pixelShift,
        buffer.width,
        pixelShift,
      )
      context.restore()
    }

    const animateStars = (time: number) => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reducedMotion || starCycleDistance <= 0) {
        outerStarsCanvas.style.setProperty("--milky-star-offset-y", "0px")
        starCycleStartedAt = time
      } else {
        let elapsed = Math.max(0, time - starCycleStartedAt)
        while (elapsed >= starCycleDuration) {
          shiftStarPixelsUp()
          starCycleStartedAt += starCycleDuration
          elapsed -= starCycleDuration
        }
        const progress = elapsed / starCycleDuration
        outerStarsCanvas.style.setProperty(
          "--milky-star-offset-y",
          `${(-starCycleDistance * progress).toFixed(3)}px`,
        )
      }
      starAnimationFrame = requestAnimationFrame(animateStars)
    }
    starAnimationFrame = requestAnimationFrame(animateStars)

    return () => {
      stopWatching()
      clearTimeout(evolutionTimer)
      clearTimeout(bankCleanupTimer)
      cancelAnimationFrame(evolutionPaintFrame)
      cancelAnimationFrame(evolutionSwapFrame)
      cancelAnimationFrame(starAnimationFrame)
    }
  }, [])

  return (
    <div ref={systemRef} className="hero-milky-system" aria-hidden="true">
      <canvas ref={outerARef} className="hero-milky-layer hero-milky-cloud hero-milky-bank-a hero-milky-outer" />
      <canvas ref={outerBRef} className="hero-milky-layer hero-milky-cloud hero-milky-bank-b hero-milky-outer" />
      <canvas ref={outerStarsRef} className="hero-milky-layer hero-milky-stars hero-milky-outer-stars" />
      <canvas ref={coreARef} className="hero-milky-layer hero-milky-cloud hero-milky-bank-a hero-milky-core" />
      <canvas ref={coreBRef} className="hero-milky-layer hero-milky-cloud hero-milky-bank-b hero-milky-core" />
      <canvas ref={shadowARef} className="hero-milky-layer hero-milky-cloud hero-milky-bank-a hero-milky-shadow" />
      <canvas ref={shadowBRef} className="hero-milky-layer hero-milky-cloud hero-milky-bank-b hero-milky-shadow" />
    </div>
  )
}
