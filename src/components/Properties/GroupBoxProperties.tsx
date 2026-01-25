import { GroupBoxElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'

interface GroupBoxPropertiesProps {
  element: GroupBoxElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function GroupBoxProperties({ element, onUpdate }: GroupBoxPropertiesProps) {
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
      </PropertySection>
    </>
  )
}
