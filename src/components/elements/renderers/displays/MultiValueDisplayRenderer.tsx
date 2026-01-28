import type { MultiValueDisplayElementConfig } from '../../../../types/elements'
import { formatDisplayValue } from '../../../../utils/valueFormatters'

interface MultiValueDisplayRendererProps {
  config: MultiValueDisplayElementConfig
}

export function MultiValueDisplayRenderer({ config }: MultiValueDisplayRendererProps) {
  // Limit to 4 values max
  const valuesToDisplay = config.values.slice(0, 4)

  return (
    <div
      className="multivaluedisplay-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        padding: `${config.padding}px`,
        border: `1px solid ${config.borderColor}`,
        borderRadius: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: config.layout === 'vertical' ? 'column' : 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {valuesToDisplay.map((valueConfig, index) => {
        const formattedValue = formatDisplayValue(
          valueConfig.value,
          valueConfig.min,
          valueConfig.max,
          valueConfig.format as any,
          { decimals: valueConfig.decimalPlaces ?? 2 }
        )

        // Determine text color (negative values in red)
        const actual = valueConfig.min + valueConfig.value * (valueConfig.max - valueConfig.min)
        const textColor = actual < 0 ? '#ff4444' : config.textColor

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: config.layout === 'vertical' ? 'row' : 'column',
              alignItems: 'center',
              gap: 4,
              flex: 1,
            }}
          >
            {valueConfig.label && (
              <span
                style={{
                  fontFamily: config.fontFamily,
                  fontSize: `${config.fontSize * 0.7}px`,
                  color: config.textColor,
                  opacity: 0.8,
                }}
              >
                {valueConfig.label}:
              </span>
            )}
            <span
              style={{
                fontFamily: config.fontFamily,
                fontSize: `${config.fontSize}px`,
                fontWeight: config.fontWeight,
                color: textColor,
              }}
            >
              {formattedValue}
            </span>
          </div>
        )
      })}
    </div>
  )
}
