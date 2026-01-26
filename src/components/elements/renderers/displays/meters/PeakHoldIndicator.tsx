import React from 'react'

interface PeakHoldIndicatorProps {
  position: number // 0-1 normalized
  orientation: 'vertical' | 'horizontal'
  style: 'line' | 'bar'
  containerWidth: number
  containerHeight: number
  segmentCount: number
  segmentGap: number
}

export function PeakHoldIndicator({
  position,
  orientation,
  style,
  containerWidth,
  containerHeight,
  segmentCount,
  segmentGap,
}: PeakHoldIndicatorProps) {
  const isVertical = orientation === 'vertical'

  // Calculate segment size accounting for gaps
  const totalGaps = (segmentCount - 1) * segmentGap
  const segmentSize = isVertical
    ? (containerHeight - totalGaps) / segmentCount
    : (containerWidth - totalGaps) / segmentCount

  // Convert position to pixel offset
  const segmentIndex = Math.round(position * (segmentCount - 1))
  const offset = segmentIndex * (segmentSize + segmentGap)

  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: '#ffffff',
    transition: 'none',
    ...(isVertical
      ? {
          left: 0,
          right: 0,
          bottom: offset,
          height: style === 'line' ? '2px' : `${segmentSize}px`,
        }
      : {
          top: 0,
          bottom: 0,
          left: offset,
          width: style === 'line' ? '2px' : `${segmentSize}px`,
        }),
  }

  return <div style={lineStyle} />
}
