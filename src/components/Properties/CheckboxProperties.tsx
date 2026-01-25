import { CheckboxElementConfig, ElementConfig } from '../../types/elements'
import { TextInput, ColorInput, PropertySection } from './'

interface CheckboxPropertiesProps {
  element: CheckboxElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function CheckboxProperties({ element, onUpdate }: CheckboxPropertiesProps) {
  return (
    <>
      {/* State */}
      <PropertySection title="State">
        <TextInput
          label="Label"
          value={element.label}
          onChange={(label) => onUpdate({ label })}
        />
        <label
          htmlFor="checkbox-checked"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="checkbox-checked"
            checked={element.checked}
            onChange={(e) => onUpdate({ checked: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Checked</span>
        </label>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Label Position</label>
          <select
            value={element.labelPosition}
            onChange={(e) =>
              onUpdate({ labelPosition: e.target.value as CheckboxElementConfig['labelPosition'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
        <ColorInput
          label="Check Color"
          value={element.checkColor}
          onChange={(checkColor) => onUpdate({ checkColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
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
      </PropertySection>
    </>
  )
}
