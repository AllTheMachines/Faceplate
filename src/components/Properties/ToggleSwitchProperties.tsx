import { ToggleSwitchElementConfig, ElementConfig } from '../../types/elements'
import { TextInput, ColorInput, PropertySection } from './'

interface ToggleSwitchPropertiesProps {
  element: ToggleSwitchElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ToggleSwitchProperties({ element, onUpdate }: ToggleSwitchPropertiesProps) {
  return (
    <>
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
