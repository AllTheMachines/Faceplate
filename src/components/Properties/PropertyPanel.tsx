import { useStore } from '../../store'
import {
  isKnob,
  isSlider,
  isButton,
  isLabel,
  isMeter,
  isImage,
  ElementConfig,
} from '../../types/elements'
import { NumberInput, TextInput, PropertySection } from './'
import { KnobProperties } from './KnobProperties'
import { SliderProperties } from './SliderProperties'
import { ButtonProperties } from './ButtonProperties'
import { LabelProperties } from './LabelProperties'
import { MeterProperties } from './MeterProperties'
import { ImageProperties } from './ImageProperties'

export function PropertyPanel() {
  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const updateElement = useStore((state) => state.updateElement)

  // Handle no selection
  if (selectedIds.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-sm">No element selected</p>
        <p className="text-xs mt-2">Click an element on the canvas to edit its properties</p>
      </div>
    )
  }

  // Handle multi-selection (defer to Phase 6)
  if (selectedIds.length > 1) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-sm">Multiple elements selected</p>
        <p className="text-xs mt-2">{selectedIds.length} elements</p>
        <p className="text-xs mt-2 text-gray-500">Multi-edit coming in Phase 6</p>
      </div>
    )
  }

  // Single element selected
  const element = getElement(selectedIds[0]!)
  if (!element) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-sm">Element not found</p>
      </div>
    )
  }

  // Update helper
  const update = (updates: Partial<ElementConfig>) => {
    updateElement(element.id, updates)
  }

  return (
    <div className="space-y-6">
      {/* Position & Size */}
      <PropertySection title="Position & Size">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="X"
            value={element.x}
            onChange={(x) => update({ x })}
          />
          <NumberInput
            label="Y"
            value={element.y}
            onChange={(y) => update({ y })}
          />
          <NumberInput
            label="Width"
            value={element.width}
            onChange={(width) => update({ width })}
            min={20}
          />
          <NumberInput
            label="Height"
            value={element.height}
            onChange={(height) => update({ height })}
            min={20}
          />
        </div>
        <NumberInput
          label="Rotation"
          value={element.rotation}
          onChange={(rotation) => update({ rotation })}
          min={-360}
          max={360}
        />
      </PropertySection>

      {/* Identity */}
      <PropertySection title="Identity">
        <TextInput
          label="Name"
          value={element.name}
          onChange={(name) => update({ name })}
        />
        <TextInput
          label="Parameter ID"
          value={element.parameterId || ''}
          onChange={(parameterId) =>
            update({ parameterId: parameterId || undefined })
          }
          placeholder="Optional JUCE parameter binding"
        />
      </PropertySection>

      {/* Type-specific properties */}
      {isKnob(element) && <KnobProperties element={element} onUpdate={update} />}
      {isSlider(element) && <SliderProperties element={element} onUpdate={update} />}
      {isButton(element) && <ButtonProperties element={element} onUpdate={update} />}
      {isLabel(element) && <LabelProperties element={element} onUpdate={update} />}
      {isMeter(element) && <MeterProperties element={element} onUpdate={update} />}
      {isImage(element) && <ImageProperties element={element} onUpdate={update} />}
    </div>
  )
}
