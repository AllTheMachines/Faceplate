import { MeterElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { useStore } from '../../store'
import { MeterLayers } from '../../types/elementStyle'

interface MeterPropertiesProps {
  element: MeterElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function MeterProperties({ element, onUpdate }: MeterPropertiesProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)

  const handleOrientationChange = (newOrientation: MeterElementConfig['orientation']) => {
    // When changing orientation, swap width and height for better UX
    if (newOrientation !== element.orientation) {
      onUpdate({
        orientation: newOrientation,
        width: element.height,
        height: element.width,
      })
    }
  }

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="meter"
          currentStyleId={element.styleId}
          onStyleChange={(styleId) => onUpdate({
            styleId,
            colorOverrides: styleId ? element.colorOverrides : undefined
          })}
        />
      </PropertySection>

      {/* Color Overrides - only when SVG style selected */}
      {element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'meter') return null

        const layerNames: Array<keyof MeterLayers> = ['body', 'fill', 'fill-green', 'fill-yellow', 'fill-red', 'scale', 'peak', 'segments']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        if (existingLayers.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {existingLayers.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName.charAt(0).toUpperCase() + layerName.slice(1).replace(/-/g, ' ')}
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
              handleOrientationChange(e.target.value as MeterElementConfig['orientation'])
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
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

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <div className="text-xs text-gray-400 mt-2">
          <p>Gradient color stops:</p>
          <ul className="mt-1 space-y-1">
            {element.colorStops.map((stop, i) => (
              <li key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded border border-gray-600"
                  style={{ backgroundColor: stop.color }}
                />
                <span>
                  {(stop.position * 100).toFixed(0)}% - {stop.color}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-gray-500">
            (Gradient editor deferred to later enhancement)
          </p>
        </div>
      </PropertySection>

      {/* Peak Hold */}
      <PropertySection title="Peak Hold">
        <label
          htmlFor="meter-peak-hold"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="meter-peak-hold"
            checked={element.showPeakHold}
            onChange={(e) => onUpdate({ showPeakHold: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Peak Hold</span>
        </label>
      </PropertySection>
    </>
  )
}
