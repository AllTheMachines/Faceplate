import type { RatioDisplayElementConfig } from '../../../../types/elements'
import { formatDisplayValue, truncateValue } from '../../../../utils/valueFormatters'

interface RatioDisplayRendererProps {
  config: RatioDisplayElementConfig
}

export function RatioDisplayRenderer({ config }: RatioDisplayRendererProps) {
  const formattedValue = formatDisplayValue(
    config.value,
    config.min,
    config.max,
    'ratio',
    { decimals: config.decimalPlaces }
  )

  const truncatedText = truncateValue(formattedValue, config.width - config.padding * 2, config.fontSize)

  // Apply bezel style
  const bezelStyle = config.bezelStyle === 'inset'
    ? { boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }
    : config.bezelStyle === 'flat'
    ? { border: `1px solid ${config.borderColor}` }
    : {}

  return (
    <div
      className="ratiodisplay-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        padding: `0 ${config.padding}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: config.fontStyle === '7segment' ? 'monospace' : config.fontFamily,
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        color: config.textColor,
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
          88.8:1
        </div>
      )}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {truncatedText}
      </span>
    </div>
  )
}
