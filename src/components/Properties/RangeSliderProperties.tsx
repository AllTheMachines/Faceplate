import { RangeSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface RangeSliderPropertiesProps {
  element: RangeSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RangeSliderProperties({ element, onUpdate }: RangeSliderPropertiesProps) {
  // Ensure min/max value constraints
  const handleMinValueChange = (newMinValue: number) => {
    // Clamp to bounds and ensure it doesn't exceed maxValue
    const clampedMin = Math.max(element.min, Math.min(newMinValue, element.maxValue))
    onUpdate({ minValue: clampedMin })
  }

  const handleMaxValueChange = (newMaxValue: number) => {
    // Clamp to bounds and ensure it doesn't go below minValue
    const clampedMax = Math.min(element.max, Math.max(newMaxValue, element.minValue))
    onUpdate({ maxValue: clampedMax })
  }

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
                orientation: e.target.value as RangeSliderElementConfig['orientation'],
              })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
      </PropertySection>

      {/* Range Bounds */}
      <PropertySection title="Range Bounds">
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

      {/* Current Selection */}
      <PropertySection title="Current Selection">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Min Value"
            value={element.minValue}
            onChange={handleMinValueChange}
            min={element.min}
            max={element.maxValue}
            step={0.01}
          />
          <NumberInput
            label="Max Value"
            value={element.maxValue}
            onChange={handleMaxValueChange}
            min={element.minValue}
            max={element.max}
            step={0.01}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Min cannot exceed max and vice versa
        </p>
      </PropertySection>

      {/* Track */}
      <PropertySection title="Track">
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

      {/* Thumbs */}
      <PropertySection title="Thumbs">
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
    </>
  )
}
