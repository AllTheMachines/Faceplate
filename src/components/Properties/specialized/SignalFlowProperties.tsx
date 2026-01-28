import { SignalFlowElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME, SELECT_CLASSNAME } from '../constants'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { FONT_WEIGHTS_COMPACT } from '../constants'

interface SignalFlowPropertiesProps {
  element: SignalFlowElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function SignalFlowProperties({ element, onUpdate }: SignalFlowPropertiesProps) {
  return (
    <>
      {/* Grid Configuration */}
      <PropertySection title="Grid">
        <NumberInput
          label="Cell Size"
          value={element.gridCellSize}
          onChange={(gridCellSize) => onUpdate({ gridCellSize })}
          min={20}
          max={60}
        />
        <NumberInput
          label="Grid Rows"
          value={element.gridRows}
          onChange={(gridRows) => onUpdate({ gridRows })}
          min={2}
          max={10}
        />
        <NumberInput
          label="Grid Columns"
          value={element.gridColumns}
          onChange={(gridColumns) => onUpdate({ gridColumns })}
          min={4}
          max={20}
        />
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
            checked={element.animateSignal}
            onChange={(e) => onUpdate({ animateSignal: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Animate Signal Flow
        </label>
      </PropertySection>

      {/* Styling */}
      <PropertySection title="Styling">
        <NumberInput
          label="Block Border Width"
          value={element.blockBorderWidth}
          onChange={(blockBorderWidth) => onUpdate({ blockBorderWidth })}
          min={1}
          max={4}
        />
        <NumberInput
          label="Connection Width"
          value={element.connectionWidth}
          onChange={(connectionWidth) => onUpdate({ connectionWidth })}
          min={1}
          max={4}
        />
      </PropertySection>

      {/* Block Colors */}
      <PropertySection title="Block Colors">
        <ColorInput
          label="Input Block"
          value={element.inputBlockColor}
          onChange={(inputBlockColor) => onUpdate({ inputBlockColor })}
        />
        <ColorInput
          label="Output Block"
          value={element.outputBlockColor}
          onChange={(outputBlockColor) => onUpdate({ outputBlockColor })}
        />
        <ColorInput
          label="Process Block"
          value={element.processBlockColor}
          onChange={(processBlockColor) => onUpdate({ processBlockColor })}
        />
        <ColorInput
          label="Mixer Block"
          value={element.mixerBlockColor}
          onChange={(mixerBlockColor) => onUpdate({ mixerBlockColor })}
        />
        <ColorInput
          label="Splitter Block"
          value={element.splitterBlockColor}
          onChange={(splitterBlockColor) => onUpdate({ splitterBlockColor })}
        />
      </PropertySection>

      {/* Other Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Connection"
          value={element.connectionColor}
          onChange={(connectionColor) => onUpdate({ connectionColor })}
        />
        <ColorInput
          label="Signal"
          value={element.signalColor}
          onChange={(signalColor) => onUpdate({ signalColor })}
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

      {/* Flow Info */}
      <PropertySection title="Flow">
        <div className={LABEL_CLASSNAME}>
          Blocks: {element.blocks.length}
        </div>
        <div className={LABEL_CLASSNAME}>
          Connections: {element.connections.length}
        </div>
      </PropertySection>
    </>
  )
}
