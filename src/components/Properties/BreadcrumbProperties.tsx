import { useCallback } from 'react'
import { BreadcrumbElementConfig, BreadcrumbItem, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface BreadcrumbPropertiesProps {
  element: BreadcrumbElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function BreadcrumbProperties({ element, onUpdate }: BreadcrumbPropertiesProps) {
  // Add new item
  const addItem = useCallback(() => {
    const newItems = [
      ...element.items,
      { id: `item-${Date.now()}`, label: `Item ${element.items.length + 1}` },
    ]
    onUpdate({ items: newItems })
  }, [element.items, onUpdate])

  // Remove item
  const removeItem = useCallback(
    (index: number) => {
      // Keep minimum 1 item
      if (element.items.length <= 1) return
      const newItems = element.items.filter((_, i) => i !== index)
      onUpdate({ items: newItems })
    },
    [element.items, onUpdate]
  )

  // Update item
  const updateItem = useCallback(
    (index: number, updates: Partial<BreadcrumbItem>) => {
      const newItems = element.items.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
      onUpdate({ items: newItems })
    },
    [element.items, onUpdate]
  )

  return (
    <>
      {/* Path Items */}
      <PropertySection title="Path Items">
        <div className="space-y-2">
          {element.items.map((item, index) => (
            <div key={item.id} className="border border-gray-600 rounded p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Item {index + 1}</span>
                <button
                  onClick={() => removeItem(index)}
                  disabled={element.items.length <= 1}
                  className={`text-xs px-2 py-1 rounded ${
                    element.items.length <= 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Remove
                </button>
              </div>
              <TextInput
                label="Label"
                value={item.label}
                onChange={(label) => updateItem(index, { label })}
              />
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Add Item
          </button>
        </div>
      </PropertySection>

      {/* Display */}
      <PropertySection title="Display">
        <div>
          <label htmlFor="breadcrumb-separator" className="block text-xs text-gray-400 mb-1">
            Separator
          </label>
          <input
            type="text"
            id="breadcrumb-separator"
            value={element.separator}
            onChange={(e) => onUpdate({ separator: e.target.value })}
            placeholder="/"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          />
        </div>
        <NumberInput
          label="Max Visible Items"
          value={element.maxVisibleItems}
          onChange={(maxVisibleItems) => onUpdate({ maxVisibleItems })}
          min={0}
          max={20}
        />
        <p className="text-xs text-gray-500 -mt-2">0 = show all items</p>
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-Bold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={24}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Link Color"
          value={element.linkColor}
          onChange={(linkColor) => onUpdate({ linkColor })}
        />
        <ColorInput
          label="Current Color"
          value={element.currentColor}
          onChange={(currentColor) => onUpdate({ currentColor })}
        />
        <ColorInput
          label="Separator Color"
          value={element.separatorColor}
          onChange={(separatorColor) => onUpdate({ separatorColor })}
        />
        <ColorInput
          label="Hover Color"
          value={element.hoverColor}
          onChange={(hoverColor) => onUpdate({ hoverColor })}
        />
      </PropertySection>
    </>
  )
}
