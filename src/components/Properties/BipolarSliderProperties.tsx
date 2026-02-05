import { BipolarSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { LabelDisplaySection, ValueDisplaySection, ElementStyleSection } from './shared'
import { SELECT_CLASSNAME } from './constants'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { LinearLayers } from '../../types/elementStyle'

interface BipolarSliderPropertiesProps {
  element: BipolarSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function BipolarSliderProperties({ element, onUpdate }: BipolarSliderPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const linearStyles = getStylesByCategory('linear')

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="linear"
          currentStyleId={element.styleId}
          styles={linearStyles}
          onStyleChange={(styleId) => onUpdate({
            styleId,
            colorOverrides: styleId ? element.colorOverrides : undefined
          })}
          isPro={isPro}
        />
      </PropertySection>

      {/* Color Overrides - only when SVG style selected */}
      {isPro && element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'linear') return null

        const layerNames: Array<keyof LinearLayers> = ['thumb', 'track', 'fill']
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

      {/* Orientation */}
      <PropertySection title="Orientation">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Orientation</label>
          <select
            value={element.orientation}
            onChange={(e) =>
              onUpdate({
                orientation: e.target.value as BipolarSliderElementConfig['orientation'],
              })
            }
            className={SELECT_CLASSNAME}
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
      </PropertySection>

      {/* Center */}
      <PropertySection title="Center">
        <NumberInput
          label="Center Value"
          value={element.centerValue}
          onChange={(centerValue) => onUpdate({ centerValue })}
          min={0}
          max={1}
          step={0.1}
        />
        <ColorInput
          label="Center Line Color"
          value={element.centerLineColor}
          onChange={(centerLineColor) => onUpdate({ centerLineColor })}
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.centerSnap ?? false}
            onChange={(e) => onUpdate({ centerSnap: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Enable Center Snap</span>
        </label>
        {element.centerSnap && (
          <NumberInput
            label="Snap Threshold %"
            value={(element.centerSnapThreshold ?? 0.02) * 100}
            onChange={(val) => onUpdate({ centerSnapThreshold: val / 100 })}
            min={0.5}
            max={10}
            step={0.5}
          />
        )}
      </PropertySection>

      {/* Zone Colors */}
      <PropertySection title="Zone Colors">
        <ColorInput
          label="Negative Zone Color"
          value={element.negativeFillColor ?? element.trackFillColor}
          onChange={(negativeFillColor) => onUpdate({ negativeFillColor })}
        />
        <ColorInput
          label="Positive Zone Color"
          value={element.positiveFillColor ?? element.trackFillColor}
          onChange={(positiveFillColor) => onUpdate({ positiveFillColor })}
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

      {/* Track */}
      <PropertySection title="Track">
        <ColorInput
          label="Track Color"
          value={element.trackColor}
          onChange={(trackColor) => onUpdate({ trackColor })}
        />
        <ColorInput
          label="Track Fill Color"
          value={element.trackFillColor}
          onChange={(trackFillColor) => onUpdate({ trackFillColor })}
        />
      </PropertySection>

      {/* Thumb */}
      <PropertySection title="Thumb">
        <ColorInput
          label="Thumb Color"
          value={element.thumbColor}
          onChange={(thumbColor) => onUpdate({ thumbColor })}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Thumb Width"
            value={element.thumbWidth}
            onChange={(thumbWidth) => onUpdate({ thumbWidth })}
            min={10}
            max={50}
          />
          <NumberInput
            label="Thumb Height"
            value={element.thumbHeight}
            onChange={(thumbHeight) => onUpdate({ thumbHeight })}
            min={10}
            max={50}
          />
        </div>
      </PropertySection>

      {/* Label */}
      <LabelDisplaySection
        showLabel={element.showLabel}
        labelText={element.labelText}
        labelPosition={element.labelPosition}
        labelDistance={element.labelDistance}
        labelFontSize={element.labelFontSize}
        labelColor={element.labelColor}
        onShowLabelChange={(showLabel) => onUpdate({ showLabel })}
        onLabelTextChange={(labelText) => onUpdate({ labelText })}
        onLabelPositionChange={(labelPosition) =>
          onUpdate({ labelPosition: labelPosition as BipolarSliderElementConfig['labelPosition'] })
        }
        onLabelDistanceChange={(labelDistance) => onUpdate({ labelDistance })}
        onLabelFontSizeChange={(labelFontSize) => onUpdate({ labelFontSize })}
        onLabelColorChange={(labelColor) => onUpdate({ labelColor })}
      />

      {/* Value Display */}
      <ValueDisplaySection
        showValue={element.showValue}
        valuePosition={element.valuePosition}
        valueDistance={element.valueDistance}
        valueFormat={element.valueFormat}
        valueSuffix={element.valueSuffix}
        valueDecimalPlaces={element.valueDecimalPlaces}
        valueFontSize={element.valueFontSize}
        valueColor={element.valueColor}
        onShowValueChange={(showValue) => onUpdate({ showValue })}
        onValuePositionChange={(valuePosition) =>
          onUpdate({ valuePosition: valuePosition as BipolarSliderElementConfig['valuePosition'] })
        }
        onValueDistanceChange={(valueDistance) => onUpdate({ valueDistance })}
        onValueFormatChange={(valueFormat) =>
          onUpdate({ valueFormat: valueFormat as BipolarSliderElementConfig['valueFormat'] })
        }
        onValueSuffixChange={(valueSuffix) => onUpdate({ valueSuffix })}
        onValueDecimalPlacesChange={(valueDecimalPlaces) => onUpdate({ valueDecimalPlaces })}
        onValueFontSizeChange={(valueFontSize) => onUpdate({ valueFontSize })}
        onValueColorChange={(valueColor) => onUpdate({ valueColor })}
      />
    </>
  )
}
