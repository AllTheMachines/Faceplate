import { EditableDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, PropertySection } from './'
import { ColorsSection, FontSection } from './shared'
import { SELECT_CLASSNAME } from './constants'

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
            className={SELECT_CLASSNAME}
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
      <ColorsSection
        textColor={element.textColor}
        backgroundColor={element.backgroundColor}
        borderColor={element.borderColor}
        onTextColorChange={(textColor) => onUpdate({ textColor })}
        onBackgroundColorChange={(backgroundColor) => onUpdate({ backgroundColor })}
        onBorderColorChange={(borderColor) => onUpdate({ borderColor })}
      />

      {/* Font */}
      <FontSection
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontWeight={element.fontWeight}
        padding={element.padding}
        onFontSizeChange={(fontSize) => onUpdate({ fontSize })}
        onFontFamilyChange={(fontFamily) => onUpdate({ fontFamily })}
        onFontWeightChange={(fontWeight) => onUpdate({ fontWeight })}
        onPaddingChange={(padding) => onUpdate({ padding })}
      />
    </>
  )
}
