/**
 * VectorscopeRenderer
 *
 * Canvas-based vectorscope Lissajous display showing L/R correlation.
 * Displays mono signal as vertical line per CONTEXT.md (perfect L/R correlation).
 * Static mock data per CONTEXT.md - frozen snapshot, not animated.
 *
 * Difference from Goniometer:
 * - Vectorscope: Standard X/Y (L on X axis, R on Y axis)
 * - Goniometer: Rotated 45° (M/S mode with diagonal L/R)
 */

import React, { useLayoutEffect, useMemo } from 'react'
import { VectorscopeElementConfig } from '../../../../../types/elements/visualizations'
import { generateMonoSignal } from '../../../../../utils/mockAudioData'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'

interface VectorscopeRendererProps {
  config: VectorscopeElementConfig
}

export function VectorscopeRenderer({ config }: VectorscopeRendererProps) {
  const { canvasRef, ctx } = useCanvasSetup(
    config.width,
    config.height,
    config.canvasScale
  )

  // Generate mono signal (static snapshot per CONTEXT.md)
  const monoSignal = useMemo(() => generateMonoSignal(), [])

  // Draw once on mount or config change
  useLayoutEffect(() => {
    if (!ctx) return

    const centerX = config.width / 2
    const centerY = config.height / 2
    const radius = Math.min(config.width, config.height) * 0.4

    // Clear canvas with background
    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, config.width, config.height)

    // Draw circular grid rings if enabled
    if (config.showGrid) {
      ctx.strokeStyle = config.gridColor
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.3

      // Draw concentric circles (reference circle at unity)
      for (let r = radius * 0.25; r <= radius; r += radius * 0.25) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.globalAlpha = 1.0
    }

    // Draw axis lines if enabled (L on X, R on Y)
    if (config.showAxisLines) {
      ctx.strokeStyle = config.gridColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.5

      // Vertical center line (R axis - right channel)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - radius)
      ctx.lineTo(centerX, centerY + radius)
      ctx.stroke()

      // Horizontal center line (L axis - left channel)
      ctx.beginPath()
      ctx.moveTo(centerX - radius, centerY)
      ctx.lineTo(centerX + radius, centerY)
      ctx.stroke()

      // Add L/R labels (standard X/Y axes)
      ctx.fillStyle = config.gridColor
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'

      // L on left (X axis)
      ctx.fillText('L', centerX - radius - 12, centerY + 4)

      // R on top (Y axis)
      ctx.fillText('R', centerX, centerY - radius - 5)

      ctx.globalAlpha = 1.0
    }

    // Draw mono signal (vertical line for centered mono per CONTEXT.md)
    // For mono signal: L = R, so x=0 (centered), y varies with amplitude
    ctx.strokeStyle = config.traceColor
    ctx.lineWidth = 2
    ctx.beginPath()

    monoSignal.forEach((point, i) => {
      // Scale to canvas coordinates
      // x: Left channel (mono signal centered at x=0)
      // y: Right channel (same as left for mono = vertical line)
      const x = centerX + point.x * radius
      const y = centerY - point.y * radius // Invert Y for screen coords

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }, [
    ctx,
    config.width,
    config.height,
    config.backgroundColor,
    config.gridColor,
    config.traceColor,
    config.showGrid,
    config.showAxisLines,
    monoSignal,
  ])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: config.width,
        height: config.height,
      }}
    />
  )
}
