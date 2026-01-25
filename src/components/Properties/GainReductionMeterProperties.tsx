import { GainReductionMeterElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface GainReductionMeterPropertiesProps {
  element: GainReductionMeterElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function GainReductionMeterProperties({
  element,
  onUpdate,
}: GainReductionMeterPropertiesProps) {
  const handleOrientationChange = (
    newOrientation: GainReductionMeterElementConfig['orientation']
  ) => {
    // When changing orientation, swap width and height for better UX
    if (newOrientation !== element.orientation) {
      onUpdate({
        orientation: newOrientation,
        width: element.height,
        height: element.width,
      })
    }
  }

  return (
    <>
      {/* Layout */}
      <PropertySection title="Layout">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Orientation</label>
          <select
            value={element.orientation}
            onChange={(e) =>
              handleOrientationChange(
                e.target.value as GainReductionMeterElementConfig['orientation']
              )
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
      </PropertySection>

      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Value (0-1)"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          min={0}
          max={1}
          step={0.01}
        />
        <NumberInput
          label="Max Reduction (dB)"
          value={element.maxReduction}
          onChange={(maxReduction) => onUpdate({ maxReduction })}
          step={1}
        />
        <p className="text-xs text-gray-500 mt-1">
          Max Reduction should be negative (e.g., -24 for 24dB reduction)
        </p>
      </PropertySection>

      {/* Display */}
      <PropertySection title="Display">
        <label
          htmlFor="grmeter-show-value"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="grmeter-show-value"
            checked={element.showValue}
            onChange={(e) => onUpdate({ showValue: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Value</span>
        </label>
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={6}
          max={24}
          step={1}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Meter Color"
          value={element.meterColor}
          onChange={(meterColor) => onUpdate({ meterColor })}
        />
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
      </PropertySection>
    </>
  )
}
