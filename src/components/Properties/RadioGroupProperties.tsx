import { RadioGroupElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface RadioGroupPropertiesProps {
  element: RadioGroupElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RadioGroupProperties({ element, onUpdate }: RadioGroupPropertiesProps) {
  return (
    <>
      {/* Options */}
      <PropertySection title="Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Options (one per line)</label>
          <textarea
            value={element.options.join('\n')}
            onChange={(e) => {
              const options = e.target.value.split('\n').filter((line) => line.trim() !== '')
              if (options.length === 0) options.push('Option 1')
              onUpdate({ options })
            }}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm font-mono min-h-[100px]"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Selected Index</label>
          <select
            value={element.selectedIndex}
            onChange={(e) => onUpdate({ selectedIndex: parseInt(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {element.options.map((option, index) => (
              <option key={index} value={index}>
                {index}: {option}
              </option>
            ))}
          </select>
        </div>
      </PropertySection>

      {/* Layout */}
      <PropertySection title="Layout">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Orientation</label>
          <select
            value={element.orientation}
            onChange={(e) =>
              onUpdate({ orientation: e.target.value as RadioGroupElementConfig['orientation'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
        <NumberInput
          label="Spacing"
          value={element.spacing}
          onChange={(spacing) => onUpdate({ spacing })}
          min={0}
          max={20}
        />
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
        <ColorInput
          label="Radio Color"
          value={element.radioColor}
          onChange={(radioColor) => onUpdate({ radioColor })}
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
