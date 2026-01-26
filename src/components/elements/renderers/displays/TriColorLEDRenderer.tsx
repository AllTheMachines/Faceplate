import { TriColorLEDElementConfig } from '../../../../types/elements'

interface TriColorLEDRendererProps {
  config: TriColorLEDElementConfig
}

export function TriColorLEDRenderer({ config }: TriColorLEDRendererProps) {
  const {
    state,
    offColor,
    yellowColor,
    redColor,
    shape,
    cornerRadius,
    glowEnabled,
    glowRadius,
    glowIntensity,
    width,
    height,
  } = config

  // Map state to color
  const colorMap = {
    off: offColor,
    yellow: yellowColor,
    red: redColor,
  }
  const currentColor = colorMap[state]
  const isLit = state !== 'off'

  // Calculate border radius based on shape
  const borderRadiusValue = shape === 'round' ? '50%' : `${cornerRadius}px`

  // Generate glow effect only when lit
  const boxShadow = isLit && glowEnabled
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
