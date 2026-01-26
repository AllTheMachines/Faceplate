import { ButtonElementConfig } from '../../../types/elements'

interface ButtonRendererProps {
  config: ButtonElementConfig
}

export function ButtonRenderer({ config }: ButtonRendererProps) {
  return (
    <div
      className="button-element"
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
        fontSize: '14px',
        fontWeight: 500,
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.1s, box-shadow 0.1s, transform 0.1s',
        // Pressed state visuals
        filter: config.pressed ? 'brightness(0.85)' : 'brightness(1)',
        boxShadow: config.pressed
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(0,0,0,0.2)',
        transform: config.pressed ? 'translateY(1px)' : 'none',
      }}
    >
      {config.label}
    </div>
  )
}
