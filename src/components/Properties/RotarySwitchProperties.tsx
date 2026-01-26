import { RotarySwitchElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface RotarySwitchPropertiesProps {
  element: RotarySwitchElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RotarySwitchProperties({ element, onUpdate }: RotarySwitchPropertiesProps) {
  // Handle position count change - ensure currentPosition is valid
  const handlePositionCountChange = (positionCount: number) => {
    const updates: Partial<RotarySwitchElementConfig> = { positionCount }
    // If current position would be out of bounds, reset to 0
    if (element.currentPosition >= positionCount) {
      updates.currentPosition = 0
    }
    onUpdate(updates)
  }

  // Handle labels change from textarea (comma or newline separated)
  const handleLabelsChange = (text: string) => {
    const trimmed = text.trim()
    if (trimmed === '') {
      onUpdate({ positionLabels: null })
    } else {
      const labels = trimmed.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
      onUpdate({ positionLabels: labels.length > 0 ? labels : null })
    }
  }

  // Convert labels array to textarea value
  const labelsText = element.positionLabels?.join(', ') ?? ''

  return (
    <>
      {/* Position */}
      <PropertySection title="Position">
        <NumberInput
          label="Position Count"
          value={element.positionCount}
          onChange={handlePositionCountChange}
          min={2}
          max={12}
        />
        <NumberInput
          label="Current Position"
          value={element.currentPosition}
          onChange={(currentPosition) => onUpdate({ currentPosition })}
          min={0}
          max={element.positionCount - 1}
        />
      </PropertySection>

      {/* Label Layout */}
      <PropertySection title="Label Layout">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Layout</label>
          <select
            value={element.labelLayout}
            onChange={(e) =>
              onUpdate({ labelLayout: e.target.value as RotarySwitchElementConfig['labelLayout'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="radial">Radial</option>
            <option value="legend">Legend</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Radial: labels around the knob. Legend: labels in a list.
          </p>
        </div>
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <p className="text-xs text-gray-500 mb-2">
          Labels are 1, 2, 3... by default. Edit below to customize (comma or newline separated).
        </p>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Position Labels</label>
          <textarea
            value={labelsText}
            onChange={(e) => handleLabelsChange(e.target.value)}
            placeholder="Leave empty for 1, 2, 3..."
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm resize-none"
          />
        </div>
        <NumberInput
          label="Label Font Size"
          value={element.labelFontSize}
          onChange={(labelFontSize) => onUpdate({ labelFontSize })}
          min={8}
          max={16}
        />
        <ColorInput
          label="Label Color"
          value={element.labelColor}
          onChange={(labelColor) => onUpdate({ labelColor })}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Pointer Color"
          value={element.pointerColor}
          onChange={(pointerColor) => onUpdate({ pointerColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Geometry */}
      <PropertySection title="Geometry">
        <NumberInput
          label="Rotation Angle"
          value={element.rotationAngle}
          onChange={(rotationAngle) => onUpdate({ rotationAngle })}
          min={90}
          max={360}
        />
        <p className="text-xs text-gray-500 mt-1">
          Total rotation range in degrees (default: 270)
        </p>
      </PropertySection>
    </>
  )
}
