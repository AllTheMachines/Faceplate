import { useMemo } from 'react'
import { DotIndicatorKnobElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

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
// Default CSS Dot Indicator Knob
// ============================================================================

function DefaultDotIndicatorKnobRenderer({ config }: DotIndicatorKnobRendererProps) {
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

// ============================================================================
// Styled SVG Dot Indicator Knob
// ============================================================================

function StyledDotIndicatorKnobRenderer({ config }: DotIndicatorKnobRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be rotary
  if (style && style.category !== 'rotary') {
    console.warn('DotIndicatorKnob requires rotary category style')
    return null
  }

  // Calculate normalized value
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Calculate rotation angle (dot rotates around arc path)
  // Indicator layer contains the dot, positioned at arc radius in the SVG
  // Rotating the entire layer makes dot travel along arc edge
  const indicatorAngle = useMemo(() => {
    if (!style) return 0
    const rotationRange = style.maxAngle - style.minAngle
    return style.minAngle + normalizedValue * rotationRange
  }, [style, normalizedValue])

  // Extract layers
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

  // Format value
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
        background: '#374151', borderRadius: '50%',
        color: '#9CA3AF', fontSize: '12px', textAlign: 'center', padding: '8px',
      }}>
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

      {/* Arc - optional value fill */}
      {layers?.arc && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: normalizedValue,
          transition: 'opacity 0.05s ease-out',
        }}>
          <SafeSVG content={layers.arc} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator (dot) - rotates around center */}
      {/* The SVG indicator layer should have the dot positioned at the arc radius */}
      {/* Rotating this layer makes the dot travel along the arc edge */}
      {layers?.indicator && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: `rotate(${indicatorAngle}deg)`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s ease-out',
        }}>
          <SafeSVG content={layers.indicator} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Glow - intensity by value */}
      {layers?.glow && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: normalizedValue * 0.7 + 0.3,
          transition: 'opacity 0.05s ease-out',
        }}>
          <SafeSVG content={layers.glow} style={{ width: '100%', height: '100%' }} />
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
// Main DotIndicatorKnobRenderer (delegates to default or styled)
// ============================================================================

export function DotIndicatorKnobRenderer({ config }: DotIndicatorKnobRendererProps) {
  if (!config.styleId) {
    return <DefaultDotIndicatorKnobRenderer config={config} />
  }
  return <StyledDotIndicatorKnobRenderer config={config} />
}
