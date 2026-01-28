import { DropdownElementConfig } from '../../../../types/elements'

interface DropdownRendererProps {
  config: DropdownElementConfig
}

export function DropdownRenderer({ config }: DropdownRendererProps) {
  return (
    <div
      className="dropdown-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <select
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: `${config.borderRadius}px`,
          padding: '0 32px 0 8px',
          fontSize: `${config.fontSize}px`,
          fontFamily: config.fontFamily,
          fontWeight: config.fontWeight,
          cursor: 'pointer',
          appearance: 'none',
          outline: 'none',
        }}
        value={config.selectedIndex}
        onChange={(e) => e.preventDefault()}
      >
        {config.options.map((option, index) => (
          <option key={index} value={index}>
            {option}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `5px solid ${config.textColor}`,
        }}
      />
    </div>
  )
}
