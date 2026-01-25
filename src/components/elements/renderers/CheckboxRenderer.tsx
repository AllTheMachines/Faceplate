import { CheckboxElementConfig } from '../../../types/elements'

interface CheckboxRendererProps {
  config: CheckboxElementConfig
}

export function CheckboxRenderer({ config }: CheckboxRendererProps) {
  const checkbox = (
    <div
      style={{
        width: '18px',
        height: '18px',
        minWidth: '18px',
        minHeight: '18px',
        backgroundColor: config.backgroundColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {config.checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke={config.checkColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )

  const label = (
    <span
      style={{
        color: config.textColor,
        fontSize: '14px',
        fontFamily: 'Inter, system-ui, sans-serif',
        userSelect: 'none',
        marginLeft: config.labelPosition === 'right' ? '8px' : '0',
        marginRight: config.labelPosition === 'left' ? '8px' : '0',
      }}
    >
      {config.label}
    </span>
  )

  return (
    <div
      className="checkbox-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: config.labelPosition === 'left' ? 'row-reverse' : 'row',
        justifyContent: 'flex-start',
        cursor: 'pointer',
      }}
    >
      {config.labelPosition === 'left' ? (
        <>
          {checkbox}
          {label}
        </>
      ) : (
        <>
          {checkbox}
          {label}
        </>
      )}
    </div>
  )
}
