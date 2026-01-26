import { LEDMatrixElementConfig } from '../../../../types/elements'

interface LEDMatrixRendererProps {
  config: LEDMatrixElementConfig
}

export function LEDMatrixRenderer({ config }: LEDMatrixRendererProps) {
  const {
    rows,
    columns,
    states,
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

  // Calculate individual LED size
  const ledWidth = (width - spacing * (columns - 1)) / columns
  const ledHeight = (height - spacing * (rows - 1)) / rows
  const ledSize = Math.min(ledWidth, ledHeight)

  // Calculate border radius based on shape
  const borderRadiusValue = shape === 'round' ? '50%' : `${cornerRadius}px`

  // Flatten states array for rendering
  const flatStates = states.flat()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, ${ledSize}px)`,
        gridTemplateColumns: `repeat(${columns}, ${ledSize}px)`,
        gap: `${spacing}px`,
      }}
    >
      {flatStates.map((isLit, index) => {
        const currentColor = isLit ? onColor : offColor
        const boxShadow = isLit && glowEnabled
          ? `0 0 ${glowRadius}px ${glowIntensity}px ${onColor}`
          : 'none'

        return (
          <div
            key={index}
            style={{
              width: `${ledSize}px`,
              height: `${ledSize}px`,
              backgroundColor: currentColor,
              borderRadius: borderRadiusValue,
              boxShadow,
              transition: 'none',
              justifySelf: 'center',
              alignSelf: 'center',
            }}
          />
        )
      })}
    </div>
  )
}
