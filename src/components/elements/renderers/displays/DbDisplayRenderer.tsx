import type { DbDisplayElementConfig } from '../../../types/elements'

interface DbDisplayRendererProps {
  config: DbDisplayElementConfig
}

export function DbDisplayRenderer({ config }: DbDisplayRendererProps) {
  const formattedValue = config.value.toFixed(config.decimalPlaces)
  const displayText = config.showUnit ? `${formattedValue} dB` : formattedValue

  return (
    <div
      className="dbdisplay-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        padding: `0 ${config.padding}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        color: config.textColor,
        borderRadius: 0,
        boxSizing: 'border-box',
      }}
    >
      {displayText}
    </div>
  )
}
