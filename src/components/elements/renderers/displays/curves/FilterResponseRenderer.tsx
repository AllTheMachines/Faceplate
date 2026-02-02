/**
 * Filter Response Renderer
 *
 * Canvas-based filter frequency response visualization with handle at cutoff.
 * Displays single filter curve for various filter types.
 * Per CONTEXT.md: static preview with hoverable handle, not draggable.
 */

import React, { useLayoutEffect, useState } from 'react'
import type { FilterResponseElementConfig } from '../../../../../types/elements/curves'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'
import {
  frequencyToX,
  xToFrequency,
  dbToY,
  calculateFilterResponse,
} from '../../../../../utils/audioMath'
import {
  drawSmoothCurve,
  drawHandle,
  isPointInHandle,
  drawFrequencyGrid,
} from '../../../../../utils/curveRendering'

interface FilterResponseRendererProps {
  config: FilterResponseElementConfig
}

export function FilterResponseRenderer({ config }: FilterResponseRendererProps) {
  const {
    width,
    height,
    filterType,
    cutoffFrequency,
    resonance,
    gain,
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
    handleColor,
    handleHoverColor,
    backgroundColor,
    canvasScale,
  } = config

  // Setup Canvas with HiDPI scaling
  const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)

  // Track hovered handle state (single handle for cutoff)
  const [hoveredHandle, setHoveredHandle] = useState<boolean>(false)

  // Draw filter response curve once (static, not animated)
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

    // Calculate filter frequency response
    const sampleCount = 200
    const points: { x: number; y: number }[] = []

    for (let i = 0; i < sampleCount; i++) {
      const x = (i / (sampleCount - 1)) * width
      const frequency = xToFrequency(x, width, minFreq, maxFreq)

      // Calculate response for filter
      const response = calculateFilterResponse(
        frequency,
        filterType,
        cutoffFrequency,
        resonance,
        gain
      )

      // Convert to Y coordinate
      const y = dbToY(response, height, minDb, maxDb)
      points.push({ x, y })
    }

    // Draw curve
    drawSmoothCurve(
      ctx,
      points,
      curveColor,
      lineWidth,
      showFill,
      fillColor,
      height
    )

    // Draw handle at cutoff position
    // For visual clarity, place handle at cutoff frequency and response at that frequency
    const handleX = frequencyToX(cutoffFrequency, width, minFreq, maxFreq)
    const responseAtCutoff = calculateFilterResponse(
      cutoffFrequency,
      filterType,
      cutoffFrequency,
      resonance,
      gain
    )
    const handleY = dbToY(responseAtCutoff, height, minDb, maxDb)

    drawHandle(
      ctx,
      handleX,
      handleY,
      hoveredHandle,
      handleColor,
      handleHoverColor
    )
  }, [
    ctx,
    width,
    height,
    filterType,
    cutoffFrequency,
    resonance,
    gain,
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
    handleColor,
    handleHoverColor,
    backgroundColor,
    hoveredHandle,
  ])

  // Mouse move handler for handle hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate handle position
    const handleX = frequencyToX(cutoffFrequency, width, minFreq, maxFreq)
    const responseAtCutoff = calculateFilterResponse(
      cutoffFrequency,
      filterType,
      cutoffFrequency,
      resonance,
      gain
    )
    const handleY = dbToY(responseAtCutoff, height, minDb, maxDb)

    // Check if mouse is over handle
    const isHovered = isPointInHandle(mouseX, mouseY, handleX, handleY, hoveredHandle)

    if (isHovered !== hoveredHandle) {
      setHoveredHandle(isHovered)
    }
  }

  // Mouse leave handler to clear hover state
  const handleMouseLeave = () => {
    setHoveredHandle(false)
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'block',
        cursor: hoveredHandle ? 'pointer' : 'default',
      }}
    />
  )
}
