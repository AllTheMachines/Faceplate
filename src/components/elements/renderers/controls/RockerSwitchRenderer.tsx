import { RockerSwitchElementConfig } from '../../../../types/elements'

interface RockerSwitchRendererProps {
  config: RockerSwitchElementConfig
}

/**
 * RockerSwitchRenderer
 *
 * Renders a 3-position rocker switch with positions:
 * - 0: Down
 * - 1: Center
 * - 2: Up
 *
 * Supports spring-to-center and latch-all-positions modes.
 * Visual: Vertical track with movable paddle showing current position.
 */
export function RockerSwitchRenderer({ config }: RockerSwitchRendererProps) {
  const { width, height } = config

  // Track and paddle dimensions
  const trackWidth = Math.min(width * 0.6, 30)
  const trackHeight = height * 0.85
  const paddleHeight = trackHeight / 3
  const paddleWidth = trackWidth - 4
  const cornerRadius = 4

  // Calculate paddle offset based on position
  // position 2 (up): top
  // position 1 (center): middle
  // position 0 (down): bottom
  let paddleOffset: number
  switch (config.position) {
    case 2:
      paddleOffset = 2
      break
    case 1:
      paddleOffset = (trackHeight - paddleHeight) / 2
      break
    case 0:
    default:
      paddleOffset = trackHeight - paddleHeight - 2
      break
  }

  // Position indicator symbols
  const positionIndicators: Record<0 | 1 | 2, string> = {
    2: '\u2191', // up arrow
    1: '\u2500', // horizontal line (center)
    0: '\u2193', // down arrow
  }

  return (
    <div
      className="rockerswitch-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        userSelect: 'none',
      }}
    >
      {/* Switch track and paddle */}
      <div
        style={{
          position: 'relative',
          width: trackWidth,
          height: trackHeight,
          backgroundColor: config.backgroundColor,
          border: `2px solid ${config.borderColor}`,
          borderRadius: cornerRadius,
        }}
      >
        {/* Paddle */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: paddleOffset,
            width: paddleWidth,
            height: paddleHeight,
            backgroundColor: config.switchColor,
            borderRadius: cornerRadius - 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ffffff',
            transition: 'none', // Instant position change
          }}
        >
          {positionIndicators[config.position]}
        </div>
      </div>

      {/* Labels (right side) */}
      {config.showLabels && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: trackHeight,
            fontSize: `${config.labelFontSize}px`,
            fontFamily: config.labelFontFamily,
            fontWeight: config.labelFontWeight,
            color: config.labelColor,
          }}
        >
          <span style={{ opacity: config.position === 2 ? 1 : 0.5 }}>
            {config.upLabel}
          </span>
          <span style={{ opacity: config.position === 0 ? 1 : 0.5 }}>
            {config.downLabel}
          </span>
        </div>
      )}
    </div>
  )
}
