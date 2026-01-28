import { ArcSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { LabelDisplaySection, ValueDisplaySection } from './shared'

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
          onUpdate({ labelPosition: labelPosition as ArcSliderElementConfig['labelPosition'] })
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
          onUpdate({ valuePosition: valuePosition as ArcSliderElementConfig['valuePosition'] })
        }
        onValueDistanceChange={(valueDistance) => onUpdate({ valueDistance })}
        onValueFormatChange={(valueFormat) =>
          onUpdate({ valueFormat: valueFormat as ArcSliderElementConfig['valueFormat'] })
        }
        onValueSuffixChange={(valueSuffix) => onUpdate({ valueSuffix })}
        onValueDecimalPlacesChange={(valueDecimalPlaces) => onUpdate({ valueDecimalPlaces })}
        onValueFontSizeChange={(valueFontSize) => onUpdate({ valueFontSize })}
        onValueColorChange={(valueColor) => onUpdate({ valueColor })}
      />
    </>
  )
}
