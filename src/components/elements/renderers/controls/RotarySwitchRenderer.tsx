import { RotarySwitchElementConfig } from '../../../../types/elements'

interface RotarySwitchRendererProps {
  config: RotarySwitchElementConfig
}

/**
 * RotarySwitchRenderer
 *
 * Renders a rotary switch with configurable 2-12 positions.
 * Features:
 * - Circular switch body with rotating pointer
 * - Labels displayed radially (2-6 positions) or as legend (7-12 positions)
 * - Current position highlighted
 */
export function RotarySwitchRenderer({ config }: RotarySwitchRendererProps) {
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
              fontFamily="Inter, system-ui, sans-serif"
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
            fontFamily: 'Inter, system-ui, sans-serif',
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
