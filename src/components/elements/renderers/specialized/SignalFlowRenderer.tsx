import React, { useCallback } from 'react'
import { SignalFlowElementConfig, SignalFlowBlock, SignalFlowConnection } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface SignalFlowRendererProps {
  config: SignalFlowElementConfig
}

export function SignalFlowRenderer({ config }: SignalFlowRendererProps) {
  const updateElement = useStore((state) => state.updateElement)

  const {
    gridCellSize,
    blocks,
    connections,
    showGrid,
    showLabels,
    inputBlockColor,
    outputBlockColor,
    processBlockColor,
    mixerBlockColor,
    splitterBlockColor,
    connectionColor,
    backgroundColor,
    gridColor,
    labelColor,
    blockBorderWidth,
    connectionWidth,
    fontSize,
    fontFamily,
    fontWeight,
    selectedBlock,
    width,
    height,
  } = config

  // Get block color by type
  const getBlockColor = (type: SignalFlowBlock['type'], customColor?: string) => {
    if (customColor) return customColor
    switch (type) {
      case 'input':
        return inputBlockColor
      case 'output':
        return outputBlockColor
      case 'process':
        return processBlockColor
      case 'mixer':
        return mixerBlockColor
      case 'splitter':
        return splitterBlockColor
      default:
        return processBlockColor
    }
  }

  // Get block position in pixels
  const getBlockRect = (block: SignalFlowBlock) => ({
    x: block.x * gridCellSize,
    y: block.y * gridCellSize,
    width: block.width * gridCellSize,
    height: block.height * gridCellSize,
  })

  // Get port position on block
  const getPortPosition = (block: SignalFlowBlock, port: 'left' | 'right' | 'top' | 'bottom') => {
    const rect = getBlockRect(block)
    switch (port) {
      case 'left':
        return { x: rect.x, y: rect.y + rect.height / 2 }
      case 'right':
        return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
      case 'top':
        return { x: rect.x + rect.width / 2, y: rect.y }
      case 'bottom':
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
    }
  }

  // Generate connection path
  const getConnectionPath = (conn: SignalFlowConnection) => {
    const fromBlock = blocks.find((b) => b.id === conn.fromBlockId)
    const toBlock = blocks.find((b) => b.id === conn.toBlockId)
    if (!fromBlock || !toBlock) return ''

    const from = getPortPosition(fromBlock, conn.fromPort)
    const to = getPortPosition(toBlock, conn.toPort)

    // Create smooth path with curves
    const dx = to.x - from.x
    const dy = to.y - from.y
    const midX = from.x + dx / 2
    const midY = from.y + dy / 2

    // Determine control points based on direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Mostly horizontal
      return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`
    } else {
      // Mostly vertical
      return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`
    }
  }

  // Handle block click
  const handleBlockClick = useCallback((blockId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateElement(config.id, {
      selectedBlock: selectedBlock === blockId ? null : blockId,
    })
  }, [config.id, selectedBlock, updateElement])

  // Grid lines
  const gridLines = []
  if (showGrid) {
    for (let x = 0; x <= width; x += gridCellSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={gridColor}
          strokeWidth={1}
          opacity={0.3}
        />
      )
    }
    for (let y = 0; y <= height; y += gridCellSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={gridColor}
          strokeWidth={1}
          opacity={0.3}
        />
      )
    }
  }

  // Render arrow marker
  const arrowMarkerId = `arrow-${config.id}`

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor }}
    >
      <defs>
        {/* Arrow marker for connections */}
        <marker
          id={arrowMarkerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={connectionColor} />
        </marker>
      </defs>

      {/* Grid */}
      {gridLines}

      {/* Connections (behind blocks) */}
      {connections.map((conn) => (
        <path
          key={conn.id}
          d={getConnectionPath(conn)}
          fill="none"
          stroke={connectionColor}
          strokeWidth={connectionWidth}
          markerEnd={`url(#${arrowMarkerId})`}
        />
      ))}

      {/* Blocks */}
      {blocks.map((block) => {
        const rect = getBlockRect(block)
        const color = getBlockColor(block.type, block.color)
        const isSelected = selectedBlock === block.id

        return (
          <g key={block.id}>
            {/* Block background */}
            <rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={backgroundColor}
              stroke={color}
              strokeWidth={isSelected ? blockBorderWidth + 2 : blockBorderWidth}
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleBlockClick(block.id, e)}
            />

            {/* Block type indicator */}
            <rect
              x={rect.x}
              y={rect.y}
              width={4}
              height={rect.height}
              fill={color}
            />

            {/* Block label */}
            {showLabels && (
              <text
                x={rect.x + rect.width / 2}
                y={rect.y + rect.height / 2 + fontSize / 3}
                textAnchor="middle"
                fill={labelColor}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
              >
                {block.label}
              </text>
            )}

            {/* Connection ports */}
            {['left', 'right', 'top', 'bottom'].map((port) => {
              const pos = getPortPosition(block, port as 'left' | 'right' | 'top' | 'bottom')
              // Check if this port is used
              const isUsed = connections.some(
                (c) =>
                  (c.fromBlockId === block.id && c.fromPort === port) ||
                  (c.toBlockId === block.id && c.toPort === port)
              )
              if (!isUsed && port !== 'left' && port !== 'right') return null

              return (
                <circle
                  key={port}
                  cx={pos.x}
                  cy={pos.y}
                  r={4}
                  fill={isUsed ? color : gridColor}
                />
              )
            })}
          </g>
        )
      })}

      {/* Type legend */}
      <g transform={`translate(8, ${height - 20})`}>
        {[
          { type: 'input', color: inputBlockColor, label: 'In' },
          { type: 'process', color: processBlockColor, label: 'Proc' },
          { type: 'output', color: outputBlockColor, label: 'Out' },
        ].map((item, i) => (
          <g key={item.type} transform={`translate(${i * 50}, 0)`}>
            <rect x={0} y={0} width={12} height={12} fill={item.color} />
            <text
              x={16}
              y={10}
              fill={labelColor}
              fontSize={fontSize - 2}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
            >
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
