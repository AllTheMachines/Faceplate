import { ArcSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection, TextInput } from './'

interface ArcSliderPropertiesProps {
  element: ArcSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ArcSliderProperties({ element, onUpdate }: ArcSliderPropertiesProps) {
  return (
    <>
      {/* Diameter */}
      <PropertySection title="Size">
        <NumberInput
          label="Diameter"
          value={element.diameter}
          onChange={(diameter) => onUpdate({ diameter, width: diameter, height: diameter })}
          min={40}
          max={300}
        />
      </PropertySection>

      {/* Arc Geometry */}
      <PropertySection title="Arc Geometry">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Start Angle"
            value={element.startAngle}
            onChange={(startAngle) => onUpdate({ startAngle })}
            min={-180}
            max={180}
          />
          <NumberInput
            label="End Angle"
            value={element.endAngle}
            onChange={(endAngle) => onUpdate({ endAngle })}
            min={-180}
            max={180}
          />
        </div>
        <NumberInput
          label="Track Width"
          value={element.trackWidth}
          onChange={(trackWidth) => onUpdate({ trackWidth })}
          min={2}
          max={20}
        />
      </PropertySection>

      {/* Thumb */}
      <PropertySection title="Thumb">
        <NumberInput
          label="Thumb Radius"
          value={element.thumbRadius}
          onChange={(thumbRadius) => onUpdate({ thumbRadius })}
          min={4}
          max={20}
        />
        <ColorInput
          label="Thumb Color"
          value={element.thumbColor}
          onChange={(thumbColor) => onUpdate({ thumbColor })}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Track Color"
          value={element.trackColor}
          onChange={(trackColor) => onUpdate({ trackColor })}
        />
        <ColorInput
          label="Fill Color"
          value={element.fillColor}
          onChange={(fillColor) => onUpdate({ fillColor })}
        />
      </PropertySection>

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
            step={0.01}
          />
          <NumberInput
            label="Max"
            value={element.max}
            onChange={(max) => onUpdate({ max })}
            step={0.01}
          />
        </div>
      </PropertySection>

      {/* Label */}
      <PropertySection title="Label">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showLabel}
            onChange={(e) => onUpdate({ showLabel: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Show Label</span>
        </label>
        {element.showLabel && (
          <>
            <TextInput
              label="Label Text"
              value={element.labelText}
              onChange={(labelText) => onUpdate({ labelText })}
            />
            <div>
              <label className="block text-xs text-gray-400 mb-1">Position</label>
              <select
                value={element.labelPosition}
                onChange={(e) =>
                  onUpdate({ labelPosition: e.target.value as ArcSliderElementConfig['labelPosition'] })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Font Size"
                value={element.labelFontSize}
                onChange={(labelFontSize) => onUpdate({ labelFontSize })}
                min={8}
                max={32}
              />
              <ColorInput
                label="Color"
                value={element.labelColor}
                onChange={(labelColor) => onUpdate({ labelColor })}
              />
            </div>
          </>
        )}
      </PropertySection>

      {/* Value Display */}
      <PropertySection title="Value Display">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showValue}
            onChange={(e) => onUpdate({ showValue: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Show Value</span>
        </label>
        {element.showValue && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Position</label>
              <select
                value={element.valuePosition}
                onChange={(e) =>
                  onUpdate({ valuePosition: e.target.value as ArcSliderElementConfig['valuePosition'] })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Format</label>
              <select
                value={element.valueFormat}
                onChange={(e) =>
                  onUpdate({ valueFormat: e.target.value as ArcSliderElementConfig['valueFormat'] })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="numeric">Numeric</option>
                <option value="percentage">Percentage</option>
                <option value="db">dB</option>
                <option value="hz">Hz</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {element.valueFormat === 'custom' && (
              <TextInput
                label="Suffix"
                value={element.valueSuffix}
                onChange={(valueSuffix) => onUpdate({ valueSuffix })}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Decimal Places"
                value={element.valueDecimalPlaces}
                onChange={(valueDecimalPlaces) => onUpdate({ valueDecimalPlaces })}
                min={0}
                max={4}
              />
              <NumberInput
                label="Font Size"
                value={element.valueFontSize}
                onChange={(valueFontSize) => onUpdate({ valueFontSize })}
                min={8}
                max={32}
              />
            </div>
            <ColorInput
              label="Color"
              value={element.valueColor}
              onChange={(valueColor) => onUpdate({ valueColor })}
            />
          </>
        )}
      </PropertySection>
    </>
  )
}
