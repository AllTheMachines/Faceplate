import React from 'react'
import { generateTickPositions, dbToNormalized } from '../../../../../utils/meterUtils'

interface MeterScaleProps {
  minDb: number
  maxDb: number
  orientation: 'vertical' | 'horizontal'
  position: 'inside' | 'outside'
  showMajorTicks: boolean
  showMinorTicks: boolean
  width: number
  height: number
  majorInterval?: number
  minorInterval?: number
}

export function MeterScale({
  minDb,
  maxDb,
  orientation,
  position,
  showMajorTicks,
  showMinorTicks,
  width,
  height,
  majorInterval = 6,
  minorInterval = 3,
}: MeterScaleProps) {
  const { major, minor } = generateTickPositions(minDb, maxDb, majorInterval, minorInterval)
  const isVertical = orientation === 'vertical'
  const isInside = position === 'inside'

  // Scale dimensions based on position
  const scaleWidth = isVertical ? (isInside ? width : 30) : width
  const scaleHeight = isVertical ? height : (isInside ? height : 20)

  const renderTick = (db: number, isMajor: boolean) => {
    const normalized = dbToNormalized(db, minDb, maxDb)
    const tickLength = isMajor ? 8 : 4
    const strokeWidth = isMajor ? 2 : 1
    const color = isMajor ? '#ffffff' : '#999999'

    if (isVertical) {
      // Vertical: ticks go from bottom (0) to top (1)
      const y = height * (1 - normalized)
      const x1 = isInside ? 0 : scaleWidth - tickLength
      const x2 = isInside ? tickLength : scaleWidth

      return (
        <g key={db}>
          <line
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {isMajor && (
            <text
              x={isInside ? tickLength + 4 : x1 - 4}
              y={y + 4}
              fill="#ffffff"
              fontSize={10}
              textAnchor={isInside ? 'start' : 'end'}
            >
              {db > 0 ? `+${db}` : db}
            </text>
          )}
        </g>
      )
    } else {
      // Horizontal: ticks go from left (0) to right (1)
      const x = width * normalized
      const y1 = isInside ? 0 : scaleHeight - tickLength
      const y2 = isInside ? tickLength : scaleHeight

      return (
        <g key={db}>
          <line
            x1={x}
            y1={y1}
            x2={x}
            y2={y2}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {isMajor && (
            <text
              x={x}
              y={isInside ? tickLength + 12 : y1 - 4}
              fill="#ffffff"
              fontSize={10}
              textAnchor="middle"
            >
              {db > 0 ? `+${db}` : db}
            </text>
          )}
        </g>
      )
    }
  }

  return (
    <svg
      width={scaleWidth}
      height={scaleHeight}
      style={{ overflow: 'visible' }}
    >
      {showMajorTicks && major.map(db => renderTick(db, true))}
      {showMinorTicks && minor.map(db => renderTick(db, false))}
    </svg>
  )
}
