/**
 * Curve rendering utilities
 * Canvas drawing functions for smooth curves, handles, and grids
 */

import { frequencyToX, dbToY } from './audioMath'

// ============================================================================
// Curve Drawing
// ============================================================================

/**
 * Draw smooth Bezier curve through points
 * Uses quadratic Bezier curves for smooth interpolation
 */
export function drawSmoothCurve(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  strokeStyle: string,
  lineWidth: number,
  fill?: boolean,
  fillStyle?: string,
  height?: number // Required for fill to bottom
): void {
  if (points.length < 2) return

  const firstPoint = points[0]
  if (!firstPoint) return

  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth

  ctx.beginPath()
  ctx.moveTo(firstPoint.x, firstPoint.y)

  if (points.length === 2) {
    // Simple line for 2 points
    const secondPoint = points[1]
    if (secondPoint) {
      ctx.lineTo(secondPoint.x, secondPoint.y)
    }
  } else {
    // Smooth curve through multiple points using quadratic Bezier
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      if (!current || !next) continue

      // Control point at midpoint for smooth transition
      const controlX = (current.x + next.x) / 2
      const controlY = (current.y + next.y) / 2

      ctx.quadraticCurveTo(current.x, current.y, controlX, controlY)
    }

    // Final segment to last point
    const last = points[points.length - 1]
    if (last) {
      ctx.lineTo(last.x, last.y)
    }
  }

  // Fill under curve if requested
  if (fill && fillStyle && height !== undefined) {
    // Close path to bottom
    const lastPoint = points[points.length - 1]
    if (lastPoint && firstPoint) {
      ctx.lineTo(lastPoint.x, height)
      ctx.lineTo(firstPoint.x, height)
      ctx.closePath()
      ctx.fillStyle = fillStyle
      ctx.fill()
    }
  }

  ctx.stroke()
}

// ============================================================================
// Handle Drawing
// ============================================================================

/**
 * Draw square handle (8px base, 10px hover per CONTEXT.md)
 */
export function drawHandle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isHovered: boolean,
  normalColor: string,
  hoverColor: string
): void {
  const size = isHovered ? 10 : 8
  const halfSize = size / 2

  ctx.fillStyle = isHovered ? hoverColor : normalColor
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1

  // Square handle
  ctx.fillRect(x - halfSize, y - halfSize, size, size)
  ctx.strokeRect(x - halfSize, y - halfSize, size, size)
}

/**
 * Point-in-handle hit detection
 * Returns true if point is inside handle bounds
 */
export function isPointInHandle(
  mouseX: number,
  mouseY: number,
  handleX: number,
  handleY: number,
  isHovered: boolean = false
): boolean {
  const size = isHovered ? 10 : 8
  const halfSize = size / 2

  // Point-in-rectangle test
  return (
    mouseX >= handleX - halfSize &&
    mouseX <= handleX + halfSize &&
    mouseY >= handleY - halfSize &&
    mouseY <= handleY + halfSize
  )
}

// ============================================================================
// Grid Drawing
// ============================================================================

/**
 * Draw frequency grid with logarithmic scale
 * Standard audio industry grid for EQ and filter displays
 */
export function drawFrequencyGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridColor: string,
  showFrequencyLabels: boolean,
  showDbLabels: boolean,
  minFreq: number,
  maxFreq: number,
  minDb: number,
  maxDb: number
): void {
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.3

  // Vertical grid lines (frequency divisions at standard points)
  const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
  for (const freq of frequencies) {
    if (freq < minFreq || freq > maxFreq) continue

    const x = frequencyToX(freq, width, minFreq, maxFreq)

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()

    if (showFrequencyLabels) {
      ctx.globalAlpha = 1.0
      ctx.fillStyle = gridColor
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`
      ctx.fillText(label, x, height - 5)
      ctx.globalAlpha = 0.3
    }
  }

  // Horizontal grid lines (dB levels)
  const dbStep = Math.abs(maxDb - minDb) >= 48 ? 12 : 6 // Adaptive step
  const dbLevels: number[] = []
  for (let db = Math.ceil(minDb / dbStep) * dbStep; db <= maxDb; db += dbStep) {
    dbLevels.push(db)
  }

  for (const db of dbLevels) {
    if (db < minDb || db > maxDb) continue

    const y = dbToY(db, height, minDb, maxDb)

    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()

    if (showDbLabels) {
      ctx.globalAlpha = 1.0
      ctx.fillStyle = gridColor
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, width - 5, y + 3)
      ctx.globalAlpha = 0.3
    }
  }

  ctx.globalAlpha = 1.0
}

/**
 * Draw linear grid (for envelope/compressor/LFO)
 * Simple rectangular grid with equal divisions
 */
export function drawLinearGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridColor: string,
  divisions: number = 4
): void {
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.3

  // Vertical lines
  for (let i = 1; i < divisions; i++) {
    const x = (i / divisions) * width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let i = 1; i < divisions; i++) {
    const y = (i / divisions) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.globalAlpha = 1.0
}

// ============================================================================
// Mock Data Generators
// ============================================================================

/**
 * Generate mock EQ bands for static preview
 * Distributes bands logarithmically across frequency spectrum
 */
export function generateMockEQBands(
  bandCount: number
): { frequency: number; gain: number; Q: number }[] {
  const bands: { frequency: number; gain: number; Q: number }[] = []

  // Distribute bands logarithmically from 100Hz to 8kHz
  const minLog = Math.log10(100)
  const maxLog = Math.log10(8000)

  for (let i = 0; i < bandCount; i++) {
    const t = bandCount === 1 ? 0.5 : i / (bandCount - 1) // Center single band
    const freqLog = minLog + t * (maxLog - minLog)
    const frequency = Math.pow(10, freqLog)

    // Random gain variation (-6 to +6 dB)
    const gain = (Math.random() - 0.5) * 12

    // Q varies from 0.5 (wide) to 4.0 (narrow)
    const Q = 0.5 + Math.random() * 3.5

    bands.push({ frequency, gain, Q })
  }

  return bands
}

/**
 * Generate mock ADSR values for static preview
 */
export function generateMockADSR(): {
  attack: number
  decay: number
  sustain: number
  release: number
} {
  return {
    attack: 0.1, // 10% of total time
    decay: 0.15, // 15%
    sustain: 0.7, // 70% level
    release: 0.2, // 20% of total time
  }
}

/**
 * Generate mock compressor settings for static preview
 */
export function generateMockCompressor(): {
  threshold: number
  ratio: number
  knee: number
} {
  return {
    threshold: -18, // dB
    ratio: 4.0, // 4:1
    knee: 6, // dB (soft knee)
  }
}
