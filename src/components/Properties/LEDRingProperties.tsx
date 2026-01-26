import { LEDRingElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface LEDRingPropertiesProps {
  element: LEDRingElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function LEDRingProperties({ element, onUpdate }: LEDRingPropertiesProps) {
  return (
    <>
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
      </PropertySection>

      {/* Ring */}
      <PropertySection title="Ring">
        <NumberInput
          label="Segment Count"
          value={element.segmentCount}
          onChange={(segmentCount) => onUpdate({ segmentCount })}
          min={12}
          max={36}
          step={1}
        />
        <NumberInput
          label="Thickness"
          value={element.thickness}
          onChange={(thickness) => onUpdate({ thickness })}
          min={2}
          max={20}
          step={1}
        />
      </PropertySection>

      {/* Angle */}
      <PropertySection title="Angle">
        <NumberInput
          label="Start Angle"
          value={element.startAngle}
          onChange={(startAngle) => onUpdate({ startAngle })}
          min={-180}
          max={180}
          step={15}
        />
        <NumberInput
          label="End Angle"
          value={element.endAngle}
          onChange={(endAngle) => onUpdate({ endAngle })}
          min={-180}
          max={180}
          step={15}
        />
      </PropertySection>

      {/* Glow */}
      <PropertySection title="Glow">
        <label
          htmlFor="ledring-glow-enabled"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="ledring-glow-enabled"
            checked={element.glowEnabled}
            onChange={(e) => onUpdate({ glowEnabled: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Enable Glow</span>
        </label>
        {element.glowEnabled && (
          <NumberInput
            label="Glow Radius"
            value={element.glowRadius}
            onChange={(glowRadius) => onUpdate({ glowRadius })}
            min={0}
            max={50}
            step={1}
          />
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
              label="On Color"
              value={element.onColor}
              onChange={(onColor) => onUpdate({ onColor })}
            />
            <ColorInput
              label="Off Color"
              value={element.offColor}
              onChange={(offColor) => onUpdate({ offColor })}
            />
          </>
        )}
      </PropertySection>
    </>
  )
}
