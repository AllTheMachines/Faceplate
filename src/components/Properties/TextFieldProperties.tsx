import { TextFieldElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface TextFieldPropertiesProps {
  element: TextFieldElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function TextFieldProperties({ element, onUpdate }: TextFieldPropertiesProps) {
  return (
    <>
      {/* Content */}
      <PropertySection title="Content">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Value</label>
          <input
            type="text"
            value={element.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            placeholder="Enter text value..."
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Placeholder</label>
          <input
            type="text"
            value={element.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            placeholder="Enter placeholder text..."
          />
        </div>
        <NumberInput
          label="Max Length (0 = unlimited)"
          value={element.maxLength}
          onChange={(maxLength) => onUpdate({ maxLength })}
          min={0}
          max={1000}
        />
      </PropertySection>

      {/* Text */}
      <PropertySection title="Text">
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
          max={72}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Text Align</label>
          <select
            value={element.textAlign}
            onChange={(e) => onUpdate({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={32}
        />
      </PropertySection>

      {/* Border */}
      <PropertySection title="Border">
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={10}
        />
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
