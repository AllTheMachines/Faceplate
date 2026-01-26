import { LEDArrayElementConfig } from '../../../../types/elements'

interface LEDArrayRendererProps {
  config: LEDArrayElementConfig
}

export function LEDArrayRenderer({ config }: LEDArrayRendererProps) {
  const {
    value,
    segmentCount,
    orientation,
    spacing,
    onColor,
    offColor,
    shape,
    cornerRadius,
    glowEnabled,
    glowRadius,
    glowIntensity,
    width,
    height,
  } = config

  // Calculate how many LEDs should be lit
  const litCount = Math.round(value * segmentCount)

  // Calculate individual LED size based on orientation
  const isHorizontal = orientation === 'horizontal'
  const ledSize = isHorizontal
    ? (width - spacing * (segmentCount - 1)) / segmentCount
    : (height - spacing * (segmentCount - 1)) / segmentCount

  // Calculate border radius based on shape
  const borderRadiusValue = shape === 'round' ? '50%' : `${cornerRadius}px`

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: `${spacing}px`,
      }}
    >
      {Array.from({ length: segmentCount }, (_, index) => {
        const isLit = index < litCount
        const currentColor = isLit ? onColor : offColor
        const boxShadow = isLit && glowEnabled
          ? `0 0 ${glowRadius}px ${glowIntensity}px ${onColor}`
          : 'none'

        return (
          <div
            key={index}
            style={{
              width: isHorizontal ? `${ledSize}px` : '100%',
              height: isHorizontal ? '100%' : `${ledSize}px`,
              backgroundColor: currentColor,
              borderRadius: borderRadiusValue,
              boxShadow,
              transition: 'none',
              flexShrink: 0,
            }}
          />
        )
      })}
    </div>
  )
}
