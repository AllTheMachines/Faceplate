/**
 * Envelope Display Renderer
 *
 * Canvas-based ADSR envelope visualization with static preview.
 * Displays attack, decay, sustain, release stages with exponential or linear curves.
 * Per CONTEXT.md: shows frozen snapshot, not animated.
 */

import React, { useLayoutEffect, useState } from 'react'
import type { EnvelopeDisplayElementConfig } from '../../../../../types/elements/curves'
import { useCanvasSetup } from '../../../../../hooks/useCanvasSetup'
import {
  drawSmoothCurve,
  drawHandle,
  isPointInHandle,
  drawLinearGrid,
  generateMockADSR,
} from '../../../../../utils/curveRendering'

interface EnvelopeDisplayRendererProps {
  config: EnvelopeDisplayElementConfig
}

export function EnvelopeDisplayRenderer({ config }: EnvelopeDisplayRendererProps) {
  const {
    width,
    height,
    attack: configAttack,
    decay: configDecay,
    sustain: configSustain,
    release: configRelease,
    curveType,
    showStageColors,
    attackColor,
    decayColor,
    sustainColor,
    releaseColor,
    curveColor,
    lineWidth,
    showFill,
    fillColor,
    showGrid,
    gridColor,
    showStageMarkers,
    handleColor,
    handleHoverColor,
    backgroundColor,
    canvasScale,
  } = config

  // Use config values or fallback to mock data
  const mockData = generateMockADSR()
  const attack = configAttack ?? mockData.attack
  const decay = configDecay ?? mockData.decay
  const sustain = configSustain ?? mockData.sustain
  const release = configRelease ?? mockData.release

  // Setup Canvas with HiDPI scaling
  const { canvasRef, ctx } = useCanvasSetup(width, height, canvasScale)

  // Track hovered handles (4 handles: A, D, S, R control points)
  const [hoveredHandle, setHoveredHandle] = useState<number | null>(null)

  // Mouse move handler for handle hover
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Calculate time proportions
    const sustainHold = 0.3 // Fixed sustain display time
    const totalTime = attack + decay + sustainHold + release
    const attackTime = (attack / totalTime) * width
    const decayTime = (decay / totalTime) * width
    const sustainTime = (sustainHold / totalTime) * width

    // Handle positions
    const handles = [
      { x: attackTime, y: 0 }, // End of attack (peak)
      { x: attackTime + decayTime, y: height - sustain * height }, // End of decay
      { x: attackTime + decayTime + sustainTime, y: height - sustain * height }, // End of sustain
    ]

    // Check which handle is hovered
    let foundHover: number | null = null
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i]
      if (handle && isPointInHandle(mouseX, mouseY, handle.x, handle.y, hoveredHandle === i)) {
        foundHover = i
        break
      }
    }

    setHoveredHandle(foundHover)
  }

  // Draw envelope curve once (static, not animated)
  useLayoutEffect(() => {
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      drawLinearGrid(ctx, width, height, gridColor, 4)
    }

    // Calculate time proportions
    const sustainHold = 0.3 // Fixed sustain display time
    const totalTime = attack + decay + sustainHold + release
    const attackTime = (attack / totalTime) * width
    const decayTime = (decay / totalTime) * width
    const sustainTime = (sustainHold / totalTime) * width
    const releaseTime = (release / totalTime) * width

    // Build envelope points for each stage

    // Attack phase (0 to peak)
    const attackPoints: { x: number; y: number }[] = []
    const attackSamples = 20
    for (let i = 0; i <= attackSamples; i++) {
      const t = i / attackSamples
      const x = t * attackTime
      let level: number

      if (curveType === 'exponential') {
        // Logarithmic rise (fast start, slow finish)
        level = Math.pow(t, 0.3)
      } else {
        // Linear rise
        level = t
      }

      const y = height - level * height
      attackPoints.push({ x, y })
    }

    // Decay phase (peak to sustain)
    const decayPoints: { x: number; y: number }[] = []
    const decaySamples = 20
    for (let i = 0; i <= decaySamples; i++) {
      const t = i / decaySamples
      const x = attackTime + t * decayTime
      let level: number

      if (curveType === 'exponential') {
        // Exponential decay
        level = 1 - (1 - sustain) * (1 - Math.exp(-5 * t))
      } else {
        // Linear decay
        level = 1 - (1 - sustain) * t
      }

      const y = height - level * height
      decayPoints.push({ x, y })
    }

    // Sustain phase (flat line)
    const sustainPoints: { x: number; y: number }[] = [
      { x: attackTime + decayTime, y: height - sustain * height },
      { x: attackTime + decayTime + sustainTime, y: height - sustain * height },
    ]

    // Release phase (sustain to zero)
    const releasePoints: { x: number; y: number }[] = []
    const releaseSamples = 20
    for (let i = 0; i <= releaseSamples; i++) {
      const t = i / releaseSamples
      const x = attackTime + decayTime + sustainTime + t * releaseTime
      let level: number

      if (curveType === 'exponential') {
        // Exponential release
        level = sustain * Math.exp(-5 * t)
      } else {
        // Linear release
        level = sustain * (1 - t)
      }

      const y = height - level * height
      releasePoints.push({ x, y })
    }

    // Draw stage markers if enabled (vertical dashed lines at stage boundaries)
    if (showStageMarkers) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])

      const markers = [attackTime, attackTime + decayTime, attackTime + decayTime + sustainTime]
      markers.forEach((x) => {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      })

      ctx.setLineDash([]) // Reset line dash
    }

    // Draw curves with stage colors or single color
    if (showStageColors) {
      // Draw each stage segment with its color
      drawSmoothCurve(ctx, attackPoints, attackColor, lineWidth)
      drawSmoothCurve(ctx, decayPoints, decayColor, lineWidth)
      drawSmoothCurve(ctx, sustainPoints, sustainColor, lineWidth)
      drawSmoothCurve(ctx, releasePoints, releaseColor, lineWidth)
    } else {
      // Draw entire envelope with single color
      const allPoints = [...attackPoints, ...decayPoints, ...sustainPoints, ...releasePoints]
      drawSmoothCurve(
        ctx,
        allPoints,
        curveColor,
        lineWidth,
        showFill,
        showFill ? fillColor : undefined,
        showFill ? height : undefined
      )
    }

    // Draw handles at control points
    const handles = [
      { x: attackTime, y: 0 }, // End of attack (peak)
      { x: attackTime + decayTime, y: height - sustain * height }, // End of decay
      { x: attackTime + decayTime + sustainTime, y: height - sustain * height }, // End of sustain
    ]

    handles.forEach((handle, i) => {
      drawHandle(
        ctx,
        handle.x,
        handle.y,
        hoveredHandle === i,
        handleColor,
        handleHoverColor
      )
    })
  }, [
    ctx,
    width,
    height,
    backgroundColor,
    showGrid,
    gridColor,
    attack,
    decay,
    sustain,
    release,
    curveType,
    showStageColors,
    attackColor,
    decayColor,
    sustainColor,
    releaseColor,
    curveColor,
    lineWidth,
    showFill,
    fillColor,
    showStageMarkers,
    handleColor,
    handleHoverColor,
    hoveredHandle,
  ])

  // Mouse leave handler to clear hover state
  const handleMouseLeave = () => {
    setHoveredHandle(null)
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'block',
        cursor: hoveredHandle !== null ? 'pointer' : 'default',
      }}
    />
  )
}
