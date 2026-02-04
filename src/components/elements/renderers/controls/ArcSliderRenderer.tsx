import { useMemo, useEffect, useState } from 'react'
import { ArcSliderElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface ArcSliderRendererProps {
  config: ArcSliderElementConfig
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
  // Handle arc direction (clockwise from startAngle to endAngle)
  // For arc slider: 135 to 45 means going through 180, 270, 0 (clockwise)
  let sweepAngle = endAngle - startAngle
  if (sweepAngle < 0) {
    sweepAngle += 360
  }

  const start = polarToCartesian(x, y, radius, startAngle)
  const end = polarToCartesian(x, y, radius, endAngle)
  const largeArcFlag = sweepAngle > 180 ? '1' : '0'

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ')
}

function DefaultArcSliderRenderer({ config }: ArcSliderRendererProps) {
  const centerX = config.diameter / 2
  const centerY = config.diameter / 2
  const radius = (config.diameter - config.trackWidth) / 2 - config.thumbRadius

  // Calculate value angle
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Calculate sweep angle (handling wrap-around)
  let sweepAngle = config.endAngle - config.startAngle
  if (sweepAngle < 0) {
    sweepAngle += 360
  }

  // Value angle interpolates from startAngle toward endAngle
  const valueAngle = config.startAngle + normalizedValue * sweepAngle

  // Generate arc paths
  const trackPath = describeArc(centerX, centerY, radius, config.startAngle, config.endAngle)
  const valuePath = normalizedValue > 0.001
    ? describeArc(centerX, centerY, radius, config.startAngle, valueAngle)
    : ''

  // Thumb position on arc
  const thumbPos = polarToCartesian(centerX, centerY, radius, valueAngle)

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

  const getValueStyle = () => {
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

      {/* Arc Slider SVG */}
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
        {valuePath && (
          <path
            d={valuePath}
            fill="none"
            stroke={config.fillColor}
            strokeWidth={config.trackWidth}
            strokeLinecap="round"
          />
        )}

        {/* Circular thumb at current position */}
        <circle
          cx={thumbPos.x}
          cy={thumbPos.y}
          r={config.thumbRadius}
          fill={config.thumbColor}
        />
      </svg>
    </div>
  )
}

// ============================================================================
// Label/Value Style Helpers
// ============================================================================

function getLabelStyle(config: ArcSliderElementConfig): React.CSSProperties {
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

function getValueStyle(config: ArcSliderElementConfig): React.CSSProperties {
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
// Styled SVG Arc Slider (uses user-provided SVG with path-following thumb)
// ============================================================================

function StyledArcSliderRenderer({ config }: ArcSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - Arc Slider uses 'arc' category
  if (style && style.category !== 'arc') {
    console.warn('ArcSlider requires arc category style')
    return null
  }

  // Calculate normalized value
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers (ArcLayers: thumb, track, fill, arc)
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      thumb: style.layers.thumb ? extractElementLayer(svgContent, style.layers.thumb) : null,
      arc: style.layers.arc ? extractElementLayer(svgContent, style.layers.arc) : null,
    }
  }, [style, svgContent])

  // Parse arc path element for getPointAtLength calculations
  const [thumbPosition, setThumbPosition] = useState({ x: 0, y: 0, angle: 0 })

  // Calculate thumb position along arc path
  useEffect(() => {
    if (!layers?.arc) {
      setThumbPosition({ x: config.diameter / 2, y: config.diameter / 2, angle: 0 })
      return
    }

    // Parse the arc SVG to get the path element
    const parser = new DOMParser()
    const doc = parser.parseFromString(layers.arc, 'image/svg+xml')
    const pathElement = doc.querySelector('path') as SVGPathElement | null

    if (!pathElement) {
      console.warn('Arc layer does not contain a path element')
      setThumbPosition({ x: config.diameter / 2, y: config.diameter / 2, angle: 0 })
      return
    }

    // Create an offscreen SVG to calculate path metrics
    const offscreenSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    offscreenSvg.setAttribute('width', String(config.diameter))
    offscreenSvg.setAttribute('height', String(config.diameter))
    offscreenSvg.style.position = 'absolute'
    offscreenSvg.style.left = '-9999px'
    offscreenSvg.style.visibility = 'hidden'

    const clonedPath = pathElement.cloneNode(true) as SVGPathElement
    offscreenSvg.appendChild(clonedPath)
    document.body.appendChild(offscreenSvg)

    try {
      // Get path length and calculate position
      const totalLength = clonedPath.getTotalLength()
      const lengthAtValue = normalizedValue * totalLength

      // Get point at current value position
      const point = clonedPath.getPointAtLength(lengthAtValue)

      // Calculate tangent angle for optional thumb rotation
      const epsilon = Math.min(0.5, totalLength * 0.01)
      const prevPoint = clonedPath.getPointAtLength(Math.max(0, lengthAtValue - epsilon))
      const nextPoint = clonedPath.getPointAtLength(Math.min(totalLength, lengthAtValue + epsilon))
      const angle = Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x) * 180 / Math.PI

      setThumbPosition({ x: point.x, y: point.y, angle })
    } finally {
      document.body.removeChild(offscreenSvg)
    }
  }, [layers?.arc, normalizedValue, config.diameter])

  // Arc fill clip-path (based on normalized value)
  // For arc fill, we use the same percentage approach as linear
  // The fill layer in the SVG should be designed to work with this clipping
  const fillClipPath = useMemo(() => {
    // Simple percentage-based clip from start of arc
    // For more sophisticated arc clipping, users can design their fill layer appropriately
    return `inset(0 ${(1 - normalizedValue) * 100}% 0 0)`
  }, [normalizedValue])

  // Format value display
  const formattedValue = formatValue(
    normalizedValue,
    config.min,
    config.max,
    config.valueFormat,
    config.valueSuffix,
    config.valueDecimalPlaces
  )

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

      {/* Track - static background arc */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Arc path (invisible, used for thumb positioning reference) */}
      {layers?.arc && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0 }}>
          <SafeSVG content={layers.arc} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill - clipped along arc */}
      {layers?.fill && (
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: fillClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Thumb - positioned along arc path */}
      {layers?.thumb && (
        <div style={{
          position: 'absolute',
          left: `${(thumbPosition.x / config.diameter) * 100}%`,
          top: `${(thumbPosition.y / config.diameter) * 100}%`,
          transform: config.rotateThumbToTangent
            ? `translate(-50%, -50%) rotate(${thumbPosition.angle}deg)`
            : 'translate(-50%, -50%)',
          transition: 'left 0.05s ease-out, top 0.05s ease-out, transform 0.05s ease-out',
        }}>
          <SafeSVG
            content={layers.thumb}
            style={{
              width: `${config.thumbRadius * 2}px`,
              height: `${config.thumbRadius * 2}px`,
            }}
          />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main ArcSliderRenderer (delegates to default or styled)
// ============================================================================

export function ArcSliderRenderer({ config }: ArcSliderRendererProps) {
  if (!config.styleId) {
    return <DefaultArcSliderRenderer config={config} />
  }
  return <StyledArcSliderRenderer config={config} />
}
