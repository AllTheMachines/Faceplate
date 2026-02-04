import { useMemo } from 'react'
import { CenterDetentKnobElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

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

function getValueStyle(config: CenterDetentKnobElementConfig): React.CSSProperties {
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
// Default CSS Center Detent Knob (existing implementation)
// ============================================================================

function DefaultCenterDetentKnobRenderer({ config }: CenterDetentKnobRendererProps) {
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

// ============================================================================
// Styled SVG Center Detent Knob (new implementation)
// ============================================================================

function StyledCenterDetentKnobRenderer({ config }: CenterDetentKnobRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be rotary
  if (style && style.category !== 'rotary') {
    console.warn('CenterDetentKnob requires rotary category style')
    return null
  }

  // Calculate normalized value (0-1)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Check if value is at center (within snap threshold)
  const isAtCenter = Math.abs(normalizedValue - 0.5) < config.snapThreshold

  // Memoize SVG content with color overrides applied
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Calculate rotation angle for indicator
  const indicatorAngle = useMemo(() => {
    if (!style) return 0
    const rotationRange = style.maxAngle - style.minAngle
    return style.minAngle + normalizedValue * rotationRange
  }, [style, normalizedValue])

  // Memoize layer extraction (expensive DOM operations)
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      shadow: style.layers.shadow ? extractElementLayer(svgContent, style.layers.shadow) : null,
      arc: style.layers.arc ? extractElementLayer(svgContent, style.layers.arc) : null,
      indicator: style.layers.indicator ? extractElementLayer(svgContent, style.layers.indicator) : null,
      glow: style.layers.glow ? extractElementLayer(svgContent, style.layers.glow) : null,
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

  // If style was deleted, show placeholder
  if (!style) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#374151',
          borderRadius: '50%',
          color: '#9CA3AF',
          fontSize: '12px',
          textAlign: 'center',
          padding: '8px',
        }}
      >
        Style not found
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - static background */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Shadow - static */}
      {layers?.shadow && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.shadow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Arc - HIDES when at center (key difference from regular knob) */}
      {layers?.arc && !isAtCenter && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: normalizedValue,
            transition: 'opacity 0.05s ease-out',
          }}
        >
          <SafeSVG content={layers.arc} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator - rotates */}
      {layers?.indicator && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotate(${indicatorAngle}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out',
          }}
        >
          <SafeSVG content={layers.indicator} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Glow - intensity by value (30% to 100% opacity) */}
      {layers?.glow && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: normalizedValue * 0.7 + 0.3,
            transition: 'opacity 0.05s ease-out',
          }}
        >
          <SafeSVG content={layers.glow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

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
    </div>
  )
}

// ============================================================================
// Main CenterDetentKnobRenderer (delegates to default or styled)
// ============================================================================

export function CenterDetentKnobRenderer({ config }: CenterDetentKnobRendererProps) {
  // If no style assigned, use default CSS knob
  if (!config.styleId) {
    return <DefaultCenterDetentKnobRenderer config={config} />
  }

  // Use styled SVG knob
  return <StyledCenterDetentKnobRenderer config={config} />
}
