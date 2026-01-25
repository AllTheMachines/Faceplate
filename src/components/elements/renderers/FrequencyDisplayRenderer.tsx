import type { FrequencyDisplayElementConfig } from '../../../types/elements'

interface FrequencyDisplayRendererProps {
  config: FrequencyDisplayElementConfig
}

export function FrequencyDisplayRenderer({ config }: FrequencyDisplayRendererProps) {
  // Auto-switch to kHz if enabled and value >= 1000
  const useKHz = config.autoSwitchKHz && config.value >= 1000
  const displayValue = useKHz ? config.value / 1000 : config.value
  const unit = useKHz ? 'kHz' : 'Hz'

  const formattedValue = displayValue.toFixed(config.decimalPlaces)
  const displayText = config.showUnit ? `${formattedValue} ${unit}` : formattedValue

  return (
    <div
      className="frequencydisplay-element"
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
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}
    >
      {displayText}
    </div>
  )
}
