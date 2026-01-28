import { NoteDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, PropertySection } from './'
import { ColorsSection, FontSection } from './shared'
import { FONT_STYLE_OPTIONS, BEZEL_STYLE_OPTIONS, SELECT_CLASSNAME } from './constants'

interface NoteDisplayPropertiesProps {
  element: NoteDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function NoteDisplayProperties({ element, onUpdate }: NoteDisplayPropertiesProps) {
  return (
    <>
      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Value"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          min={0}
          max={1}
          step={0.01}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Min (MIDI)"
            value={element.min}
            onChange={(min) => onUpdate({ min })}
            min={0}
            max={127}
            step={1}
          />
          <NumberInput
            label="Max (MIDI)"
            value={element.max}
            onChange={(max) => onUpdate({ max })}
            min={0}
            max={127}
            step={1}
          />
        </div>
      </PropertySection>

      {/* Display */}
      <PropertySection title="Display">
        <label
          htmlFor="notedisplay-prefer-sharps"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="notedisplay-prefer-sharps"
            checked={element.preferSharps}
            onChange={(e) => onUpdate({ preferSharps: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Prefer Sharps (A# vs Bb)</span>
        </label>
        <label
          htmlFor="notedisplay-show-midi"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="notedisplay-show-midi"
            checked={element.showMidiNumber}
            onChange={(e) => onUpdate({ showMidiNumber: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show MIDI Number</span>
        </label>
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Style</label>
          <select
            value={element.fontStyle}
            onChange={(e) => onUpdate({ fontStyle: e.target.value as '7segment' | 'modern' })}
            className={SELECT_CLASSNAME}
          >
            {FONT_STYLE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Bezel Style</label>
          <select
            value={element.bezelStyle}
            onChange={(e) => onUpdate({ bezelStyle: e.target.value as 'inset' | 'flat' | 'none' })}
            className={SELECT_CLASSNAME}
          >
            {BEZEL_STYLE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </PropertySection>

      {/* Colors */}
      <ColorsSection
        textColor={element.textColor}
        backgroundColor={element.backgroundColor}
        borderColor={element.borderColor}
        onTextColorChange={(textColor) => onUpdate({ textColor })}
        onBackgroundColorChange={(backgroundColor) => onUpdate({ backgroundColor })}
        onBorderColorChange={(borderColor) => onUpdate({ borderColor })}
      />

      {/* Font */}
      <FontSection
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontWeight={element.fontWeight}
        padding={element.padding}
        onFontSizeChange={(fontSize) => onUpdate({ fontSize })}
        onFontFamilyChange={(fontFamily) => onUpdate({ fontFamily })}
        onFontWeightChange={(fontWeight) => onUpdate({ fontWeight })}
        onPaddingChange={(padding) => onUpdate({ padding })}
      />
    </>
  )
}
