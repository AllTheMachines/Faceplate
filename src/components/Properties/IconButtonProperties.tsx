import { IconButtonElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { BuiltInIcon } from '../../utils/builtInIcons'
import { useStore } from '../../store'

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
  const assets = useStore((state) => state.assets)
  // All assets in store are SVGs; filter for icon or decoration categories
  const svgAssets = assets.filter(
    (asset) => asset.categories.includes('icon') || asset.categories.includes('decoration')
  )

  return (
    <>
      {/* Icon Source */}
      <PropertySection title="Icon Source">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Source</label>
          <select
            value={element.iconSource}
            onChange={(e) =>
              onUpdate({ iconSource: e.target.value as IconButtonElementConfig['iconSource'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
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
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
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
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
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

      {/* Button Mode */}
      <PropertySection title="Behavior">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={element.mode}
            onChange={(e) =>
              onUpdate({ mode: e.target.value as IconButtonElementConfig['mode'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
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

      {/* Colors */}
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

      {/* Style */}
      <PropertySection title="Style">
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
