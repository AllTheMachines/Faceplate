import { useCallback } from 'react'
import { MultiSelectDropdownElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface MultiSelectDropdownPropertiesProps {
  element: MultiSelectDropdownElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function MultiSelectDropdownProperties({
  element,
  onUpdate,
}: MultiSelectDropdownPropertiesProps) {
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
      // Remove any selections that referenced the removed option
      const newSelectedIndices = element.selectedIndices
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i))
      onUpdate({ options: newOptions, selectedIndices: newSelectedIndices })
    },
    [element.options, element.selectedIndices, onUpdate]
  )

  // Update option
  const updateOption = useCallback(
    (index: number, value: string) => {
      const newOptions = element.options.map((opt, i) => (i === index ? value : opt))
      onUpdate({ options: newOptions })
    },
    [element.options, onUpdate]
  )

  // Toggle selection
  const toggleSelection = useCallback(
    (index: number) => {
      const isSelected = element.selectedIndices.includes(index)
      let newSelectedIndices: number[]

      if (isSelected) {
        newSelectedIndices = element.selectedIndices.filter((i) => i !== index)
      } else {
        // Check max selections limit
        if (
          element.maxSelections > 0 &&
          element.selectedIndices.length >= element.maxSelections
        ) {
          return // Don't add if at limit
        }
        newSelectedIndices = [...element.selectedIndices, index]
      }

      onUpdate({ selectedIndices: newSelectedIndices })
    },
    [element.selectedIndices, element.maxSelections, onUpdate]
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
                    type="checkbox"
                    checked={element.selectedIndices.includes(index)}
                    onChange={() => toggleSelection(index)}
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

      {/* Selection */}
      <PropertySection title="Selection">
        <NumberInput
          label="Max Selections"
          value={element.maxSelections}
          onChange={(maxSelections) => onUpdate({ maxSelections })}
          min={0}
          max={element.options.length}
        />
        <p className="text-xs text-gray-500 -mt-2">0 = unlimited</p>
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
    </>
  )
}
