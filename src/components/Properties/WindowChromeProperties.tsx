import { WindowChromeElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, TextInput, PropertySection } from './'

interface WindowChromePropertiesProps {
  element: WindowChromeElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function WindowChromeProperties({ element, onUpdate }: WindowChromePropertiesProps) {
  return (
    <>
      {/* Title Bar */}
      <PropertySection title="Title Bar">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={element.showTitle}
            onChange={(e) => onUpdate({ showTitle: e.target.checked })}
          />
          <span style={{ fontSize: '13px', color: '#d1d5db' }}>Show Title</span>
        </label>

        {element.showTitle && (
          <>
            <TextInput
              label="Title Text"
              value={element.titleText}
              onChange={(titleText) => onUpdate({ titleText })}
            />
            <NumberInput
              label="Title Font Size"
              value={element.titleFontSize}
              onChange={(titleFontSize) => onUpdate({ titleFontSize })}
              min={10}
              max={20}
            />
            <ColorInput
              label="Title Color"
              value={element.titleColor}
              onChange={(titleColor) => onUpdate({ titleColor })}
            />
          </>
        )}

        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <NumberInput
          label="Height"
          value={element.height}
          onChange={(height) => onUpdate({ height })}
          min={24}
          max={48}
        />
      </PropertySection>

      {/* Button Style */}
      <PropertySection title="Button Style">
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>
            Style
          </label>
          <select
            value={element.buttonStyle}
            onChange={(e) => onUpdate({ buttonStyle: e.target.value as 'macos' | 'windows' | 'neutral' })}
            style={{
              width: '100%',
              padding: '6px 8px',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: '1px solid #4b5563',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="macos">macOS (Traffic Lights)</option>
            <option value="windows">Windows (Icons)</option>
            <option value="neutral">Neutral (Circles)</option>
          </select>
        </div>
      </PropertySection>

      {/* Button Visibility */}
      <PropertySection title="Button Visibility">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={element.showCloseButton}
            onChange={(e) => onUpdate({ showCloseButton: e.target.checked })}
          />
          <span style={{ fontSize: '13px', color: '#d1d5db' }}>Show Close Button</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={element.showMinimizeButton}
            onChange={(e) => onUpdate({ showMinimizeButton: e.target.checked })}
          />
          <span style={{ fontSize: '13px', color: '#d1d5db' }}>Show Minimize Button</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={element.showMaximizeButton}
            onChange={(e) => onUpdate({ showMaximizeButton: e.target.checked })}
          />
          <span style={{ fontSize: '13px', color: '#d1d5db' }}>Show Maximize Button</span>
        </label>
      </PropertySection>
    </>
  )
}
