import { BipolarSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { LabelDisplaySection, ValueDisplaySection } from './shared'
import { SELECT_CLASSNAME } from './constants'

interface BipolarSliderPropertiesProps {
  element: BipolarSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function BipolarSliderProperties({ element, onUpdate }: BipolarSliderPropertiesProps) {
  return (
    <>
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
