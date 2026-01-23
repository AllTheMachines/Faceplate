import { KnobElementConfig } from '../../../types/elements'

interface KnobRendererProps {
  config: KnobElementConfig
}

// ============================================================================
// SVG Arc Utilities
// ============================================================================

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0'

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ')
}

// ============================================================================
// KnobRenderer Component
// ============================================================================

export function KnobRenderer({ config }: KnobRendererProps) {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  // Calculate value angle
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const valueAngle = config.startAngle + normalizedValue * (config.endAngle - config.startAngle)

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = describeArc(centerX, centerY, radius, config.startAngle, valueAngle)

  // For indicator rendering
  const indicatorAngle = valueAngle
  const indicatorStart = polarToCartesian(centerX, centerY, radius * 0.4, indicatorAngle)
  const indicatorEnd = polarToCartesian(centerX, centerY, radius * 0.9, indicatorAngle)

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${config.diameter} ${config.diameter}`}
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      {/* Background track arc */}
      <path
        d={trackPath}
        fill="none"
        stroke={config.trackColor}
        strokeWidth={config.trackWidth}
        strokeLinecap="round"
      />

      {/* Value fill arc (only render if value > min) */}
      {config.value > config.min && (
        <path
          d={valuePath}
          fill="none"
          stroke={config.fillColor}
          strokeWidth={config.trackWidth}
          strokeLinecap="round"
        />
      )}

      {/* Indicator based on style */}
      {config.style === 'line' && (
        <line
          x1={indicatorStart.x}
          y1={indicatorStart.y}
          x2={indicatorEnd.x}
          y2={indicatorEnd.y}
          stroke={config.indicatorColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}

      {config.style === 'dot' && (
        <circle
          cx={indicatorEnd.x}
          cy={indicatorEnd.y}
          r={config.trackWidth / 2}
          fill={config.indicatorColor}
        />
      )}

      {/* 'arc' and 'filled' styles don't need additional indicator */}
    </svg>
  )
}
