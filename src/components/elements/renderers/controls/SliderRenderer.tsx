import { useMemo } from 'react'
import { SliderElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

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

// ============================================================================
// Label/Value Style Helpers
// ============================================================================

function getLabelStyle(config: SliderElementConfig): React.CSSProperties {
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

function getValueStyle(config: SliderElementConfig): React.CSSProperties {
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
// Default CSS Slider (existing implementation)
// ============================================================================

function DefaultSliderRenderer({ config }: SliderRendererProps) {
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

  if (config.orientation === 'vertical') {
    // Vertical slider: 0 = bottom, 1 = top
    // Thumb position (inverted: 0 at bottom)
    const thumbY = config.height - normalizedValue * (config.height - config.thumbHeight)
    const fillHeight = normalizedValue * config.height

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

// ============================================================================
// Styled SVG Slider (new implementation)
// ============================================================================

function StyledSliderRenderer({ config }: SliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be linear
  if (style && style.category !== 'linear') {
    console.warn('Slider requires linear category style')
    return null
  }

  // Calculate normalized value (0 to 1)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

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

  // Fill clip path
  const fillClipPath = isVertical
    ? `inset(${(1 - normalizedValue) * 100}% 0 0 0)`
    : `inset(0 ${(1 - normalizedValue) * 100}% 0 0)`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - static background */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill - clipped by value */}
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
// Main SliderRenderer (delegates to default or styled)
// ============================================================================

export function SliderRenderer({ config }: SliderRendererProps) {
  if (!config.styleId) {
    return <DefaultSliderRenderer config={config} />
  }
  return <StyledSliderRenderer config={config} />
}
