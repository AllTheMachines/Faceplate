import { IconButtonElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { BuiltInIcon } from '../../utils/builtInIcons'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { ButtonLayers } from '../../types/elementStyle'
import { SELECT_CLASSNAME } from './constants'

interface IconButtonPropertiesProps {
  element: IconButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

// Group icons by category for the dropdown
const iconCategories = {
  Transport: [
    BuiltInIcon.Play,
    BuiltInIcon.Pause,
    BuiltInIcon.Stop,
    BuiltInIcon.Record,
    BuiltInIcon.Loop,
    BuiltInIcon.SkipForward,
    BuiltInIcon.SkipBackward,
  ],
  Common: [
    BuiltInIcon.Mute,
    BuiltInIcon.Solo,
    BuiltInIcon.Bypass,
    BuiltInIcon.Power,
    BuiltInIcon.Settings,
    BuiltInIcon.Reset,
    BuiltInIcon.Save,
    BuiltInIcon.Load,
  ],
  Audio: [
    BuiltInIcon.Waveform,
    BuiltInIcon.Spectrum,
    BuiltInIcon.Midi,
    BuiltInIcon.Sync,
    BuiltInIcon.Link,
    BuiltInIcon.EQ,
    BuiltInIcon.Compressor,
    BuiltInIcon.Reverb,
    BuiltInIcon.Delay,
    BuiltInIcon.Filter,
  ],
  Additional: [
    BuiltInIcon.Add,
    BuiltInIcon.Remove,
    BuiltInIcon.Edit,
    BuiltInIcon.Copy,
    BuiltInIcon.Paste,
    BuiltInIcon.Undo,
    BuiltInIcon.Redo,
    BuiltInIcon.Help,
    BuiltInIcon.Info,
    BuiltInIcon.Warning,
  ],
}

// Format icon name for display (e.g., 'skip-forward' -> 'Skip Forward')
function formatIconName(icon: BuiltInIcon): string {
  return icon
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function IconButtonProperties({ element, onUpdate }: IconButtonPropertiesProps) {
  const { isPro } = useLicense()
  const assets = useStore((state) => state.assets)
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const buttonStyles = getStylesByCategory('button')

  // All assets in store are SVGs; filter for icon or decoration categories
  const svgAssets = assets.filter(
    (asset) => asset.categories.includes('icon') || asset.categories.includes('decoration')
  )

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

        const layerNames: Array<keyof ButtonLayers> = ['normal', 'pressed', 'icon']
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

      {/* Icon Source - only show if not using SVG style */}
      {!element.styleId && (
        <PropertySection title="Icon Source">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Source</label>
            <select
              value={element.iconSource}
              onChange={(e) =>
                onUpdate({ iconSource: e.target.value as IconButtonElementConfig['iconSource'] })
              }
              className={SELECT_CLASSNAME}
            >
              <option value="builtin">Built-In Icon</option>
              <option value="asset">Asset Library</option>
            </select>
          </div>

          {element.iconSource === 'builtin' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Icon</label>
              <select
                value={element.builtInIcon || BuiltInIcon.Play}
                onChange={(e) => onUpdate({ builtInIcon: e.target.value as BuiltInIcon })}
                className={SELECT_CLASSNAME}
              >
                {Object.entries(iconCategories).map(([category, icons]) => (
                  <optgroup key={category} label={category}>
                    {icons.map((icon) => (
                      <option key={icon} value={icon}>
                        {formatIconName(icon)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {element.iconSource === 'asset' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Asset</label>
              <select
                value={element.assetId || ''}
                onChange={(e) => onUpdate({ assetId: e.target.value })}
                className={SELECT_CLASSNAME}
              >
                <option value="">Select an asset...</option>
                {svgAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
              {svgAssets.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No SVG assets available. Upload icons in the Asset Library.
                </p>
              )}
            </div>
          )}
        </PropertySection>
      )}

      {/* Button Mode */}
      <PropertySection title="Behavior">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={element.mode}
            onChange={(e) =>
              onUpdate({ mode: e.target.value as IconButtonElementConfig['mode'] })
            }
            className={SELECT_CLASSNAME}
          >
            <option value="momentary">Momentary</option>
            <option value="toggle">Toggle</option>
          </select>
        </div>
        <label
          htmlFor="iconbutton-pressed"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="iconbutton-pressed"
            checked={element.pressed}
            onChange={(e) => onUpdate({ pressed: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Pressed</span>
        </label>
      </PropertySection>

      {/* Colors - only show if not using SVG style */}
      {!element.styleId && (
        <PropertySection title="Colors">
          <ColorInput
            label="Icon Color"
            value={element.iconColor}
            onChange={(iconColor) => onUpdate({ iconColor })}
          />
          <ColorInput
            label="Background Color"
            value={element.backgroundColor}
            onChange={(backgroundColor) => onUpdate({ backgroundColor })}
          />
          <ColorInput
            label="Border Color"
            value={element.borderColor}
            onChange={(borderColor) => onUpdate({ borderColor })}
          />
        </PropertySection>
      )}

      {/* Style - only show if not using SVG style */}
      {!element.styleId && (
        <PropertySection title="Appearance">
          <NumberInput
            label="Border Radius"
            value={element.borderRadius}
            onChange={(borderRadius) => onUpdate({ borderRadius })}
            min={0}
            max={20}
          />
        </PropertySection>
      )}
    </>
  )
}
