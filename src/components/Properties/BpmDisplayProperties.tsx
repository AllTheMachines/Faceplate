import { BpmDisplayElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, PropertySection } from './'
import { ColorsSection, FontSection } from './shared'
import { FONT_STYLE_OPTIONS, BEZEL_STYLE_OPTIONS, SELECT_CLASSNAME } from './constants'

interface BpmDisplayPropertiesProps {
  element: BpmDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function BpmDisplayProperties({ element, onUpdate }: BpmDisplayPropertiesProps) {
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
            label="Min (BPM)"
            value={element.min}
            onChange={(min) => onUpdate({ min })}
            min={20}
            max={300}
            step={1}
          />
          <NumberInput
            label="Max (BPM)"
            value={element.max}
            onChange={(max) => onUpdate({ max })}
            min={20}
            max={300}
            step={1}
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
          max={2}
          step={1}
        />
        <label
          htmlFor="bpmdisplay-show-label"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="bpmdisplay-show-label"
            checked={element.showLabel}
            onChange={(e) => onUpdate({ showLabel: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show "BPM" Label</span>
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
        {element.fontStyle === '7segment' && (
          <label
            htmlFor="bpmdisplay-show-ghost"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              id="bpmdisplay-show-ghost"
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
