import { SteppedKnobElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection, TextInput } from './'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { RotaryLayers } from '../../types/elementStyle'

interface SteppedKnobPropertiesProps {
  element: SteppedKnobElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function SteppedKnobProperties({ element, onUpdate }: SteppedKnobPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const rotaryStyles = getStylesByCategory('rotary')

  return (
    <>
      {/* Knob Style - Pro feature */}
      {isPro && (
        <PropertySection title="Knob Style">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Style</label>
            <select
              value={element.styleId || ''}
              onChange={(e) => {
                const value = e.target.value
                onUpdate({
                  styleId: value === '' ? undefined : value,
                  colorOverrides: undefined, // Reset on style change
                })
              }}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            >
              <option value="">Default (CSS)</option>
              {rotaryStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
        </PropertySection>
      )}

      {/* Color Overrides - only when SVG style selected */}
      {isPro && element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'rotary') return null

        const layerNames: Array<keyof RotaryLayers> = ['indicator', 'track', 'arc', 'glow', 'shadow']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        if (existingLayers.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {existingLayers.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                value={element.colorOverrides?.[layerName] || ''}
                onChange={(color) => {
                  const newOverrides = { ...element.colorOverrides }
                  if (color) {
                    newOverrides[layerName] = color
                  } else {
                    delete newOverrides[layerName]
                  }
                  onUpdate({ colorOverrides: newOverrides })
                }}
              />
            ))}
            <button
              onClick={() => onUpdate({ colorOverrides: undefined })}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 mt-1"
            >
              Reset to Original Colors
            </button>
          </PropertySection>
        )
      })()}

      {/* Step Configuration */}
      <PropertySection title="Step Configuration">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Step Count</label>
          <select
            value={element.stepCount}
            onChange={(e) => onUpdate({ stepCount: parseInt(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value={12}>12 Steps</option>
            <option value={24}>24 Steps</option>
            <option value={36}>36 Steps</option>
            <option value={48}>48 Steps</option>
            <option value={64}>64 Steps</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showStepIndicators}
            onChange={(e) => onUpdate({ showStepIndicators: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Show Step Indicators</span>
        </label>
        {element.showStepIndicators && (
          <NumberInput
            label="Indicator Size"
            value={element.stepIndicatorSize ?? 1.3}
            onChange={(stepIndicatorSize) => onUpdate({ stepIndicatorSize })}
            min={0.5}
            max={10}
            step={0.1}
          />
        )}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showStepMarks ?? false}
            onChange={(e) => onUpdate({ showStepMarks: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Show Step Marks</span>
        </label>
        {element.showStepMarks && (
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Mark Length"
              value={element.stepMarkLength ?? 6}
              onChange={(stepMarkLength) => onUpdate({ stepMarkLength })}
              min={1}
              max={20}
              step={1}
            />
            <NumberInput
              label="Mark Width"
              value={element.stepMarkWidth ?? 1}
              onChange={(stepMarkWidth) => onUpdate({ stepMarkWidth })}
              min={0.5}
              max={10}
              step={0.5}
            />
          </div>
        )}
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
          label="Fill Color"
          value={element.fillColor}
          onChange={(fillColor) => onUpdate({ fillColor })}
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
                  onUpdate({ labelPosition: e.target.value as SteppedKnobElementConfig['labelPosition'] })
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
                  onUpdate({ valuePosition: e.target.value as SteppedKnobElementConfig['valuePosition'] })
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
                  onUpdate({ valueFormat: e.target.value as SteppedKnobElementConfig['valueFormat'] })
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
