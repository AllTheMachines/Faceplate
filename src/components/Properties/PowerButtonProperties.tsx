import { PowerButtonElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'
import { useStore } from '../../store'
import { ButtonLayers } from '../../types/elementStyle'
import { SELECT_CLASSNAME } from './constants'

interface PowerButtonPropertiesProps {
  element: PowerButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PowerButtonProperties({ element, onUpdate }: PowerButtonPropertiesProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="button"
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
        if (!style || style.category !== 'button') return null

        const layerNames: Array<keyof ButtonLayers> = ['normal', 'pressed', 'icon', 'led']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        if (existingLayers.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {existingLayers.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName === 'led' ? 'LED' : layerName.charAt(0).toUpperCase() + layerName.slice(1)}
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

      {/* Label */}
      <PropertySection title="Label">
        <TextInput
          label="Label"
          value={element.label}
          onChange={(label) => onUpdate({ label })}
        />
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className={SELECT_CLASSNAME}
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className={SELECT_CLASSNAME}
          >
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-Bold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={48}
        />
      </PropertySection>

      {/* State */}
      <PropertySection title="State">
        <label
          htmlFor="powerbutton-ison"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="powerbutton-ison"
            checked={element.isOn}
            onChange={(e) => onUpdate({ isOn: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">On (preview)</span>
        </label>
      </PropertySection>

      {/* LED */}
      <PropertySection title="LED Indicator">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Position</label>
          <select
            value={element.ledPosition}
            onChange={(e) =>
              onUpdate({ ledPosition: e.target.value as PowerButtonElementConfig['ledPosition'] })
            }
            className={SELECT_CLASSNAME}
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="center">Center</option>
          </select>
        </div>
        <NumberInput
          label="LED Size"
          value={element.ledSize}
          onChange={(ledSize) => onUpdate({ ledSize })}
          min={4}
          max={16}
        />
        <ColorInput
          label="LED On Color"
          value={element.ledOnColor}
          onChange={(ledOnColor) => onUpdate({ ledOnColor })}
        />
        <ColorInput
          label="LED Off Color"
          value={element.ledOffColor}
          onChange={(ledOffColor) => onUpdate({ ledOffColor })}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Shape */}
      <PropertySection title="Shape">
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={20}
        />
      </PropertySection>
    </>
  )
}
