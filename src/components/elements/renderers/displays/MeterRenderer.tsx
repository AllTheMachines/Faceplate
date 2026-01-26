import { MeterElementConfig } from '../../../types/elements'

interface MeterRendererProps {
  config: MeterElementConfig
}

export function MeterRenderer({ config }: MeterRendererProps) {
  // Calculate normalized value (0-1)
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const clampedValue = Math.max(0, Math.min(1, normalizedValue))

  // For vertical meters: fill from bottom to top
  // For horizontal meters: fill from left to right
  const isVertical = config.orientation === 'vertical'

  // Generate unique gradient ID to avoid conflicts with multiple meters
  const gradientId = `meter-gradient-${config.id}`

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${config.width} ${config.height}`}
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={isVertical ? '0' : '0'}
          y1={isVertical ? '1' : '0'}
          x2={isVertical ? '0' : '1'}
          y2={isVertical ? '0' : '0'}
        >
          {config.colorStops.map((stop, i) => (
            <stop key={i} offset={`${stop.position * 100}%`} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>

      {/* Background */}
      <rect
        x={0}
        y={0}
        width={config.width}
        height={config.height}
        fill={config.backgroundColor}
        rx={0}
      />

      {/* Fill based on value */}
      {clampedValue > 0 && (
        <rect
          x={isVertical ? 1 : 1}
          y={isVertical ? config.height * (1 - clampedValue) : 1}
          width={isVertical ? config.width - 2 : (config.width - 2) * clampedValue}
          height={isVertical ? config.height * clampedValue - 1 : config.height - 2}
          fill={`url(#${gradientId})`}
          rx={0}
        />
      )}

      {/* Peak hold indicator (simplified - using value position for now) */}
      {config.showPeakHold && clampedValue > 0 && (
        <rect
          x={isVertical ? 1 : (config.width - 2) * clampedValue}
          y={isVertical ? config.height * (1 - clampedValue) : 1}
          width={isVertical ? config.width - 2 : 2}
          height={isVertical ? 2 : config.height - 2}
          fill={config.colorStops[config.colorStops.length - 1]?.color || '#ef4444'}
        />
      )}
    </svg>
  )
}
