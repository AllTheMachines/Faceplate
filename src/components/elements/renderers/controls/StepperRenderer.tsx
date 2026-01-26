import { StepperElementConfig } from '../../../../types/elements'

interface StepperRendererProps {
  config: StepperElementConfig
}

export function StepperRenderer({ config }: StepperRendererProps) {
  const isHorizontal = config.orientation === 'horizontal'

  // Format value display
  const formattedValue =
    config.valueFormat === 'numeric'
      ? config.value.toFixed(config.decimalPlaces)
      : config.value.toString()

  const displayValue = config.valueSuffix
    ? `${formattedValue}${config.valueSuffix}`
    : formattedValue

  return (
    <div
      className="stepper-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: config.backgroundColor,
        borderRadius: `${config.borderRadius}px`,
        border: `1px solid ${config.borderColor}`,
        userSelect: 'none',
        transition: 'none',
      }}
      data-element-type="stepper"
      data-value={config.value}
      data-min={config.min}
      data-max={config.max}
      data-step={config.step}
    >
      {/* Decrement button */}
      <button
        className="stepper-button stepper-decrement"
        style={{
          width: isHorizontal ? config.buttonSize : '100%',
          height: isHorizontal ? '100%' : config.buttonSize,
          backgroundColor: config.buttonColor,
          color: config.textColor,
          border: 'none',
          borderRadius: isHorizontal
            ? `${config.borderRadius}px 0 0 ${config.borderRadius}px`
            : `${config.borderRadius}px ${config.borderRadius}px 0 0`,
          fontSize: Math.min(config.buttonSize * 0.6, 16),
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        data-action="decrement"
      >
        −
      </button>

      {/* Value display */}
      {config.showValue && (
        <div
          className="stepper-value"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.textColor,
            fontSize: Math.min(config.height * 0.5, 14),
            fontWeight: 500,
            padding: '0 4px',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          data-display="value"
        >
          {displayValue}
        </div>
      )}

      {/* Increment button */}
      <button
        className="stepper-button stepper-increment"
        style={{
          width: isHorizontal ? config.buttonSize : '100%',
          height: isHorizontal ? '100%' : config.buttonSize,
          backgroundColor: config.buttonColor,
          color: config.textColor,
          border: 'none',
          borderRadius: isHorizontal
            ? `0 ${config.borderRadius}px ${config.borderRadius}px 0`
            : `0 0 ${config.borderRadius}px ${config.borderRadius}px`,
          fontSize: Math.min(config.buttonSize * 0.6, 16),
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        data-action="increment"
      >
        +
      </button>
    </div>
  )
}
