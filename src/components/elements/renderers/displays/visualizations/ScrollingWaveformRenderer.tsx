/**
 * Scrolling Waveform Renderer
 *
 * Canvas-based scrolling waveform visualization with static mock data.
 * Per CONTEXT.md: shows frozen snapshot, not animated.
 */

import { useLayoutEffect, useMemo } from 'react'
import type { ScrollingWaveformElementConfig } from '../../../../../types/elements/visualizations'
import { generateWaveformData } from '../../../../../utils/mockAudioData'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'

interface ScrollingWaveformRendererProps {
  config: ScrollingWaveformElementConfig
}

export function ScrollingWaveformRenderer({ config }: ScrollingWaveformRendererProps) {
  const {
    width,
    height,
    displayMode,
    waveformColor,
    backgroundColor,
    showGrid,
    gridColor,
    canvasScale,
  } = config

  // Setup Canvas with HiDPI scaling
  const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)

  // Generate static waveform data (frozen snapshot)
  const waveformData = useMemo(() => {
    return generateWaveformData(width * 2) // 2x width for smooth rendering
  }, [width])

  // Draw waveform once (static, not animated)
  useLayoutEffect(() => {
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1

      // Horizontal center line
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Vertical divisions (every 20% of width)
      for (let i = 1; i < 5; i++) {
        const x = (width / 5) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
    }

    // Draw waveform
    const sampleCount = waveformData.length
    const xStep = width / sampleCount

    if (displayMode === 'line') {
      // Line mode: stroke path
      ctx.strokeStyle = waveformColor
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = 0; i < sampleCount; i++) {
        const x = i * xStep
        const sample = waveformData[i] ?? 0
        const y = height / 2 - (sample * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
    } else {
      // Fill mode: filled area from center to waveform
      ctx.fillStyle = waveformColor
      ctx.beginPath()

      // Start from center left
      ctx.moveTo(0, height / 2)

      // Draw top edge
      for (let i = 0; i < sampleCount; i++) {
        const x = i * xStep
        const sample = waveformData[i] ?? 0
        const y = height / 2 - (sample * height) / 2
        ctx.lineTo(x, y)
      }

      // Draw bottom edge (mirrored)
      for (let i = sampleCount - 1; i >= 0; i--) {
        const x = i * xStep
        const sample = waveformData[i] ?? 0
        const y = height / 2 + (sample * height) / 2
        ctx.lineTo(x, y)
      }

      ctx.closePath()
      ctx.fill()
    }
  }, [ctx, width, height, displayMode, waveformColor, backgroundColor, showGrid, gridColor, waveformData])

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
