import { ButtonElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'

interface ButtonPropertiesProps {
  element: ButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ButtonProperties({ element, onUpdate }: ButtonPropertiesProps) {
  return (
    <>
      {/* Behavior */}
      <PropertySection title="Behavior">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={element.mode}
            onChange={(e) =>
              onUpdate({ mode: e.target.value as ButtonElementConfig['mode'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="momentary">Momentary</option>
            <option value="toggle">Toggle</option>
          </select>
        </div>
        <TextInput
          label="Label"
          value={element.label}
          onChange={(label) => onUpdate({ label })}
        />
        <label
          htmlFor="button-pressed"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="button-pressed"
            checked={element.pressed}
            onChange={(e) => onUpdate({ pressed: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Pressed</span>
        </label>
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
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
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={50}
        />
      </PropertySection>
    </>
  )
}
