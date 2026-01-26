import { RadioGroupElementConfig } from '../../../../types/elements'

interface RadioGroupRendererProps {
  config: RadioGroupElementConfig
}

export function RadioGroupRenderer({ config }: RadioGroupRendererProps) {
  return (
    <div
      className="radiogroup-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: config.orientation === 'vertical' ? 'column' : 'row',
        gap: `${config.spacing}px`,
        backgroundColor: config.backgroundColor,
        padding: config.backgroundColor !== 'transparent' ? '4px' : '0',
      }}
    >
      {config.options.map((option, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Radio button */}
          <div
            style={{
              width: '16px',
              height: '16px',
              minWidth: '16px',
              minHeight: '16px',
              borderRadius: '50%',
              border: `2px solid ${config.borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {config.selectedIndex === index && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: config.radioColor,
                }}
              />
            )}
          </div>
          {/* Label */}
          <span
            style={{
              marginLeft: '8px',
              color: config.textColor,
              fontSize: '14px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {option}
          </span>
        </div>
      ))}
    </div>
  )
}
