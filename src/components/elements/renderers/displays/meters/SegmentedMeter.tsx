import React from 'react'
import { getSegmentColor, calculateLitSegments, ColorZone } from '../../../../../utils/meterUtils'
import { PeakHoldIndicator } from './PeakHoldIndicator'

interface SegmentedMeterProps {
  value: number          // 0-1 normalized
  segmentCount: number   // Number of segments
  orientation: 'vertical' | 'horizontal'
  segmentGap: number     // Gap between segments in px (default 1)
  minDb: number
  maxDb: number
  colorZones: ColorZone[]
  showPeakHold?: boolean
  peakHoldPosition?: number // 0-1 normalized
  peakHoldStyle?: 'line' | 'bar'
  width: number
  height: number
}

export function SegmentedMeter({
  value,
  segmentCount,
  orientation,
  segmentGap = 1,
  minDb,
  maxDb,
  colorZones,
  showPeakHold = false,
  peakHoldPosition,
  peakHoldStyle = 'line',
  width,
  height,
}: SegmentedMeterProps) {
  const litSegments = calculateLitSegments(value, segmentCount)
  const isVertical = orientation === 'vertical'

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: isVertical ? '1fr' : `repeat(${segmentCount}, 1fr)`,
        gridTemplateRows: isVertical ? `repeat(${segmentCount}, 1fr)` : '1fr',
        gap: `${segmentGap}px`,
        width,
        height,
        backgroundColor: '#000000',
      }}
    >
      {Array.from({ length: segmentCount }, (_, i) => {
        // Vertical: fill from bottom (index 0 = top, so reverse for display)
        // Horizontal: fill from left
        const displayIndex = isVertical ? segmentCount - 1 - i : i
        const isLit = isVertical
          ? i >= segmentCount - litSegments
          : i < litSegments

        const color = getSegmentColor(displayIndex, segmentCount, minDb, maxDb, colorZones)

        return (
          <div
            key={i}
            style={{
              backgroundColor: isLit ? color : color,
              opacity: isLit ? 1 : 0.3, // Off segments at 30% brightness per Phase 22
              borderRadius: '1px',
              transition: 'none', // Instant per Phase 21 standard
            }}
          />
        )
      })}

      {showPeakHold && peakHoldPosition !== undefined && (
        <PeakHoldIndicator
          position={peakHoldPosition}
          orientation={orientation}
          style={peakHoldStyle}
          containerWidth={width}
          containerHeight={height}
          segmentCount={segmentCount}
          segmentGap={segmentGap}
        />
      )}
    </div>
  )
}
