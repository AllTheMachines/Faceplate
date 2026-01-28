import { ToggleSwitchElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface ToggleSwitchPropertiesProps {
  element: ToggleSwitchElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ToggleSwitchProperties({ element, onUpdate }: ToggleSwitchPropertiesProps) {
  return (
    <>
      {/* State */}
      <PropertySection title="State">
        <label
          htmlFor="toggleswitch-ison"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="toggleswitch-ison"
            checked={element.isOn}
            onChange={(e) => onUpdate({ isOn: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">On (preview)</span>
        </label>
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="On Color"
          value={element.onColor}
          onChange={(onColor) => onUpdate({ onColor })}
        />
        <ColorInput
          label="Off Color"
          value={element.offColor}
          onChange={(offColor) => onUpdate({ offColor })}
        />
        <ColorInput
          label="Thumb Color"
          value={element.thumbColor}
          onChange={(thumbColor) => onUpdate({ thumbColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <label
          htmlFor="toggleswitch-showlabels"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="toggleswitch-showlabels"
            checked={element.showLabels}
            onChange={(e) => onUpdate({ showLabels: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Labels</span>
        </label>
        {element.showLabels && (
          <>
            <TextInput
              label="On Label"
              value={element.onLabel}
              onChange={(onLabel) => onUpdate({ onLabel })}
            />
            <TextInput
              label="Off Label"
              value={element.offLabel}
              onChange={(offLabel) => onUpdate({ offLabel })}
            />
            <div>
              <label className="block text-xs text-gray-400 mb-1">Font Family</label>
              <select
                value={element.labelFontFamily}
                onChange={(e) => onUpdate({ labelFontFamily: e.target.value })}
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
                value={element.labelFontWeight}
                onChange={(e) => onUpdate({ labelFontWeight: e.target.value })}
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
              label="Font Size"
              value={element.labelFontSize}
              onChange={(labelFontSize) => onUpdate({ labelFontSize })}
              min={8}
              max={32}
            />
            <ColorInput
              label="Label Color"
              value={element.labelColor}
              onChange={(labelColor) => onUpdate({ labelColor })}
            />
          </>
        )}
      </PropertySection>
    </>
  )
}
