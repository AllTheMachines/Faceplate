import { CrossfadeSliderElementConfig } from '../../../../types/elements'

interface CrossfadeSliderRendererProps {
  config: CrossfadeSliderElementConfig
}

export function CrossfadeSliderRenderer({ config }: CrossfadeSliderRendererProps) {
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
