import { ArcSliderElementConfig } from '../../../../types/elements'

interface ArcSliderRendererProps {
  config: ArcSliderElementConfig
}

// ============================================================================
// Value Formatting Utility
// ============================================================================

function formatValue(
  value: number,
  min: number,
  max: number,
  format: string,
  suffix: string,
  decimals: number
): string {
  const actual = min + value * (max - min)
  switch (format) {
    case 'percentage':
      return `${Math.round(value * 100)}%`
    case 'db':
      return `${actual.toFixed(decimals)} dB`
    case 'hz':
      return actual >= 1000
        ? `${(actual / 1000).toFixed(decimals)} kHz`
        : `${actual.toFixed(decimals)} Hz`
    case 'custom':
      return `${actual.toFixed(decimals)}${suffix}`
    default:
      return actual.toFixed(decimals)
  }
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
  // Handle arc direction (clockwise from startAngle to endAngle)
  // For arc slider: 135 to 45 means going through 180, 270, 0 (clockwise)
  let sweepAngle = endAngle - startAngle
  if (sweepAngle < 0) {
    sweepAngle += 360
  }

  const start = polarToCartesian(x, y, radius, startAngle)
  const end = polarToCartesian(x, y, radius, endAngle)
  const largeArcFlag = sweepAngle > 180 ? '1' : '0'

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ')
}

export function ArcSliderRenderer({ config }: ArcSliderRendererProps) {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2 - config.thumbRadius

  // Calculate value angle
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Calculate sweep angle (handling wrap-around)
  let sweepAngle = config.endAngle - config.startAngle
  if (sweepAngle < 0) {
    sweepAngle += 360
  }

  // Value angle interpolates from startAngle toward endAngle
  const valueAngle = config.startAngle + normalizedValue * sweepAngle

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = normalizedValue > 0.001
    ? describeArc(centerX, centerY, radius, config.startAngle, valueAngle)
    : ''

  // Thumb position on arc
  const thumbPos = polarToCartesian(centerX, centerY, radius, valueAngle)

  // Format value display
  const formattedValue = formatValue(
    normalizedValue,
    config.min,
    config.max,
    config.valueFormat,
    config.valueSuffix,
    config.valueDecimalPlaces
  )

  // Calculate label/value positioning
  const getLabelStyle = () => {
    const distance = config.labelDistance ?? 4
    const base: React.CSSProperties = {
      position: 'absolute',
      fontSize: `${config.labelFontSize}px`,
      fontFamily: config.labelFontFamily,
      color: config.labelColor,
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }

    switch (config.labelPosition) {
      case 'top':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: `${distance}px` }
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: `${distance}px` }
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: `${distance}px` }
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: `${distance}px` }
    }
  }

  const getValueStyle = () => {
    const distance = config.valueDistance ?? 4
    const base: React.CSSProperties = {
      position: 'absolute',
      fontSize: `${config.valueFontSize}px`,
      fontFamily: config.valueFontFamily,
      color: config.valueColor,
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }

    switch (config.valuePosition) {
      case 'top':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: `${distance}px` }
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: `${distance}px` }
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: `${distance}px` }
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: `${distance}px` }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Label */}
      {config.showLabel && (
        <span style={getLabelStyle()}>
          {config.labelText}
        </span>
      )}

      {/* Value Display */}
      {config.showValue && (
        <span style={getValueStyle()}>
          {formattedValue}
        </span>
      )}

      {/* Arc Slider SVG */}
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
        {valuePath && (
          <path
            d={valuePath}
            fill="none"
            stroke={config.fillColor}
            strokeWidth={config.trackWidth}
            strokeLinecap="round"
          />
        )}

        {/* Circular thumb at current position */}
        <circle
          cx={thumbPos.x}
          cy={thumbPos.y}
          r={config.thumbRadius}
          fill={config.thumbColor}
        />
      </svg>
    </div>
  )
}
