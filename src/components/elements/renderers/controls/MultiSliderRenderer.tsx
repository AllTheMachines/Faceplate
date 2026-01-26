import { MultiSliderElementConfig } from '../../../../types/elements'

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

export function MultiSliderRenderer({ config }: MultiSliderRendererProps) {
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
