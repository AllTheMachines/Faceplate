import React, { useRef, useCallback, useEffect } from 'react'
import { XYPadElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface XYPadRendererProps {
  config: XYPadElementConfig
}

export function XYPadRenderer({ config }: XYPadRendererProps) {
  const updateElement = useStore((state) => state.updateElement)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const {
    xValue,
    yValue,
    xLabel,
    yLabel,
    showLabels,
    showGrid,
    gridDivisions,
    gridColor,
    cursorSize,
    cursorColor,
    showCrosshair,
    crosshairColor,
    backgroundColor,
    borderColor,
    fontSize,
    fontFamily,
    fontWeight,
    labelColor,
    width,
    height,
  } = config

  // Cursor position (Y is inverted: 0 at bottom, 1 at top)
  const cursorX = xValue * width
  const cursorY = (1 - yValue) * height

  // Calculate position from mouse event
  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))

    updateElement(config.id, { xValue: x, yValue: y })
  }, [config.id, updateElement])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    isDraggingRef.current = true
    updatePosition(e.clientX, e.clientY)
  }, [updatePosition])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        updatePosition(e.clientX, e.clientY)
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [updatePosition])

  // Grid lines
  const gridLines = []
  if (showGrid) {
    for (let i = 1; i < gridDivisions; i++) {
      const pos = (i / gridDivisions) * width
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={pos}
          y1={0}
          x2={pos}
          y2={height}
          stroke={gridColor}
          strokeWidth={1}
        />
      )
    }
    for (let i = 1; i < gridDivisions; i++) {
      const pos = (i / gridDivisions) * height
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={pos}
          x2={width}
          y2={pos}
          stroke={gridColor}
          strokeWidth={1}
        />
      )
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor,
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        cursor: 'crosshair',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {/* Grid */}
        {gridLines}

        {/* Crosshair */}
        {showCrosshair && (
          <>
            <line
              x1={cursorX}
              y1={0}
              x2={cursorX}
              y2={height}
              stroke={crosshairColor}
              strokeWidth={1}
            />
            <line
              x1={0}
              y1={cursorY}
              x2={width}
              y2={cursorY}
              stroke={crosshairColor}
              strokeWidth={1}
            />
          </>
        )}

        {/* Cursor */}
        <circle
          cx={cursorX}
          cy={cursorY}
          r={cursorSize / 2}
          fill={cursorColor}
          stroke="#fff"
          strokeWidth={2}
        />
      </svg>

      {/* Labels */}
      {showLabels && (
        <>
          <span
            style={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize,
              fontFamily,
              fontWeight,
              color: labelColor,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {xLabel}
          </span>
          <span
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              fontSize,
              fontFamily,
              fontWeight,
              color: labelColor,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {yLabel}
          </span>
        </>
      )}
    </div>
  )
}
