import { PianoKeyboardElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME, SELECT_CLASSNAME } from '../constants'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { FONT_WEIGHTS_COMPACT } from '../constants'

interface PianoKeyboardPropertiesProps {
  element: PianoKeyboardElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PianoKeyboardProperties({ element, onUpdate }: PianoKeyboardPropertiesProps) {
  return (
    <>
      {/* Range */}
      <PropertySection title="Range">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Start Note"
            value={element.startNote}
            onChange={(startNote) => onUpdate({ startNote })}
            min={0}
            max={127}
          />
          <NumberInput
            label="End Note"
            value={element.endNote}
            onChange={(endNote) => onUpdate({ endNote })}
            min={0}
            max={127}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          MIDI notes: C2=36, C4=60, C6=84
        </p>
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showNoteLabels}
            onChange={(e) => onUpdate({ showNoteLabels: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Note Labels
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.labelOctavesOnly}
            onChange={(e) => onUpdate({ labelOctavesOnly: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Octaves Only (C1, C2, etc.)
        </label>
      </PropertySection>

      {/* Key Dimensions */}
      <PropertySection title="Key Dimensions">
        <NumberInput
          label="White Key Width"
          value={element.whiteKeyWidth}
          onChange={(whiteKeyWidth) => onUpdate({ whiteKeyWidth })}
          min={12}
          max={60}
        />
        <NumberInput
          label="Black Key Width Ratio"
          value={element.blackKeyWidthRatio}
          onChange={(blackKeyWidthRatio) => onUpdate({ blackKeyWidthRatio })}
          min={0.4}
          max={0.8}
          step={0.1}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="White Key Color"
          value={element.whiteKeyColor}
          onChange={(whiteKeyColor) => onUpdate({ whiteKeyColor })}
        />
        <ColorInput
          label="Black Key Color"
          value={element.blackKeyColor}
          onChange={(blackKeyColor) => onUpdate({ blackKeyColor })}
        />
        <ColorInput
          label="Active Key Color"
          value={element.activeKeyColor}
          onChange={(activeKeyColor) => onUpdate({ activeKeyColor })}
        />
        <ColorInput
          label="Label Color"
          value={element.labelColor}
          onChange={(labelColor) => onUpdate({ labelColor })}
        />
      </PropertySection>

      {/* Font */}
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
          min={6}
          max={14}
        />
      </PropertySection>
    </>
  )
}
