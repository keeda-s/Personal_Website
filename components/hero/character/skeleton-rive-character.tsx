"use client"

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas"
import { useEffect, useRef, useState } from "react"

type SkeletonAimDetail = {
  armAngle?: number
  eyeAngle?: number
  returnHome?: boolean
}

function cssControl(element: HTMLElement, name: string, fallback: number) {
  const value = Number.parseFloat(getComputedStyle(element).getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

const TAU = Math.PI * 2
const ARTBOARD_WIDTH = 1440
const ARTBOARD_HEIGHT = 1024

function nearestEquivalentAngle(angle: number, reference: number, period: number) {
  return angle + Math.round((reference - angle) / period) * period
}

export function SkeletonRiveCharacter() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const { rive, RiveComponent } = useRive({
    src: "/hero-layers/animation/skeleton_website.riv",
    artboard: "Desktop - 1",
    stateMachines: "State Machine 1",
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
  })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!rive || !wrapper) return

    let instance = rive.viewModelInstance
    if (!instance) {
      const controls = rive.viewModelByName("Controls")
      instance = controls?.defaultInstance() ?? controls?.instanceByName("Default") ?? null
      if (instance) rive.bindViewModelInstance(instance)
    }

    const armAngle = instance?.number("armAngle")
    const forearmAngle = instance?.number("forearmAngle")
    const eyeAngle = instance?.number("eyeAngle")
    const eyeLX = instance?.number("eyeLX")
    const eyeLY = instance?.number("eyeLY")
    const eyeRX = instance?.number("eyeRX")
    const eyeRY = instance?.number("eyeRY")

    if (!armAngle || !forearmAngle || !eyeLX || !eyeLY || !eyeRX || !eyeRY) {
      console.warn("The skeleton Rive Controls instance is missing one or more number bindings.")
      return
    }

    const armRest = cssControl(wrapper, "--skeleton-arm-rest", armAngle.value)
    const forearmRest = cssControl(wrapper, "--skeleton-forearm-rest", forearmAngle.value)
    const forearmPoint = cssControl(wrapper, "--skeleton-forearm-point", 0)
    const armAngleOffset = cssControl(wrapper, "--skeleton-arm-angle-offset", 90)
    const armAnchorX = cssControl(wrapper, "--skeleton-arm-anchor-x", 50) / 100
    const armAnchorY = cssControl(wrapper, "--skeleton-arm-anchor-y", 34) / 100
    const eyeAnchorX = cssControl(wrapper, "--skeleton-eye-anchor-x", 50) / 100
    const eyeAnchorY = cssControl(wrapper, "--skeleton-eye-anchor-y", 30) / 100
    const eyeLeftCenterX = cssControl(wrapper, "--skeleton-eye-left-x", eyeLX.value)
    const eyeLeftCenterY = cssControl(wrapper, "--skeleton-eye-left-y", eyeLY.value)
    const eyeRightCenterX = cssControl(wrapper, "--skeleton-eye-right-x", eyeRX.value)
    const eyeRightCenterY = cssControl(wrapper, "--skeleton-eye-right-y", eyeRY.value)
    const eyeRadius = cssControl(wrapper, "--skeleton-eye-radius", 4)
    const armFollow = cssControl(wrapper, "--skeleton-arm-follow", 0.12)
    const eyeFollow = cssControl(wrapper, "--skeleton-eye-follow", 0.18)
    const idleSway = cssControl(wrapper, "--skeleton-idle-sway", 0.03)
    const returnDelay = cssControl(wrapper, "--skeleton-return-delay", 700)
    const interestRadius = cssControl(wrapper, "--skeleton-interest-radius", 150)
    const interestReleaseDelay = cssControl(wrapper, "--skeleton-interest-release-delay", 420)
    const glanceInterval = cssControl(wrapper, "--skeleton-glance-interval", 4200)
    const glanceDuration = cssControl(wrapper, "--skeleton-glance-duration", 520)
    let armAim = armRest
    let armCurrent = armRest
    let forearmAim = forearmRest
    let forearmCurrent = forearmRest
    let eyeAngleAim = 0
    let eyeAngleCurrent = 0
    let eyeOffsetXAim = 0
    let eyeOffsetYAim = 0
    let eyeOffsetXCurrent = 0
    let eyeOffsetYCurrent = 0
    let eyeReachAim = 0
    let eyeReachCurrent = 0
    let returnTimer = 0
    let glanceTimer = 0
    let glanceIntervalTimer = 0
    let frameId = 0
    let activeInterest: HTMLElement | null = null

    const setEyes = (offsetX: number, offsetY: number, angle: number) => {
      eyeLX.value = eyeLeftCenterX + offsetX
      eyeLY.value = eyeLeftCenterY + offsetY
      eyeRX.value = eyeRightCenterX + offsetX
      eyeRY.value = eyeRightCenterY + offsetY
      if (eyeAngle) eyeAngle.value = angle
    }

    // Apply the authored rest pose before revealing the canvas.
    armAngle.value = armRest
    forearmAngle.value = forearmRest
    setEyes(0, 0, 0)
    setIsReady(true)

    const scheduleReturnHome = (delay = returnDelay) => {
      window.clearTimeout(returnTimer)
      returnTimer = window.setTimeout(() => {
        armAim = nearestEquivalentAngle(armRest, armCurrent, 360)
        forearmAim = forearmRest
        eyeAngleAim = nearestEquivalentAngle(0, eyeAngleCurrent, TAU)
        eyeOffsetXAim = 0
        eyeOffsetYAim = 0
        eyeReachAim = 0
      }, delay)
    }

    const artboardPoint = (bounds: DOMRect, x: number, y: number) => {
      const scale = Math.min(bounds.width / ARTBOARD_WIDTH, bounds.height / ARTBOARD_HEIGHT)
      const renderedWidth = ARTBOARD_WIDTH * scale
      const renderedHeight = ARTBOARD_HEIGHT * scale

      return {
        x: bounds.left + (bounds.width - renderedWidth) / 2 + renderedWidth * x,
        y: bounds.top + (bounds.height - renderedHeight) / 2 + renderedHeight * y,
      }
    }

    const aimEyesToward = (clientX: number, clientY: number) => {
      const bounds = wrapper.getBoundingClientRect()
      const eyes = artboardPoint(bounds, eyeAnchorX, eyeAnchorY)
      const eyeDeltaX = clientX - eyes.x
      const eyeDeltaY = clientY - eyes.y
      const eyeDistance = Math.hypot(eyeDeltaX, eyeDeltaY) || 1
      eyeOffsetXAim = (eyeDeltaX / eyeDistance) * eyeRadius
      eyeOffsetYAim = (eyeDeltaY / eyeDistance) * eyeRadius
      eyeAngleAim = nearestEquivalentAngle(Math.atan2(-eyeDeltaY, eyeDeltaX), eyeAngleAim, TAU)
      eyeReachAim = 1
    }

    const aimToward = (clientX: number, clientY: number) => {
      const bounds = wrapper.getBoundingClientRect()
      const shoulder = artboardPoint(bounds, armAnchorX, armAnchorY)
      const rawArmTarget = Math.atan2(clientY - shoulder.y, clientX - shoulder.x) * (180 / Math.PI) + armAngleOffset
      armAim = nearestEquivalentAngle(rawArmTarget, armAim, 360)
      forearmAim = forearmPoint
      aimEyesToward(clientX, clientY)
    }

    const targetCenter = (target: HTMLElement) => {
      const bounds = target.getBoundingClientRect()
      return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
    }

    const closestInterest = (clientX: number, clientY: number) => {
      let closest: HTMLElement | null = null
      let closestDistance = Number.POSITIVE_INFINITY

      for (const target of document.querySelectorAll<HTMLElement>("[data-skeleton-interest]")) {
        const styles = getComputedStyle(target)
        const bounds = target.getBoundingClientRect()
        if (
          styles.display === "none" ||
          styles.visibility === "hidden" ||
          Number.parseFloat(styles.opacity) === 0 ||
          bounds.width === 0 ||
          bounds.height === 0
        ) continue

        const distanceX = Math.max(bounds.left - clientX, 0, clientX - bounds.right)
        const distanceY = Math.max(bounds.top - clientY, 0, clientY - bounds.bottom)
        const distance = Math.hypot(distanceX, distanceY)
        const radius = target === activeInterest ? interestRadius * 1.18 : interestRadius

        if (distance <= radius && distance < closestDistance) {
          closest = target
          closestDistance = distance
        }
      }

      return closest
    }

    const onPointerMove = (event: PointerEvent) => {
      const interest = closestInterest(event.clientX, event.clientY)

      if (interest) {
        window.clearTimeout(returnTimer)
        window.clearTimeout(glanceTimer)
        activeInterest = interest
        const target = targetCenter(interest)
        aimToward(target.x, target.y)
        return
      }

      if (activeInterest) {
        activeInterest = null
        window.clearTimeout(glanceTimer)
        scheduleReturnHome(interestReleaseDelay)
      }
    }

    const onAim = (event: Event) => {
      const detail = (event as CustomEvent<SkeletonAimDetail>).detail ?? {}
      if (detail.armAngle !== undefined) armAim = nearestEquivalentAngle(detail.armAngle, armAim, 360)
      if (detail.armAngle !== undefined) forearmAim = forearmPoint
      if (detail.eyeAngle !== undefined) {
        eyeAngleAim = nearestEquivalentAngle(detail.eyeAngle, eyeAngleAim, TAU)
        eyeOffsetXAim = Math.cos(detail.eyeAngle) * eyeRadius
        eyeOffsetYAim = -Math.sin(detail.eyeAngle) * eyeRadius
        eyeReachAim = 1
      }
      if (detail.returnHome !== false) scheduleReturnHome()
    }

    glanceIntervalTimer = window.setInterval(() => {
      if (!activeInterest) return

      eyeOffsetXAim = 0
      eyeOffsetYAim = 0
      eyeReachAim = 0
      eyeAngleAim = nearestEquivalentAngle(0, eyeAngleCurrent, TAU)
      window.clearTimeout(glanceTimer)
      glanceTimer = window.setTimeout(() => {
        if (!activeInterest) return
        const target = targetCenter(activeInterest)
        aimEyesToward(target.x, target.y)
      }, glanceDuration)
    }, glanceInterval)

    const frame = (time: number) => {
      armCurrent += (armAim - armCurrent) * armFollow
      forearmCurrent += (forearmAim - forearmCurrent) * armFollow
      eyeAngleCurrent += (eyeAngleAim - eyeAngleCurrent) * eyeFollow
      eyeOffsetXCurrent += (eyeOffsetXAim - eyeOffsetXCurrent) * eyeFollow
      eyeOffsetYCurrent += (eyeOffsetYAim - eyeOffsetYCurrent) * eyeFollow
      eyeReachCurrent += (eyeReachAim - eyeReachCurrent) * eyeFollow
      const sway = idleSway * Math.sin(time * 0.002)
      armAngle.value = armCurrent + sway
      forearmAngle.value = forearmCurrent - sway * 0.35
      setEyes(
        eyeOffsetXCurrent * eyeReachCurrent,
        eyeOffsetYCurrent * eyeReachCurrent,
        eyeAngleCurrent,
      )
      frameId = window.requestAnimationFrame(frame)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("skeleton:aim", onAim)
    frameId = window.requestAnimationFrame(frame)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(returnTimer)
      window.clearTimeout(glanceTimer)
      window.clearInterval(glanceIntervalTimer)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("skeleton:aim", onAim)
    }
  }, [rive])

  return (
    <div
      ref={wrapperRef}
      className={`hero-rive-character${isReady ? " is-ready" : ""}`}
      aria-hidden="true"
    >
      <RiveComponent className="hero-rive-canvas" />
    </div>
  )
}
