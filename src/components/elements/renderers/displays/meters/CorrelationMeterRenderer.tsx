import React from 'react'
import type { CorrelationMeterElementConfig } from '../../../../../types/elements/displays'

interface Props {
  config: CorrelationMeterElementConfig
}

export function CorrelationMeterRenderer({ config }: Props) {
  const { width, height, value, barHeight, showScale, scalePosition, showNumericReadout, colorZones } = config

  // Normalize -1 to +1 to 0-1 for positioning
  const normalized = (value + 1) / 2 // -1 -> 0, 0 -> 0.5, +1 -> 1

  // Find color based on value
  const getColor = (v: number) => {
    const zone = colorZones.find(z => v >= z.start && v < z.end)
    return zone?.color || '#666666'
  }

  const scaleHeight = showScale ? 16 : 0
  const readoutHeight = showNumericReadout ? 18 : 0
  const meterAreaHeight = height - scaleHeight - readoutHeight

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {/* Scale above */}
      {showScale && scalePosition === 'above' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#999',
          height: scaleHeight,
        }}>
          <span>-1</span>
          <span>0</span>
          <span>+1</span>
        </div>
      )}

      {/* Meter bar area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* Background track */}
        <div style={{
          width: '100%',
          height: barHeight,
          backgroundColor: '#333',
          borderRadius: 2,
          position: 'relative',
        }}>
          {/* Center marker at 0 correlation */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: '#666',
            transform: 'translateX(-50%)',
          }} />

          {/* Indicator */}
          <div style={{
            position: 'absolute',
            left: `${normalized * 100}%`,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: getColor(value),
            transform: 'translateX(-50%)',
            borderRadius: 2,
            transition: 'none',
          }} />
        </div>
      </div>

      {/* Scale below */}
      {showScale && scalePosition === 'below' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#999',
          height: scaleHeight,
        }}>
          <span>-1</span>
          <span>0</span>
          <span>+1</span>
        </div>
      )}

      {/* Numeric readout */}
      {showNumericReadout && (
        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: getColor(value),
          height: readoutHeight,
        }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </div>
      )}
    </div>
  )
}
