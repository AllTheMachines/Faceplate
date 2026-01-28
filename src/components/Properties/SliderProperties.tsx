import { SliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { LabelDisplaySection, ValueDisplaySection } from './shared'
import { SELECT_CLASSNAME } from './constants'

interface SliderPropertiesProps {
  element: SliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function SliderProperties({ element, onUpdate }: SliderPropertiesProps) {
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
                orientation: e.target.value as SliderElementConfig['orientation'],
              })
            }
            className={SELECT_CLASSNAME}
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
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
        labelFontSize={element.labelFontSize}
        labelColor={element.labelColor}
        labelFontFamily={element.labelFontFamily}
        labelFontWeight={element.labelFontWeight}
        onShowLabelChange={(showLabel) => onUpdate({ showLabel })}
        onLabelTextChange={(labelText) => onUpdate({ labelText })}
        onLabelPositionChange={(labelPosition) =>
          onUpdate({ labelPosition: labelPosition as SliderElementConfig['labelPosition'] })
        }
        onLabelFontSizeChange={(labelFontSize) => onUpdate({ labelFontSize })}
        onLabelColorChange={(labelColor) => onUpdate({ labelColor })}
        onLabelFontFamilyChange={(labelFontFamily) => onUpdate({ labelFontFamily })}
        onLabelFontWeightChange={(labelFontWeight) => onUpdate({ labelFontWeight })}
      />

      {/* Value Display */}
      <ValueDisplaySection
        showValue={element.showValue}
        valuePosition={element.valuePosition}
        valueFormat={element.valueFormat}
        valueSuffix={element.valueSuffix}
        valueDecimalPlaces={element.valueDecimalPlaces}
        valueFontSize={element.valueFontSize}
        valueColor={element.valueColor}
        valueFontFamily={element.valueFontFamily}
        valueFontWeight={element.valueFontWeight}
        onShowValueChange={(showValue) => onUpdate({ showValue })}
        onValuePositionChange={(valuePosition) =>
          onUpdate({ valuePosition: valuePosition as SliderElementConfig['valuePosition'] })
        }
        onValueFormatChange={(valueFormat) =>
          onUpdate({ valueFormat: valueFormat as SliderElementConfig['valueFormat'] })
        }
        onValueSuffixChange={(valueSuffix) => onUpdate({ valueSuffix })}
        onValueDecimalPlacesChange={(valueDecimalPlaces) => onUpdate({ valueDecimalPlaces })}
        onValueFontSizeChange={(valueFontSize) => onUpdate({ valueFontSize })}
        onValueColorChange={(valueColor) => onUpdate({ valueColor })}
        onValueFontFamilyChange={(valueFontFamily) => onUpdate({ valueFontFamily })}
        onValueFontWeightChange={(valueFontWeight) => onUpdate({ valueFontWeight })}
      />
    </>
  )
}
