/**
 * Compressor Curve Renderer
 *
 * Canvas-based compressor transfer function visualization with static preview.
 * Displays input/output dB relationship with threshold, ratio, and knee parameters.
 * Per CONTEXT.md: shows frozen snapshot, not animated.
 */

import React, { useLayoutEffect, useState } from 'react'
import type { CompressorCurveElementConfig } from '../../../../../types/elements/curves'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'
import { calculateCompressorOutput } from '../../../../../utils/audioMath'
import {
  drawSmoothCurve,
  drawHandle,
  isPointInHandle,
  drawLinearGrid,
  generateMockCompressor,
} from '../../../../../utils/curveRendering'

interface CompressorCurveRendererProps {
  config: CompressorCurveElementConfig
}

export function CompressorCurveRenderer({ config }: CompressorCurveRendererProps) {
  const {
    width,
    height,
    threshold: configThreshold,
    ratio,
    knee,
    minDb,
    maxDb,
    displayMode,
    showGrid,
    gridColor,
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

  // Use config values or fallback to mock data
  const mockData = generateMockCompressor()
  const threshold = configThreshold ?? mockData.threshold
  const currentRatio = ratio ?? mockData.ratio
  const currentKnee = knee ?? mockData.knee

  // Setup Canvas with HiDPI scaling
  const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)

  // Track hovered handle
  const [hoveredHandle, setHoveredHandle] = useState(false)

  // Mouse move handler for handle hover
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Calculate threshold handle position (on 1:1 line)
    const thresholdX = ((threshold - minDb) / (maxDb - minDb)) * width
    const thresholdY = height - ((threshold - minDb) / (maxDb - minDb)) * height

    // Check if mouse is over handle
    const isOverHandle = isPointInHandle(mouseX, mouseY, thresholdX, thresholdY, hoveredHandle)
    setHoveredHandle(isOverHandle)
  }

  // Draw compressor curve once (static, not animated)
  useLayoutEffect(() => {
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      drawLinearGrid(ctx, width, height, gridColor, 4)
    }

    // Draw 1:1 reference line (diagonal from bottom-left to top-right)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height)
    ctx.lineTo(width, 0)
    ctx.stroke()

    // Calculate compressor transfer curve
    const points: { x: number; y: number }[] = []
    const step = 0.5 // 0.5dB steps for smooth curve

    for (let inputDb = minDb; inputDb <= maxDb; inputDb += step) {
      const outputDb = calculateCompressorOutput(inputDb, threshold, currentRatio, currentKnee)

      // Convert to canvas coordinates
      const x = ((inputDb - minDb) / (maxDb - minDb)) * width
      const y = height - ((outputDb - minDb) / (maxDb - minDb)) * height

      points.push({ x, y })
    }

    // Draw transfer curve
    drawSmoothCurve(
      ctx,
      points,
      curveColor,
      lineWidth,
      showFill,
      showFill ? fillColor : undefined,
      showFill ? height : undefined
    )

    // Draw handle at threshold position (on 1:1 line)
    const thresholdX = ((threshold - minDb) / (maxDb - minDb)) * width
    const thresholdY = height - ((threshold - minDb) / (maxDb - minDb)) * height
    drawHandle(ctx, thresholdX, thresholdY, hoveredHandle, handleColor, handleHoverColor)

    // If displayMode is 'gainreduction', draw vertical bar showing gain reduction
    if (displayMode === 'gainreduction') {
      // Example input level at 75% of range
      const exampleInputDb = minDb + 0.75 * (maxDb - minDb)
      const exampleOutputDb = calculateCompressorOutput(
        exampleInputDb,
        threshold,
        currentRatio,
        currentKnee
      )
      const gainReduction = exampleInputDb - exampleOutputDb

      if (gainReduction > 0) {
        const x = ((exampleInputDb - minDb) / (maxDb - minDb)) * width
        const yInput = height - ((exampleInputDb - minDb) / (maxDb - minDb)) * height
        const yOutput = height - ((exampleOutputDb - minDb) / (maxDb - minDb)) * height

        // Draw gain reduction bar
        ctx.strokeStyle = '#ff4444'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, yInput)
        ctx.lineTo(x, yOutput)
        ctx.stroke()

        // Draw gain reduction label
        ctx.fillStyle = '#ff4444'
        ctx.font = '10px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`-${gainReduction.toFixed(1)}dB`, x, yOutput - 5)
      }
    }

    // Draw dB labels if enabled
    if (showDbLabels) {
      ctx.fillStyle = gridColor
      ctx.font = '10px monospace'

      // Input axis labels (bottom)
      ctx.textAlign = 'center'
      const inputLabels = [minDb, (minDb + maxDb) / 2, maxDb]
      inputLabels.forEach((db) => {
        const x = ((db - minDb) / (maxDb - minDb)) * width
        ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, x, height - 2)
      })

      // Output axis labels (left)
      ctx.textAlign = 'right'
      const outputLabels = [minDb, (minDb + maxDb) / 2, maxDb]
      outputLabels.forEach((db) => {
        const y = height - ((db - minDb) / (maxDb - minDb)) * height
        ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, width - 2, y + 3)
      })
    }
  }, [
    ctx,
    width,
    height,
    backgroundColor,
    showGrid,
    gridColor,
    threshold,
    currentRatio,
    currentKnee,
    minDb,
    maxDb,
    displayMode,
    curveColor,
    lineWidth,
    showFill,
    fillColor,
    handleColor,
    handleHoverColor,
    hoveredHandle,
    showDbLabels,
  ])

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
