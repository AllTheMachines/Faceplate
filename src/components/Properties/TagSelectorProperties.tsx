import { useCallback } from 'react'
import { TagSelectorElementConfig, Tag, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'

interface TagSelectorPropertiesProps {
  element: TagSelectorElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function TagSelectorProperties({ element, onUpdate }: TagSelectorPropertiesProps) {
  // Add new available tag
  const addAvailableTag = useCallback(() => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      label: `Tag ${element.availableTags.length + 1}`,
    }
    const newAvailableTags = [...element.availableTags, newTag]
    onUpdate({ availableTags: newAvailableTags })
  }, [element.availableTags, onUpdate])

  // Remove available tag
  const removeAvailableTag = useCallback(
    (index: number) => {
      if (element.availableTags.length <= 1) return
      const tagToRemove = element.availableTags[index]
      if (!tagToRemove) return
      const newAvailableTags = element.availableTags.filter((_, i) => i !== index)
      // Remove from selected tags if it was selected
      const newSelectedTags = element.selectedTags.filter((tag) => tag.id !== tagToRemove.id)
      onUpdate({ availableTags: newAvailableTags, selectedTags: newSelectedTags })
    },
    [element.availableTags, element.selectedTags, onUpdate]
  )

  // Update available tag
  const updateAvailableTag = useCallback(
    (index: number, updates: Partial<Tag>) => {
      const tagToUpdate = element.availableTags[index]
      if (!tagToUpdate) return
      const newAvailableTags = element.availableTags.map((tag, i) =>
        i === index ? { ...tag, ...updates } : tag
      )
      // Also update in selected tags if it was selected
      const tagId = tagToUpdate.id
      const newSelectedTags = element.selectedTags.map((tag) =>
        tag.id === tagId ? { ...tag, ...updates } : tag
      )
      onUpdate({ availableTags: newAvailableTags, selectedTags: newSelectedTags })
    },
    [element.availableTags, element.selectedTags, onUpdate]
  )

  // Toggle tag selection
  const toggleTagSelection = useCallback(
    (tag: Tag) => {
      const isSelected = element.selectedTags.some((t) => t.id === tag.id)
      let newSelectedTags: Tag[]

      if (isSelected) {
        newSelectedTags = element.selectedTags.filter((t) => t.id !== tag.id)
      } else {
        newSelectedTags = [...element.selectedTags, tag]
      }

      onUpdate({ selectedTags: newSelectedTags })
    },
    [element.selectedTags, onUpdate]
  )

  return (
    <>
      {/* Available Tags */}
      <PropertySection title="Available Tags">
        <div className="space-y-2">
          {element.availableTags.map((tag, index) => (
            <div key={tag.id} className="border border-gray-600 rounded p-2">
              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={element.selectedTags.some((t) => t.id === tag.id)}
                    onChange={() => toggleTagSelection(tag)}
                    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-400">Selected</span>
                </label>
                <button
                  onClick={() => removeAvailableTag(index)}
                  disabled={element.availableTags.length <= 1}
                  className={`ml-auto text-xs px-2 py-1 rounded ${
                    element.availableTags.length <= 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Remove
                </button>
              </div>
              <TextInput
                label="Label"
                value={tag.label}
                onChange={(label) => updateAvailableTag(index, { label })}
              />
            </div>
          ))}
          <button
            onClick={addAvailableTag}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Add Tag
          </button>
        </div>
      </PropertySection>

      {/* Input */}
      <PropertySection title="Input">
        <label
          htmlFor="tagselector-showinput"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="tagselector-showinput"
            checked={element.showInput}
            onChange={(e) => onUpdate({ showInput: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Input Field</span>
        </label>
        {element.showInput && (
          <>
            <div>
              <label
                htmlFor="tagselector-placeholder"
                className="block text-xs text-gray-400 mb-1"
              >
                Placeholder
              </label>
              <input
                type="text"
                id="tagselector-placeholder"
                value={element.inputPlaceholder}
                onChange={(e) => onUpdate({ inputPlaceholder: e.target.value })}
                placeholder="Type to search..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
            <ColorInput
              label="Input Background"
              value={element.inputBackgroundColor}
              onChange={(inputBackgroundColor) => onUpdate({ inputBackgroundColor })}
            />
            <ColorInput
              label="Input Text Color"
              value={element.inputTextColor}
              onChange={(inputTextColor) => onUpdate({ inputTextColor })}
            />
            <ColorInput
              label="Input Border Color"
              value={element.inputBorderColor}
              onChange={(inputBorderColor) => onUpdate({ inputBorderColor })}
            />
          </>
        )}
      </PropertySection>

      {/* Chip Style */}
      <PropertySection title="Chip Style">
        <ColorInput
          label="Background Color"
          value={element.chipBackgroundColor}
          onChange={(chipBackgroundColor) => onUpdate({ chipBackgroundColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.chipTextColor}
          onChange={(chipTextColor) => onUpdate({ chipTextColor })}
        />
        <ColorInput
          label="Remove Button Color"
          value={element.chipRemoveColor}
          onChange={(chipRemoveColor) => onUpdate({ chipRemoveColor })}
        />
        <NumberInput
          label="Border Radius"
          value={element.chipBorderRadius}
          onChange={(chipBorderRadius) => onUpdate({ chipBorderRadius })}
          min={0}
          max={20}
        />
      </PropertySection>

      <ScrollbarStyleSection config={element} onUpdate={onUpdate} />
    </>
  )
}
