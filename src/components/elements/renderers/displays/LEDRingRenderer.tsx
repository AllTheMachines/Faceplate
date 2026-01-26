import { LEDRingElementConfig } from '../../../../types/elements'

interface LEDRingRendererProps {
  config: LEDRingElementConfig
}

export function LEDRingRenderer({ config }: LEDRingRendererProps) {
  const {
    value,
    segmentCount,
    diameter,
    thickness,
    startAngle,
    endAngle,
    onColor,
    offColor,
    glowEnabled,
    glowRadius,
  } = config

  // Calculate arc parameters
  const radius = diameter / 2
  const circumference = 2 * Math.PI * (radius - thickness / 2)

  // Calculate total arc angle and lit arc length
  const totalArc = endAngle - startAngle
  const litArcAngle = value * totalArc

  // Calculate dash array for segments
  const segmentLength = circumference / segmentCount
  const gapLength = segmentLength * 0.2 // 20% gap between segments
  const dashLength = segmentLength - gapLength

  // Convert angles to radians for SVG rotation
  const rotationAngle = startAngle + 90 // SVG rotation (0° is at top)

  // Calculate stroke-dashoffset to show only lit portion
  const litSegments = Math.round((litArcAngle / totalArc) * segmentCount)
  const totalLitLength = litSegments * segmentLength

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        style={{
          transform: `rotate(${rotationAngle}deg)`,
        }}
      >
        <defs>
          {glowEnabled && (
            <filter id={`led-ring-glow-${config.id}`}>
              <feGaussianBlur stdDeviation={glowRadius / 2} />
              <feComponentTransfer>
                <feFuncA type="linear" slope="1.5" />
              </feComponentTransfer>
            </filter>
          )}
        </defs>

        {/* Background circle (off segments) */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - thickness / 2}
          fill="none"
          stroke={offColor}
          strokeWidth={thickness}
          strokeDasharray={`${dashLength} ${gapLength}`}
          opacity={0.8}
        />

        {/* Foreground arc (lit segments) */}
        {litSegments > 0 && (
          <circle
            cx={radius}
            cy={radius}
            r={radius - thickness / 2}
            fill="none"
            stroke={onColor}
            strokeWidth={thickness}
            strokeDasharray={`${totalLitLength} ${circumference - totalLitLength}`}
            strokeDashoffset={0}
            style={{
              filter: glowEnabled ? `url(#led-ring-glow-${config.id})` : 'none',
              transition: 'none',
            }}
          />
        )}
      </svg>
    </div>
  )
}
