import React, { useRef, useCallback, useEffect } from 'react'
import { EnvelopeEditorElementConfig, EnvelopeCurveType } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface EnvelopeEditorRendererProps {
  config: EnvelopeEditorElementConfig
}

// Apply curve transformation for a segment
function applyCurve(t: number, curveType: EnvelopeCurveType): number {
  switch (curveType) {
    case 'exponential':
      return t * t
    case 'logarithmic':
      return Math.sqrt(t)
    case 'linear':
    default:
      return t
  }
}

export function EnvelopeEditorRenderer({ config }: EnvelopeEditorRendererProps) {
  const updateElement = useStore((state) => state.updateElement)
  const containerRef = useRef<SVGSVGElement>(null)
  const draggingPointRef = useRef<'attack' | 'decay' | 'sustain' | 'release' | null>(null)

  const {
    attack,
    decay,
    sustain,
    release,
    attackCurve,
    decayCurve,
    releaseCurve,
    showGrid,
    showLabels,
    showValues,
    lineColor,
    fillColor,
    pointColor,
    activePointColor,
    gridColor,
    backgroundColor,
    labelColor,
    pointSize,
    fontSize,
    fontFamily,
    fontWeight,
    selectedPoint,
    width,
    height,
  } = config

  const padding = showLabels ? 24 : 8
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Total time units (attack + decay + sustain hold + release)
  const sustainHold = 0.3 // Fixed sustain display width
  const totalTime = attack + decay + sustainHold + release

  // Convert time to x position
  const timeToX = (time: number) => padding + (time / totalTime) * chartWidth

  // Convert level to y position (inverted: 0 at top, 1 at bottom)
  const levelToY = (level: number) => padding + (1 - level) * chartHeight

  // Key points
  const attackEndTime = attack
  const decayEndTime = attack + decay
  const sustainEndTime = attack + decay + sustainHold
  const releaseEndTime = totalTime

  // Generate path points with curves
  const generatePath = () => {
    const points: string[] = []
    const steps = 20

    // Start at 0
    points.push(`M ${timeToX(0)} ${levelToY(0)}`)

    // Attack phase (0 to peak)
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const time = t * attack
      const level = applyCurve(t, attackCurve)
      points.push(`L ${timeToX(time)} ${levelToY(level)}`)
    }

    // Decay phase (peak to sustain)
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const time = attackEndTime + t * decay
      const level = 1 - applyCurve(t, decayCurve) * (1 - sustain)
      points.push(`L ${timeToX(time)} ${levelToY(level)}`)
    }

    // Sustain hold (flat)
    points.push(`L ${timeToX(sustainEndTime)} ${levelToY(sustain)}`)

    // Release phase (sustain to 0)
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const time = sustainEndTime + t * release
      const level = sustain * (1 - applyCurve(t, releaseCurve))
      points.push(`L ${timeToX(time)} ${levelToY(level)}`)
    }

    return points.join(' ')
  }

  // Generate fill path (closed)
  const generateFillPath = () => {
    return generatePath() + ` L ${timeToX(releaseEndTime)} ${levelToY(0)} L ${timeToX(0)} ${levelToY(0)} Z`
  }

  // Handle point dragging
  const updateFromMouse = useCallback((clientX: number, clientY: number, point: string) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const relativeX = (clientX - rect.left - padding) / chartWidth
    const relativeY = 1 - (clientY - rect.top - padding) / chartHeight

    const clampedTime = Math.max(0.01, Math.min(0.99, relativeX * totalTime))
    const clampedLevel = Math.max(0, Math.min(1, relativeY))

    switch (point) {
      case 'attack':
        // Adjust attack time based on x position
        updateElement(config.id, { attack: Math.max(0.01, Math.min(clampedTime, 0.5)), selectedPoint: 'attack' })
        break
      case 'decay':
        // Adjust decay time
        updateElement(config.id, { decay: Math.max(0.01, Math.min(0.5, clampedTime - attack)), selectedPoint: 'decay' })
        break
      case 'sustain':
        // Adjust sustain level based on y position
        updateElement(config.id, { sustain: clampedLevel, selectedPoint: 'sustain' })
        break
      case 'release':
        // Adjust release time
        updateElement(config.id, { release: Math.max(0.01, Math.min(0.5, totalTime - sustainEndTime)), selectedPoint: 'release' })
        break
    }
  }, [config.id, attack, chartWidth, chartHeight, padding, totalTime, sustainEndTime, updateElement])

  const handlePointMouseDown = useCallback((point: 'attack' | 'decay' | 'sustain' | 'release', e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    draggingPointRef.current = point
    updateElement(config.id, { selectedPoint: point })
  }, [config.id, updateElement])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingPointRef.current) {
        updateFromMouse(e.clientX, e.clientY, draggingPointRef.current)
      }
    }

    const handleMouseUp = () => {
      draggingPointRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [updateFromMouse])

  // Grid lines
  const gridLines = []
  if (showGrid) {
    // Horizontal lines (level)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray={i === 0 || i === 4 ? 'none' : '4 4'}
        />
      )
    }
    // Vertical lines (time)
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i / 4) * chartWidth
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray={i === 0 || i === 4 ? 'none' : '4 4'}
        />
      )
    }
  }

  // Control points
  const points = [
    { id: 'attack', x: timeToX(attackEndTime), y: levelToY(1), label: 'A' },
    { id: 'decay', x: timeToX(decayEndTime), y: levelToY(sustain), label: 'D' },
    { id: 'sustain', x: timeToX(sustainEndTime), y: levelToY(sustain), label: 'S' },
    { id: 'release', x: timeToX(releaseEndTime), y: levelToY(0), label: 'R' },
  ]

  return (
    <svg
      ref={containerRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor }}
    >
      {/* Grid */}
      {gridLines}

      {/* Fill */}
      <path d={generateFillPath()} fill={fillColor} />

      {/* Line */}
      <path d={generatePath()} fill="none" stroke={lineColor} strokeWidth={2} />

      {/* Control points */}
      {points.map((point) => (
        <g key={point.id}>
          {/* Hit area */}
          <circle
            cx={point.x}
            cy={point.y}
            r={pointSize + 4}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseDown={(e) => handlePointMouseDown(point.id as 'attack' | 'decay' | 'sustain' | 'release', e)}
          />
          {/* Visible point */}
          <circle
            cx={point.x}
            cy={point.y}
            r={pointSize / 2}
            fill={selectedPoint === point.id ? activePointColor : pointColor}
            stroke={lineColor}
            strokeWidth={2}
          />
          {/* Label */}
          {showLabels && (
            <text
              x={point.x}
              y={height - 4}
              textAnchor="middle"
              fill={labelColor}
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
            >
              {point.label}
            </text>
          )}
        </g>
      ))}

      {/* Value display */}
      {showValues && (
        <text
          x={padding}
          y={padding - 4}
          fill={labelColor}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
        >
          A:{attack.toFixed(2)} D:{decay.toFixed(2)} S:{sustain.toFixed(2)} R:{release.toFixed(2)}
        </text>
      )}
    </svg>
  )
}
