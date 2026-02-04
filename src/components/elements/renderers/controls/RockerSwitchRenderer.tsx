import { useMemo } from 'react'
import { RockerSwitchElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface RockerSwitchRendererProps {
  config: RockerSwitchElementConfig
}

/**
 * DefaultRockerSwitchRenderer
 *
 * Renders a 3-position rocker switch with positions:
 * - 0: Down
 * - 1: Center
 * - 2: Up
 *
 * Supports spring-to-center and latch-all-positions modes.
 * Visual: Vertical track with movable paddle showing current position.
 */
function DefaultRockerSwitchRenderer({ config }: RockerSwitchRendererProps) {
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

/**
 * StyledRockerSwitchRenderer
 *
 * Renders a rocker switch using SVG artwork with position-based state layers.
 * Layer roles: base (static), position-0, position-1, position-2 (show/hide based on state)
 */
function StyledRockerSwitchRenderer({ config }: RockerSwitchRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'button') {
    console.warn('RockerSwitch requires button category style')
    return null
  }

  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      base: style.layers.base ? extractElementLayer(svgContent, style.layers.base) : null,
      position0: style.layers['position-0'] ? extractElementLayer(svgContent, style.layers['position-0']) : null,
      position1: style.layers['position-1'] ? extractElementLayer(svgContent, style.layers['position-1']) : null,
      position2: style.layers['position-2'] ? extractElementLayer(svgContent, style.layers['position-2']) : null,
    }
  }, [style, svgContent])

  if (!style) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#374151', borderRadius: '4px',
        color: '#9CA3AF', fontSize: '12px', textAlign: 'center', padding: '8px',
      }}>
        Style not found
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Static base - always visible */}
      {layers?.base && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.base} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Position 0 (down) - visible when position === 0 */}
      {layers?.position0 && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.position === 0 ? 1 : 0,
          transition: 'none', // Direct jump per CONTEXT.md
        }}>
          <SafeSVG content={layers.position0} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Position 1 (center) - visible when position === 1 */}
      {layers?.position1 && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.position === 1 ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.position1} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Position 2 (up) - visible when position === 2 */}
      {layers?.position2 && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.position === 2 ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.position2} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Labels - preserved from existing implementation */}
      {config.showLabels && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'flex-end',
          paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px',
          fontSize: `${config.labelFontSize}px`,
          fontFamily: config.labelFontFamily,
          fontWeight: config.labelFontWeight,
          color: config.labelColor,
          pointerEvents: 'none',
        }}>
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

/**
 * RockerSwitchRenderer - Delegating component
 *
 * Routes to StyledRockerSwitchRenderer when styleId is set,
 * otherwise falls back to DefaultRockerSwitchRenderer (CSS-based).
 */
export function RockerSwitchRenderer({ config }: RockerSwitchRendererProps) {
  if (!config.styleId) {
    return <DefaultRockerSwitchRenderer config={config} />
  }
  return <StyledRockerSwitchRenderer config={config} />
}
