import { useState, useEffect } from 'react'
import { DropdownElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface DropdownPropertiesProps {
  element: DropdownElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function DropdownProperties({ element, onUpdate }: DropdownPropertiesProps) {
  const [localOptions, setLocalOptions] = useState(element.options.join('\n'))

  // Sync when element changes (different element selected)
  useEffect(() => {
    setLocalOptions(element.options.join('\n'))
  }, [element.id, element.options])

  return (
    <>
      {/* Options */}
      <PropertySection title="Options">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Options (one per line)</label>
          <textarea
            value={localOptions}
            onChange={(e) => setLocalOptions(e.target.value)}
            onBlur={() => {
              const options = localOptions.split('\n').filter((line) => line.trim() !== '')
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
          max={20}
        />
      </PropertySection>
    </>
  )
}
