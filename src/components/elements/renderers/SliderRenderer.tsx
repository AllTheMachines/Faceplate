import { SliderElementConfig } from '../../../types/elements'

interface SliderRendererProps {
  config: SliderElementConfig
}

export function SliderRenderer({ config }: SliderRendererProps) {
  // Calculate normalized value (0 to 1)
  const range = config.max - config.min
  const normalizedValue = (config.value - config.min) / range

  // Track width (use smaller dimension)
  const trackWidth = config.orientation === 'vertical' ? 6 : 6

  if (config.orientation === 'vertical') {
    // Vertical slider: 0 = bottom, 1 = top
    // Thumb position (inverted: 0 at bottom)
    const thumbY = config.height - normalizedValue * (config.height - config.thumbHeight)
    const fillHeight = normalizedValue * config.height

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
          rx={trackWidth / 2}
        />

        {/* Track fill (from bottom to value position) */}
        <rect
          x={(config.width - trackWidth) / 2}
          y={config.height - fillHeight}
          width={trackWidth}
          height={fillHeight}
          fill={config.trackFillColor}
          rx={trackWidth / 2}
        />

        {/* Thumb */}
        <rect
          x={(config.width - config.thumbWidth) / 2}
          y={thumbY}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={4}
        />
      </svg>
    )
  } else {
    // Horizontal slider: 0 = left, 1 = right
    const thumbX = normalizedValue * (config.width - config.thumbWidth)
    const fillWidth = normalizedValue * config.width

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
          rx={trackWidth / 2}
        />

        {/* Track fill (from left to value position) */}
        <rect
          x={0}
          y={(config.height - trackWidth) / 2}
          width={fillWidth}
          height={trackWidth}
          fill={config.trackFillColor}
          rx={trackWidth / 2}
        />

        {/* Thumb */}
        <rect
          x={thumbX}
          y={(config.height - config.thumbHeight) / 2}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={4}
        />
      </svg>
    )
  }
}
