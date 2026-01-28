import { PowerButtonElementConfig } from '../../../../types/elements'

interface PowerButtonRendererProps {
  config: PowerButtonElementConfig
}

export function PowerButtonRenderer({ config }: PowerButtonRendererProps) {
  const { ledPosition, ledSize, ledOnColor, ledOffColor, isOn } = config

  // Calculate LED position styles
  const getLedPositionStyles = (): React.CSSProperties => {
    const offset = 4 // pixels from edge
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: ledSize,
      height: ledSize,
      borderRadius: '50%',
      backgroundColor: isOn ? ledOnColor : ledOffColor,
      boxShadow: isOn ? `0 0 ${ledSize}px ${ledOnColor}` : 'none',
      transition: 'none',
    }

    switch (ledPosition) {
      case 'top':
        return { ...baseStyles, top: offset, left: '50%', transform: 'translateX(-50%)' }
      case 'bottom':
        return { ...baseStyles, bottom: offset, left: '50%', transform: 'translateX(-50%)' }
      case 'left':
        return { ...baseStyles, left: offset, top: '50%', transform: 'translateY(-50%)' }
      case 'right':
        return { ...baseStyles, right: offset, top: '50%', transform: 'translateY(-50%)' }
      case 'center':
        return { ...baseStyles, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      default:
        return baseStyles
    }
  }

  // Calculate label position based on LED
  const getLabelPadding = () => {
    const ledPadding = ledSize + 8
    switch (ledPosition) {
      case 'top':
        return { paddingTop: ledPadding }
      case 'bottom':
        return { paddingBottom: ledPadding }
      case 'left':
        return { paddingLeft: ledPadding }
      case 'right':
        return { paddingRight: ledPadding }
      default:
        return {}
    }
  }

  return (
    <div
      className="power-button-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        borderRadius: `${config.borderRadius}px`,
        border: `2px solid ${config.borderColor}`,
        fontSize: `${config.fontSize}px`,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'none',
        // Brighter when on
        filter: isOn ? 'brightness(1.1)' : 'brightness(1)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        ...getLabelPadding(),
      }}
    >
      {/* LED indicator */}
      <div style={getLedPositionStyles()} />

      {/* Label */}
      {config.label && (
        <span style={{ textAlign: 'center' }}>{config.label}</span>
      )}
    </div>
  )
}
