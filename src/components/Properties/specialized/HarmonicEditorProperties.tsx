import { HarmonicEditorElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME, SELECT_CLASSNAME } from '../constants'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { FONT_WEIGHTS_COMPACT } from '../constants'

interface HarmonicEditorPropertiesProps {
  element: HarmonicEditorElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function HarmonicEditorProperties({ element, onUpdate }: HarmonicEditorPropertiesProps) {
  return (
    <>
      {/* Harmonics Configuration */}
      <PropertySection title="Harmonics">
        <NumberInput
          label="Harmonic Count"
          value={element.harmonicCount}
          onChange={(harmonicCount) => onUpdate({ harmonicCount })}
          min={8}
          max={64}
        />
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showFundamental}
            onChange={(e) => onUpdate({ showFundamental: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Highlight Fundamental
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showHarmonicNumbers}
            onChange={(e) => onUpdate({ showHarmonicNumbers: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Harmonic Numbers
        </label>
      </PropertySection>

      {/* Bar Styling */}
      <PropertySection title="Bar Styling">
        <NumberInput
          label="Bar Gap"
          value={element.barGap}
          onChange={(barGap) => onUpdate({ barGap })}
          min={0}
          max={8}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Bar Color"
          value={element.barColor}
          onChange={(barColor) => onUpdate({ barColor })}
        />
        <ColorInput
          label="Selected Bar Color"
          value={element.selectedBarColor}
          onChange={(selectedBarColor) => onUpdate({ selectedBarColor })}
        />
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Grid Color"
          value={element.gridColor}
          onChange={(gridColor) => onUpdate({ gridColor })}
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
          min={6}
          max={14}
        />
      </PropertySection>
    </>
  )
}
