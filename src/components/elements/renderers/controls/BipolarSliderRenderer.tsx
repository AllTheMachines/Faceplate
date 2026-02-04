import { useMemo } from 'react'
import { BipolarSliderElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

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

// ============================================================================
// Default CSS Bipolar Slider (existing implementation)
// ============================================================================

function DefaultBipolarSliderRenderer({ config }: BipolarSliderRendererProps) {
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

// ============================================================================
// Label/Value Style Helpers
// ============================================================================

function getLabelStyle(config: BipolarSliderElementConfig): React.CSSProperties {
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

function getValueStyle(config: BipolarSliderElementConfig): React.CSSProperties {
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
// Styled SVG Bipolar Slider (new implementation)
// ============================================================================

function StyledBipolarSliderRenderer({ config }: BipolarSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be linear
  if (style && style.category !== 'linear') {
    console.warn('BipolarSlider requires linear category style')
    return null
  }

  // Calculate normalized value (0 to 1)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Center position (normalized 0-1, user-configurable)
  const centerValue = config.centerValue

  // Determine fill color based on value position relative to center
  const fillColor = normalizedValue >= centerValue
    ? (config.positiveFillColor ?? config.trackFillColor)
    : (config.negativeFillColor ?? config.trackFillColor)

  // Memoize SVG content with color overrides
  // Note: We apply fill color override dynamically based on value position
  const svgContent = useMemo(() => {
    if (!style) return ''
    // Build color overrides, adding the dynamic fill color
    const overrides = {
      ...config.colorOverrides,
      fill: config.colorOverrides?.fill || fillColor,
    }
    return applyAllColorOverrides(style.svgContent, style.layers, overrides)
  }, [style, config.colorOverrides, fillColor])

  // Extract layers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      thumb: style.layers.thumb ? extractElementLayer(svgContent, style.layers.thumb) : null,
    }
  }, [style, svgContent])

  // Format value display
  const formattedValue = formatValue(
    normalizedValue,
    config.min,
    config.max,
    config.valueFormat,
    config.valueSuffix,
    config.valueDecimalPlaces
  )

  // Style not found fallback
  if (!style) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#374151', borderRadius: '4px',
        color: '#9CA3AF', fontSize: '12px', textAlign: 'center', padding: '8px',
      }}>
        Style not found
      </div>
    )
  }

  // Calculate transforms based on orientation
  const isVertical = config.orientation === 'vertical'

  // Thumb translation
  const thumbTransform = isVertical
    ? `translateY(${(1 - normalizedValue) * (config.height - config.thumbHeight)}px)`
    : `translateX(${normalizedValue * (config.width - config.thumbWidth)}px)`

  // Fill clip path - from center to value position (bipolar behavior)
  // fillStart = smaller of centerValue and normalizedValue
  // fillEnd = larger of centerValue and normalizedValue
  const fillStart = Math.min(centerValue, normalizedValue)
  const fillEnd = Math.max(centerValue, normalizedValue)

  const fillClipPath = isVertical
    ? `inset(${(1 - fillEnd) * 100}% 0 ${fillStart * 100}% 0)`
    : `inset(0 ${(1 - fillEnd) * 100}% 0 ${fillStart * 100}%)`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - static background */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill - clipped from center to value */}
      {layers?.fill && (
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: fillClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Thumb - translated by value */}
      {layers?.thumb && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: thumbTransform,
          transition: 'transform 0.05s ease-out',
        }}>
          <SafeSVG content={layers.thumb} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Label */}
      {config.showLabel && <span style={getLabelStyle(config)}>{config.labelText}</span>}

      {/* Value Display */}
      {config.showValue && <span style={getValueStyle(config)}>{formattedValue}</span>}
    </div>
  )
}

// ============================================================================
// Main BipolarSliderRenderer (delegates to default or styled)
// ============================================================================

export function BipolarSliderRenderer({ config }: BipolarSliderRendererProps) {
  if (!config.styleId) {
    return <DefaultBipolarSliderRenderer config={config} />
  }
  return <StyledBipolarSliderRenderer config={config} />
}
