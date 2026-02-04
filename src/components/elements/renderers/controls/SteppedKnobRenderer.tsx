import { useMemo } from 'react'
import { SteppedKnobElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface SteppedKnobRendererProps {
  config: SteppedKnobElementConfig
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

function getLabelStyle(config: SteppedKnobElementConfig): React.CSSProperties {
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

function getValueStyle(config: SteppedKnobElementConfig): React.CSSProperties {
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
// Default CSS Stepped Knob (existing implementation)
// ============================================================================

function DefaultSteppedKnobRenderer({ config }: SteppedKnobRendererProps) {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2

  // Calculate normalized value and quantize to nearest step
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range
  const stepSize = 1 / (config.stepCount - 1)
  const steppedValue = Math.round(normalizedValue / stepSize) * stepSize
  const valueAngle = config.startAngle + steppedValue * (config.endAngle - config.startAngle)

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = describeArc(centerX, centerY, radius, config.startAngle, valueAngle)

  // For indicator rendering
  const indicatorStart = polarToCartesian(centerX, centerY, radius * 0.4, valueAngle)
  const indicatorEnd = polarToCartesian(centerX, centerY, radius * 0.9, valueAngle)

  // Generate step indicator positions (dots on arc)
  const stepIndicators: { x: number; y: number }[] = []
  if (config.showStepIndicators) {
    for (let i = 0; i < config.stepCount; i++) {
      const stepNormalized = i / (config.stepCount - 1)
      const stepAngle = config.startAngle + stepNormalized * (config.endAngle - config.startAngle)
      const pos = polarToCartesian(centerX, centerY, radius, stepAngle)
      stepIndicators.push(pos)
    }
  }

  // Tick marks (dial-style, outside knob)
  const tickMarks: Array<{inner: {x: number, y: number}, outer: {x: number, y: number}}> = []
  if (config.showStepMarks) {
    const markLength = config.stepMarkLength ?? 6
    const innerRadius = radius + 2 // Small gap from track
    const outerRadius = innerRadius + markLength
    for (let i = 0; i < config.stepCount; i++) {
      const stepNormalized = i / (config.stepCount - 1)
      const stepAngle = config.startAngle + stepNormalized * (config.endAngle - config.startAngle)
      tickMarks.push({
        inner: polarToCartesian(centerX, centerY, innerRadius, stepAngle),
        outer: polarToCartesian(centerX, centerY, outerRadius, stepAngle)
      })
    }
  }

  // Format value display
  const formattedValue = formatValue(
    steppedValue,
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

        {/* Step indicators (small circles at each step position) */}
        {config.showStepIndicators && stepIndicators.map((pos, i) => (
          <circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={config.stepIndicatorSize ?? (config.trackWidth / 3)}
            fill={i <= Math.round(steppedValue * (config.stepCount - 1)) ? config.fillColor : config.trackColor}
            stroke="none"
          />
        ))}

        {/* Value fill arc (only render if value > min) */}
        {steppedValue > 0 && (
          <path
            d={valuePath}
            fill="none"
            stroke={config.fillColor}
            strokeWidth={config.trackWidth}
            strokeLinecap="round"
          />
        )}

        {/* Tick marks (outside knob edge) */}
        {tickMarks.map((tick, i) => (
          <line
            key={`tick-${i}`}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
            stroke={config.trackColor}
            strokeWidth={config.stepMarkWidth ?? Math.max(1, config.trackWidth / 4)}
            strokeLinecap="round"
          />
        ))}

        {/* Indicator line with snap transition */}
        <g style={{ transition: 'transform 0.05s ease-out' }}>
          <line
            x1={indicatorStart.x}
            y1={indicatorStart.y}
            x2={indicatorEnd.x}
            y2={indicatorEnd.y}
            stroke={config.indicatorColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  )
}

// ============================================================================
// Styled SVG Stepped Knob (new implementation)
// ============================================================================

function StyledSteppedKnobRenderer({ config }: SteppedKnobRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be rotary
  if (style && style.category !== 'rotary') {
    console.warn('SteppedKnob requires rotary category style')
    return null
  }

  // Calculate stepped value (quantize BEFORE rotation)
  const normalizedValue = (config.value - config.min) / (config.max - config.min)
  const stepSize = 1 / (config.stepCount - 1)
  const steppedValue = Math.round(normalizedValue / stepSize) * stepSize

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Calculate rotation angle with stepped value
  const indicatorAngle = useMemo(() => {
    if (!style) return 0
    const rotationRange = style.maxAngle - style.minAngle
    return style.minAngle + steppedValue * rotationRange
  }, [style, steppedValue])

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
    steppedValue,
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

      {/* Arc - animated by value */}
      {layers?.arc && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: steppedValue,
          transition: 'opacity 0.05s ease-out',
        }}>
          <SafeSVG content={layers.arc} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator - rotates with snap transition */}
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
          opacity: steppedValue * 0.7 + 0.3,
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
// Main SteppedKnobRenderer (delegates to default or styled)
// ============================================================================

export function SteppedKnobRenderer({ config }: SteppedKnobRendererProps) {
  if (!config.styleId) {
    return <DefaultSteppedKnobRenderer config={config} />
  }
  return <StyledSteppedKnobRenderer config={config} />
}
