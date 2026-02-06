import { RockerSwitchElementConfig, ElementConfig } from '../../types/elements'
import { TextInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { SELECT_CLASSNAME } from './constants'
import { useStore } from '../../store'
import { ButtonLayers } from '../../types/elementStyle'

interface RockerSwitchPropertiesProps {
  element: RockerSwitchElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RockerSwitchProperties({ element, onUpdate }: RockerSwitchPropertiesProps) {
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

        const layerNames: Array<keyof ButtonLayers> = ['base', 'position-0', 'position-1', 'position-2']
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

      {/* State */}
      <PropertySection title="State">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Position</label>
          <select
            value={element.position}
            onChange={(e) =>
              onUpdate({ position: Number(e.target.value) as RockerSwitchElementConfig['position'] })
            }
            className={SELECT_CLASSNAME}
          >
            <option value={2}>Up (2)</option>
            <option value={1}>Center (1)</option>
            <option value={0}>Down (0)</option>
          </select>
        </div>
      </PropertySection>

      {/* Behavior */}
      <PropertySection title="Behavior">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={element.mode}
            onChange={(e) =>
              onUpdate({ mode: e.target.value as RockerSwitchElementConfig['mode'] })
            }
            className={SELECT_CLASSNAME}
          >
            <option value="spring-to-center">Spring to Center</option>
            <option value="latch-all-positions">Latch All Positions</option>
          </select>
        </div>
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <label
          htmlFor="rockerswitch-showlabels"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="rockerswitch-showlabels"
            checked={element.showLabels}
            onChange={(e) => onUpdate({ showLabels: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Labels</span>
        </label>
        {element.showLabels && (
          <>
            <TextInput
              label="Up Label"
              value={element.upLabel}
              onChange={(upLabel) => onUpdate({ upLabel })}
            />
            <TextInput
              label="Down Label"
              value={element.downLabel}
              onChange={(downLabel) => onUpdate({ downLabel })}
            />
            <ColorInput
              label="Label Color"
              value={element.labelColor}
              onChange={(labelColor) => onUpdate({ labelColor })}
            />
          </>
        )}
      </PropertySection>

      {/* Colors - only shown when no SVG style selected */}
      {!element.styleId && (
        <PropertySection title="Colors">
          <ColorInput
            label="Background Color"
            value={element.backgroundColor}
            onChange={(backgroundColor) => onUpdate({ backgroundColor })}
          />
          <ColorInput
            label="Switch Color"
            value={element.switchColor}
            onChange={(switchColor) => onUpdate({ switchColor })}
          />
          <ColorInput
            label="Border Color"
            value={element.borderColor}
            onChange={(borderColor) => onUpdate({ borderColor })}
          />
        </PropertySection>
      )}
    </>
  )
}
