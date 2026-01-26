import { BiColorLEDElementConfig } from '../../../../types/elements'

interface BiColorLEDRendererProps {
  config: BiColorLEDElementConfig
}

export function BiColorLEDRenderer({ config }: BiColorLEDRendererProps) {
  const {
    state,
    greenColor,
    redColor,
    shape,
    cornerRadius,
    glowEnabled,
    glowRadius,
    glowIntensity,
    width,
    height,
  } = config

  // Bi-color LED is always lit (green or red)
  const currentColor = state === 'green' ? greenColor : redColor

  // Calculate border radius based on shape
  const borderRadiusValue = shape === 'round' ? '50%' : `${cornerRadius}px`

  // Generate glow effect with current state color
  const boxShadow = glowEnabled
    ? `0 0 ${glowRadius}px ${glowIntensity}px ${currentColor}`
    : 'none'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: currentColor,
          borderRadius: borderRadiusValue,
          boxShadow,
          transition: 'none',
        }}
      />
    </div>
  )
}
