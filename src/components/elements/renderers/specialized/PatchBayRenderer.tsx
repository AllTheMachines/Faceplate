import React, { useRef, useCallback, useEffect, useState } from 'react'
import { PatchBayElementConfig, PatchCable, PatchPoint } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface PatchBayRendererProps {
  config: PatchBayElementConfig
}

export function PatchBayRenderer({ config }: PatchBayRendererProps) {
  const updateElement = useStore((state) => state.updateElement)
  const containerRef = useRef<SVGSVGElement>(null)
  const [dragState, setDragState] = useState<{
    fromPoint: PatchPoint | null
    currentX: number
    currentY: number
  }>({ fromPoint: null, currentX: 0, currentY: 0 })

  const {
    points,
    cables,
    showLabels,
    showGrid,
    inputColor,
    outputColor,
    cableColors,
    backgroundColor,
    gridColor,
    labelColor,
    pointSize,
    cableWidth,
    fontSize,
    fontFamily,
    fontWeight,
    selectedCable,
    width,
    height,
  } = config

  // Get point position in pixels
  const getPointPosition = (point: PatchPoint) => ({
    x: point.x * width,
    y: point.y * height,
  })

  // Generate cable path (curved)
  const getCablePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x
    const controlOffset = Math.abs(dx) * 0.5
    return `M ${from.x} ${from.y} C ${from.x + controlOffset} ${from.y}, ${to.x - controlOffset} ${to.y}, ${to.x} ${to.y}`
  }

  // Handle point click to start cable
  const handlePointMouseDown = useCallback((point: PatchPoint, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setDragState({
      fromPoint: point,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    })
  }, [])

  // Handle point click to complete cable
  const handlePointClick = useCallback((point: PatchPoint) => {
    if (dragState.fromPoint && dragState.fromPoint.id !== point.id) {
      // Only connect output to input
      const from = dragState.fromPoint.type === 'output' ? dragState.fromPoint : point
      const to = dragState.fromPoint.type === 'output' ? point : dragState.fromPoint

      if (from.type === 'output' && to.type === 'input') {
        // Check if connection already exists
        const exists = cables.some(
          (c) => c.fromPointId === from.id && c.toPointId === to.id
        )

        if (!exists) {
          const newCable: PatchCable = {
            id: crypto.randomUUID(),
            fromPointId: from.id,
            toPointId: to.id,
            color: cableColors[cables.length % cableColors.length],
          }
          updateElement(config.id, { cables: [...cables, newCable] })
        }
      }
    }
    setDragState({ fromPoint: null, currentX: 0, currentY: 0 })
  }, [config.id, cables, cableColors, dragState.fromPoint, updateElement])

  // Handle cable click to select/delete
  const handleCableClick = useCallback((cable: PatchCable, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedCable === cable.id) {
      // Delete cable on second click
      updateElement(config.id, {
        cables: cables.filter((c) => c.id !== cable.id),
        selectedCable: null,
      })
    } else {
      updateElement(config.id, { selectedCable: cable.id })
    }
  }, [config.id, cables, selectedCable, updateElement])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.fromPoint && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDragState((prev) => ({
          ...prev,
          currentX: e.clientX - rect.left,
          currentY: e.clientY - rect.top,
        }))
      }
    }

    const handleMouseUp = () => {
      setDragState({ fromPoint: null, currentX: 0, currentY: 0 })
    }

    if (dragState.fromPoint) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState.fromPoint])

  // Grid lines
  const gridLines = []
  if (showGrid) {
    const gridSpacing = 40
    for (let x = gridSpacing; x < width; x += gridSpacing) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )
    }
    for (let y = gridSpacing; y < height; y += gridSpacing) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )
    }
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

      {/* Cables */}
      {cables.map((cable) => {
        const fromPoint = points.find((p) => p.id === cable.fromPointId)
        const toPoint = points.find((p) => p.id === cable.toPointId)
        if (!fromPoint || !toPoint) return null

        const from = getPointPosition(fromPoint)
        const to = getPointPosition(toPoint)
        const isSelected = selectedCable === cable.id

        return (
          <g key={cable.id}>
            {/* Cable hit area */}
            <path
              d={getCablePath(from, to)}
              fill="none"
              stroke="transparent"
              strokeWidth={cableWidth + 8}
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleCableClick(cable, e)}
            />
            {/* Cable */}
            <path
              d={getCablePath(from, to)}
              fill="none"
              stroke={cable.color}
              strokeWidth={isSelected ? cableWidth + 2 : cableWidth}
              strokeLinecap="round"
              opacity={isSelected ? 1 : 0.8}
            />
          </g>
        )
      })}

      {/* Dragging cable preview */}
      {dragState.fromPoint && (
        <path
          d={getCablePath(
            getPointPosition(dragState.fromPoint),
            { x: dragState.currentX, y: dragState.currentY }
          )}
          fill="none"
          stroke={cableColors[cables.length % cableColors.length]}
          strokeWidth={cableWidth}
          strokeLinecap="round"
          strokeDasharray="8 4"
          opacity={0.6}
        />
      )}

      {/* Points */}
      {points.map((point) => {
        const pos = getPointPosition(point)
        const isOutput = point.type === 'output'
        const color = isOutput ? outputColor : inputColor
        const isHighlighted = dragState.fromPoint?.id === point.id

        return (
          <g key={point.id}>
            {/* Point hit area */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={pointSize + 4}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => handlePointMouseDown(point, e)}
              onClick={() => handlePointClick(point)}
            />
            {/* Point visual */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={pointSize / 2}
              fill={backgroundColor}
              stroke={color}
              strokeWidth={isHighlighted ? 3 : 2}
            />
            {/* Inner indicator */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={pointSize / 4}
              fill={color}
            />
            {/* Label */}
            {showLabels && (
              <text
                x={pos.x + (isOutput ? -pointSize - 4 : pointSize + 4)}
                y={pos.y + 4}
                textAnchor={isOutput ? 'end' : 'start'}
                fill={labelColor}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
              >
                {point.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Instructions */}
      <text
        x={width / 2}
        y={height - 8}
        textAnchor="middle"
        fill={labelColor}
        fontSize={fontSize - 1}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        opacity={0.6}
      >
        Drag from output to input to connect
      </text>
    </svg>
  )
}
