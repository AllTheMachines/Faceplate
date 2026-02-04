import { useMemo } from 'react'
import { MultiSliderElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface MultiSliderRendererProps {
  config: MultiSliderElementConfig
}

// ============================================================================
// Frequency Label Presets
// ============================================================================

const frequencyLabels: Record<number, string[]> = {
  3: ['Low', 'Mid', 'High'],
  4: ['Sub', 'Low', 'Mid', 'High'],
  5: ['Sub', 'Low', 'Mid', 'Hi-Mid', 'High'],
  7: ['63', '125', '250', '500', '1k', '2k', '4k'],
  10: ['31', '63', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'],
  31: [
    '20', '25', '31', '40', '50', '63', '80', '100', '125', '160',
    '200', '250', '315', '400', '500', '630', '800', '1k', '1.3k', '1.6k',
    '2k', '2.5k', '3.2k', '4k', '5k', '6.3k', '8k', '10k', '12.5k', '16k', '20k'
  ],
}

function getLabels(config: MultiSliderElementConfig): string[] {
  // Custom labels take precedence
  if (config.customLabels && config.customLabels.length > 0) {
    return config.customLabels
  }

  // Hidden labels return empty array
  if (config.labelStyle === 'hidden') {
    return []
  }

  // Frequency labels from preset if available
  if (config.labelStyle === 'frequency') {
    const preset = frequencyLabels[config.bandCount]
    if (preset) {
      return preset
    }
    // Fallback: generate generic frequency labels
    return Array.from({ length: config.bandCount }, (_, i) => `${i + 1}`)
  }

  // Index labels
  return Array.from({ length: config.bandCount }, (_, i) => `${i + 1}`)
}

// ============================================================================
// Default CSS Multi-Slider (existing implementation)
// ============================================================================

function DefaultMultiSliderRenderer({ config }: MultiSliderRendererProps) {
  const { bandCount, bandValues, bandGap, trackColor, fillColor, thumbColor } = config

  // Reserve space for labels at the bottom
  const showLabels = config.labelStyle !== 'hidden'
  const labelHeight = showLabels ? config.labelFontSize + 4 : 0
  const sliderAreaHeight = config.height - labelHeight

  // Calculate band width
  const totalGapWidth = bandGap * (bandCount - 1)
  const bandWidth = (config.width - totalGapWidth) / bandCount

  // Get labels for display
  const labels = getLabels(config)

  // Thumb height (thin line)
  const thumbHeight = 3

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${config.width} ${config.height}`}
        focusable="false"
        style={{ overflow: 'visible' }}
      >
        {/* Render each band */}
        {Array.from({ length: bandCount }, (_, i) => {
          const x = i * (bandWidth + bandGap)
          const value = bandValues[i] ?? 0.5

          // Fill height from bottom to value position
          const fillHeight = value * sliderAreaHeight
          const fillY = sliderAreaHeight - fillHeight

          // Thumb position
          const thumbY = fillY - thumbHeight / 2

          return (
            <g key={i}>
              {/* Track background */}
              <rect
                x={x}
                y={0}
                width={bandWidth}
                height={sliderAreaHeight}
                fill={trackColor}
              />

              {/* Fill (from bottom to value) */}
              <rect
                x={x}
                y={fillY}
                width={bandWidth}
                height={fillHeight}
                fill={fillColor}
              />

              {/* Thumb (thin line at value position) */}
              <rect
                x={x}
                y={Math.max(0, Math.min(thumbY, sliderAreaHeight - thumbHeight))}
                width={bandWidth}
                height={thumbHeight}
                fill={thumbColor}
              />
            </g>
          )
        })}

        {/* Render labels */}
        {showLabels && labels.map((label, i) => {
          if (i >= bandCount) return null
          const x = i * (bandWidth + bandGap) + bandWidth / 2
          const y = sliderAreaHeight + config.labelFontSize

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={config.labelFontSize}
              fontFamily={config.labelFontFamily}
              fill={config.labelColor}
              style={{ userSelect: 'none' }}
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================================
// Styled Band Component (renders one band with shared SVG layers)
// ============================================================================

interface StyledBandProps {
  layers: {
    track: string | null
    fill: string | null
    thumb: string | null
  }
  value: number
  bandHeight: number
}

function StyledBand({ layers, value, bandHeight }: StyledBandProps) {
  // Fill clip-path (vertical only - multi-slider bands are always vertical)
  // Value 0 = bottom, value 1 = top
  const fillClipPath = `inset(${(1 - value) * 100}% 0 0 0)`

  // Thumb translation (value 0 at bottom, 1 at top)
  // Estimate thumb height as percentage of band height
  const thumbHeightPercent = 5 // Approximate thumb height as 5% of band
  const availableTravel = 100 - thumbHeightPercent
  const thumbY = (1 - value) * availableTravel

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Track - static background */}
      {layers.track && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.track} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Fill - clipped by value */}
      {layers.fill && (
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: fillClipPath,
          transition: 'clip-path 0.05s ease-out',
        }}>
          <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Thumb - translated by value */}
      {layers.thumb && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: `translateY(${thumbY}%)`,
          transition: 'transform 0.05s ease-out',
        }}>
          <SafeSVG content={layers.thumb} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Styled SVG Multi-Slider (new implementation)
// ============================================================================

function StyledMultiSliderRenderer({ config }: MultiSliderRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be linear
  if (style && style.category !== 'linear') {
    console.warn('MultiSlider requires linear category style')
    return null
  }

  // Memoize SVG content with color overrides (shared for all bands)
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers once (shared for all bands)
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

  const { bandCount, bandValues, bandGap } = config

  // Reserve space for labels at the bottom
  const showLabels = config.labelStyle !== 'hidden'
  const labelHeight = showLabels ? config.labelFontSize + 4 : 0
  const sliderAreaHeight = config.height - labelHeight

  // Calculate band width
  const totalGapWidth = bandGap * (bandCount - 1)
  const bandWidth = (config.width - totalGapWidth) / bandCount

  // Get labels for display
  const labels = getLabels(config)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Render each band with shared style */}
      {Array.from({ length: bandCount }, (_, i) => {
        const value = bandValues[i] ?? 0.5
        const normalizedValue = (value - config.min) / (config.max - config.min)
        const x = i * (bandWidth + bandGap)

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: 0,
              width: bandWidth,
              height: sliderAreaHeight,
            }}
          >
            {layers && (
              <StyledBand
                layers={layers}
                value={normalizedValue}
                bandHeight={sliderAreaHeight}
              />
            )}
          </div>
        )
      })}

      {/* Render labels below bands */}
      {showLabels && (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: sliderAreaHeight,
            width: config.width,
            height: labelHeight,
            overflow: 'visible',
          }}
          viewBox={`0 0 ${config.width} ${labelHeight}`}
          focusable="false"
        >
          {labels.map((label, i) => {
            if (i >= bandCount) return null
            const x = i * (bandWidth + bandGap) + bandWidth / 2
            const y = config.labelFontSize

            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={config.labelFontSize}
                fontFamily={config.labelFontFamily}
                fill={config.labelColor}
                style={{ userSelect: 'none' }}
              >
                {label}
              </text>
            )
          })}
        </svg>
      )}
    </div>
  )
}

// ============================================================================
// Main MultiSliderRenderer (delegates to default or styled)
// ============================================================================

export function MultiSliderRenderer({ config }: MultiSliderRendererProps) {
  if (!config.styleId) {
    return <DefaultMultiSliderRenderer config={config} />
  }
  return <StyledMultiSliderRenderer config={config} />
}
