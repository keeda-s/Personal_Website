export function mulberry32(seed: number) {
  return () => {
    seed += 0x6d2b79f5
    let value = seed
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function cssNumber(styles: CSSStyleDeclaration, name: string, fallback: number) {
  const value = Number.parseFloat(styles.getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

export function smoothStep(edge0: number, edge1: number, value: number) {
  const ratio = Math.max(0, Math.min(1, (value - edge0) / Math.max(0.0001, edge1 - edge0)))
  return ratio * ratio * (3 - 2 * ratio)
}

export function watchCanvasControls(frame: HTMLElement, draw: () => void, controlNames: string[]) {
  let frameId = 0
  let drawScheduled = false
  let previousSignature = ""

  const scheduleDraw = () => {
    if (drawScheduled) return
    drawScheduled = true
    frameId = window.requestAnimationFrame(() => {
      drawScheduled = false
      draw()
    })
  }

  const currentSignature = () => {
    const styles = getComputedStyle(frame)
    const rect = frame.getBoundingClientRect()
    return [
      Math.ceil(rect.width),
      Math.ceil(rect.height),
      ...controlNames.map((name) => styles.getPropertyValue(name).trim()),
    ].join("|")
  }

  previousSignature = currentSignature()
  scheduleDraw()

  const resizeObserver = new ResizeObserver(() => {
    const nextSignature = currentSignature()
    if (nextSignature === previousSignature) return
    previousSignature = nextSignature
    scheduleDraw()
  })
  resizeObserver.observe(frame)

  const interval = window.setInterval(() => {
    const nextSignature = currentSignature()

    if (nextSignature !== previousSignature) {
      previousSignature = nextSignature
      scheduleDraw()
    }
  }, 350)

  return () => {
    window.cancelAnimationFrame(frameId)
    window.clearInterval(interval)
    resizeObserver.disconnect()
  }
}
