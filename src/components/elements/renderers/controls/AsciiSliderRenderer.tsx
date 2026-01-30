import { AsciiSliderElementConfig } from '../../../../types/elements'

interface AsciiSliderRendererProps {
  config: AsciiSliderElementConfig
}

function formatValue(
  normalizedValue: number,
  min: number,
  max: number,
  format: string,
  suffix: string,
  decimals: number
): string {
  const actual = min + normalizedValue * (max - min)
  switch (format) {
    case 'percentage':
      return `${Math.round(normalizedValue * 100)}%`
    case 'numeric':
      return actual.toFixed(decimals)
    case 'custom':
      return `${actual.toFixed(decimals)}${suffix}`
    default:
      return `${Math.round(normalizedValue * 100)}%`
  }
}

export function AsciiSliderRenderer({ config }: AsciiSliderRendererProps) {
  // Calculate normalized value (0 to 1)
  const range = config.max - config.min
  const normalizedValue = range > 0 ? (config.value - config.min) / range : 0

  // Build the bar
  const filledCount = Math.round(normalizedValue * config.barWidth)
  const emptyCount = config.barWidth - filledCount
  const filledPart = config.filledChar.repeat(filledCount)
  const emptyPart = config.emptyChar.repeat(emptyCount)
  const bar = `${config.leftBracket}${filledPart}${emptyPart}${config.rightBracket}`

  // Format value display
  const formattedValue = formatValue(
    normalizedValue,
    config.min,
    config.max,
    config.valueFormat,
    config.valueSuffix,
    config.valueDecimalPlaces
  )

  // Build the full display string based on settings
  let displayParts: string[] = []

  // Add label on left
  if (config.showLabel && config.labelPosition === 'left') {
    displayParts.push(config.labelText)
  }

  if (config.showMinMax) {
    displayParts.push(config.minLabel)
  }

  if (config.valuePosition === 'left' && config.showValue) {
    displayParts.push(formattedValue)
  }

  displayParts.push(bar)

  if (config.valuePosition === 'right' && config.showValue) {
    displayParts.push(formattedValue)
  }

  if (config.showMinMax) {
    displayParts.push(config.maxLabel)
  }

  // Add label on right
  if (config.showLabel && config.labelPosition === 'right') {
    displayParts.push(config.labelText)
  }

  // Handle inside value position (replaces center of bar)
  let displayText = displayParts.join(' ')

  if (config.valuePosition === 'inside' && config.showValue) {
    // For inside, we show the value centered in the bar area
    const valueStr = ` ${formattedValue} `
    const totalBarLen = config.barWidth + 2 // +2 for brackets
    const startPos = Math.floor((totalBarLen - valueStr.length) / 2)
    const barWithValue =
      bar.slice(0, startPos + 1) + valueStr + bar.slice(startPos + 1 + valueStr.length)
    displayParts = []
    if (config.showMinMax) displayParts.push(config.minLabel)
    displayParts.push(barWithValue)
    if (config.showMinMax) displayParts.push(config.maxLabel)
    displayText = displayParts.join(' ')
  }

  // Map textAlign to flexbox justify-content
  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }
  const justifyContent = justifyMap[config.textAlign || 'left']

  // Handle above/below value positions
  if ((config.valuePosition === 'above' || config.valuePosition === 'below') && config.showValue) {
    const mainLine = displayParts.join(' ')
    const valueLine = formattedValue

    return (
      <div
        className="w-full h-full flex flex-col justify-center"
        style={{
          fontFamily: config.fontFamily,
          fontSize: `${config.fontSize}px`,
          fontWeight: config.fontWeight,
          color: config.textColor,
          lineHeight: config.lineHeight,
          backgroundColor: config.backgroundColor,
          padding: `${config.padding}px`,
          borderRadius: `${config.borderRadius}px`,
          border:
            config.borderWidth > 0
              ? `${config.borderWidth}px solid ${config.borderColor}`
              : 'none',
          boxSizing: 'border-box',
          whiteSpace: 'pre',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          alignItems: justifyContent,
        }}
      >
        {config.valuePosition === 'above' && (
          <div style={{ textAlign: config.textAlign || 'left' }}>{valueLine}</div>
        )}
        <div style={{ textAlign: config.textAlign || 'left' }}>{mainLine}</div>
        {config.valuePosition === 'below' && (
          <div style={{ textAlign: config.textAlign || 'left' }}>{valueLine}</div>
        )}
      </div>
    )
  }

  return (
    <div
      className="w-full h-full flex items-center"
      style={{
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        color: config.textColor,
        lineHeight: config.lineHeight,
        backgroundColor: config.backgroundColor,
        padding: `${config.padding}px`,
        borderRadius: `${config.borderRadius}px`,
        border:
          config.borderWidth > 0
            ? `${config.borderWidth}px solid ${config.borderColor}`
            : 'none',
        boxSizing: 'border-box',
        whiteSpace: 'pre',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        justifyContent,
      }}
    >
      {displayText}
    </div>
  )
}
