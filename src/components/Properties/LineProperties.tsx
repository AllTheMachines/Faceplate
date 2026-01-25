import { LineElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface LinePropertiesProps {
  element: LineElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function LineProperties({ element, onUpdate }: LinePropertiesProps) {
  // Determine orientation based on aspect ratio
  const orientation = element.width > element.height ? 'horizontal' : 'vertical'

  return (
    <>
      {/* Stroke */}
      <PropertySection title="Stroke">
        <div>
          <label className="block text-xs text-gray-400 mb-2">Orientation</label>
          <p className="text-sm text-gray-300">
            {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
            <span className="text-xs text-gray-500 ml-2">
              (based on aspect ratio)
            </span>
          </p>
        </div>
        <NumberInput
          label="Stroke Width"
          value={element.strokeWidth}
          onChange={(strokeWidth) => onUpdate({ strokeWidth })}
          min={1}
          max={20}
        />
        <ColorInput
          label="Stroke Color"
          value={element.strokeColor}
          onChange={(strokeColor) => onUpdate({ strokeColor })}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Stroke Style</label>
          <select
            value={element.strokeStyle}
            onChange={(e) =>
              onUpdate({ strokeStyle: e.target.value as LineElementConfig['strokeStyle'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
      </PropertySection>
    </>
  )
}
