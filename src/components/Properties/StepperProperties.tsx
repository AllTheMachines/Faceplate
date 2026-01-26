import { StepperElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface StepperPropertiesProps {
  element: StepperElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function StepperProperties({ element, onUpdate }: StepperPropertiesProps) {
  return (
    <>
      {/* Value Range */}
      <PropertySection title="Value Range">
        <NumberInput
          label="Value"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          min={element.min}
          max={element.max}
          step={element.step}
        />
        <NumberInput
          label="Step"
          value={element.step}
          onChange={(step) => onUpdate({ step })}
          min={0.001}
          max={100}
          step={0.001}
        />
        <NumberInput
          label="Min"
          value={element.min}
          onChange={(min) => onUpdate({ min })}
        />
        <NumberInput
          label="Max"
          value={element.max}
          onChange={(max) => onUpdate({ max })}
        />
      </PropertySection>

      {/* Display */}
      <PropertySection title="Display">
        <label
          htmlFor="stepper-showvalue"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="stepper-showvalue"
            checked={element.showValue}
            onChange={(e) => onUpdate({ showValue: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Value</span>
        </label>
        {element.showValue && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Value Format</label>
              <select
                value={element.valueFormat}
                onChange={(e) =>
                  onUpdate({ valueFormat: e.target.value as StepperElementConfig['valueFormat'] })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="numeric">Numeric</option>
                <option value="custom">Custom (with suffix)</option>
              </select>
            </div>
            <NumberInput
              label="Decimal Places"
              value={element.decimalPlaces}
              onChange={(decimalPlaces) => onUpdate({ decimalPlaces })}
              min={0}
              max={6}
            />
            <div>
              <label htmlFor="stepper-suffix" className="block text-xs text-gray-400 mb-1">
                Value Suffix
              </label>
              <input
                type="text"
                id="stepper-suffix"
                value={element.valueSuffix}
                onChange={(e) => onUpdate({ valueSuffix: e.target.value })}
                placeholder="e.g., dB, Hz, %"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
          </>
        )}
      </PropertySection>

      {/* Layout */}
      <PropertySection title="Layout">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Orientation</label>
          <select
            value={element.orientation}
            onChange={(e) =>
              onUpdate({ orientation: e.target.value as StepperElementConfig['orientation'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
        <NumberInput
          label="Button Size"
          value={element.buttonSize}
          onChange={(buttonSize) => onUpdate({ buttonSize })}
          min={16}
          max={48}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Button Color"
          value={element.buttonColor}
          onChange={(buttonColor) => onUpdate({ buttonColor })}
        />
        <ColorInput
          label="Button Hover Color"
          value={element.buttonHoverColor}
          onChange={(buttonHoverColor) => onUpdate({ buttonHoverColor })}
        />
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
