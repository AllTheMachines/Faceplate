import { useMemo } from 'react'
import { RangeSliderElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface RangeSliderRendererProps {
  config: RangeSliderElementConfig
}

// ============================================================================
// Default CSS Range Slider (existing implementation)
// ============================================================================

function DefaultRangeSliderRenderer({ config }: RangeSliderRendererProps) {
  // Calculate normalized values (0 to 1)
  const range = config.max - config.min
  const normalizedMin = (config.minValue - config.min) / range
  const normalizedMax = (config.maxValue - config.min) / range

  // Track width (use smaller dimension)
  const trackWidth = config.orientation === 'vertical' ? 6 : 6

  if (config.orientation === 'vertical') {
    // Vertical slider: 0 = bottom, 1 = top
    // Thumb positions (inverted: 0 at bottom)
    const minThumbY = config.height - normalizedMin * (config.height - config.thumbHeight)
    const maxThumbY = config.height - normalizedMax * (config.height - config.thumbHeight)

    // Fill between thumbs
    const fillY = maxThumbY + config.thumbHeight / 2
    const fillHeight = (minThumbY + config.thumbHeight / 2) - fillY

    return (
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

        {/* Range fill (between min and max thumbs) */}
        <rect
          x={(config.width - trackWidth) / 2}
          y={fillY}
          width={trackWidth}
          height={fillHeight}
          fill={config.fillColor}
          rx={0}
        />

        {/* Min thumb */}
        <rect
          x={(config.width - config.thumbWidth) / 2}
          y={minThumbY}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={0}
        />

        {/* Max thumb */}
        <rect
          x={(config.width - config.thumbWidth) / 2}
          y={maxThumbY}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={0}
        />
      </svg>
    )
  } else {
    // Horizontal slider: 0 = left, 1 = right
    const minThumbX = normalizedMin * (config.width - config.thumbWidth)
    const maxThumbX = normalizedMax * (config.width - config.thumbWidth)

    // Fill between thumbs
    const fillX = minThumbX + config.thumbWidth / 2
    const fillWidth = (maxThumbX + config.thumbWidth / 2) - fillX

    return (
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

        {/* Range fill (between min and max thumbs) */}
        <rect
          x={fillX}
          y={(config.height - trackWidth) / 2}
          width={fillWidth}
          height={trackWidth}
          fill={config.fillColor}
          rx={0}
        />

        {/* Min thumb */}
        <rect
          x={minThumbX}
          y={(config.height - config.thumbHeight) / 2}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={0}
        />

        {/* Max thumb */}
        <rect
          x={maxThumbX}
          y={(config.height - config.thumbHeight) / 2}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={0}
        />
      </svg>
    )
  }
}

// ============================================================================
// Styled SVG Range Slider (new implementation)
// ============================================================================

function StyledRangeSliderRenderer({ config }: RangeSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be linear
  if (style && style.category !== 'linear') {
    console.warn('Range Slider requires linear category style')
    return null
  }

  // Calculate normalized values (0 to 1)
  const range = config.max - config.min
  const normalizedMin = (config.minValue - config.min) / range
  const normalizedMax = (config.maxValue - config.min) / range

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers - support thumb-low/thumb-high with fallback to generic thumb
  const layers = useMemo(() => {
    if (!style || !svgContent) return null

    // Access layers dynamically - check for thumb-low/thumb-high first
    const layersObj = style.layers as Record<string, string | undefined>
    const thumbLowId = layersObj['thumb-low']
    const thumbHighId = layersObj['thumb-high']
    const genericThumbId = layersObj['thumb']

    return {
      track: style.layers.track ? extractElementLayer(svgContent, style.layers.track) : null,
      fill: style.layers.fill ? extractElementLayer(svgContent, style.layers.fill) : null,
      // Use thumb-low if available, otherwise fall back to generic thumb
      thumbLow: thumbLowId
        ? extractElementLayer(svgContent, thumbLowId)
        : (genericThumbId ? extractElementLayer(svgContent, genericThumbId) : null),
      // Use thumb-high if available, otherwise fall back to generic thumb
      thumbHigh: thumbHighId
        ? extractElementLayer(svgContent, thumbHighId)
        : (genericThumbId ? extractElementLayer(svgContent, genericThumbId) : null),
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

  const isVertical = config.orientation === 'vertical'

  // Thumb positions
  const thumbLowTransform = isVertical
    ? `translateY(${(1 - normalizedMin) * (config.height - config.thumbHeight)}px)`
    : `translateX(${normalizedMin * (config.width - config.thumbWidth)}px)`

  const thumbHighTransform = isVertical
    ? `translateY(${(1 - normalizedMax) * (config.height - config.thumbHeight)}px)`
    : `translateX(${normalizedMax * (config.width - config.thumbWidth)}px)`

  // Range fill clip-path (from minValue to maxValue)
  const start = Math.min(normalizedMin, normalizedMax)
  const end = Math.max(normalizedMin, normalizedMax)

  const rangeFillClipPath = isVertical
    ? `inset(${(1 - end) * 100}% 0 ${start * 100}% 0)`
    : `inset(0 ${(1 - end) * 100}% 0 ${start * 100}%)`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - static background */}
      {layers?.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill - clipped between low and high thumb positions */}
      {layers?.fill && (
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: rangeFillClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Low thumb - z-index 1 (below high thumb by default) */}
      {layers?.thumbLow && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: thumbLowTransform,
          transition: 'transform 0.05s ease-out',
          zIndex: 1,
        }}>
          <SafeSVG content={layers.thumbLow} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* High thumb - z-index 2 (on top by default) */}
      {layers?.thumbHigh && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: thumbHighTransform,
          transition: 'transform 0.05s ease-out',
          zIndex: 2,
        }}>
          <SafeSVG content={layers.thumbHigh} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main RangeSliderRenderer (delegates to default or styled)
// ============================================================================

export function RangeSliderRenderer({ config }: RangeSliderRendererProps) {
  if (!config.styleId) {
    return <DefaultRangeSliderRenderer config={config} />
  }
  return <StyledRangeSliderRenderer config={config} />
}
