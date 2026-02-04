import { useMemo } from 'react'
import { NotchedSliderElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface NotchedSliderRendererProps {
  config: NotchedSliderElementConfig
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

function getLabelStyle(config: NotchedSliderElementConfig): React.CSSProperties {
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

function getValueStyle(config: NotchedSliderElementConfig): React.CSSProperties {
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
// Default CSS Notched Slider (existing implementation)
// ============================================================================

function DefaultNotchedSliderRenderer({ config }: NotchedSliderRendererProps) {
  // Calculate normalized value (0 to 1)
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Track width
  const trackWidth = 6

  // Calculate notch positions
  const notchPositions: number[] = config.notchPositions
    ? config.notchPositions
    : Array.from({ length: config.notchCount }, (_, i) => i / (config.notchCount - 1))

  // Format value display
  const formattedValue = formatValue(
    normalizedValue,
    config.min,
    config.max,
    config.valueFormat,
    config.valueSuffix,
    config.valueDecimalPlaces
  )

  // Notch length (perpendicular to track)
  const notchLength = config.notchLength ?? 12
  const notchLabelFontSize = config.notchLabelFontSize ?? 10

  if (config.orientation === 'vertical') {
    // Vertical slider: 0 = bottom, 1 = top
    const thumbY = config.height - normalizedValue * (config.height - config.thumbHeight)
    const fillHeight = normalizedValue * config.height
    const centerX = config.width / 2

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
            x={centerX - trackWidth / 2}
            y={0}
            width={trackWidth}
            height={config.height}
            fill={config.trackColor}
            rx={0}
          />

          {/* Track fill (from bottom to value position) */}
          <rect
            x={centerX - trackWidth / 2}
            y={config.height - fillHeight}
            width={trackWidth}
            height={fillHeight}
            fill={config.trackFillColor}
            rx={0}
          />

          {/* Notch marks */}
          {notchPositions.map((pos, i) => {
            const notchY = config.height - pos * config.height
            return (
              <g key={i}>
                {/* Left notch line */}
                <line
                  x1={centerX - trackWidth / 2 - 2}
                  y1={notchY}
                  x2={centerX - trackWidth / 2 - 2 - notchLength}
                  y2={notchY}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Right notch line */}
                <line
                  x1={centerX + trackWidth / 2 + 2}
                  y1={notchY}
                  x2={centerX + trackWidth / 2 + 2 + notchLength}
                  y2={notchY}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Notch label (if enabled) */}
                {config.showNotchLabels && (
                  <text
                    x={centerX + trackWidth / 2 + notchLength + 6}
                    y={notchY}
                    fill={config.notchColor}
                    fontSize={notchLabelFontSize}
                    dominantBaseline="middle"
                  >
                    {(config.min + pos * range).toFixed(1)}
                  </text>
                )}
              </g>
            )
          })}

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
    const centerY = config.height / 2

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
            y={centerY - trackWidth / 2}
            width={config.width}
            height={trackWidth}
            fill={config.trackColor}
            rx={0}
          />

          {/* Track fill (from left to value position) */}
          <rect
            x={0}
            y={centerY - trackWidth / 2}
            width={fillWidth}
            height={trackWidth}
            fill={config.trackFillColor}
            rx={0}
          />

          {/* Notch marks */}
          {notchPositions.map((pos, i) => {
            const notchX = pos * config.width
            return (
              <g key={i}>
                {/* Top notch line */}
                <line
                  x1={notchX}
                  y1={centerY - trackWidth / 2 - 2}
                  x2={notchX}
                  y2={centerY - trackWidth / 2 - 2 - notchLength}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Bottom notch line */}
                <line
                  x1={notchX}
                  y1={centerY + trackWidth / 2 + 2}
                  x2={notchX}
                  y2={centerY + trackWidth / 2 + 2 + notchLength}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Notch label (if enabled) */}
                {config.showNotchLabels && (
                  <text
                    x={notchX}
                    y={centerY + trackWidth / 2 + notchLength + 12}
                    fill={config.notchColor}
                    fontSize={notchLabelFontSize}
                    textAnchor="middle"
                  >
                    {(config.min + pos * range).toFixed(1)}
                  </text>
                )}
              </g>
            )
          })}

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
// Styled SVG Notched Slider (new implementation)
// ============================================================================

function StyledNotchedSliderRenderer({ config }: NotchedSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be linear
  if (style && style.category !== 'linear') {
    console.warn('NotchedSlider requires linear category style')
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

  // Calculate notch positions
  const notchPositions: number[] = useMemo(() => {
    if (config.notchPositions) return config.notchPositions
    return Array.from({ length: config.notchCount }, (_, i) => i / (config.notchCount - 1))
  }, [config.notchPositions, config.notchCount])

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

  // Notch styling
  const notchLength = config.notchLength ?? 12
  const notchLabelFontSize = config.notchLabelFontSize ?? 10
  const range = config.max - config.min

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

      {/* CSS Tick marks - programmatic overlays, NOT SVG layers */}
      {/* Per CONTEXT.md: tick marks are generated from notchCount, not from SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${config.width} ${config.height}`}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        {isVertical ? (
          // Vertical tick marks
          notchPositions.map((pos, i) => {
            const notchY = config.height - pos * config.height
            const centerX = config.width / 2
            const trackWidth = 6
            return (
              <g key={i}>
                {/* Left tick */}
                <line
                  x1={centerX - trackWidth / 2 - 2}
                  y1={notchY}
                  x2={centerX - trackWidth / 2 - 2 - notchLength}
                  y2={notchY}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Right tick */}
                <line
                  x1={centerX + trackWidth / 2 + 2}
                  y1={notchY}
                  x2={centerX + trackWidth / 2 + 2 + notchLength}
                  y2={notchY}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Notch label (if enabled) */}
                {config.showNotchLabels && (
                  <text
                    x={centerX + trackWidth / 2 + notchLength + 6}
                    y={notchY}
                    fill={config.notchColor}
                    fontSize={notchLabelFontSize}
                    dominantBaseline="middle"
                  >
                    {(config.min + pos * range).toFixed(1)}
                  </text>
                )}
              </g>
            )
          })
        ) : (
          // Horizontal tick marks
          notchPositions.map((pos, i) => {
            const notchX = pos * config.width
            const centerY = config.height / 2
            const trackWidth = 6
            return (
              <g key={i}>
                {/* Top tick */}
                <line
                  x1={notchX}
                  y1={centerY - trackWidth / 2 - 2}
                  x2={notchX}
                  y2={centerY - trackWidth / 2 - 2 - notchLength}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Bottom tick */}
                <line
                  x1={notchX}
                  y1={centerY + trackWidth / 2 + 2}
                  x2={notchX}
                  y2={centerY + trackWidth / 2 + 2 + notchLength}
                  stroke={config.notchColor}
                  strokeWidth={1.5}
                />
                {/* Notch label (if enabled) */}
                {config.showNotchLabels && (
                  <text
                    x={notchX}
                    y={centerY + trackWidth / 2 + notchLength + 12}
                    fill={config.notchColor}
                    fontSize={notchLabelFontSize}
                    textAnchor="middle"
                  >
                    {(config.min + pos * range).toFixed(1)}
                  </text>
                )}
              </g>
            )
          })
        )}
      </svg>

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
// Main NotchedSliderRenderer (delegates to default or styled)
// ============================================================================

export function NotchedSliderRenderer({ config }: NotchedSliderRendererProps) {
  if (!config.styleId) {
    return <DefaultNotchedSliderRenderer config={config} />
  }
  return <StyledNotchedSliderRenderer config={config} />
}
