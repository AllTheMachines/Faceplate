import { ToggleSwitchElementConfig } from '../../../../types/elements'

interface ToggleSwitchRendererProps {
  config: ToggleSwitchElementConfig
}

export function ToggleSwitchRenderer({ config }: ToggleSwitchRendererProps) {
  const { width, height } = config

  // iOS-style toggle switch with pill shape
  // Thumb is circular with diameter = height - padding
  const padding = 2
  const thumbDiameter = height - padding * 2
  const trackRadius = height / 2

  // Thumb position: instant snap (no transition)
  const thumbOffset = config.isOn ? width - height : 0

  return (
    <div
      className="toggle-switch-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Track */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: trackRadius,
          backgroundColor: config.isOn ? config.onColor : config.offColor,
          border: `1px solid ${config.borderColor}`,
          transition: 'none',
          position: 'relative',
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: padding,
            left: padding + thumbOffset,
            width: thumbDiameter,
            height: thumbDiameter,
            borderRadius: '50%',
            backgroundColor: config.thumbColor,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'none',
          }}
        />

        {/* Labels */}
        {config.showLabels && (
          <>
            {/* ON label (left side, visible when off) */}
            <div
              style={{
                position: 'absolute',
                left: height * 0.4,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: Math.max(8, height * 0.35),
                fontWeight: 600,
                color: config.labelColor,
                opacity: config.isOn ? 0.3 : 0.8,
                transition: 'none',
                userSelect: 'none',
              }}
            >
              {config.offLabel}
            </div>
            {/* OFF label (right side, visible when on) */}
            <div
              style={{
                position: 'absolute',
                right: height * 0.4,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: Math.max(8, height * 0.35),
                fontWeight: 600,
                color: config.labelColor,
                opacity: config.isOn ? 0.8 : 0.3,
                transition: 'none',
                userSelect: 'none',
              }}
            >
              {config.onLabel}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
