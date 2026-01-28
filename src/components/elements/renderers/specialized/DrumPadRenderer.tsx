import { DrumPadElementConfig } from '../../../../types/elements'

interface DrumPadRendererProps {
  config: DrumPadElementConfig
}

export function DrumPadRenderer({ config }: DrumPadRendererProps) {
  const {
    label,
    isPressed,
    velocity,
    backgroundColor,
    pressedColor,
    labelColor,
    borderColor,
    borderWidth,
    fontSize,
    fontFamily,
    fontWeight,
    showVelocity,
    width,
    height,
  } = config

  // Calculate color based on pressed state and velocity
  const padColor = isPressed ? pressedColor : backgroundColor
  const velocityOpacity = showVelocity && isPressed ? velocity / 127 : 1

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: padColor,
        border: `${borderWidth}px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        opacity: velocityOpacity,
        transition: 'all 0.05s ease-out',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      }}
    >
      {/* Label */}
      <span
        style={{
          color: labelColor,
          fontSize: `${fontSize}px`,
          fontFamily,
          fontWeight,
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        {label}
      </span>

      {/* Velocity indicator bar */}
      {showVelocity && (
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            right: 4,
            height: 4,
            backgroundColor: 'rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(velocity / 127) * 100}%`,
              height: '100%',
              backgroundColor: pressedColor,
              transition: 'width 0.1s',
            }}
          />
        </div>
      )}
    </div>
  )
}
