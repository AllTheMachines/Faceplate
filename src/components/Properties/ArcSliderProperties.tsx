import { ArcSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { LabelDisplaySection, ValueDisplaySection, ColorPicker } from './shared'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'

interface ArcSliderPropertiesProps {
  element: ArcSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ArcSliderProperties({ element, onUpdate }: ArcSliderPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  // Note: Arc Slider uses 'arc' category, not 'linear'
  const arcStyles = getStylesByCategory('arc')
  const currentStyle = element.styleId
    ? arcStyles.find(s => s.id === element.styleId)
    : undefined

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        {/* Style Dropdown */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">SVG Style</label>
          <select
            value={element.styleId || ''}
            onChange={(e) => onUpdate({
              styleId: e.target.value || undefined,
              colorOverrides: e.target.value ? element.colorOverrides : undefined
            })}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1.5 border border-gray-600"
            disabled={!isPro && arcStyles.length > 0}
          >
            <option value="">Default (CSS)</option>
            {arcStyles.map(style => (
              <option key={style.id} value={style.id}>{style.name}</option>
            ))}
          </select>
          {!isPro && arcStyles.length > 0 && (
            <p className="text-xs text-amber-500 mt-1">Pro license required for SVG styles</p>
          )}
        </div>

        {/* Thumb Rotation (only when style is selected) */}
        {currentStyle && isPro && (
          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              id="rotateThumbToTangent"
              checked={element.rotateThumbToTangent ?? false}
              onChange={(e) => onUpdate({
                rotateThumbToTangent: e.target.checked
              })}
              className="rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            <label htmlFor="rotateThumbToTangent" className="text-sm text-gray-300">
              Rotate thumb to tangent
            </label>
          </div>
        )}

        {/* Color Overrides (only when style is selected) */}
        {currentStyle && isPro && (
          <div className="space-y-2 mt-3">
            <label className="block text-xs text-gray-400">Color Overrides</label>
            {currentStyle.layers.thumb && (
              <ColorPicker
                label="Thumb"
                value={element.colorOverrides?.thumb || ''}
                onChange={(color) => onUpdate({
                  colorOverrides: { ...element.colorOverrides, thumb: color || undefined }
                })}
              />
            )}
            {currentStyle.layers.track && (
              <ColorPicker
                label="Track"
                value={element.colorOverrides?.track || ''}
                onChange={(color) => onUpdate({
                  colorOverrides: { ...element.colorOverrides, track: color || undefined }
                })}
              />
            )}
            {currentStyle.layers.fill && (
              <ColorPicker
                label="Fill"
                value={element.colorOverrides?.fill || ''}
                onChange={(color) => onUpdate({
                  colorOverrides: { ...element.colorOverrides, fill: color || undefined }
                })}
              />
            )}
            {currentStyle.layers.arc && (
              <ColorPicker
                label="Arc Path"
                value={element.colorOverrides?.arc || ''}
                onChange={(color) => onUpdate({
                  colorOverrides: { ...element.colorOverrides, arc: color || undefined }
                })}
              />
            )}
          </div>
        )}
      </PropertySection>

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
