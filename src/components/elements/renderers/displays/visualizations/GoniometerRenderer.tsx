/**
 * GoniometerRenderer
 *
 * Canvas-based goniometer L/R phase display with circular visualization.
 * Displays mono signal as vertical line per CONTEXT.md (perfect L/R correlation).
 * Static mock data per CONTEXT.md - frozen snapshot, not animated.
 */

import { useLayoutEffect, useMemo } from 'react'
import { GoniometerElementConfig } from '../../../../../types/elements/visualizations'
import { generateMonoSignal } from '../../../../../utils/mockAudioData'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'

interface GoniometerRendererProps {
  config: GoniometerElementConfig
}

export function GoniometerRenderer({ config }: GoniometerRendererProps) {
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

      // Draw concentric circles
      for (let r = radius * 0.25; r <= radius; r += radius * 0.25) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.globalAlpha = 1.0
    }

    // Draw axis lines if enabled (L/R and M/S reference)
    if (config.showAxisLines) {
      ctx.strokeStyle = config.gridColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.5

      // Vertical center line (M axis - mono/sum)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - radius)
      ctx.lineTo(centerX, centerY + radius)
      ctx.stroke()

      // Horizontal center line (S axis - side/difference)
      ctx.beginPath()
      ctx.moveTo(centerX - radius, centerY)
      ctx.lineTo(centerX + radius, centerY)
      ctx.stroke()

      // Diagonal lines (L/R at 45°)
      const diag = radius * 0.707 // cos(45°) = sin(45°) ≈ 0.707

      // Left channel (upper-left to lower-right)
      ctx.beginPath()
      ctx.moveTo(centerX - diag, centerY - diag)
      ctx.lineTo(centerX + diag, centerY + diag)
      ctx.stroke()

      // Right channel (upper-right to lower-left)
      ctx.beginPath()
      ctx.moveTo(centerX + diag, centerY - diag)
      ctx.lineTo(centerX - diag, centerY + diag)
      ctx.stroke()

      // Add L/R labels along diagonal axes
      ctx.fillStyle = config.gridColor
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('L', centerX - diag - 12, centerY - diag - 5)
      ctx.fillText('R', centerX + diag + 12, centerY - diag - 5)

      ctx.globalAlpha = 1.0
    }

    // Draw mono signal (vertical line for centered mono per CONTEXT.md)
    ctx.strokeStyle = config.traceColor
    ctx.lineWidth = 2
    ctx.beginPath()

    monoSignal.forEach((point, i) => {
      // Scale to canvas coordinates
      // x: Left-Right (mono signal is centered at x=0, so vertical line)
      // y: amplitude variation along the vertical axis
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
