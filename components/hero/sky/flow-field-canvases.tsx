"use client"

import { useEffect, useRef } from "react"
import { cssNumber, mulberry32, smoothStep } from "../canvas-utils"

export function StarFlowFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = canvas?.closest(".hero-frame")

    if (!canvas || !(frame instanceof HTMLElement)) {
      return
    }

    const flowControlNames = [
      "--flow-seed",
      "--flow-count",
      "--flow-center-x",
      "--flow-center-y",
      "--flow-radius",
      "--flow-pull",
      "--flow-curl",
      "--flow-length",
      "--flow-width",
      "--flow-alpha",
      "--flow-dark-alpha",
      "--flow-swirl-speed",
      "--flow-swirl-strength",
      "--flow-phase-drift",
      "--flow-spiral-arms",
      "--flow-spiral-wobble",
      "--flow-inner-radius",
      "--flow-rotation-speed",
      "--flow-drift-duration",
      "--flow-redraw-fps",
      "--flow-render-dpr",
      "--flow-moon-repel-radius",
      "--flow-moon-repel-strength",
      "--moon-x",
      "--moon-y",
      "--moon-size",
      "--flow-rise-top-y",
      "--flow-rise-horizon-y",
      "--flow-rise-fade",
      "--flow-1-rise-enabled", "--flow-1-rise-duration",
      "--flow-2-rise-enabled", "--flow-2-rise-duration",
      "--flow-3-rise-enabled", "--flow-3-rise-duration",
      "--flow-4-rise-enabled", "--flow-4-rise-duration",
      "--flow-5-rise-enabled", "--flow-5-rise-duration",
      "--flow-1-x", "--flow-1-y", "--flow-1-radius", "--flow-1-opacity", "--flow-1-density", "--flow-1-length", "--flow-1-rotation-speed", "--flow-1-drift-x", "--flow-1-drift-y", "--flow-1-ring-mode",
      "--flow-2-x", "--flow-2-y", "--flow-2-radius", "--flow-2-opacity", "--flow-2-density", "--flow-2-length", "--flow-2-rotation-speed", "--flow-2-drift-x", "--flow-2-drift-y", "--flow-2-ring-mode",
      "--flow-3-x", "--flow-3-y", "--flow-3-radius", "--flow-3-opacity", "--flow-3-density", "--flow-3-length", "--flow-3-rotation-speed", "--flow-3-drift-x", "--flow-3-drift-y", "--flow-3-ring-mode",
      "--flow-4-x", "--flow-4-y", "--flow-4-radius", "--flow-4-opacity", "--flow-4-density", "--flow-4-length", "--flow-4-rotation-speed", "--flow-4-drift-x", "--flow-4-drift-y", "--flow-4-ring-mode",
      "--flow-5-x", "--flow-5-y", "--flow-5-radius", "--flow-5-opacity", "--flow-5-density", "--flow-5-length", "--flow-5-rotation-speed", "--flow-5-drift-x", "--flow-5-drift-y", "--flow-5-ring-mode",
    ]

    const controlSignature = () => {
      const styles = getComputedStyle(frame)
      return flowControlNames.map((name) => styles.getPropertyValue(name).trim()).join("|")
    }

    const animationStartedAt = performance.now()

    const drawFlowField = (time = 0) => {
      const rect = frame.getBoundingClientRect()
      const styles = getComputedStyle(frame)
      const seed = cssNumber(styles, "--flow-seed", 907)
      const count = cssNumber(styles, "--flow-count", 2600)
      const centerX = cssNumber(styles, "--flow-center-x", 0.62)
      const centerY = cssNumber(styles, "--flow-center-y", 0.42)
      const radius = cssNumber(styles, "--flow-radius", 0.36)
      const pull = cssNumber(styles, "--flow-pull", 0.72)
      const curl = cssNumber(styles, "--flow-curl", 1.35)
      const length = cssNumber(styles, "--flow-length", 16)
      const widthControl = cssNumber(styles, "--flow-width", 0.42)
      const alpha = cssNumber(styles, "--flow-alpha", 0.18)
      const darkAlpha = cssNumber(styles, "--flow-dark-alpha", 0.08)
      const swirlSpeed = cssNumber(styles, "--flow-swirl-speed", 0.18)
      const swirlStrength = cssNumber(styles, "--flow-swirl-strength", 0.55)
      const phaseDrift = cssNumber(styles, "--flow-phase-drift", 0.35)
      const spiralArms = Math.max(1, Math.round(cssNumber(styles, "--flow-spiral-arms", 1)))
      const spiralWobble = cssNumber(styles, "--flow-spiral-wobble", 0.08)
      const innerRadius = Math.min(0.85, Math.max(0, cssNumber(styles, "--flow-inner-radius", 0.18)))
      const phase = time * 0.001 * swirlSpeed
      const dpr = Math.max(0.5, Math.min(window.devicePixelRatio || 1, cssNumber(styles, "--flow-render-dpr", 1)))
      const width = Math.ceil(rect.width)
      const height = Math.ceil(rect.height)
      const random = mulberry32(seed)
      const context = canvas.getContext("2d")
      const canvasWidth = width * dpr
      const canvasHeight = height * dpr
      const rotationSpeed = cssNumber(styles, "--flow-rotation-speed", 0.04)
      const driftDuration = Math.max(1, cssNumber(styles, "--flow-drift-duration", 38))
      const driftPhase = (time * 0.001 / driftDuration) * Math.PI * 2
      const riseTop = cssNumber(styles, "--flow-rise-top-y", -0.12)
      const riseHorizon = cssNumber(styles, "--flow-rise-horizon-y", 0.84)
      const riseFade = Math.max(0.02, Math.min(0.2, cssNumber(styles, "--flow-rise-fade", 0.08)))
      const moonX = cssNumber(styles, "--moon-x", 92) / 100 * width
      const moonY = cssNumber(styles, "--moon-y", 13) / 100 * height
      const moonRadius = cssNumber(styles, "--moon-size", 46) * 0.5
      const moonRepelRadius = moonRadius + Math.max(0, cssNumber(styles, "--flow-moon-repel-radius", 90))
      const moonAvoidanceStrength = Math.max(0.5, Math.min(1.8, cssNumber(styles, "--flow-moon-repel-strength", 0.92)))

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }

      if (!context) {
        return
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineCap = "round"
      context.lineJoin = "round"
      context.globalCompositeOperation = "screen"

      const flowConfig = (
        index: number,
        fallback: {
          x: number
          y: number
          radius: number
          opacity: number
          density: number
          strandLength: number
          rotate: number
          driftX: number
          driftY: number
          ringMode?: number
        },
      ) => ({
        x: cssNumber(styles, `--flow-${index}-x`, fallback.x),
        y: cssNumber(styles, `--flow-${index}-y`, fallback.y),
        radius: cssNumber(styles, `--flow-${index}-radius`, fallback.radius),
        opacity: cssNumber(styles, `--flow-${index}-opacity`, fallback.opacity),
        density: cssNumber(styles, `--flow-${index}-density`, fallback.density),
        strandLength: cssNumber(styles, `--flow-${index}-length`, fallback.strandLength),
        rotate: cssNumber(styles, `--flow-${index}-rotation-speed`, fallback.rotate),
        driftX: cssNumber(styles, `--flow-${index}-drift-x`, fallback.driftX),
        driftY: cssNumber(styles, `--flow-${index}-drift-y`, fallback.driftY),
        ringMode: cssNumber(styles, `--flow-${index}-ring-mode`, fallback.ringMode ?? 0),
        riseEnabled: cssNumber(styles, `--flow-${index}-rise-enabled`, index === 3 ? 0 : 1),
        riseDuration: Math.max(8, cssNumber(styles, `--flow-${index}-rise-duration`, 110 + index * 7)),
      })

      const spiralConfigs = [
        flowConfig(1, { x: centerX, y: centerY, radius, opacity: 1, density: 1, strandLength: length, rotate: rotationSpeed, driftX: -0.002, driftY: -0.012 }),
        flowConfig(2, { x: 0.28, y: 0.22, radius: 0.035, opacity: 0.36, density: 0.42, strandLength: length * 0.9, rotate: -0.025, driftX: 0.004, driftY: -0.008 }),
        flowConfig(3, { x: 0.58, y: 0.36, radius: 0.42, opacity: 0.24, density: 0.72, strandLength: 24, rotate: 0.012, driftX: -0.006, driftY: -0.018 }),
        flowConfig(4, { x: 0.78, y: 0.23, radius: 0.03, opacity: 0.34, density: 0.38, strandLength: length * 0.9, rotate: 0.03, driftX: -0.006, driftY: -0.01 }),
        flowConfig(5, { x: 0.44, y: 0.18, radius: 0.026, opacity: 0.28, density: 0.34, strandLength: length * 0.8, rotate: -0.02, driftX: 0.005, driftY: -0.012 }),
      ]

      const drawSpiral = (config: typeof spiralConfigs[number], configIndex: number) => {
        if (config.opacity <= 0 || config.radius <= 0 || config.density <= 0) {
          return
        }

        const configCount = Math.max(1, Math.round(count * config.density))
        let originX = width * (config.x + Math.sin(driftPhase) * config.driftX)
        let originY = height * (config.y + Math.cos(driftPhase) * config.driftY)
        let loopVisibility = 1
        if (config.riseEnabled >= 0.5) {
          const riseRange = Math.max(0.2, riseHorizon - riseTop)
          const initialPhase = Math.max(0, Math.min(1, (riseHorizon - config.y) / riseRange))
          const elapsedSeconds = Math.max(0, (time - animationStartedAt) * 0.001)
          const risePhase = (initialPhase + elapsedSeconds / config.riseDuration) % 1
          const verticalWoft = Math.sin(driftPhase + configIndex * 1.7) * Math.abs(config.driftY) * 0.08
          originY = height * (riseHorizon - riseRange * risePhase + verticalWoft)
          loopVisibility = smoothStep(0, riseFade, risePhase) * (1 - smoothStep(1 - riseFade, 1, risePhase))
        }
        const fieldRadius = Math.min(width, height) * config.radius
        const horizontalClearance = fieldRadius * 1.18 + config.strandLength * 2 + moonRepelRadius
        const verticalClearance = fieldRadius * 0.86 + config.strandLength * 1.5 + moonRepelRadius
        const verticalDistance = Math.abs(originY - moonY)
        if (verticalDistance < verticalClearance && Math.abs(originX - moonX) < horizontalClearance) {
          const leftTarget = moonX - horizontalClearance
          const rightTarget = moonX + horizontalClearance
          const fieldMargin = fieldRadius * 0.5
          const targetX = leftTarget >= fieldMargin || rightTarget > width - fieldMargin
            ? leftTarget
            : rightTarget
          const proximity = 1 - smoothStep(verticalClearance * 0.38, verticalClearance, verticalDistance)
          originX += (targetX - originX) * Math.min(1, proximity * moonAvoidanceStrength)
        }
        const shapeRotation = time * 0.001 * config.rotate

        context.globalCompositeOperation = "screen"

        for (let index = 0; index < configCount; index += 1) {
          const arm = index % spiralArms
          const ringBand = Math.floor(random() * 18) / 18
          const distanceRatio = config.ringMode >= 1
            ? innerRadius + (1 - innerRadius) * Math.min(1, ringBand + (random() - 0.5) * 0.018)
            : innerRadius + (1 - innerRadius) * (random() ** 0.72)
          const armOffset = arm * ((Math.PI * 2) / spiralArms)
          const distance = fieldRadius * distanceRatio
          const spiralTurn = distanceRatio * curl * Math.PI * 2
          const localPhase = phase + distanceRatio * Math.PI * 3 + armOffset + configIndex
          const wobble = Math.sin(localPhase * 1.3 + random() * Math.PI * 2) * spiralWobble
          const angle = armOffset + spiralTurn + shapeRotation + wobble + (random() - 0.5) * spiralWobble * 0.18
          const laneOffset = (random() - 0.5) * fieldRadius * (config.ringMode >= 1 ? 0.008 : 0.035) * (1 - distanceRatio * 0.18)
          const radialDrift = Math.sin(phase * 0.7 + armOffset + distanceRatio * Math.PI * 4) * phaseDrift * fieldRadius * 0.025
          const rawX = originX + Math.cos(angle) * (distance + radialDrift) * 1.04 + Math.cos(angle + Math.PI / 2) * laneOffset
          const rawY = originY + Math.sin(angle) * (distance + radialDrift) * 0.72 + Math.sin(angle + Math.PI / 2) * laneOffset * 0.72
          const dx = rawX - originX
          const dy = rawY - originY
          const normalizedDistance = Math.min(Math.hypot(dx, dy) / fieldRadius, 1)
          const tangent = angle + Math.PI / 2 + (config.ringMode >= 1 ? 0 : pull * 0.34)
          const inward = Math.atan2(originY - rawY, originX - rawX)
          const flowAngle = config.ringMode >= 1
            ? tangent + Math.sin(localPhase * 1.8) * spiralWobble * 0.08
            : tangent + inward * pull * 0.18 + Math.sin(localPhase * 1.8) * swirlStrength * 0.22
          const strandLength = config.strandLength * (0.35 + random() * 1.4) * (1 - normalizedDistance * 0.45)
          const laneAlpha = alpha * config.opacity * loopVisibility * (1 - normalizedDistance * 0.65) * (0.25 + random() * 0.95)
          const rawX2 = rawX + Math.cos(flowAngle) * strandLength
          const rawY2 = rawY + Math.sin(flowAngle) * strandLength
          const curveBend = Math.sin(localPhase * 1.5) * spiralWobble * 0.3
          const rawControlX = rawX + Math.cos(flowAngle + curveBend) * strandLength * 0.45
          const rawControlY = rawY + Math.sin(flowAngle + curveBend) * strandLength * 0.45
          context.strokeStyle = random() > 0.18
            ? `rgba(190, 218, 255, ${Math.min(laneAlpha, 1)})`
            : `rgba(170, 145, 255, ${Math.min(laneAlpha * 0.9, 1)})`
          context.lineWidth = widthControl * (0.5 + random() * 1.8)
          context.beginPath()
          context.moveTo(rawX, rawY)
          context.quadraticCurveTo(rawControlX, rawControlY, rawX2, rawY2)
          context.stroke()
        }

        context.globalCompositeOperation = "destination-out"

        for (let index = 0; index < configCount * 0.18; index += 1) {
          const arm = index % spiralArms
          const distanceRatio = innerRadius + (1 - innerRadius) * (random() ** 0.68)
          const armOffset = arm * ((Math.PI * 2) / spiralArms)
          const distance = fieldRadius * distanceRatio
          const localPhase = phase * 0.85 + armOffset + distanceRatio * Math.PI * 4 + configIndex
          const angle = armOffset + distanceRatio * curl * Math.PI * 2 + shapeRotation + Math.cos(localPhase) * spiralWobble
          const laneOffset = (random() - 0.5) * fieldRadius * 0.035
          const rawX = originX + Math.cos(angle) * distance * 1.04 + Math.cos(angle + Math.PI / 2) * laneOffset
          const rawY = originY + Math.sin(angle) * distance * 0.72 + Math.sin(angle + Math.PI / 2) * laneOffset * 0.72
          const tangent = angle + Math.PI / 2 + pull * 0.28
          const strandLength = config.strandLength * (0.45 + random() * 1.9)
          const controlX = rawX + Math.cos(tangent) * strandLength * 0.4
          const controlY = rawY + Math.sin(tangent) * strandLength * 0.4
          const endX = rawX + Math.cos(tangent) * strandLength
          const endY = rawY + Math.sin(tangent) * strandLength
          context.strokeStyle = `rgba(0, 0, 0, ${darkAlpha * config.opacity * loopVisibility * (0.4 + random())})`
          context.lineWidth = widthControl * (1.4 + random() * 2.6)
          context.beginPath()
          context.moveTo(rawX, rawY)
          context.quadraticCurveTo(controlX, controlY, endX, endY)
          context.stroke()
        }
      }

      spiralConfigs.forEach(drawSpiral)

    }

    let frameId = 0
    let lastDraw = 0
    let previousSignature = ""

    const render = (time: number) => {
      const styles = getComputedStyle(frame)
      const fps = Math.max(1, cssNumber(styles, "--flow-redraw-fps", 18))
      const signature = controlSignature()
      const shouldRedraw = signature !== previousSignature || time - lastDraw >= 1000 / fps

      if (shouldRedraw) {
        previousSignature = signature
        lastDraw = time
        drawFlowField(time)
      }

      frameId = requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(() => {
      previousSignature = ""
      drawFlowField(performance.now())
    })

    resizeObserver.observe(frame)
    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-star-flow-field" />
}

