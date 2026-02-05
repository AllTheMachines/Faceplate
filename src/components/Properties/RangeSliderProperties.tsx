import { RangeSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { SELECT_CLASSNAME } from './constants'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { LinearLayers } from '../../types/elementStyle'

interface RangeSliderPropertiesProps {
  element: RangeSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RangeSliderProperties({ element, onUpdate }: RangeSliderPropertiesProps) {
  const { isPro } = useLicense()
  const getElementStyle = useStore((state) => state.getElementStyle)

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
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="linear"
          currentStyleId={element.styleId}
          
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

        // Range Slider supports thumb-low, thumb-high, track, fill
        // Check for explicit layers and fall back to generic thumb
        const layersObj = style.layers as Record<string, string | undefined>
        const layerNames: string[] = []

        // Check for dual thumb layers
        if (layersObj['thumb-low']) layerNames.push('thumb-low')
        if (layersObj['thumb-high']) layerNames.push('thumb-high')
        // Fall back to generic thumb if no specific thumb layers
        if (!layersObj['thumb-low'] && !layersObj['thumb-high'] && layersObj['thumb']) {
          layerNames.push('thumb')
        }
        // Add track and fill
        if (layersObj['track']) layerNames.push('track')
        if (layersObj['fill']) layerNames.push('fill')

        if (layerNames.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {layerNames.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
                orientation: e.target.value as RangeSliderElementConfig['orientation'],
              })
            }
            className={SELECT_CLASSNAME}
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
