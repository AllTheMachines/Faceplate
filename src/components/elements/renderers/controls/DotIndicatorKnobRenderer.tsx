import { DotIndicatorKnobElementConfig } from '../../../../types/elements'

interface DotIndicatorKnobRendererProps {
  config: DotIndicatorKnobElementConfig
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

function getLabelStyle(config: DotIndicatorKnobElementConfig): React.CSSProperties {
  const distance = config.labelDistance ?? 4
  const base: React.CSSProperties = {
    position: 'absolute',
    fontSize: `${config.labelFontSize}px`,
    fontFamily: config.labelFontFamily,
    fontWeight: config.labelFontWeight,
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

function getValueStyle(config: DotIndicatorKnobElementConfig): React.CSSProperties {
  const distance = config.valueDistance ?? 4
  const base: React.CSSProperties = {
    position: 'absolute',
    fontSize: `${config.valueFontSize}px`,
    fontFamily: config.valueFontFamily,
    fontWeight: config.valueFontWeight,
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

// ============================================================================
// Dot Indicator Knob Renderer
// ============================================================================

export function DotIndicatorKnobRenderer({ config }: DotIndicatorKnobRendererProps) {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  // Calculate value angle
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const valueAngle = config.startAngle + normalizedValue * (config.endAngle - config.startAngle)

  // Generate track arc path
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)

  // Dot indicator position (on the arc)
  const dotPos = polarToCartesian(centerX, centerY, radius, valueAngle)

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
        {/* Background track arc - no fill, just the track */}
        <path
          d={trackPath}
          fill="none"
          stroke={config.trackColor}
          strokeWidth={config.trackWidth}
          strokeLinecap="round"
        />

        {/* Dot indicator on the arc */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r={config.dotRadius}
          fill={config.indicatorColor}
        />
      </svg>
    </div>
  )
}
