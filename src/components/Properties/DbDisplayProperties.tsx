import { DbDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { FontFamilySelect, FontWeightSelect } from './shared'

interface DbDisplayPropertiesProps {
  element: DbDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function DbDisplayProperties({ element, onUpdate }: DbDisplayPropertiesProps) {
  return (
    <>
      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Value (dB)"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          step={0.1}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Min dB"
            value={element.minDb}
            onChange={(minDb) => onUpdate({ minDb })}
            step={1}
          />
          <NumberInput
            label="Max dB"
            value={element.maxDb}
            onChange={(maxDb) => onUpdate({ maxDb })}
            step={1}
          />
        </div>
      </PropertySection>

      {/* Display */}
      <PropertySection title="Display">
        <NumberInput
          label="Decimal Places"
          value={element.decimalPlaces}
          onChange={(decimalPlaces) => onUpdate({ decimalPlaces })}
          min={0}
          max={3}
          step={1}
        />
        <label
          htmlFor="dbdisplay-show-unit"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="dbdisplay-show-unit"
            checked={element.showUnit}
            onChange={(e) => onUpdate({ showUnit: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show "dB" Unit</span>
        </label>
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
        <FontFamilySelect
          value={element.fontFamily}
          onChange={(fontFamily) => onUpdate({ fontFamily })}
        />
        <FontWeightSelect
          value={element.fontWeight}
          onChange={(fontWeight) => onUpdate({ fontWeight: fontWeight as string })}
          variant="compact"
          valueType="string"
        />
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={72}
          step={1}
        />
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
