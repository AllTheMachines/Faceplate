import type { StereoWidthMeterElementConfig } from '../../../../../types/elements/displays'

interface Props {
  config: StereoWidthMeterElementConfig
}

export function StereoWidthMeterRenderer({ config }: Props) {
  const { width, height, value, barHeight, showScale, scalePosition, showNumericReadout, colorZones } = config

  // value is 0-2 (representing 0-200%)
  const percentage = value * 100
  const normalized = value / 2 // 0-2 -> 0-1

  // Find color based on percentage value
  const getColor = (pct: number) => {
    const zone = colorZones.find(z => pct >= z.start && pct < z.end)
    return zone?.color || '#666666'
  }

  const scaleHeight = showScale ? 16 : 0
  const readoutHeight = showNumericReadout ? 18 : 0

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
          <span>0%</span>
          <span>100%</span>
          <span>200%</span>
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
          {/* Center marker at 100% */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: '#666',
            transform: 'translateX(-50%)',
          }} />

          {/* Fill bar from left */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${normalized * 100}%`,
            backgroundColor: getColor(percentage),
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
          <span>0%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
      )}

      {/* Numeric readout */}
      {showNumericReadout && (
        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: getColor(percentage),
          height: readoutHeight,
        }}>
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  )
}
