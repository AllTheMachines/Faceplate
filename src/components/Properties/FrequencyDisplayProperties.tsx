import { FrequencyDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface FrequencyDisplayPropertiesProps {
  element: FrequencyDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function FrequencyDisplayProperties({
  element,
  onUpdate,
}: FrequencyDisplayPropertiesProps) {
  return (
    <>
      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Frequency (Hz)"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          min={0}
          step={1}
        />
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
          htmlFor="freqdisplay-auto-khz"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="freqdisplay-auto-khz"
            checked={element.autoSwitchKHz}
            onChange={(e) => onUpdate({ autoSwitchKHz: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Auto-switch to kHz at 1000Hz</span>
        </label>
        <label
          htmlFor="freqdisplay-show-unit"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="freqdisplay-show-unit"
            checked={element.showUnit}
            onChange={(e) => onUpdate({ showUnit: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Unit</span>
        </label>
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
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
          <input
            type="text"
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          />
        </div>
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
