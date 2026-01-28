import { PowerButtonElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface PowerButtonPropertiesProps {
  element: PowerButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PowerButtonProperties({ element, onUpdate }: PowerButtonPropertiesProps) {
  return (
    <>
      {/* Label */}
      <PropertySection title="Label">
        <TextInput
          label="Label"
          value={element.label}
          onChange={(label) => onUpdate({ label })}
        />
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
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
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={48}
        />
      </PropertySection>

      {/* State */}
      <PropertySection title="State">
        <label
          htmlFor="powerbutton-ison"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="powerbutton-ison"
            checked={element.isOn}
            onChange={(e) => onUpdate({ isOn: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">On (preview)</span>
        </label>
      </PropertySection>

      {/* LED */}
      <PropertySection title="LED Indicator">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Position</label>
          <select
            value={element.ledPosition}
            onChange={(e) =>
              onUpdate({ ledPosition: e.target.value as PowerButtonElementConfig['ledPosition'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="center">Center</option>
          </select>
        </div>
        <NumberInput
          label="LED Size"
          value={element.ledSize}
          onChange={(ledSize) => onUpdate({ ledSize })}
          min={4}
          max={16}
        />
        <ColorInput
          label="LED On Color"
          value={element.ledOnColor}
          onChange={(ledOnColor) => onUpdate({ ledOnColor })}
        />
        <ColorInput
          label="LED Off Color"
          value={element.ledOffColor}
          onChange={(ledOffColor) => onUpdate({ ledOffColor })}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Style */}
      <PropertySection title="Style">
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={20}
        />
      </PropertySection>
    </>
  )
}
