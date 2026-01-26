import { NumericDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'

interface NumericDisplayPropertiesProps {
  element: NumericDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function NumericDisplayProperties({ element, onUpdate }: NumericDisplayPropertiesProps) {
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
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Min"
            value={element.min}
            onChange={(min) => onUpdate({ min })}
            step={1}
          />
          <NumberInput
            label="Max"
            value={element.max}
            onChange={(max) => onUpdate({ max })}
            step={1}
          />
        </div>
        <NumberInput
          label="Decimal Places"
          value={element.decimalPlaces}
          onChange={(decimalPlaces) => onUpdate({ decimalPlaces })}
          min={0}
          max={6}
          step={1}
        />
      </PropertySection>

      {/* Unit */}
      <PropertySection title="Unit">
        <TextInput
          label="Unit Label"
          value={element.unit || ''}
          onChange={(unit) => onUpdate({ unit })}
          placeholder="e.g., Hz, dB, ms"
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Unit Display</label>
          <select
            value={element.unitDisplay}
            onChange={(e) => onUpdate({ unitDisplay: e.target.value as 'suffix' | 'label' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="suffix">Suffix (inline)</option>
            <option value="label">Label (separate)</option>
          </select>
        </div>
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
            htmlFor="numericdisplay-show-ghost"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              id="numericdisplay-show-ghost"
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
