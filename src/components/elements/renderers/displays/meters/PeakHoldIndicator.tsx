// Props-based interface (new)
interface PropsBasedPeakHoldIndicatorProps {
  position: number // 0-1 normalized
  orientation: 'vertical' | 'horizontal'
  style: 'line' | 'bar'
  containerWidth: number
  containerHeight: number
  segmentCount: number
  segmentGap: number
}

// Legacy interface (from KMeterRenderer)
interface LegacyPeakHoldIndicatorProps {
  peakValue: number
  minDb: number
  maxDb: number
  orientation: 'vertical' | 'horizontal'
  width: number
  height: number
  style: 'line' | 'bar'
}

export type PeakHoldIndicatorProps = PropsBasedPeakHoldIndicatorProps | LegacyPeakHoldIndicatorProps

function isLegacy(props: PeakHoldIndicatorProps): props is LegacyPeakHoldIndicatorProps {
  return 'peakValue' in props
}

export function PeakHoldIndicator(props: PeakHoldIndicatorProps) {
  // Normalize props - support both new and legacy interfaces
  const {
    position,
    orientation,
    style,
    containerWidth,
    containerHeight,
    segmentCount,
    segmentGap,
  } = isLegacy(props)
    ? {
        // Convert dB to normalized position (0-1)
        position: Math.max(0, Math.min(1, (props.peakValue - props.minDb) / (props.maxDb - props.minDb))),
        orientation: props.orientation,
        style: props.style,
        containerWidth: props.width,
        containerHeight: props.height,
        segmentCount: 24, // Default segment count for legacy mode
        segmentGap: 1,
      }
    : {
        position: props.position,
        orientation: props.orientation,
        style: props.style,
        containerWidth: props.containerWidth,
        containerHeight: props.containerHeight,
        segmentCount: props.segmentCount,
        segmentGap: props.segmentGap,
      }
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
