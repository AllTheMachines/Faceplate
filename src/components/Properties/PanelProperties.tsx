import { PanelElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { EditContentsButton } from './EditContentsButton'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'

interface PanelPropertiesProps {
  element: PanelElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PanelProperties({ element, onUpdate }: PanelPropertiesProps) {
  return (
    <>
      {/* Edit Contents Button */}
      <EditContentsButton element={element} />

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

      {/* Content */}
      <PropertySection title="Content">
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
