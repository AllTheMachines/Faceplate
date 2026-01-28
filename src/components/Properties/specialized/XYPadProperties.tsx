import { XYPadElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection, TextInput } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME } from '../constants'

interface XYPadPropertiesProps {
  element: XYPadElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function XYPadProperties({ element, onUpdate }: XYPadPropertiesProps) {
  return (
    <>
      {/* Values */}
      <PropertySection title="Values">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="X Value"
            value={element.xValue}
            onChange={(xValue) => onUpdate({ xValue })}
            min={0}
            max={1}
            step={0.01}
          />
          <NumberInput
            label="Y Value"
            value={element.yValue}
            onChange={(yValue) => onUpdate({ yValue })}
            min={0}
            max={1}
            step={0.01}
          />
        </div>
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showLabels}
            onChange={(e) => onUpdate({ showLabels: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Labels
        </label>
        {element.showLabels && (
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="X Label"
              value={element.xLabel}
              onChange={(xLabel) => onUpdate({ xLabel })}
            />
            <TextInput
              label="Y Label"
              value={element.yLabel}
              onChange={(yLabel) => onUpdate({ yLabel })}
            />
          </div>
        )}
      </PropertySection>

      {/* Grid */}
      <PropertySection title="Grid">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showGrid}
            onChange={(e) => onUpdate({ showGrid: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Grid
        </label>
        {element.showGrid && (
          <>
            <NumberInput
              label="Grid Divisions"
              value={element.gridDivisions}
              onChange={(gridDivisions) => onUpdate({ gridDivisions })}
              min={2}
              max={10}
            />
            <ColorInput
              label="Grid Color"
              value={element.gridColor}
              onChange={(gridColor) => onUpdate({ gridColor })}
            />
          </>
        )}
      </PropertySection>

      {/* Cursor */}
      <PropertySection title="Cursor">
        <NumberInput
          label="Cursor Size"
          value={element.cursorSize}
          onChange={(cursorSize) => onUpdate({ cursorSize })}
          min={8}
          max={32}
        />
        <ColorInput
          label="Cursor Color"
          value={element.cursorColor}
          onChange={(cursorColor) => onUpdate({ cursorColor })}
        />
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showCrosshair}
            onChange={(e) => onUpdate({ showCrosshair: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Crosshair
        </label>
        {element.showCrosshair && (
          <ColorInput
            label="Crosshair Color"
            value={element.crosshairColor}
            onChange={(crosshairColor) => onUpdate({ crosshairColor })}
          />
        )}
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Background">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>
    </>
  )
}
