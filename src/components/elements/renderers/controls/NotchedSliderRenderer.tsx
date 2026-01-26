import { NotchedSliderElementConfig } from '../../../../types/elements'

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

export function NotchedSliderRenderer({ config }: NotchedSliderRendererProps) {
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

  // Calculate label/value positioning
  const getLabelStyle = () => {
    const base: React.CSSProperties = {
      position: 'absolute',
      fontSize: `${config.labelFontSize}px`,
      color: config.labelColor,
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }

    switch (config.labelPosition) {
      case 'top':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px' }
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px' }
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '4px' }
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '4px' }
    }
  }

  const getValueStyle = () => {
    const base: React.CSSProperties = {
      position: 'absolute',
      fontSize: `${config.valueFontSize}px`,
      color: config.valueColor,
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }

    switch (config.valuePosition) {
      case 'top':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px' }
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '4px' }
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '4px' }
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '4px' }
    }
  }

  // Notch length (perpendicular to track)
  const notchLength = 8

  if (config.orientation === 'vertical') {
    // Vertical slider: 0 = bottom, 1 = top
    const thumbY = config.height - normalizedValue * (config.height - config.thumbHeight)
    const fillHeight = normalizedValue * config.height
    const centerX = config.width / 2

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
                    fontSize={9}
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
                    fontSize={9}
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
