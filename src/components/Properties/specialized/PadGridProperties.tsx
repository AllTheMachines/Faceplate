import { PadGridElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { SELECT_CLASSNAME, LABEL_CLASSNAME } from '../constants'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { FONT_WEIGHTS_COMPACT } from '../constants'

interface PadGridPropertiesProps {
  element: PadGridElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PadGridProperties({ element, onUpdate }: PadGridPropertiesProps) {
  return (
    <>
      {/* Grid Dimensions */}
      <PropertySection title="Grid Dimensions">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASSNAME}>Rows</label>
            <select
              value={element.rows}
              onChange={(e) => onUpdate({ rows: parseInt(e.target.value) })}
              className={SELECT_CLASSNAME}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASSNAME}>Columns</label>
            <select
              value={element.columns}
              onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
              className={SELECT_CLASSNAME}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>
        </div>
      </PropertySection>

      {/* MIDI */}
      <PropertySection title="MIDI">
        <NumberInput
          label="Start Note"
          value={element.startNote}
          onChange={(startNote) => onUpdate({ startNote })}
          min={0}
          max={127}
        />
        <p className="text-xs text-gray-500 mt-1">
          Notes increment left-to-right, top-to-bottom
        </p>
      </PropertySection>

      {/* Styling */}
      <PropertySection title="Styling">
        <NumberInput
          label="Grid Gap"
          value={element.gridGap}
          onChange={(gridGap) => onUpdate({ gridGap })}
          min={0}
          max={16}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Pad Color"
          value={element.padColor}
          onChange={(padColor) => onUpdate({ padColor })}
        />
        <ColorInput
          label="Active Pad Color"
          value={element.activePadColor}
          onChange={(activePadColor) => onUpdate({ activePadColor })}
        />
        <ColorInput
          label="Label Color"
          value={element.labelColor}
          onChange={(labelColor) => onUpdate({ labelColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
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
          max={24}
        />
      </PropertySection>
    </>
  )
}
