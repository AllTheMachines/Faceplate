import { RangeSliderElementConfig } from '../../../types/elements'

interface RangeSliderRendererProps {
  config: RangeSliderElementConfig
}

export function RangeSliderRenderer({ config }: RangeSliderRendererProps) {
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
          rx={trackWidth / 2}
        />

        {/* Range fill (between min and max thumbs) */}
        <rect
          x={(config.width - trackWidth) / 2}
          y={fillY}
          width={trackWidth}
          height={fillHeight}
          fill={config.fillColor}
          rx={trackWidth / 2}
        />

        {/* Min thumb */}
        <rect
          x={(config.width - config.thumbWidth) / 2}
          y={minThumbY}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={4}
        />

        {/* Max thumb */}
        <rect
          x={(config.width - config.thumbWidth) / 2}
          y={maxThumbY}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={4}
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
          rx={trackWidth / 2}
        />

        {/* Range fill (between min and max thumbs) */}
        <rect
          x={fillX}
          y={(config.height - trackWidth) / 2}
          width={fillWidth}
          height={trackWidth}
          fill={config.fillColor}
          rx={trackWidth / 2}
        />

        {/* Min thumb */}
        <rect
          x={minThumbX}
          y={(config.height - config.thumbHeight) / 2}
          width={config.thumbWidth}
          height={config.thumbHeight}
          fill={config.thumbColor}
          rx={4}
        />

        {/* Max thumb */}
        <rect
          x={maxThumbX}
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
