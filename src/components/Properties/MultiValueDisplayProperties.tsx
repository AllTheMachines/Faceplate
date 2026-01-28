import { MultiValueDisplayElementConfig, ElementConfig } from '../../types/elements'
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

interface MultiValueDisplayPropertiesProps {
  element: MultiValueDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function MultiValueDisplayProperties({ element, onUpdate }: MultiValueDisplayPropertiesProps) {
  // Handle value updates
  const updateValue = (index: number, updates: Partial<MultiValueDisplayElementConfig['values'][0]>) => {
    const newValues = [...element.values]
    const currentValue = newValues[index]!
    newValues[index] = { ...currentValue, ...updates }
    onUpdate({ values: newValues })
  }

  const addValue = () => {
    if (element.values.length >= 4) return
    const newValues = [
      ...element.values,
      { value: 0.5, min: 0, max: 100, format: 'numeric', label: `Value ${element.values.length + 1}`, decimalPlaces: 1 }
    ]
    onUpdate({ values: newValues })
  }

  const removeValue = (index: number) => {
    if (element.values.length <= 1) return
    const newValues = element.values.filter((_, i) => i !== index)
    onUpdate({ values: newValues })
  }

  return (
    <>
      {/* Layout */}
      <PropertySection title="Layout">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Layout</label>
          <select
            value={element.layout}
            onChange={(e) => onUpdate({ layout: e.target.value as 'vertical' | 'horizontal' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
      </PropertySection>

      {/* Values */}
      <PropertySection title="Values">
        {element.values.slice(0, 4).map((val, index) => (
          <div key={index} className="border border-gray-600 rounded p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Value {index + 1}</span>
              {element.values.length > 1 && (
                <button
                  onClick={() => removeValue(index)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
            <TextInput
              label="Label"
              value={val.label || ''}
              onChange={(label) => updateValue(index, { label })}
              placeholder={`Value ${index + 1}`}
            />
            <NumberInput
              label="Value"
              value={val.value}
              onChange={(value) => updateValue(index, { value })}
              min={0}
              max={1}
              step={0.01}
            />
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="Min"
                value={val.min}
                onChange={(min) => updateValue(index, { min })}
                step={1}
              />
              <NumberInput
                label="Max"
                value={val.max}
                onChange={(max) => updateValue(index, { max })}
                step={1}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Format</label>
                <select
                  value={val.format}
                  onChange={(e) => updateValue(index, { format: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
                >
                  <option value="numeric">Numeric</option>
                  <option value="percentage">Percentage</option>
                  <option value="db">dB</option>
                </select>
              </div>
              <NumberInput
                label="Decimals"
                value={val.decimalPlaces ?? 1}
                onChange={(decimalPlaces) => updateValue(index, { decimalPlaces })}
                min={0}
                max={6}
                step={1}
              />
            </div>
          </div>
        ))}
        {element.values.length < 4 && (
          <button
            onClick={addValue}
            className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 border border-gray-600 rounded"
          >
            + Add Value
          </button>
        )}
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
