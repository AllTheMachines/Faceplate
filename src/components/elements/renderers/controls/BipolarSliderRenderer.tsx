import { BipolarSliderElementConfig } from '../../../../types/elements'

interface BipolarSliderRendererProps {
  config: BipolarSliderElementConfig
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

export function BipolarSliderRenderer({ config }: BipolarSliderRendererProps) {
  // Calculate normalized value (0 to 1)
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Track width
  const trackWidth = 6

  // Center position (normalized 0-1)
  const centerValue = config.centerValue

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
    const base: React.CSSProperties = {
      position: 'absolute',
      fontSize: `${config.labelFontSize}px`,
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

  const getValueStyle = () => {
    const base: React.CSSProperties = {
      position: 'absolute',
      fontSize: `${config.valueFontSize}px`,
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

  if (config.orientation === 'vertical') {
    // Vertical slider: 0 = bottom, 1 = top
    const thumbY = config.height - normalizedValue * (config.height - config.thumbHeight)
    const centerY = config.height - centerValue * config.height

    // Calculate fill from center to value
    let fillY: number
    let fillHeight: number
    if (normalizedValue >= centerValue) {
      // Value above center: fill from center to value
      fillY = config.height - normalizedValue * config.height
      fillHeight = (normalizedValue - centerValue) * config.height
    } else {
      // Value below center: fill from value to center
      fillY = centerY
      fillHeight = (centerValue - normalizedValue) * config.height
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

        {/* Slider SVG */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${config.width} ${config.height}`}
          focusable="false"
          style={{ overflow: 'visible' }}
        >
          {/* Track background */}
          <rect
            x={(config.width - trackWidth) / 2}
            y={0}
            width={trackWidth}
            height={config.height}
            fill={config.trackColor}
            rx={0}
          />

          {/* Track fill (from center to value position) */}
          <rect
            x={(config.width - trackWidth) / 2}
            y={fillY}
            width={trackWidth}
            height={fillHeight}
            fill={config.trackFillColor}
            rx={0}
          />

          {/* Center line (perpendicular to track) */}
          <line
            x1={0}
            y1={centerY}
            x2={config.width}
            y2={centerY}
            stroke={config.centerLineColor}
            strokeWidth={2}
          />

          {/* Thumb */}
          <rect
            x={(config.width - config.thumbWidth) / 2}
            y={thumbY}
            width={config.thumbWidth}
            height={config.thumbHeight}
            fill={config.thumbColor}
            rx={0}
          />
        </svg>
      </div>
    )
  } else {
    // Horizontal slider: 0 = left, 1 = right
    const thumbX = normalizedValue * (config.width - config.thumbWidth)
    const centerX = centerValue * config.width

    // Calculate fill from center to value
    let fillX: number
    let fillWidth: number
    if (normalizedValue >= centerValue) {
      // Value right of center: fill from center to value
      fillX = centerX
      fillWidth = normalizedValue * config.width - centerX
    } else {
      // Value left of center: fill from value to center
      fillX = normalizedValue * config.width
      fillWidth = centerX - fillX
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

        {/* Slider SVG */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${config.width} ${config.height}`}
          focusable="false"
          style={{ overflow: 'visible' }}
        >
          {/* Track background */}
          <rect
            x={0}
            y={(config.height - trackWidth) / 2}
            width={config.width}
            height={trackWidth}
            fill={config.trackColor}
            rx={0}
          />

          {/* Track fill (from center to value position) */}
          <rect
            x={fillX}
            y={(config.height - trackWidth) / 2}
            width={fillWidth}
            height={trackWidth}
            fill={config.trackFillColor}
            rx={0}
          />

          {/* Center line (perpendicular to track) */}
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={config.height}
            stroke={config.centerLineColor}
            strokeWidth={2}
          />

          {/* Thumb */}
          <rect
            x={thumbX}
            y={(config.height - config.thumbHeight) / 2}
            width={config.thumbWidth}
            height={config.thumbHeight}
            fill={config.thumbColor}
            rx={0}
          />
        </svg>
      </div>
    )
  }
}
