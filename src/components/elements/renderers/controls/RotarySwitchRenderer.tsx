import { useMemo } from 'react'
import { RotarySwitchElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface RotarySwitchRendererProps {
  config: RotarySwitchElementConfig
}

/**
 * DefaultRotarySwitchRenderer
 *
 * Renders a rotary switch with configurable 2-12 positions.
 * Features:
 * - Circular switch body with rotating pointer
 * - Labels displayed radially (2-6 positions) or as legend (7-12 positions)
 * - Current position highlighted
 */
function DefaultRotarySwitchRenderer({ config }: RotarySwitchRendererProps) {
  const { width, height, positionCount, currentPosition, rotationAngle } = config

  // Calculate dimensions
  const size = Math.min(width, height)
  const centerX = size / 2
  const centerY = size / 2
  const radius = size * 0.35
  const pointerLength = radius * 0.7

  // Calculate angle per position
  const anglePerPosition = positionCount > 1 ? rotationAngle / (positionCount - 1) : 0
  // Current pointer angle (centered at -rotationAngle/2)
  const startAngle = -rotationAngle / 2
  const currentAngle = startAngle + currentPosition * anglePerPosition

  // Generate position labels
  const labels = config.positionLabels || Array.from({ length: positionCount }, (_, i) => String(i + 1))

  // Convert angle to radians for calculations
  const degToRad = (deg: number) => (deg * Math.PI) / 180

  // Calculate pointer end position
  const pointerEndX = centerX + pointerLength * Math.sin(degToRad(currentAngle))
  const pointerEndY = centerY - pointerLength * Math.cos(degToRad(currentAngle))

  // Generate label positions for radial layout
  const labelRadius = radius + 20
  const generateRadialLabels = () =>
    labels.slice(0, positionCount).map((label, i) => {
      const angle = startAngle + i * anglePerPosition
      const x = centerX + labelRadius * Math.sin(degToRad(angle))
      const y = centerY - labelRadius * Math.cos(degToRad(angle))
      const isActive = i === currentPosition
      return { label, x, y, isActive, index: i }
    })

  const radialLabels = config.labelLayout === 'radial' ? generateRadialLabels() : []

  return (
    <div
      className="rotaryswitch-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: config.labelLayout === 'legend' ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        userSelect: 'none',
      }}
    >
      {/* Switch SVG */}
      <svg
        width={config.labelLayout === 'legend' ? size * 0.6 : '100%'}
        height={config.labelLayout === 'legend' ? size * 0.6 : '100%'}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Switch body */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={config.backgroundColor}
          stroke={config.borderColor}
          strokeWidth={2}
        />

        {/* Position indicator marks on the body */}
        {Array.from({ length: positionCount }).map((_, i) => {
          const angle = startAngle + i * anglePerPosition
          const markStartRadius = radius - 6
          const markEndRadius = radius - 2
          const x1 = centerX + markStartRadius * Math.sin(degToRad(angle))
          const y1 = centerY - markStartRadius * Math.cos(degToRad(angle))
          const x2 = centerX + markEndRadius * Math.sin(degToRad(angle))
          const y2 = centerY - markEndRadius * Math.cos(degToRad(angle))
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i === currentPosition ? config.pointerColor : config.borderColor}
              strokeWidth={2}
              strokeLinecap="round"
            />
          )
        })}

        {/* Pointer/indicator line */}
        <line
          x1={centerX}
          y1={centerY}
          x2={pointerEndX}
          y2={pointerEndY}
          stroke={config.pointerColor}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transition: 'none' }}
        />

        {/* Center dot */}
        <circle cx={centerX} cy={centerY} r={4} fill={config.pointerColor} />

        {/* Radial labels (for 2-6 positions) */}
        {config.labelLayout === 'radial' &&
          radialLabels.map(({ label, x, y, isActive, index }) => (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={config.labelFontSize}
              fill={config.labelColor}
              fontWeight={isActive ? 'bold' : 'normal'}
              opacity={isActive ? 1 : 0.6}
              fontFamily={config.labelFontFamily}
            >
              {label}
            </text>
          ))}
      </svg>

      {/* Legend layout (for 7-12 positions) */}
      {config.labelLayout === 'legend' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontSize: `${config.labelFontSize}px`,
            fontFamily: config.labelFontFamily,
            fontWeight: config.labelFontWeight,
          }}
        >
          {labels.slice(0, positionCount).map((label, i) => (
            <span
              key={i}
              style={{
                color: config.labelColor,
                opacity: i === currentPosition ? 1 : 0.5,
                fontWeight: i === currentPosition ? 'bold' : 'normal',
              }}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * StyledRotarySwitchRenderer
 *
 * Renders a rotary switch using SVG artwork with static base and rotating selector.
 * Layer roles: base (static), selector (rotates with position)
 */
function StyledRotarySwitchRenderer({ config }: RotarySwitchRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  if (style && style.category !== 'button') {
    console.warn('RotarySwitch requires button category style')
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
      selector: style.layers.selector ? extractElementLayer(svgContent, style.layers.selector) : null,
    }
  }, [style, svgContent])

  // Calculate rotation angle - same logic as existing RotarySwitchRenderer
  const { positionCount, currentPosition, rotationAngle } = config
  const anglePerPosition = positionCount > 1 ? rotationAngle / (positionCount - 1) : 0
  const startAngle = -rotationAngle / 2
  const currentAngle = startAngle + currentPosition * anglePerPosition

  // Generate label positions for radial layout (preserve existing behavior)
  const size = Math.min(config.width, config.height)
  const centerX = size / 2
  const centerY = size / 2
  const labelRadius = size * 0.35 + 20
  const degToRad = (deg: number) => (deg * Math.PI) / 180

  const labels = config.positionLabels || Array.from({ length: positionCount }, (_, i) => String(i + 1))

  const radialLabels = config.labelLayout === 'radial'
    ? labels.slice(0, positionCount).map((label, i) => {
        const angle = startAngle + i * anglePerPosition
        const x = centerX + labelRadius * Math.sin(degToRad(angle))
        const y = centerY - labelRadius * Math.cos(degToRad(angle))
        const isActive = i === currentPosition
        return { label, x, y, isActive, index: i }
      })
    : []

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
    <div
      style={{
        width: '100%', height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: config.labelLayout === 'legend' ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      {/* SVG container for base + rotating selector */}
      <div style={{
        position: 'relative',
        width: config.labelLayout === 'legend' ? size * 0.6 : '100%',
        height: config.labelLayout === 'legend' ? size * 0.6 : '100%',
      }}>
        {/* Static base */}
        {layers?.base && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <SafeSVG content={layers.base} style={{ width: '100%', height: '100%' }} />
          </div>
        )}

        {/* Rotating selector */}
        {layers?.selector && (
          <div style={{
            position: 'absolute', inset: 0,
            transform: `rotate(${currentAngle}deg)`,
            transformOrigin: 'center center',
            transition: 'none', // Per CONTEXT.md: keep current motion (instant)
          }}>
            <SafeSVG content={layers.selector} style={{ width: '100%', height: '100%' }} />
          </div>
        )}

        {/* Radial labels (preserved from existing implementation) */}
        {config.labelLayout === 'radial' && (
          <svg
            style={{
              position: 'absolute', inset: 0,
              overflow: 'visible',
              pointerEvents: 'none',
            }}
            viewBox={`0 0 ${size} ${size}`}
          >
            {radialLabels.map(({ label, x, y, isActive, index }) => (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={config.labelFontSize}
                fill={config.labelColor}
                fontWeight={isActive ? 'bold' : 'normal'}
                opacity={isActive ? 1 : 0.6}
                fontFamily={config.labelFontFamily}
              >
                {label}
              </text>
            ))}
          </svg>
        )}
      </div>

      {/* Legend layout (preserved from existing implementation) */}
      {config.labelLayout === 'legend' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontSize: `${config.labelFontSize}px`,
            fontFamily: config.labelFontFamily,
            fontWeight: config.labelFontWeight,
          }}
        >
          {labels.slice(0, positionCount).map((label, i) => (
            <span
              key={i}
              style={{
                color: config.labelColor,
                opacity: i === currentPosition ? 1 : 0.5,
                fontWeight: i === currentPosition ? 'bold' : 'normal',
              }}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * RotarySwitchRenderer - Delegating component
 *
 * Routes to StyledRotarySwitchRenderer when styleId is set,
 * otherwise falls back to DefaultRotarySwitchRenderer (CSS-based).
 */
export function RotarySwitchRenderer({ config }: RotarySwitchRendererProps) {
  if (!config.styleId) {
    return <DefaultRotarySwitchRenderer config={config} />
  }
  return <StyledRotarySwitchRenderer config={config} />
}
