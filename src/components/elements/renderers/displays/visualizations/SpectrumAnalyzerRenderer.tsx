/**
 * Spectrum Analyzer Renderer
 *
 * Canvas-based spectrum analyzer visualization with static pink noise spectrum.
 * Per CONTEXT.md: shows frozen snapshot, not animated.
 */

import React, { useLayoutEffect, useMemo } from 'react'
import type { SpectrumAnalyzerElementConfig } from '../../../../../types/elements/visualizations'
import { generatePinkNoiseSpectrum, magnitudeToColor } from '../../../../../utils/mockAudioData'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'

interface SpectrumAnalyzerRendererProps {
  config: SpectrumAnalyzerElementConfig
}

export function SpectrumAnalyzerRenderer({ config }: SpectrumAnalyzerRendererProps) {
  const {
    width,
    height,
    fftSize,
    colorGradient,
    barGap,
    backgroundColor,
    showGrid,
    gridColor,
    showFrequencyLabels,
    showDbScale,
    canvasScale,
  } = config

  // Setup Canvas with HiDPI scaling
  const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)

  // Generate static pink noise spectrum (frozen snapshot)
  const barCount = 64 // Default bar count for visualization
  const spectrumData = useMemo(() => {
    return generatePinkNoiseSpectrum(barCount)
  }, [barCount])

  // Draw spectrum once (static, not animated)
  useLayoutEffect(() => {
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1

      // Horizontal dB lines (every 20% of height)
      for (let i = 1; i < 5; i++) {
        const y = (height / 5) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Vertical frequency divisions (every 20% of width)
      for (let i = 1; i < 5; i++) {
        const x = (width / 5) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
    }

    // Draw spectrum bars
    const barWidth = (width - barGap * (barCount - 1)) / barCount

    for (let i = 0; i < barCount; i++) {
      const magnitude = spectrumData[i]
      const barHeight = magnitude * height
      const x = i * (barWidth + barGap)
      const y = height - barHeight

      // Get color based on magnitude and color gradient
      ctx.fillStyle = magnitudeToColor(magnitude, colorGradient)
      ctx.fillRect(x, y, barWidth, barHeight)
    }

    // Draw frequency labels if enabled
    if (showFrequencyLabels) {
      ctx.fillStyle = '#999999'
      ctx.font = '10px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'

      // Sample frequency labels (20Hz, 200Hz, 2kHz, 20kHz for log scale)
      const labels = [
        { text: '20Hz', position: 0.05 },
        { text: '200Hz', position: 0.25 },
        { text: '2kHz', position: 0.5 },
        { text: '20kHz', position: 0.95 },
      ]

      labels.forEach(({ text, position }) => {
        const x = width * position
        ctx.fillText(text, x, height - 4)
      })
    }

    // Draw dB scale if enabled
    if (showDbScale) {
      ctx.fillStyle = '#999999'
      ctx.font = '10px Inter, system-ui, sans-serif'
      ctx.textAlign = 'right'

      // dB scale labels (0dB at top, -60dB at bottom)
      const dbLabels = [
        { text: '0dB', position: 0.05 },
        { text: '-20dB', position: 0.35 },
        { text: '-40dB', position: 0.65 },
        { text: '-60dB', position: 0.95 },
      ]

      dbLabels.forEach(({ text, position }) => {
        const y = height * position
        ctx.fillText(text, width - 4, y)
      })
    }
  }, [
    ctx,
    width,
    height,
    backgroundColor,
    showGrid,
    gridColor,
    spectrumData,
    barCount,
    barGap,
    colorGradient,
    showFrequencyLabels,
    showDbScale,
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
