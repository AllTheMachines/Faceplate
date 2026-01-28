import type { NumericDisplayElementConfig } from '../../../../types/elements'
import { formatDisplayValue, truncateValue } from '../../../../utils/valueFormatters'

interface NumericDisplayRendererProps {
  config: NumericDisplayElementConfig
}

export function NumericDisplayRenderer({ config }: NumericDisplayRendererProps) {
  const formattedValue = formatDisplayValue(
    config.value,
    config.min,
    config.max,
    'numeric',
    { decimals: config.decimalPlaces }
  )

  const displayText = config.unit && config.unitDisplay === 'suffix'
    ? `${formattedValue} ${config.unit}`
    : formattedValue

  const truncatedText = truncateValue(displayText, config.width - config.padding * 2, config.fontSize)

  // Determine text color (negative values in red)
  const actual = config.min + config.value * (config.max - config.min)
  const textColor = actual < 0 ? '#ff4444' : config.textColor

  // Apply bezel style
  const bezelStyle = config.bezelStyle === 'inset'
    ? { boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }
    : config.bezelStyle === 'flat'
    ? { border: `1px solid ${config.borderColor}` }
    : {}

  return (
    <div
      className="numericdisplay-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        padding: `0 ${config.padding}px`,
        display: 'flex',
        flexDirection: config.unit && config.unitDisplay === 'label' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: config.fontStyle === '7segment' ? 'monospace' : config.fontFamily,
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        color: textColor,
        borderRadius: 0,
        boxSizing: 'border-box',
        position: 'relative',
        ...bezelStyle,
      }}
    >
      {config.showGhostSegments && config.fontStyle === '7segment' && (
        <div
          style={{
            position: 'absolute',
            opacity: 0.25,
            color: config.borderColor,
          }}
        >
          {'8'.repeat(formattedValue.length)}
        </div>
      )}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {truncatedText}
      </span>
      {config.unit && config.unitDisplay === 'label' && (
        <span style={{ fontSize: `${config.fontSize * 0.7}px`, marginTop: 2 }}>
          {config.unit}
        </span>
      )}
    </div>
  )
}
