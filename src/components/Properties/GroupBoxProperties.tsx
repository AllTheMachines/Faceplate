import { GroupBoxElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { EditContentsButton } from './EditContentsButton'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface GroupBoxPropertiesProps {
  element: GroupBoxElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function GroupBoxProperties({ element, onUpdate }: GroupBoxPropertiesProps) {
  return (
    <>
      {/* Edit Contents Button */}
      <EditContentsButton element={element} />

      {/* Header */}
      <PropertySection title="Header">
        <TextInput
          label="Header Text"
          value={element.headerText}
          onChange={(headerText) => onUpdate({ headerText })}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.headerFontFamily}
            onChange={(e) => onUpdate({ headerFontFamily: e.target.value })}
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
            value={element.headerFontWeight}
            onChange={(e) => onUpdate({ headerFontWeight: e.target.value })}
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
          value={element.headerFontSize}
          onChange={(headerFontSize) => onUpdate({ headerFontSize })}
          min={8}
          max={24}
        />
        <ColorInput
          label="Text Color"
          value={element.headerColor}
          onChange={(headerColor) => onUpdate({ headerColor })}
        />
        <ColorInput
          label="Background"
          value={element.headerBackground}
          onChange={(headerBackground) => onUpdate({ headerBackground })}
        />
      </PropertySection>

      {/* Border */}
      <PropertySection title="Border">
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={1}
          max={10}
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

      {/* Layout */}
      <PropertySection title="Layout">
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={50}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={element.allowScroll ?? false}
            onChange={(e) => onUpdate({ allowScroll: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-300">Allow Scrolling</span>
        </label>
      </PropertySection>

      {/* Scrollbar Style (only shown when scrolling is enabled) */}
      {element.allowScroll && (
        <ScrollbarStyleSection config={element} onUpdate={onUpdate} />
      )}
    </>
  )
}
