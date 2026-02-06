import { getSegmentColor, calculateLitSegments, ColorZone, defaultColorZones } from '../../../../../utils/meterUtils'
import { PeakHoldIndicator } from './PeakHoldIndicator'

// Config-based interface (from meter element configs)
interface MeterConfig {
  value: number
  segmentCount?: number
  orientation: 'vertical' | 'horizontal'
  segmentGap?: number
  minDb: number
  maxDb: number
  colorZones?: ColorZone[]
  showPeakHold?: boolean
  peakHoldStyle?: 'line' | 'bar'
}

// Props-based interface
interface PropsBasedSegmentedMeterProps {
  value: number
  segmentCount: number
  orientation: 'vertical' | 'horizontal'
  segmentGap?: number
  minDb: number
  maxDb: number
  colorZones: ColorZone[]
  showPeakHold?: boolean
  peakHoldPosition?: number
  peakHoldStyle?: 'line' | 'bar'
  width: number
  height: number
}

// Config-based interface (accepts config object from KMeterRenderer etc.)
interface ConfigBasedSegmentedMeterProps {
  config: MeterConfig
  width: number
  height: number
}

export type SegmentedMeterProps = PropsBasedSegmentedMeterProps | ConfigBasedSegmentedMeterProps

function isConfigBased(props: SegmentedMeterProps): props is ConfigBasedSegmentedMeterProps {
  return 'config' in props
}

export function SegmentedMeter(props: SegmentedMeterProps) {
  // Normalize props - support both config-based and individual props
  const {
    value,
    segmentCount,
    orientation,
    segmentGap,
    minDb,
    maxDb,
    colorZones,
    showPeakHold,
    peakHoldPosition,
    peakHoldStyle,
    width,
    height,
  } = isConfigBased(props)
    ? {
        value: props.config.value,
        segmentCount: props.config.segmentCount ?? 24,
        orientation: props.config.orientation,
        segmentGap: props.config.segmentGap ?? 1,
        minDb: props.config.minDb,
        maxDb: props.config.maxDb,
        colorZones: props.config.colorZones ?? defaultColorZones,
        showPeakHold: props.config.showPeakHold ?? false,
        peakHoldPosition: props.config.value, // Use value as peak position for config mode
        peakHoldStyle: props.config.peakHoldStyle ?? 'line',
        width: props.width,
        height: props.height,
      }
    : {
        value: props.value,
        segmentCount: props.segmentCount,
        orientation: props.orientation,
        segmentGap: props.segmentGap ?? 1,
        minDb: props.minDb,
        maxDb: props.maxDb,
        colorZones: props.colorZones,
        showPeakHold: props.showPeakHold ?? false,
        peakHoldPosition: props.peakHoldPosition,
        peakHoldStyle: props.peakHoldStyle ?? 'line',
        width: props.width,
        height: props.height,
      }
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
