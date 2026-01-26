/**
 * LFO Display Renderer
 *
 * Canvas-based LFO waveform visualization with 8 shape types.
 * Displays frozen snapshot per CONTEXT.md (no animation).
 */

import React, { useLayoutEffect } from 'react'
import type { LFODisplayElementConfig } from '../../../../../types/elements/curves'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'
import { drawLinearGrid } from '../../../../../utils/curveRendering'

interface LFODisplayRendererProps {
  config: LFODisplayElementConfig
}

export function LFODisplayRenderer({ config }: LFODisplayRendererProps) {
  const {
    width,
    height,
    shape,
    pulseWidth,
    showGrid,
    gridColor,
    waveformColor,
    lineWidth,
    showFill,
    fillColor,
    backgroundColor,
    canvasScale,
  } = config

  // Setup Canvas with HiDPI scaling
  const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)

  // Draw LFO waveform (static, not animated)
  useLayoutEffect(() => {
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      drawLinearGrid(ctx, width, height, gridColor, 4)

      // Draw center line (zero reference)
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
      ctx.globalAlpha = 1.0
    }

    // Generate waveform points
    const sampleCount = 200
    const centerY = height / 2
    const amplitude = height * 0.4
    const points: { x: number; y: number }[] = []

    for (let i = 0; i <= sampleCount; i++) {
      const t = i / sampleCount // 0 to 1 (one cycle)
      const x = t * width
      let value = 0 // -1 to 1

      switch (shape) {
        case 'sine':
          value = Math.sin(t * Math.PI * 2)
          break
        case 'triangle':
          value = t < 0.5 ? -1 + 4 * t : 3 - 4 * t
          break
        case 'saw-up':
          value = -1 + 2 * t
          break
        case 'saw-down':
          value = 1 - 2 * t
          break
        case 'square':
          value = t < 0.5 ? 1 : -1
          break
        case 'pulse':
          value = t < pulseWidth ? 1 : -1
          break
        case 'sample-hold': {
          // Random value that holds for 10% of cycle
          // Use deterministic random based on segment index
          const segment = Math.floor(t * 10)
          value = ((segment * 7 + 3) % 11) / 5 - 1 // Deterministic pseudo-random
          break
        }
        case 'smooth-random':
          // Smooth interpolation between random values
          const freq = 3
          value = Math.sin(t * Math.PI * 2 * freq + 0.5)
          break
      }

      const y = centerY - value * amplitude
      points.push({ x, y })
    }

    // Fill under waveform if enabled
    if (showFill) {
      ctx.fillStyle = fillColor
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      for (const point of points) {
        ctx.lineTo(point.x, point.y)
      }
      ctx.lineTo(width, centerY)
      ctx.closePath()
      ctx.fill()
    }

    // Draw waveform
    ctx.strokeStyle = waveformColor
    ctx.lineWidth = lineWidth

    if (shape === 'square' || shape === 'pulse' || shape === 'sample-hold') {
      // Hard edges for square waves
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        // Draw horizontal then vertical for square wave appearance
        ctx.lineTo(points[i].x, points[i - 1].y)
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()
    } else {
      // Smooth curves for sine, triangle, saw, smooth-random
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()
    }
  }, [
    ctx,
    width,
    height,
    shape,
    pulseWidth,
    showGrid,
    gridColor,
    waveformColor,
    lineWidth,
    showFill,
    fillColor,
    backgroundColor,
  ])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  )
}
