import { EditableDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface EditableDisplayPropertiesProps {
  element: EditableDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function EditableDisplayProperties({ element, onUpdate }: EditableDisplayPropertiesProps) {
  return (
    <>
      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Value"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          min={0}
          max={1}
          step={0.01}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Min"
            value={element.min}
            onChange={(min) => onUpdate({ min })}
            step={1}
          />
          <NumberInput
            label="Max"
            value={element.max}
            onChange={(max) => onUpdate({ max })}
            step={1}
          />
        </div>
      </PropertySection>

      {/* Format */}
      <PropertySection title="Format">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Format</label>
          <select
            value={element.format}
            onChange={(e) => onUpdate({ format: e.target.value as 'numeric' | 'percentage' | 'db' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="numeric">Numeric</option>
            <option value="percentage">Percentage</option>
            <option value="db">dB</option>
          </select>
        </div>
        <NumberInput
          label="Decimal Places"
          value={element.decimalPlaces}
          onChange={(decimalPlaces) => onUpdate({ decimalPlaces })}
          min={0}
          max={6}
          step={1}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Font */}
      <PropertySection title="Font">
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={72}
          step={1}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="Roboto Mono, monospace">Roboto Mono</option>
            <option value="Inter, system-ui, sans-serif">Inter</option>
          </select>
        </div>
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={50}
          step={1}
        />
      </PropertySection>
    </>
  )
}
