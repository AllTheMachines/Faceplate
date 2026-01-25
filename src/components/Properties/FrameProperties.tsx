import { FrameElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface FramePropertiesProps {
  element: FrameElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function FrameProperties({ element, onUpdate }: FramePropertiesProps) {
  return (
    <>
      {/* Border */}
      <PropertySection title="Border">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Border Style</label>
          <select
            value={element.borderStyle}
            onChange={(e) =>
              onUpdate({ borderStyle: e.target.value as FrameElementConfig['borderStyle'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
            <option value="groove">Groove</option>
            <option value="ridge">Ridge</option>
          </select>
        </div>
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
