import { SingleLEDElementConfig } from '../../../../types/elements'

interface SingleLEDRendererProps {
  config: SingleLEDElementConfig
}

export function SingleLEDRenderer({ config }: SingleLEDRendererProps) {
  const {
    state,
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

  const isOn = state === 'on'
  const currentColor = isOn ? onColor : offColor

  // Calculate border radius based on shape
  const borderRadiusValue = shape === 'round' ? '50%' : `${cornerRadius}px`

  // Generate glow effect
  const boxShadow = isOn && glowEnabled
    ? `0 0 ${glowRadius}px ${glowIntensity}px ${onColor}`
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