export function VanGoghFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = canvas?.closest(".hero-frame")

    if (!canvas || !(frame instanceof HTMLElement)) {
      return
    }

    const controlNames = [
      "--vangogh-flow-seed",
      "--vangogh-flow-count",
      "--vangogh-flow-x",
      "--vangogh-flow-y",
      "--vangogh-flow-width",
      "--vangogh-flow-height",
      "--vangogh-flow-opacity",
      "--vangogh-flow-line-length",
      "--vangogh-flow-line-width",
      "--vangogh-flow-spacing",
      "--vangogh-flow-wave-height",
      "--vangogh-flow-wave-length",
      "--vangogh-flow-speed",
      "--vangogh-flow-drift-x",
      "--vangogh-flow-drift-y",
      "--vangogh-flow-drift-duration",
      "--vangogh-flow-rotation",
      "--vangogh-flow-blur",
    ]

    const signature = () => {
      const styles = getComputedStyle(frame)
      return controlNames.map((name) => styles.getPropertyValue(name).trim()).join("|")
    }

    const draw = (time = 0) => {
      const rect = frame.getBoundingClientRect()
      const styles = getComputedStyle(frame)
      const seed = cssNumber(styles, "--vangogh-flow-seed", 411)
      const count = cssNumber(styles, "--vangogh-flow-count", 900)
      const centerX = cssNumber(styles, "--vangogh-flow-x", 0.52)
      const centerY = cssNumber(styles, "--vangogh-flow-y", 0.34)
      const areaWidth = cssNumber(styles, "--vangogh-flow-width", 0.68)
      const areaHeight = cssNumber(styles, "--vangogh-flow-height", 0.36)
      const opacity = cssNumber(styles, "--vangogh-flow-opacity", 0.22)
      const lineLength = cssNumber(styles, "--vangogh-flow-line-length", 34)
      const lineWidth = cssNumber(styles, "--vangogh-flow-line-width", 0.55)
      const spacing = cssNumber(styles, "--vangogh-flow-spacing", 0.048)
      const waveHeight = cssNumber(styles, "--vangogh-flow-wave-height", 0.14)
      const waveLength = cssNumber(styles, "--vangogh-flow-wave-length", 0.34)
      const speed = cssNumber(styles, "--vangogh-flow-speed", 0.11)
      const driftX = cssNumber(styles, "--vangogh-flow-drift-x", -0.01)
      const driftY = cssNumber(styles, "--vangogh-flow-drift-y", -0.018)
      const driftDuration = Math.max(1, cssNumber(styles, "--vangogh-flow-drift-duration", 38))
      const rotation = cssNumber(styles, "--vangogh-flow-rotation", -8) * (Math.PI / 180)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.ceil(rect.width)
      const height = Math.ceil(rect.height)
      const context = canvas.getContext("2d")
      const canvasWidth = width * dpr
      const canvasHeight = height * dpr
      const random = mulberry32(seed)
      const phase = time * 0.001 * speed
      const driftPhase = (time * 0.001 / driftDuration) * Math.PI * 2

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }

      if (!context) {
        return
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = "screen"
      context.lineCap = "round"
      context.lineJoin = "round"

      const originX = width * (centerX + Math.sin(driftPhase) * driftX)
      const originY = height * (centerY + Math.cos(driftPhase) * driftY)
      const regionWidth = width * areaWidth
      const regionHeight = height * areaHeight
      const laneCount = Math.max(4, Math.round(1 / spacing))
      const cos = Math.cos(rotation)
      const sin = Math.sin(rotation)

      const toWorld = (x: number, y: number) => ({
        x: originX + x * cos - y * sin,
        y: originY + x * sin + y * cos,
      })

      for (let index = 0; index < count; index += 1) {
        const lane = index % laneCount
        const laneT = laneCount === 1 ? 0.5 : lane / (laneCount - 1)
        const progress = (Math.floor(index / laneCount) / Math.ceil(count / laneCount) + random() * 0.035 + phase) % 1
        const localX = (progress - 0.5) * regionWidth
        const baseY = (laneT - 0.5) * regionHeight
        const wave = Math.sin((progress / waveLength + laneT * 1.8 + phase) * Math.PI * 2)
        const localY = baseY + wave * regionHeight * waveHeight
        const slope = Math.cos((progress / waveLength + laneT * 1.8 + phase) * Math.PI * 2)
        const tangent = Math.atan2(slope * regionHeight * waveHeight, regionWidth * waveLength * 0.6)
        const segmentLength = lineLength * (0.55 + random() * 0.8)
        const bend = Math.sin(progress * Math.PI * 2 + laneT * 4 + phase) * 0.28
        const start = toWorld(
          localX - Math.cos(tangent) * segmentLength * 0.5,
          localY - Math.sin(tangent) * segmentLength * 0.5,
        )
        const end = toWorld(
          localX + Math.cos(tangent) * segmentLength * 0.5,
          localY + Math.sin(tangent) * segmentLength * 0.5,
        )
        const control = toWorld(
          localX + Math.cos(tangent + bend) * segmentLength * 0.18,
          localY + Math.sin(tangent + bend) * segmentLength * 0.18,
        )
        const laneAlpha = opacity * (0.35 + random() * 0.65)

        context.strokeStyle = random() > 0.22
          ? `rgba(180, 218, 255, ${Math.min(laneAlpha, 1)})`
          : `rgba(126, 176, 255, ${Math.min(laneAlpha * 0.9, 1)})`
        context.lineWidth = lineWidth * (0.55 + random() * 1.25)
        context.beginPath()
        context.moveTo(start.x, start.y)
        context.quadraticCurveTo(control.x, control.y, end.x, end.y)
        context.stroke()
      }
    }

    let frameId = 0
    let lastDraw = 0
    let previousSignature = ""

    const render = (time: number) => {
      const styles = getComputedStyle(frame)
      const fps = Math.max(1, cssNumber(styles, "--flow-redraw-fps", 18))
      const nextSignature = signature()

      if (nextSignature !== previousSignature || time - lastDraw >= 1000 / fps) {
        previousSignature = nextSignature
        lastDraw = time
        draw(time)
      }

      frameId = requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(() => {
      previousSignature = ""
      draw(performance.now())
    })

    resizeObserver.observe(frame)
    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-vangogh-flow" />
}
