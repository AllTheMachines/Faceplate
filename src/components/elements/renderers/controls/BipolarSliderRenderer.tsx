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

  // Center position (normalized 0-1)
  const centerValue = config.centerValue

  // Determine fill color based on value position relative to center
  const fillColor = normalizedValue >= centerValue
    ? (config.positiveFillColor ?? config.trackFillColor)
    : (config.negativeFillColor ?? config.trackFillColor)

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
  const getLabelStyle = (): React.CSSProperties => {
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
      default:
        return base
    }
  }

  const getValueStyle = (): React.CSSProperties => {
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
      default:
        return base
    }
  }

  const isVertical = config.orientation === 'vertical'

  // Calculate fill position (CSS-based approach using percentages)
  const fillStart = Math.min(centerValue, normalizedValue) * 100
  const fillEnd = Math.max(centerValue, normalizedValue) * 100
  const fillSize = fillEnd - fillStart

  // Common styles
  const trackStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 6,
        transform: 'translateX(-50%)',
        backgroundColor: config.trackColor,
        borderRadius: 0,
      }
    : {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 6,
        transform: 'translateY(-50%)',
        backgroundColor: config.trackColor,
        borderRadius: 0,
      }

  const fillStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: '50%',
        bottom: `${fillStart}%`,
        width: 6,
        height: `${fillSize}%`,
        transform: 'translateX(-50%)',
        backgroundColor: fillColor,
        borderRadius: 0,
      }
    : {
        position: 'absolute',
        top: '50%',
        left: `${fillStart}%`,
        height: 6,
        width: `${fillSize}%`,
        transform: 'translateY(-50%)',
        backgroundColor: fillColor,
        borderRadius: 0,
      }

  const centerMarkStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: '50%',
        bottom: `${centerValue * 100}%`,
        width: 16,
        height: 3,
        transform: 'translate(-50%, 50%)',
        backgroundColor: config.centerLineColor,
        pointerEvents: 'none',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: `${centerValue * 100}%`,
        width: 3,
        height: 16,
        transform: 'translate(-50%, -50%)',
        backgroundColor: config.centerLineColor,
        pointerEvents: 'none',
      }

  const thumbStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: '50%',
        bottom: `${normalizedValue * 100}%`,
        width: config.thumbWidth,
        height: config.thumbHeight,
        transform: 'translate(-50%, 50%)',
        backgroundColor: config.thumbColor,
        borderRadius: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: `${normalizedValue * 100}%`,
        width: config.thumbWidth,
        height: config.thumbHeight,
        transform: 'translate(-50%, -50%)',
        backgroundColor: config.thumbColor,
        borderRadius: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
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

      {/* Track */}
      <div style={trackStyle} />

      {/* Fill */}
      <div style={fillStyle} />

      {/* Center Mark */}
      <div style={centerMarkStyle} />

      {/* Thumb */}
      <div style={thumbStyle} />
    </div>
  )
}
