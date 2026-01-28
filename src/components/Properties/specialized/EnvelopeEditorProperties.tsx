import { EnvelopeEditorElementConfig, ElementConfig, EnvelopeCurveType } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME, SELECT_CLASSNAME } from '../constants'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { FONT_WEIGHTS_COMPACT } from '../constants'

interface EnvelopeEditorPropertiesProps {
  element: EnvelopeEditorElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

const CURVE_TYPES: { value: EnvelopeCurveType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'exponential', label: 'Exponential' },
  { value: 'logarithmic', label: 'Logarithmic' },
]

export function EnvelopeEditorProperties({ element, onUpdate }: EnvelopeEditorPropertiesProps) {
  return (
    <>
      {/* ADSR Values */}
      <PropertySection title="Envelope">
        <NumberInput
          label="Attack"
          value={element.attack}
          onChange={(attack) => onUpdate({ attack })}
          min={0.01}
          max={1}
          step={0.01}
        />
        <NumberInput
          label="Decay"
          value={element.decay}
          onChange={(decay) => onUpdate({ decay })}
          min={0.01}
          max={1}
          step={0.01}
        />
        <NumberInput
          label="Sustain"
          value={element.sustain}
          onChange={(sustain) => onUpdate({ sustain })}
          min={0}
          max={1}
          step={0.01}
        />
        <NumberInput
          label="Release"
          value={element.release}
          onChange={(release) => onUpdate({ release })}
          min={0.01}
          max={1}
          step={0.01}
        />
      </PropertySection>

      {/* Curve Types */}
      <PropertySection title="Curve Types">
        <div>
          <label className={LABEL_CLASSNAME}>Attack Curve</label>
          <select
            value={element.attackCurve}
            onChange={(e) => onUpdate({ attackCurve: e.target.value as EnvelopeCurveType })}
            className={SELECT_CLASSNAME}
          >
            {CURVE_TYPES.map((curve) => (
              <option key={curve.value} value={curve.value}>
                {curve.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASSNAME}>Decay Curve</label>
          <select
            value={element.decayCurve}
            onChange={(e) => onUpdate({ decayCurve: e.target.value as EnvelopeCurveType })}
            className={SELECT_CLASSNAME}
          >
            {CURVE_TYPES.map((curve) => (
              <option key={curve.value} value={curve.value}>
                {curve.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASSNAME}>Release Curve</label>
          <select
            value={element.releaseCurve}
            onChange={(e) => onUpdate({ releaseCurve: e.target.value as EnvelopeCurveType })}
            className={SELECT_CLASSNAME}
          >
            {CURVE_TYPES.map((curve) => (
              <option key={curve.value} value={curve.value}>
                {curve.label}
              </option>
            ))}
          </select>
        </div>
      </PropertySection>

      {/* Display Options */}
      <PropertySection title="Display">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showGrid}
            onChange={(e) => onUpdate({ showGrid: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Grid
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showLabels}
            onChange={(e) => onUpdate({ showLabels: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Labels
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showValues}
            onChange={(e) => onUpdate({ showValues: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Values
        </label>
        <NumberInput
          label="Point Size"
          value={element.pointSize}
          onChange={(pointSize) => onUpdate({ pointSize })}
          min={4}
          max={16}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Line Color"
          value={element.lineColor}
          onChange={(lineColor) => onUpdate({ lineColor })}
        />
        <ColorInput
          label="Fill Color"
          value={element.fillColor}
          onChange={(fillColor) => onUpdate({ fillColor })}
        />
        <ColorInput
          label="Point Color"
          value={element.pointColor}
          onChange={(pointColor) => onUpdate({ pointColor })}
        />
        <ColorInput
          label="Active Point"
          value={element.activePointColor}
          onChange={(activePointColor) => onUpdate({ activePointColor })}
        />
        <ColorInput
          label="Grid Color"
          value={element.gridColor}
          onChange={(gridColor) => onUpdate({ gridColor })}
        />
        <ColorInput
          label="Background"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
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
