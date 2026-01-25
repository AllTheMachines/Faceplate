import { CollapsibleContainerElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'

interface CollapsiblePropertiesProps {
  element: CollapsibleContainerElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function CollapsibleProperties({ element, onUpdate }: CollapsiblePropertiesProps) {
  return (
    <>
      {/* Header */}
      <PropertySection title="Header">
        <TextInput
          label="Header Text"
          value={element.headerText}
          onChange={(headerText) => onUpdate({ headerText })}
        />
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
        <NumberInput
          label="Header Height"
          value={element.headerHeight}
          onChange={(headerHeight) => onUpdate({ headerHeight })}
          min={24}
          max={60}
        />
      </PropertySection>

      {/* Content */}
      <PropertySection title="Content">
        <ColorInput
          label="Background"
          value={element.contentBackground}
          onChange={(contentBackground) => onUpdate({ contentBackground })}
        />
        <NumberInput
          label="Max Height"
          value={element.maxContentHeight}
          onChange={(maxContentHeight) => onUpdate({ maxContentHeight })}
          min={50}
          max={500}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Scroll Behavior</label>
          <select
            value={element.scrollBehavior}
            onChange={(e) =>
              onUpdate({
                scrollBehavior: e.target.value as CollapsibleContainerElementConfig['scrollBehavior'],
              })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="auto">Auto</option>
            <option value="hidden">Hidden</option>
            <option value="scroll">Scroll</option>
          </select>
        </div>
      </PropertySection>

      {/* State */}
      <PropertySection title="State">
        <label
          htmlFor="collapsible-collapsed"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="collapsible-collapsed"
            checked={element.collapsed}
            onChange={(e) => onUpdate({ collapsed: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Collapsed</span>
        </label>
      </PropertySection>

      {/* Border */}
      <PropertySection title="Border">
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
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
    </>
  )
}
