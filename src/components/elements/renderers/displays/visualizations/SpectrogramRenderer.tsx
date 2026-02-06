/**
 * SpectrogramRenderer
 *
 * Canvas-based spectrogram waterfall visualization with frozen time-frequency color map.
 * Static mock data per CONTEXT.md - frozen snapshot, not animated.
 */

import { useLayoutEffect, useMemo } from 'react'
import { SpectrogramElementConfig } from '../../../../../types/elements/visualizations'
import { generateSpectrogramFrame, magnitudeToColor } from '../../../../../utils/mockAudioData'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'

interface SpectrogramRendererProps {
  config: SpectrogramElementConfig
}

export function SpectrogramRenderer({ config }: SpectrogramRendererProps) {
  const { canvasRef, ctx } = useCanvasSetup(
    config.width,
    config.height,
    config.canvasScale
  )

  // Generate static spectrogram frame (frozen snapshot per CONTEXT.md)
  const spectrogramData = useMemo(
    () => generateSpectrogramFrame(config.width, config.fftSize),
    [config.width, config.fftSize]
  )

  // Draw once on mount or config change
  useLayoutEffect(() => {
    if (!ctx) return

    // Clear canvas with background
    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, config.width, config.height)

    // Draw spectrogram pixels (time x frequency grid with color-mapped magnitudes)
    const frequencyBins = spectrogramData[0]?.length || 64
    const timeSlices = spectrogramData.length

    spectrogramData.forEach((timeSlice, timeIndex) => {
      const y = (timeIndex / timeSlices) * config.height
      const rowHeight = config.height / timeSlices

      timeSlice.forEach((magnitude, freqIndex) => {
        const x = (freqIndex / frequencyBins) * config.width
        const colWidth = config.width / frequencyBins

        const color = magnitudeToColor(magnitude, config.colorMap)
        ctx.fillStyle = color
        ctx.fillRect(x, y, colWidth + 0.5, rowHeight + 0.5) // +0.5 to prevent gaps
      })
    })

    // Draw frequency labels if enabled (higher frequencies at top)
    if (config.showFrequencyLabels) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      const freqLabels = ['20k', '10k', '5k', '1k', '100']
      freqLabels.forEach((label, i) => {
        const y = ((i + 0.5) / freqLabels.length) * config.height
        ctx.fillText(label, 35, y + 4)
      })
    }

    // Draw time labels if enabled (waterfall flows from left to right)
    if (config.showTimeLabels) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Time →', config.width / 2, config.height - 4)
    }
  }, [
    ctx,
    config.width,
    config.height,
    config.backgroundColor,
    config.colorMap,
    config.showFrequencyLabels,
    config.showTimeLabels,
    spectrogramData,
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
