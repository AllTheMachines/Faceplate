import { RectangleElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface RectanglePropertiesProps {
  element: RectangleElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RectangleProperties({ element, onUpdate }: RectanglePropertiesProps) {
  return (
    <>
      {/* Fill */}
      <PropertySection title="Fill">
        <ColorInput
          label="Fill Color"
          value={element.fillColor}
          onChange={(fillColor) => onUpdate({ fillColor })}
        />
        <NumberInput
          label="Fill Opacity"
          value={element.fillOpacity}
          onChange={(fillOpacity) => onUpdate({ fillOpacity })}
          min={0}
          max={1}
          step={0.1}
        />
      </PropertySection>

      {/* Border */}
      <PropertySection title="Border">
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={20}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Border Style</label>
          <select
            value={element.borderStyle}
            onChange={(e) =>
              onUpdate({ borderStyle: e.target.value as RectangleElementConfig['borderStyle'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
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
