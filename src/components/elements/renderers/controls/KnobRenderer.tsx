import { useMemo } from 'react'
import { KnobElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractLayer, applyAllColorOverrides } from '../../../../services/knobLayers'

interface KnobRendererProps {
  config: KnobElementConfig
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
// Label/Value Style Helpers (shared between default and styled renderers)
// ============================================================================

function getLabelStyle(config: KnobElementConfig): React.CSSProperties {
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

function getValueStyle(config: KnobElementConfig): React.CSSProperties {
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

// ============================================================================
// Default CSS Knob (existing implementation)
// ============================================================================

function DefaultKnobRenderer({ config }: KnobRendererProps) {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  // Calculate value angle
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const valueAngle = config.startAngle + normalizedValue * (config.endAngle - config.startAngle)

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = describeArc(centerX, centerY, radius, config.startAngle, valueAngle)

  // For indicator rendering
  const indicatorAngle = valueAngle
  const indicatorStart = polarToCartesian(centerX, centerY, radius * 0.4, indicatorAngle)
  const indicatorEnd = polarToCartesian(centerX, centerY, radius * 0.9, indicatorAngle)

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

        {/* Value fill arc (only render if value > min) */}
        {config.value > config.min && (
          <path
            d={valuePath}
            fill="none"
            stroke={config.fillColor}
            strokeWidth={config.trackWidth}
            strokeLinecap="round"
          />
        )}

        {/* Indicator based on style */}
        {config.style === 'line' && (
          <line
            x1={indicatorStart.x}
            y1={indicatorStart.y}
            x2={indicatorEnd.x}
            y2={indicatorEnd.y}
            stroke={config.indicatorColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        {config.style === 'dot' && (
          <circle
            cx={indicatorEnd.x}
            cy={indicatorEnd.y}
            r={config.trackWidth / 2}
            fill={config.indicatorColor}
          />
        )}

        {/* 'arc' and 'filled' styles don't need additional indicator */}
      </svg>
    </div>
  )
}

// ============================================================================
// Styled SVG Knob (new implementation)
// ============================================================================

function StyledKnobRenderer({ config }: KnobRendererProps) {
  const getKnobStyle = useStore((state) => state.getKnobStyle)
  const style = config.styleId ? getKnobStyle(config.styleId) : undefined

  // Calculate normalized value (0-1)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)

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
      track: style.layers.track ? extractLayer(svgContent, style.layers.track) : null,
      shadow: style.layers.shadow ? extractLayer(svgContent, style.layers.shadow) : null,
      arc: style.layers.arc ? extractLayer(svgContent, style.layers.arc) : null,
      indicator: style.layers.indicator ? extractLayer(svgContent, style.layers.indicator) : null,
      glow: style.layers.glow ? extractLayer(svgContent, style.layers.glow) : null,
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

      {/* Arc - animated by value (opacity fades in) */}
      {layers?.arc && (
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
// Main KnobRenderer (delegates to default or styled)
// ============================================================================

export function KnobRenderer({ config }: KnobRendererProps) {
  // If no style assigned, use default CSS knob
  if (!config.styleId) {
    return <DefaultKnobRenderer config={config} />
  }

  // Use styled SVG knob
  return <StyledKnobRenderer config={config} />
}
