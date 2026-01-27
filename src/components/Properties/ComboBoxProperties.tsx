import { useCallback } from 'react'
import { ComboBoxElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'

interface ComboBoxPropertiesProps {
  element: ComboBoxElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ComboBoxProperties({ element, onUpdate }: ComboBoxPropertiesProps) {
  // Add new option
  const addOption = useCallback(() => {
    const newOptions = [...element.options, `Option ${element.options.length + 1}`]
    onUpdate({ options: newOptions })
  }, [element.options, onUpdate])

  // Remove option
  const removeOption = useCallback(
    (index: number) => {
      if (element.options.length <= 1) return
      const newOptions = element.options.filter((_, i) => i !== index)
      // Clear selection if it was the removed option
      const newSelectedValue =
        element.selectedValue === element.options[index] ? '' : element.selectedValue
      onUpdate({ options: newOptions, selectedValue: newSelectedValue })
    },
    [element.options, element.selectedValue, onUpdate]
  )

  // Update option
  const updateOption = useCallback(
    (index: number, value: string) => {
      const oldValue = element.options[index]
      const newOptions = element.options.map((opt, i) => (i === index ? value : opt))
      // Update selected value if it was the changed option
      const newSelectedValue = element.selectedValue === oldValue ? value : element.selectedValue
      onUpdate({ options: newOptions, selectedValue: newSelectedValue })
    },
    [element.options, element.selectedValue, onUpdate]
  )

  // Set selected option
  const selectOption = useCallback(
    (value: string) => {
      onUpdate({ selectedValue: value })
    },
    [onUpdate]
  )

  return (
    <>
      {/* Options */}
      <PropertySection title="Options">
        <div className="space-y-2">
          {element.options.map((option, index) => (
            <div key={index} className="border border-gray-600 rounded p-2">
              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="combobox-selected"
                    checked={element.selectedValue === option}
                    onChange={() => selectOption(option)}
                    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-400">Selected</span>
                </label>
                <button
                  onClick={() => removeOption(index)}
                  disabled={element.options.length <= 1}
                  className={`ml-auto text-xs px-2 py-1 rounded ${
                    element.options.length <= 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
          ))}
          <button
            onClick={addOption}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Add Option
          </button>
        </div>
      </PropertySection>

      {/* Display */}
      <PropertySection title="Display">
        <div>
          <label htmlFor="combobox-placeholder" className="block text-xs text-gray-400 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            id="combobox-placeholder"
            value={element.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Type to search..."
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          />
        </div>
      </PropertySection>

      {/* Dropdown */}
      <PropertySection title="Dropdown">
        <NumberInput
          label="Max Height (px)"
          value={element.dropdownMaxHeight}
          onChange={(dropdownMaxHeight) => onUpdate({ dropdownMaxHeight })}
          min={100}
          max={600}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
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

      <ScrollbarStyleSection config={element} onUpdate={onUpdate} />
    </>
  )
}
