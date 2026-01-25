import { PanelElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface PanelPropertiesProps {
  element: PanelElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PanelProperties({ element, onUpdate }: PanelPropertiesProps) {
  return (
    <>
      {/* Appearance */}
      <PropertySection title="Appearance">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={50}
        />
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={10}
        />
        {element.borderWidth > 0 && (
          <ColorInput
            label="Border Color"
            value={element.borderColor}
            onChange={(borderColor) => onUpdate({ borderColor })}
          />
        )}
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
