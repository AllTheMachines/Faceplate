import React, { useRef, useCallback, useEffect } from 'react'
import { HarmonicEditorElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface HarmonicEditorRendererProps {
  config: HarmonicEditorElementConfig
}

export function HarmonicEditorRenderer({ config }: HarmonicEditorRendererProps) {
  const updateElement = useStore((state) => state.updateElement)
  const containerRef = useRef<SVGSVGElement>(null)
  const draggingBarRef = useRef<number | null>(null)

  const {
    harmonicCount,
    harmonicValues,
    showFundamental,
    showHarmonicNumbers,
    barColor,
    selectedBarColor,
    backgroundColor,
    gridColor,
    labelColor,
    barGap,
    fontSize,
    fontFamily,
    fontWeight,
    selectedHarmonic,
    width,
    height,
  } = config

  const labelHeight = showHarmonicNumbers ? 16 : 0
  const chartHeight = height - labelHeight
  const barWidth = (width - barGap * (harmonicCount + 1)) / harmonicCount

  // Update harmonic value from mouse position
  const updateHarmonicValue = useCallback((clientY: number, barIndex: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const relativeY = clientY - rect.top
    // Convert to normalized value (0 at bottom, 1 at top)
    const normalizedY = 1 - Math.max(0, Math.min(1, relativeY / chartHeight))

    const newValues = [...harmonicValues]
    newValues[barIndex] = normalizedY
    updateElement(config.id, { harmonicValues: newValues, selectedHarmonic: barIndex })
  }, [config.id, harmonicValues, chartHeight, updateElement])

  const handleBarMouseDown = useCallback((barIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    draggingBarRef.current = barIndex
    updateHarmonicValue(e.clientY, barIndex)
  }, [updateHarmonicValue])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingBarRef.current !== null) {
        updateHarmonicValue(e.clientY, draggingBarRef.current)
      }
    }

    const handleMouseUp = () => {
      draggingBarRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [updateHarmonicValue])

  const bars = []
  const labels = []
  const hitAreas = []

  for (let i = 0; i < harmonicCount; i++) {
    const value = harmonicValues[i] || 0
    const barHeight = value * chartHeight
    const x = barGap + i * (barWidth + barGap)
    const y = chartHeight - barHeight
    const isSelected = i === selectedHarmonic
    const isFundamental = i === 0

    // Visible bar
    bars.push(
      <rect
        key={`bar-${i}`}
        x={x}
        y={y}
        width={barWidth}
        height={barHeight}
        fill={isSelected ? selectedBarColor : barColor}
        opacity={isFundamental && showFundamental ? 1 : 0.8}
      />
    )

    // Invisible hit area for easier interaction (full column height)
    hitAreas.push(
      <rect
        key={`hit-${i}`}
        x={x}
        y={0}
        width={barWidth}
        height={chartHeight}
        fill="transparent"
        style={{ cursor: 'ns-resize' }}
        onMouseDown={(e) => handleBarMouseDown(i, e)}
      />
    )

    if (showHarmonicNumbers) {
      labels.push(
        <text
          key={`label-${i}`}
          x={x + barWidth / 2}
          y={chartHeight + labelHeight - 4}
          textAnchor="middle"
          fill={isFundamental && showFundamental ? selectedBarColor : labelColor}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={isFundamental ? '600' : fontWeight}
        >
          {i + 1}
        </text>
      )
    }
  }

  // Grid lines
  const gridLines = []
  for (let i = 0; i <= 4; i++) {
    const y = (i / 4) * chartHeight
    gridLines.push(
      <line
        key={`grid-${i}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={gridColor}
        strokeWidth={1}
        strokeDasharray={i === 0 ? 'none' : '4 4'}
      />
    )
  }

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

      {/* Bars */}
      {bars}

      {/* Hit areas for interaction (on top) */}
      {hitAreas}

      {/* Labels */}
      {labels}
    </svg>
  )
}
