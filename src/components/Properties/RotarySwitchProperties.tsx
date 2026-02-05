import { useState, useEffect } from 'react'
import { RotarySwitchElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { SELECT_CLASSNAME } from './constants'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { ButtonLayers } from '../../types/elementStyle'

interface RotarySwitchPropertiesProps {
  element: RotarySwitchElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RotarySwitchProperties({ element, onUpdate }: RotarySwitchPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const buttonStyles = getStylesByCategory('button')

  // Local state for textarea to allow typing commas
  const [labelsText, setLabelsText] = useState(element.positionLabels?.join(', ') ?? '')

  // Sync local state when element changes externally
  useEffect(() => {
    setLabelsText(element.positionLabels?.join(', ') ?? '')
  }, [element.id, element.positionLabels])

  // Handle position count change - ensure currentPosition is valid
  const handlePositionCountChange = (positionCount: number) => {
    const updates: Partial<RotarySwitchElementConfig> = { positionCount }
    // If current position would be out of bounds, reset to 0
    if (element.currentPosition >= positionCount) {
      updates.currentPosition = 0
    }
    onUpdate(updates)
  }

  // Handle labels change on blur (comma or newline separated)
  // Also auto-adjust positionCount to match number of labels if more labels provided
  const handleLabelsBlur = () => {
    const trimmed = labelsText.trim()
    if (trimmed === '') {
      onUpdate({ positionLabels: null })
    } else {
      const labels = trimmed.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
      if (labels.length > 0) {
        const updates: Partial<RotarySwitchElementConfig> = { positionLabels: labels }
        // Auto-adjust positionCount if more labels provided (up to max of 12)
        if (labels.length > element.positionCount && labels.length <= 12) {
          updates.positionCount = labels.length
          // Reset currentPosition if it would be out of bounds
          if (element.currentPosition >= labels.length) {
            updates.currentPosition = 0
          }
        }
        onUpdate(updates)
      } else {
        onUpdate({ positionLabels: null })
      }
    }
  }

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="button"
          currentStyleId={element.styleId}
          styles={buttonStyles}
          onStyleChange={(styleId) => onUpdate({
            styleId,
            colorOverrides: styleId ? element.colorOverrides : undefined
          })}
          isPro={isPro}
        />
      </PropertySection>

      {/* Color Overrides - only when SVG style selected */}
      {isPro && element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'button') return null

        const layerNames: Array<keyof ButtonLayers> = ['base', 'selector']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        if (existingLayers.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {existingLayers.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                value={element.colorOverrides?.[layerName] || ''}
                onChange={(color) => {
                  const newOverrides = { ...element.colorOverrides }
                  if (color) {
                    newOverrides[layerName] = color
                  } else {
                    delete newOverrides[layerName]
                  }
                  onUpdate({ colorOverrides: newOverrides })
                }}
              />
            ))}
            <button
              onClick={() => onUpdate({ colorOverrides: undefined })}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 mt-1"
            >
              Reset to Original Colors
            </button>
          </PropertySection>
        )
      })()}

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
            className={SELECT_CLASSNAME}
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
            onChange={(e) => setLabelsText(e.target.value)}
            onBlur={handleLabelsBlur}
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

      {/* Colors - only shown when no SVG style selected */}
      {!element.styleId && (
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
      )}

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
