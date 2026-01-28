import { CenterDetentKnobElementConfig } from '../../../../types/elements'

interface CenterDetentKnobRendererProps {
  config: CenterDetentKnobElementConfig
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
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0'

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ')
}

// ============================================================================
// Label/Value Style Helpers
// ============================================================================

function getLabelStyle(config: CenterDetentKnobElementConfig): React.CSSProperties {
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
      return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px' }
    case 'bottom':
      return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px' }
    case 'left':
      return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '4px' }
    case 'right':
      return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '4px' }
  }
}

function getValueStyle(config: CenterDetentKnobElementConfig): React.CSSProperties {
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
      return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px' }
    case 'bottom':
      return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px' }
    case 'left':
      return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '4px' }
    case 'right':
      return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '4px' }
  }
}

// ============================================================================
// Center Detent Knob Renderer
// ============================================================================

export function CenterDetentKnobRenderer({ config }: CenterDetentKnobRendererProps) {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  // Calculate normalized value
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Check if value is at center (within snap threshold)
  const isAtCenter = Math.abs(normalizedValue - 0.5) < config.snapThreshold

  // Value angle calculation
  const valueAngle = config.startAngle + normalizedValue * (config.endAngle - config.startAngle)
  const centerAngle = config.startAngle + 0.5 * (config.endAngle - config.startAngle)

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)

  // For bipolar fill: fill from center to current value
  const fillStartAngle = normalizedValue < 0.5 ? valueAngle : centerAngle
  const fillEndAngle = normalizedValue < 0.5 ? centerAngle : valueAngle
  const valuePath = describeArc(centerX, centerY, radius, fillStartAngle, fillEndAngle)

  // Center mark position
  const centerMarkOuter = polarToCartesian(centerX, centerY, radius + config.trackWidth / 2 + 2, centerAngle)
  const centerMarkInner = polarToCartesian(centerX, centerY, radius - config.trackWidth / 2 - 2, centerAngle)

  // For indicator rendering
  const indicatorStart = polarToCartesian(centerX, centerY, radius * 0.4, valueAngle)
  const indicatorEnd = polarToCartesian(centerX, centerY, radius * 0.9, valueAngle)

  // Format value display
  const formattedValue = formatValue(
    normalizedValue,
    config.min,
    config.max,
    config.valueFormat,
    config.valueSuffix,
    config.valueDecimalPlaces
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Label */}
      {config.showLabel && (
        <span style={getLabelStyle(config)}>
          {config.labelText}
        </span>
      )}

      {/* Value Display */}
      {config.showValue && (
        <span style={getValueStyle(config)}>
          {formattedValue}
        </span>
      )}

      {/* Knob SVG */}
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

        {/* Value fill arc (bipolar from center) */}
        {!isAtCenter && (
          <path
            d={valuePath}
            fill="none"
            stroke={config.fillColor}
            strokeWidth={config.trackWidth}
            strokeLinecap="round"
          />
        )}

        {/* Center mark */}
        {config.showCenterMark && (
          <line
            x1={centerMarkOuter.x}
            y1={centerMarkOuter.y}
            x2={centerMarkInner.x}
            y2={centerMarkInner.y}
            stroke={isAtCenter ? config.indicatorColor : config.trackColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        {/* Indicator line */}
        <line
          x1={indicatorStart.x}
          y1={indicatorStart.y}
          x2={indicatorEnd.x}
          y2={indicatorEnd.y}
          stroke={config.indicatorColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
