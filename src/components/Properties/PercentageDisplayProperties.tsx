import { PercentageDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface PercentageDisplayPropertiesProps {
  element: PercentageDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PercentageDisplayProperties({ element, onUpdate }: PercentageDisplayPropertiesProps) {
  return (
    <>
      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Value (0-100%)"
          value={element.value * 100}
          onChange={(value) => onUpdate({ value: value / 100 })}
          min={0}
          max={100}
          step={1}
        />
      </PropertySection>

      {/* Format */}
      <PropertySection title="Format">
        <NumberInput
          label="Decimal Places"
          value={element.decimalPlaces}
          onChange={(decimalPlaces) => onUpdate({ decimalPlaces })}
          min={0}
          max={2}
          step={1}
        />
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Style</label>
          <select
            value={element.fontStyle}
            onChange={(e) => onUpdate({ fontStyle: e.target.value as '7segment' | 'modern' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="7segment">7-Segment</option>
            <option value="modern">Modern</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Bezel Style</label>
          <select
            value={element.bezelStyle}
            onChange={(e) => onUpdate({ bezelStyle: e.target.value as 'inset' | 'flat' | 'none' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="inset">Inset</option>
            <option value="flat">Flat</option>
            <option value="none">None</option>
          </select>
        </div>
        {element.fontStyle === '7segment' && (
          <label
            htmlFor="percentagedisplay-show-ghost"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              id="percentagedisplay-show-ghost"
              checked={element.showGhostSegments}
              onChange={(e) => onUpdate({ showGhostSegments: e.target.checked })}
              className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-300">Show Ghost Segments</span>
          </label>
        )}
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
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

      {/* Font */}
      <PropertySection title="Font">
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={72}
          step={1}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="Roboto Mono, monospace">Roboto Mono</option>
            <option value="Inter, system-ui, sans-serif">Inter</option>
          </select>
        </div>
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={50}
          step={1}
        />
      </PropertySection>
    </>
  )
}
