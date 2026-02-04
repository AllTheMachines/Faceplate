import { useMemo } from 'react'
import { CrossfadeSliderElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface CrossfadeSliderRendererProps {
  config: CrossfadeSliderElementConfig
}

// ============================================================================
// Default CSS Crossfade Slider (existing implementation)
// ============================================================================

function DefaultCrossfadeSliderRenderer({ config }: CrossfadeSliderRendererProps) {
  // Calculate normalized value (0 to 1)
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Track dimensions - crossfade is always horizontal
  const trackWidth = 6
  const labelOffset = 16 // Space for labels above track

  // Thumb position
  const thumbX = normalizedValue * (config.width - config.thumbWidth)

  // Center position (50% for crossfade)
  const centerX = config.width / 2

  // Calculate opacity for each side based on position
  // At center (0.5), both are equally faded
  // At left (0), A is full, B is faded
  // At right (1), B is full, A is faded
  const aOpacity = 1 - normalizedValue
  const bOpacity = normalizedValue

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* A Label (left) */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontSize: `${config.labelFontSize}px`,
          fontFamily: config.labelFontFamily,
          fontWeight: config.labelFontWeight,
          color: config.labelColor,
          opacity: 0.5 + aOpacity * 0.5, // Range from 0.5 to 1.0
          userSelect: 'none',
        }}
      >
        {config.labelA}
      </span>

      {/* B Label (right) */}
      <span
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          fontSize: `${config.labelFontSize}px`,
          fontFamily: config.labelFontFamily,
          fontWeight: config.labelFontWeight,
          color: config.labelColor,
          opacity: 0.5 + bOpacity * 0.5, // Range from 0.5 to 1.0
          userSelect: 'none',
        }}
      >
        {config.labelB}
      </span>

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
          y={(config.height - trackWidth) / 2 + labelOffset / 2}
          width={config.width}
          height={trackWidth}
          fill={config.trackColor}
          rx={0}
        />

        {/* Track fill - shows balance visually */}
        {/* Fill from center to thumb position */}
        {normalizedValue >= 0.5 ? (
          <rect
            x={centerX}
            y={(config.height - trackWidth) / 2 + labelOffset / 2}
            width={(normalizedValue - 0.5) * config.width}
            height={trackWidth}
            fill={config.trackFillColor}
            rx={0}
          />
        ) : (
          <rect
            x={normalizedValue * config.width}
            y={(config.height - trackWidth) / 2 + labelOffset / 2}
            width={(0.5 - normalizedValue) * config.width}
            height={trackWidth}
            fill={config.trackFillColor}
            rx={0}
          />
        )}

        {/* Center detent mark (vertical line at 50%) */}
        <line
          x1={centerX}
          y1={(config.height - trackWidth) / 2 + labelOffset / 2 - 4}
          x2={centerX}
          y2={(config.height + trackWidth) / 2 + labelOffset / 2 + 4}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={2}
        />

        {/* Thumb */}
        <rect
          x={thumbX}
          y={(config.height - config.thumbHeight) / 2 + labelOffset / 2}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={0}
        />
      </svg>
    </div>
  )
}

// ============================================================================
// Styled SVG Crossfade Slider (new implementation)
// ============================================================================

function StyledCrossfadeSliderRenderer({ config }: CrossfadeSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be linear
  if (style && style.category !== 'linear') {
    console.warn('CrossfadeSlider requires linear category style')
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

  // Crossfade is always horizontal
  // Thumb translation
  const thumbTransform = `translateX(${normalizedValue * (config.width - config.thumbWidth)}px)`

  // Fill clip path - bipolar from center (0.5)
  // When value < 0.5: fill from value to center
  // When value > 0.5: fill from center to value
  const fillStart = Math.min(0.5, normalizedValue)
  const fillEnd = Math.max(0.5, normalizedValue)
  const fillClipPath = `inset(0 ${(1 - fillEnd) * 100}% 0 ${fillStart * 100}%)`

  // Calculate opacity for each side based on position
  const aOpacity = 1 - normalizedValue
  const bOpacity = normalizedValue

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* A Label (left) */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          fontSize: `${config.labelFontSize}px`,
          fontFamily: config.labelFontFamily,
          fontWeight: config.labelFontWeight,
          color: config.labelColor,
          opacity: 0.5 + aOpacity * 0.5,
          userSelect: 'none',
          zIndex: 10,
        }}
      >
        {config.labelA}
      </span>

      {/* B Label (right) */}
      <span
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          fontSize: `${config.labelFontSize}px`,
          fontFamily: config.labelFontFamily,
          fontWeight: config.labelFontWeight,
          color: config.labelColor,
          opacity: 0.5 + bOpacity * 0.5,
          userSelect: 'none',
          zIndex: 10,
        }}
      >
        {config.labelB}
      </span>

      {/* Track - static background */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill - clipped from center to value (bipolar style) */}
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
    </div>
  )
}

// ============================================================================
// Main CrossfadeSliderRenderer (delegates to default or styled)
// ============================================================================

export function CrossfadeSliderRenderer({ config }: CrossfadeSliderRendererProps) {
  if (!config.styleId) {
    return <DefaultCrossfadeSliderRenderer config={config} />
  }
  return <StyledCrossfadeSliderRenderer config={config} />
}
