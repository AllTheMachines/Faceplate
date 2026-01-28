import { KickButtonElementConfig } from '../../../../types/elements'

interface KickButtonRendererProps {
  config: KickButtonElementConfig
}

export function KickButtonRenderer({ config }: KickButtonRendererProps) {
  return (
    <div
      className="kick-button-element"
      style={{
        width: '100%',
        height: '100%',
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
        // Pressed state: flash brighter
        filter: config.pressed ? 'brightness(1.2)' : 'brightness(1)',
        boxShadow: config.pressed
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(0,0,0,0.2)',
      }}
    >
      {config.label}
    </div>
  )
}
