import { PatchBayElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME, SELECT_CLASSNAME } from '../constants'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { FONT_WEIGHTS_COMPACT } from '../constants'

interface PatchBayPropertiesProps {
  element: PatchBayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PatchBayProperties({ element, onUpdate }: PatchBayPropertiesProps) {
  return (
    <>
      {/* Configuration */}
      <PropertySection title="Configuration">
        <NumberInput
          label="Rows"
          value={element.rows}
          onChange={(rows) => onUpdate({ rows })}
          min={2}
          max={8}
        />
        <NumberInput
          label="Columns"
          value={element.columns}
          onChange={(columns) => onUpdate({ columns })}
          min={2}
          max={8}
        />
      </PropertySection>

      {/* Display Options */}
      <PropertySection title="Display">
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
            checked={element.showGrid}
            onChange={(e) => onUpdate({ showGrid: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Grid
        </label>
        <NumberInput
          label="Point Size"
          value={element.pointSize}
          onChange={(pointSize) => onUpdate({ pointSize })}
          min={8}
          max={24}
        />
        <NumberInput
          label="Cable Width"
          value={element.cableWidth}
          onChange={(cableWidth) => onUpdate({ cableWidth })}
          min={1}
          max={6}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Input Color"
          value={element.inputColor}
          onChange={(inputColor) => onUpdate({ inputColor })}
        />
        <ColorInput
          label="Output Color"
          value={element.outputColor}
          onChange={(outputColor) => onUpdate({ outputColor })}
        />
        <ColorInput
          label="Background"
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

      {/* Cable Colors */}
      <PropertySection title="Cable Colors">
        {element.cableColors.map((color, index) => (
          <ColorInput
            key={index}
            label={`Cable ${index + 1}`}
            value={color}
            onChange={(newColor) => {
              const newColors = [...element.cableColors]
              newColors[index] = newColor
              onUpdate({ cableColors: newColors })
            }}
          />
        ))}
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
          max={14}
        />
      </PropertySection>

      {/* Connection Info */}
      <PropertySection title="Connections">
        <div className={LABEL_CLASSNAME}>
          Active Cables: {element.cables.length}
        </div>
        {element.cables.length > 0 && (
          <button
            onClick={() => onUpdate({ cables: [], selectedCable: null })}
            className="w-full px-2 py-1 text-xs bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
          >
            Clear All Cables
          </button>
        )}
      </PropertySection>
    </>
  )
}
