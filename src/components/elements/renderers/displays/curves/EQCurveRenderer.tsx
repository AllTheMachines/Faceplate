/**
 * EQ Curve Renderer
 *
 * Canvas-based frequency response visualization with interactive handles.
 * Shows composite frequency response from multiple parametric EQ bands.
 * Per CONTEXT.md: static preview with hoverable handles, not draggable.
 */

import React, { useLayoutEffect, useMemo, useState } from 'react'
import type { EQCurveElementConfig } from '../../../../../types/elements/curves'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'
import {
  frequencyToX,
  xToFrequency,
  dbToY,
  calculateBiquadResponse,
} from '../../../../../utils/audioMath'
import {
  drawSmoothCurve,
  drawHandle,
  isPointInHandle,
  drawFrequencyGrid,
  generateMockEQBands,
} from '../../../../../utils/curveRendering'

interface EQCurveRendererProps {
  config: EQCurveElementConfig
}

export function EQCurveRenderer({ config }: EQCurveRendererProps) {
  const {
    width,
    height,
    bandCount,
    minDb,
    maxDb,
    minFreq,
    maxFreq,
    showGrid,
    gridColor,
    showFrequencyLabels,
    showDbLabels,
    curveColor,
    lineWidth,
    showFill,
    fillColor,
    fillOpacity,
    showIndividualBands,
    handleColor,
    handleHoverColor,
    backgroundColor,
    canvasScale,
  } = config

  // Setup Canvas with HiDPI scaling
  const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)

  // Generate static mock bands (frozen snapshot per CONTEXT.md)
  const bands = useMemo(() => {
    return generateMockEQBands(bandCount)
  }, [bandCount])

  // Track hovered band for handle hover effects
  const [hoveredBand, setHoveredBand] = useState<number | null>(null)

  // Draw EQ curve once (static, not animated)
  useLayoutEffect(() => {
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      drawFrequencyGrid(
        ctx,
        width,
        height,
        gridColor,
        showFrequencyLabels,
        showDbLabels,
        minFreq,
        maxFreq,
        minDb,
        maxDb
      )
    }

    // Calculate composite frequency response
    const sampleCount = 200
    const compositePoints: { x: number; y: number }[] = []

    for (let i = 0; i < sampleCount; i++) {
      const x = (i / (sampleCount - 1)) * width
      const frequency = xToFrequency(x, width, minFreq, maxFreq)

      // Sum all band contributions
      let totalDb = 0
      for (const band of bands) {
        const response = calculateBiquadResponse(
          frequency,
          band.frequency,
          band.gain,
          band.Q
        )
        totalDb += response
      }

      // Convert to Y coordinate
      const y = dbToY(totalDb, height, minDb, maxDb)
      compositePoints.push({ x, y })
    }

    // Draw individual band curves if enabled
    if (showIndividualBands) {
      ctx.globalAlpha = 0.3

      for (const band of bands) {
        const bandPoints: { x: number; y: number }[] = []

        for (let i = 0; i < sampleCount; i++) {
          const x = (i / (sampleCount - 1)) * width
          const frequency = xToFrequency(x, width, minFreq, maxFreq)

          const response = calculateBiquadResponse(
            frequency,
            band.frequency,
            band.gain,
            band.Q
          )

          const y = dbToY(response, height, minDb, maxDb)
          bandPoints.push({ x, y })
        }

        drawSmoothCurve(ctx, bandPoints, curveColor, lineWidth)
      }

      ctx.globalAlpha = 1.0
    }

    // Draw composite curve
    const fillColorWithOpacity = showFill
      ? fillColor.replace(/[^,]+(?=\))/, fillOpacity.toString())
      : undefined

    drawSmoothCurve(
      ctx,
      compositePoints,
      curveColor,
      lineWidth,
      showFill,
      fillColorWithOpacity,
      height
    )

    // Draw handles at each band position
    for (let i = 0; i < bands.length; i++) {
      const band = bands[i]
      const handleX = frequencyToX(band.frequency, width, minFreq, maxFreq)
      const handleY = dbToY(band.gain, height, minDb, maxDb)

      drawHandle(
        ctx,
        handleX,
        handleY,
        hoveredBand === i,
        handleColor,
        handleHoverColor
      )
    }
  }, [
    ctx,
    width,
    height,
    bands,
    minDb,
    maxDb,
    minFreq,
    maxFreq,
    showGrid,
    gridColor,
    showFrequencyLabels,
    showDbLabels,
    curveColor,
    lineWidth,
    showFill,
    fillColor,
    fillOpacity,
    showIndividualBands,
    handleColor,
    handleHoverColor,
    backgroundColor,
    hoveredBand,
  ])

  // Mouse move handler for handle hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Check each handle for hover
    let foundHover: number | null = null
    for (let i = 0; i < bands.length; i++) {
      const band = bands[i]
      const handleX = frequencyToX(band.frequency, width, minFreq, maxFreq)
      const handleY = dbToY(band.gain, height, minDb, maxDb)

      if (isPointInHandle(mouseX, mouseY, handleX, handleY, hoveredBand === i)) {
        foundHover = i
        break
      }
    }

    if (foundHover !== hoveredBand) {
      setHoveredBand(foundHover)
    }
  }

  // Mouse leave handler to clear hover state
  const handleMouseLeave = () => {
    setHoveredBand(null)
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        cursor: hoveredBand !== null ? 'pointer' : 'default',
      }}
    />
  )
}
