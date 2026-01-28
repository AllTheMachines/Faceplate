import { SampleDisplayElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME, SELECT_CLASSNAME } from '../constants'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { FONT_WEIGHTS_COMPACT } from '../constants'

interface SampleDisplayPropertiesProps {
  element: SampleDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function SampleDisplayProperties({ element, onUpdate }: SampleDisplayPropertiesProps) {
  return (
    <>
      {/* View Range */}
      <PropertySection title="View Range">
        <NumberInput
          label="View Start"
          value={element.viewStart}
          onChange={(viewStart) => onUpdate({ viewStart })}
          min={0}
          max={0.99}
          step={0.01}
        />
        <NumberInput
          label="View End"
          value={element.viewEnd}
          onChange={(viewEnd) => onUpdate({ viewEnd })}
          min={0.01}
          max={1}
          step={0.01}
        />
        <NumberInput
          label="Zoom Level"
          value={element.zoomLevel}
          onChange={(zoomLevel) => onUpdate({ zoomLevel })}
          min={1}
          max={100}
        />
      </PropertySection>

      {/* Selection */}
      <PropertySection title="Selection">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showSelection}
            onChange={(e) => onUpdate({ showSelection: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Selection
        </label>
        <NumberInput
          label="Selection Start"
          value={element.selectionStart}
          onChange={(selectionStart) => onUpdate({ selectionStart })}
          min={0}
          max={1}
          step={0.01}
        />
        <NumberInput
          label="Selection End"
          value={element.selectionEnd}
          onChange={(selectionEnd) => onUpdate({ selectionEnd })}
          min={0}
          max={1}
          step={0.01}
        />
      </PropertySection>

      {/* Display Options */}
      <PropertySection title="Display">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showZeroLine}
            onChange={(e) => onUpdate({ showZeroLine: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Zero Line
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showTimeRuler}
            onChange={(e) => onUpdate({ showTimeRuler: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Time Ruler
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showPeaks}
            onChange={(e) => onUpdate({ showPeaks: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Peaks
        </label>
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Waveform Color"
          value={element.waveformColor}
          onChange={(waveformColor) => onUpdate({ waveformColor })}
        />
        <ColorInput
          label="Peak Color"
          value={element.peakColor}
          onChange={(peakColor) => onUpdate({ peakColor })}
        />
        <ColorInput
          label="Zero Line Color"
          value={element.zeroLineColor}
          onChange={(zeroLineColor) => onUpdate({ zeroLineColor })}
        />
        <ColorInput
          label="Selection Color"
          value={element.selectionColor}
          onChange={(selectionColor) => onUpdate({ selectionColor })}
        />
        <ColorInput
          label="Background"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Ruler Color"
          value={element.rulerColor}
          onChange={(rulerColor) => onUpdate({ rulerColor })}
        />
        <ColorInput
          label="Label Color"
          value={element.labelColor}
          onChange={(labelColor) => onUpdate({ labelColor })}
        />
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
        <div>
          <label className={LABEL_CLASSNAME}>Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className={SELECT_CLASSNAME}
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASSNAME}>Font Weight</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className={SELECT_CLASSNAME}
          >
            {FONT_WEIGHTS_COMPACT.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={16}
        />
      </PropertySection>
    </>
  )
}
