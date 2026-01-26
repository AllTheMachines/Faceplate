import { BiColorLEDElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface BiColorLEDPropertiesProps {
  element: BiColorLEDElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function BiColorLEDProperties({ element, onUpdate }: BiColorLEDPropertiesProps) {
  return (
    <>
      {/* State */}
      <PropertySection title="State">
        <div>
          <label className="block text-xs text-gray-400 mb-1">State</label>
          <select
            value={element.state}
            onChange={(e) => onUpdate({ state: e.target.value as 'green' | 'red' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="green">Green</option>
            <option value="red">Red</option>
          </select>
        </div>
      </PropertySection>

      {/* Shape */}
      <PropertySection title="Shape">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Shape</label>
          <select
            value={element.shape}
            onChange={(e) => onUpdate({ shape: e.target.value as 'round' | 'square' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="round">Round</option>
            <option value="square">Square</option>
          </select>
        </div>
        {element.shape === 'square' && (
          <NumberInput
            label="Corner Radius"
            value={element.cornerRadius}
            onChange={(cornerRadius) => onUpdate({ cornerRadius })}
            min={0}
            max={20}
            step={1}
          />
        )}
      </PropertySection>

      {/* Glow */}
      <PropertySection title="Glow">
        <label
          htmlFor="bicolorled-glow-enabled"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="bicolorled-glow-enabled"
            checked={element.glowEnabled}
            onChange={(e) => onUpdate({ glowEnabled: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Enable Glow</span>
        </label>
        {element.glowEnabled && (
          <>
            <NumberInput
              label="Glow Radius"
              value={element.glowRadius}
              onChange={(glowRadius) => onUpdate({ glowRadius })}
              min={0}
              max={50}
              step={1}
            />
            <NumberInput
              label="Glow Intensity"
              value={element.glowIntensity}
              onChange={(glowIntensity) => onUpdate({ glowIntensity })}
              min={0}
              max={50}
              step={1}
            />
          </>
        )}
      </PropertySection>

      {/* Color Palette */}
      <PropertySection title="Color Palette">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Preset</label>
          <select
            value={element.colorPalette}
            onChange={(e) => onUpdate({ colorPalette: e.target.value as 'classic' | 'modern' | 'neon' | 'custom' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="neon">Neon</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {element.colorPalette === 'custom' && (
          <>
            <ColorInput
              label="Green Color"
              value={element.greenColor}
              onChange={(greenColor) => onUpdate({ greenColor })}
            />
            <ColorInput
              label="Red Color"
              value={element.redColor}
              onChange={(redColor) => onUpdate({ redColor })}
            />
          </>
        )}
      </PropertySection>
    </>
  )
}
