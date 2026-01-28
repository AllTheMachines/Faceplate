import { TimeDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, PropertySection } from './'
import { ColorsSection, FontSection } from './shared'
import { FONT_STYLE_OPTIONS, BEZEL_STYLE_OPTIONS, SELECT_CLASSNAME } from './constants'

interface TimeDisplayPropertiesProps {
  element: TimeDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function TimeDisplayProperties({ element, onUpdate }: TimeDisplayPropertiesProps) {
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
            label="Min (ms)"
            value={element.min}
            onChange={(min) => onUpdate({ min })}
            step={100}
          />
          <NumberInput
            label="Max (ms)"
            value={element.max}
            onChange={(max) => onUpdate({ max })}
            step={100}
          />
        </div>
      </PropertySection>

      {/* Format */}
      <PropertySection title="Format">
        <NumberInput
          label="Decimal Places"
          value={element.decimalPlaces}
          onChange={(decimalPlaces) => onUpdate({ decimalPlaces })}
          min={0}
          max={6}
          step={1}
        />
      </PropertySection>

      {/* Timing */}
      <PropertySection title="Timing">
        <NumberInput
          label="BPM"
          value={element.bpm}
          onChange={(bpm) => onUpdate({ bpm })}
          min={20}
          max={300}
          step={1}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Time Signature</label>
          <select
            value={element.timeSignature}
            onChange={(e) => onUpdate({ timeSignature: parseInt(e.target.value) })}
            className={SELECT_CLASSNAME}
          >
            <option value="2">2/4</option>
            <option value="4">4/4</option>
            <option value="6">6/8</option>
          </select>
        </div>
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
        {element.fontStyle === '7segment' && (
          <label
            htmlFor="timedisplay-show-ghost"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              id="timedisplay-show-ghost"
              checked={element.showGhostSegments}
              onChange={(e) => onUpdate({ showGhostSegments: e.target.checked })}
              className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-300">Show Ghost Segments</span>
          </label>
        )}
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
