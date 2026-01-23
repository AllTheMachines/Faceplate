import { LabelElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'

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
        <TextInput
          label="Font Family"
          value={element.fontFamily}
          onChange={(fontFamily) => onUpdate({ fontFamily })}
          placeholder="Inter, system-ui, sans-serif"
        />
        <NumberInput
          label="Font Weight"
          value={element.fontWeight}
          onChange={(fontWeight) => onUpdate({ fontWeight })}
          min={100}
          max={900}
          step={100}
        />
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
