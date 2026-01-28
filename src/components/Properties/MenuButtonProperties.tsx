import { useCallback } from 'react'
import { MenuButtonElementConfig, MenuItem, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface MenuButtonPropertiesProps {
  element: MenuButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function MenuButtonProperties({ element, onUpdate }: MenuButtonPropertiesProps) {
  // Add new menu item
  const addMenuItem = useCallback(() => {
    const newMenuItems = [
      ...element.menuItems,
      { id: `item-${Date.now()}`, label: `Item ${element.menuItems.length + 1}` },
    ]
    onUpdate({ menuItems: newMenuItems })
  }, [element.menuItems, onUpdate])

  // Remove menu item
  const removeMenuItem = useCallback(
    (index: number) => {
      if (element.menuItems.length <= 1) return
      const newMenuItems = element.menuItems.filter((_, i) => i !== index)
      onUpdate({ menuItems: newMenuItems })
    },
    [element.menuItems, onUpdate]
  )

  // Update menu item
  const updateMenuItem = useCallback(
    (index: number, updates: Partial<MenuItem>) => {
      const newMenuItems = element.menuItems.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
      onUpdate({ menuItems: newMenuItems })
    },
    [element.menuItems, onUpdate]
  )

  return (
    <>
      {/* Button Label */}
      <PropertySection title="Button">
        <TextInput
          label="Label"
          value={element.label}
          onChange={(label) => onUpdate({ label })}
        />
      </PropertySection>

      {/* Menu Items */}
      <PropertySection title="Menu Items">
        <div className="space-y-2">
          {element.menuItems.map((item, index) => (
            <div key={item.id} className="border border-gray-600 rounded p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Item {index + 1}</span>
                <button
                  onClick={() => removeMenuItem(index)}
                  disabled={element.menuItems.length <= 1}
                  className={`text-xs px-2 py-1 rounded ${
                    element.menuItems.length <= 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <TextInput
                  label="Label"
                  value={item.label}
                  onChange={(label) => updateMenuItem(index, { label })}
                />
                <label
                  htmlFor={`menuitem-disabled-${index}`}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id={`menuitem-disabled-${index}`}
                    checked={item.disabled || false}
                    onChange={(e) => updateMenuItem(index, { disabled: e.target.checked })}
                    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Disabled</span>
                </label>
                <label
                  htmlFor={`menuitem-divider-${index}`}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id={`menuitem-divider-${index}`}
                    checked={item.divider || false}
                    onChange={(e) => updateMenuItem(index, { divider: e.target.checked })}
                    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Show Divider After</span>
                </label>
              </div>
            </div>
          ))}
          <button
            onClick={addMenuItem}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Add Menu Item
          </button>
        </div>
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
          max={32}
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
