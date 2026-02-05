import { ToggleSwitchElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'
import { useLicense } from '../../hooks/useLicense'
import { useStore } from '../../store'
import { ButtonLayers } from '../../types/elementStyle'
import { SELECT_CLASSNAME } from './constants'

interface ToggleSwitchPropertiesProps {
  element: ToggleSwitchElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ToggleSwitchProperties({ element, onUpdate }: ToggleSwitchPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const buttonStyles = getStylesByCategory('button')

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="button"
          currentStyleId={element.styleId}
          styles={buttonStyles}
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
        if (!style || style.category !== 'button') return null

        const layerNames: Array<keyof ButtonLayers> = ['body', 'on', 'off', 'indicator']
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

      {/* State */}
      <PropertySection title="State">
        <label
          htmlFor="toggleswitch-ison"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="toggleswitch-ison"
            checked={element.isOn}
            onChange={(e) => onUpdate({ isOn: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">On (preview)</span>
        </label>
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="On Color"
          value={element.onColor}
          onChange={(onColor) => onUpdate({ onColor })}
        />
        <ColorInput
          label="Off Color"
          value={element.offColor}
          onChange={(offColor) => onUpdate({ offColor })}
        />
        <ColorInput
          label="Thumb Color"
          value={element.thumbColor}
          onChange={(thumbColor) => onUpdate({ thumbColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <label
          htmlFor="toggleswitch-showlabels"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="toggleswitch-showlabels"
            checked={element.showLabels}
            onChange={(e) => onUpdate({ showLabels: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Labels</span>
        </label>
        {element.showLabels && (
          <>
            <TextInput
              label="On Label"
              value={element.onLabel}
              onChange={(onLabel) => onUpdate({ onLabel })}
            />
            <TextInput
              label="Off Label"
              value={element.offLabel}
              onChange={(offLabel) => onUpdate({ offLabel })}
            />
            <div>
              <label className="block text-xs text-gray-400 mb-1">Font Family</label>
              <select
                value={element.labelFontFamily}
                onChange={(e) => onUpdate({ labelFontFamily: e.target.value })}
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
                value={element.labelFontWeight}
                onChange={(e) => onUpdate({ labelFontWeight: e.target.value })}
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
              value={element.labelFontSize}
              onChange={(labelFontSize) => onUpdate({ labelFontSize })}
              min={8}
              max={32}
            />
            <ColorInput
              label="Label Color"
              value={element.labelColor}
              onChange={(labelColor) => onUpdate({ labelColor })}
            />
          </>
        )}
      </PropertySection>
    </>
  )
}
