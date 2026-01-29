import { DotIndicatorKnobElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection, TextInput } from './'

interface DotIndicatorKnobPropertiesProps {
  element: DotIndicatorKnobElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function DotIndicatorKnobProperties({ element, onUpdate }: DotIndicatorKnobPropertiesProps) {
  return (
    <>
      {/* Dot Configuration */}
      <PropertySection title="Dot Indicator">
        <NumberInput
          label="Dot Radius"
          value={element.dotRadius}
          onChange={(dotRadius) => onUpdate({ dotRadius })}
          min={2}
          max={10}
          step={1}
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
          min={1}
          max={20}
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
          label="Indicator Color"
          value={element.indicatorColor}
          onChange={(indicatorColor) => onUpdate({ indicatorColor })}
        />
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
                  onUpdate({ labelPosition: e.target.value as DotIndicatorKnobElementConfig['labelPosition'] })
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
              <NumberInput
                label="Distance"
                value={element.labelDistance ?? 4}
                onChange={(labelDistance) => onUpdate({ labelDistance })}
                min={-20}
                max={50}
                step={0.1}
              />
            </div>
            <ColorInput
              label="Color"
              value={element.labelColor}
              onChange={(labelColor) => onUpdate({ labelColor })}
            />
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
                  onUpdate({ valuePosition: e.target.value as DotIndicatorKnobElementConfig['valuePosition'] })
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
                  onUpdate({ valueFormat: e.target.value as DotIndicatorKnobElementConfig['valueFormat'] })
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
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Distance"
                value={element.valueDistance ?? 4}
                onChange={(valueDistance) => onUpdate({ valueDistance })}
                min={-20}
                max={50}
                step={0.1}
              />
              <ColorInput
                label="Color"
                value={element.valueColor}
                onChange={(valueColor) => onUpdate({ valueColor })}
              />
            </div>
          </>
        )}
      </PropertySection>
    </>
  )
}
