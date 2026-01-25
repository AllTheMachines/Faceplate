import { useStore } from '../../store'
import {
  isKnob,
  isSlider,
  isButton,
  isLabel,
  isMeter,
  isImage,
  isDropdown,
  isCheckbox,
  isRadioGroup,
  isPanel,
  isFrame,
  isGroupBox,
  isRectangle,
  isLine,
  isDbDisplay,
  isFrequencyDisplay,
  isGainReductionMeter,
  isPresetBrowser,
  isWaveform,
  isOscilloscope,
  isTextField,
  isCollapsible,
  ElementConfig,
} from '../../types/elements'
import { NumberInput, TextInput, PropertySection } from './'
import { KnobProperties } from './KnobProperties'
import { SliderProperties } from './SliderProperties'
import { ButtonProperties } from './ButtonProperties'
import { LabelProperties } from './LabelProperties'
import { MeterProperties } from './MeterProperties'
import { ImageProperties } from './ImageProperties'
import { PanelProperties } from './PanelProperties'
import { FrameProperties } from './FrameProperties'
import { GroupBoxProperties } from './GroupBoxProperties'
import { RectangleProperties } from './RectangleProperties'
import { LineProperties } from './LineProperties'
import { DbDisplayProperties } from './DbDisplayProperties'
import { FrequencyDisplayProperties } from './FrequencyDisplayProperties'
import { GainReductionMeterProperties } from './GainReductionMeterProperties'
import { PresetBrowserProperties } from './PresetBrowserProperties'
import { WaveformProperties } from './WaveformProperties'
import { OscilloscopeProperties } from './OscilloscopeProperties'
import { DropdownProperties } from './DropdownProperties'
import { CheckboxProperties } from './CheckboxProperties'
import { RadioGroupProperties } from './RadioGroupProperties'
import { TextFieldProperties } from './TextFieldProperties'
import { CollapsibleProperties } from './CollapsibleProperties'

export function PropertyPanel() {
  const selectedIds = useStore((state) => state.selectedIds)
  const elements = useStore((state) => state.elements)
  const updateElement = useStore((state) => state.updateElement)
  const liveDragValues = useStore((state) => state.liveDragValues)

  // Get the selected element by finding it in the elements array
  // This ensures the component re-renders when the element changes
  const getElement = (id: string) => elements.find((el) => el.id === id)

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

  // Merge live values if available (live values take precedence during drag/resize)
  const liveValues = liveDragValues?.[element.id]
  const displayX = liveValues?.x ?? element.x
  const displayY = liveValues?.y ?? element.y
  const displayWidth = liveValues?.width ?? element.width
  const displayHeight = liveValues?.height ?? element.height

  return (
    <div className="space-y-6">
      {/* Position & Size */}
      <PropertySection title="Position & Size">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="X"
            value={displayX}
            onChange={(x) => update({ x })}
          />
          <NumberInput
            label="Y"
            value={displayY}
            onChange={(y) => update({ y })}
          />
          <NumberInput
            label="Width"
            value={displayWidth}
            onChange={(width) => update({ width })}
            min={20}
          />
          <NumberInput
            label="Height"
            value={displayHeight}
            onChange={(height) => update({ height })}
            min={20}
          />
        </div>
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

      {/* Lock */}
      <PropertySection title="Lock">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={element.locked}
            onChange={(e) => update({ locked: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Lock element</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Locked elements cannot be moved or resized
        </p>
      </PropertySection>

      {/* Type-specific properties */}
      {isKnob(element) && <KnobProperties element={element} onUpdate={update} />}
      {isSlider(element) && <SliderProperties element={element} onUpdate={update} />}
      {isButton(element) && <ButtonProperties element={element} onUpdate={update} />}
      {isLabel(element) && <LabelProperties element={element} onUpdate={update} />}
      {isMeter(element) && <MeterProperties element={element} onUpdate={update} />}
      {isImage(element) && <ImageProperties element={element} onUpdate={update} />}
      {isPanel(element) && <PanelProperties element={element} onUpdate={update} />}
      {isFrame(element) && <FrameProperties element={element} onUpdate={update} />}
      {isGroupBox(element) && <GroupBoxProperties element={element} onUpdate={update} />}
      {isRectangle(element) && <RectangleProperties element={element} onUpdate={update} />}
      {isLine(element) && <LineProperties element={element} onUpdate={update} />}
      {isDbDisplay(element) && <DbDisplayProperties element={element} onUpdate={update} />}
      {isFrequencyDisplay(element) && (
        <FrequencyDisplayProperties element={element} onUpdate={update} />
      )}
      {isGainReductionMeter(element) && (
        <GainReductionMeterProperties element={element} onUpdate={update} />
      )}
      {isPresetBrowser(element) && (
        <PresetBrowserProperties element={element} onUpdate={update} />
      )}
      {isWaveform(element) && <WaveformProperties element={element} onUpdate={update} />}
      {isOscilloscope(element) && <OscilloscopeProperties element={element} onUpdate={update} />}
      {isDropdown(element) && <DropdownProperties element={element} onUpdate={update} />}
      {isCheckbox(element) && <CheckboxProperties element={element} onUpdate={update} />}
      {isRadioGroup(element) && <RadioGroupProperties element={element} onUpdate={update} />}
      {isTextField(element) && <TextFieldProperties element={element} onUpdate={update} />}
      {isCollapsible(element) && <CollapsibleProperties element={element} onUpdate={update} />}
    </div>
  )
}
