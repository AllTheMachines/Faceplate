import type { GainReductionMeterElementConfig } from '../../../types/elements'

interface GainReductionMeterRendererProps {
  config: GainReductionMeterElementConfig
}

export function GainReductionMeterRenderer({ config }: GainReductionMeterRendererProps) {
  const isVertical = config.orientation === 'vertical'
  // GR meters grow FROM TOP (inverted) - value 0 = no reduction, value 1 = full reduction
  const fillPercent = config.value * 100

  // Calculate actual dB value for display
  const dbValue = config.value * config.maxReduction // maxReduction is negative

  return (
    <div
      className="gainreductionmeter-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        position: 'relative',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      {/* Meter fill - grows from TOP (vertical) or RIGHT (horizontal) */}
      <div
        className="gr-fill"
        style={{
          position: 'absolute',
          backgroundColor: config.meterColor,
          borderRadius: '2px',
          ...(isVertical
            ? {
                top: 0,
                left: 0,
                right: 0,
                height: `${fillPercent}%`,
              }
            : {
                top: 0,
                right: 0,
                bottom: 0,
                width: `${fillPercent}%`,
              }),
        }}
      />

      {/* Value display */}
      {config.showValue && (
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: `${config.fontSize}px`,
            color: config.textColor,
            fontFamily: 'Roboto Mono, monospace',
          }}
        >
          {dbValue.toFixed(1)}
        </div>
      )}
    </div>
  )
}
