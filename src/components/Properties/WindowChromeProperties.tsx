import { WindowChromeElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, TextInput, PropertySection } from './'
import { EditContentsButton } from './EditContentsButton'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface WindowChromePropertiesProps {
  element: WindowChromeElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function WindowChromeProperties({ element, onUpdate }: WindowChromePropertiesProps) {
  return (
    <>
      {/* Edit Contents Button */}
      <EditContentsButton element={element} />

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
            <div>
              <label className="block text-xs text-gray-400 mb-1">Font Family</label>
              <select
                value={element.fontFamily}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
              <select
                value={element.fontWeight}
                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="300">Light (300)</option>
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>
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

      {/* Content */}
      <PropertySection title="Content">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={element.allowScroll ?? false}
            onChange={(e) => onUpdate({ allowScroll: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-300">Allow Scrolling</span>
        </label>
      </PropertySection>

      {/* Scrollbar Style (only shown when scrolling is enabled) */}
      {element.allowScroll && (
        <ScrollbarStyleSection config={element} onUpdate={onUpdate} />
      )}
    </>
  )
}
