import { SliderElementConfig } from '../../../../types/elements'

interface SliderRendererProps {
  config: SliderElementConfig
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

export function SliderRenderer({ config }: SliderRendererProps) {
  // Calculate normalized value (0 to 1)
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Track width from config (defaults to 6 if not set)
  const trackWidth = config.trackWidth ?? 6

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

  const getValueStyle = () => {
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

  if (config.orientation === 'vertical') {
    // Vertical slider: 0 = bottom, 1 = top
    // Thumb position (inverted: 0 at bottom)
    const thumbY = config.height - normalizedValue * (config.height - config.thumbHeight)
    const fillHeight = normalizedValue * config.height

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

          {/* Track fill (from bottom to value position) */}
          <rect
            x={(config.width - trackWidth) / 2}
            y={config.height - fillHeight}
            width={trackWidth}
            height={fillHeight}
            fill={config.trackFillColor}
            rx={0}
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
    const fillWidth = normalizedValue * config.width

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

          {/* Track fill (from left to value position) */}
          <rect
            x={0}
            y={(config.height - trackWidth) / 2}
            width={fillWidth}
            height={trackWidth}
            fill={config.trackFillColor}
            rx={0}
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
