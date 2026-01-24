import { LabelElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
] as const

interface LabelPropertiesProps {
  element: LabelElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function LabelProperties({ element, onUpdate }: LabelPropertiesProps) {
  return (
    <>
      {/* Text */}
      <PropertySection title="Text">
        <TextInput
          label="Text"
          value={element.text}
          onChange={(text) => onUpdate({ text })}
        />
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={72}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.name} value={font.family}>
                {font.name}
              </option>
            ))}
          </select>
          <p
            className="text-xs text-gray-500 mt-1"
            style={{
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight
            }}
          >
            Preview: {element.text || 'Sample Text'}
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {FONT_WEIGHTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Text Align</label>
          <select
            value={element.textAlign}
            onChange={(e) =>
              onUpdate({ textAlign: e.target.value as LabelElementConfig['textAlign'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </PropertySection>

      {/* Color */}
      <PropertySection title="Color">
        <ColorInput
          label="Color"
          value={element.color}
          onChange={(color) => onUpdate({ color })}
        />
      </PropertySection>
    </>
  )
}
