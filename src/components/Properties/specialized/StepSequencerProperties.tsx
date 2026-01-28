import { StepSequencerElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { SELECT_CLASSNAME, CHECKBOX_CLASSNAME, LABEL_CLASSNAME } from '../constants'

interface StepSequencerPropertiesProps {
  element: StepSequencerElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function StepSequencerProperties({ element, onUpdate }: StepSequencerPropertiesProps) {
  return (
    <>
      {/* Grid Configuration */}
      <PropertySection title="Grid Configuration">
        <div>
          <label className={LABEL_CLASSNAME}>Step Count</label>
          <select
            value={element.stepCount}
            onChange={(e) => onUpdate({ stepCount: parseInt(e.target.value) })}
            className={SELECT_CLASSNAME}
          >
            <option value={8}>8 steps</option>
            <option value={16}>16 steps</option>
            <option value={24}>24 steps</option>
            <option value={32}>32 steps</option>
          </select>
        </div>
        <NumberInput
          label="Row Count"
          value={element.rowCount}
          onChange={(rowCount) => onUpdate({ rowCount })}
          min={1}
          max={8}
        />
        <NumberInput
          label="Beats Per Measure"
          value={element.beatsPerMeasure}
          onChange={(beatsPerMeasure) => onUpdate({ beatsPerMeasure })}
          min={2}
          max={8}
        />
      </PropertySection>

      {/* Display Options */}
      <PropertySection title="Display Options">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.highlightDownbeats}
            onChange={(e) => onUpdate({ highlightDownbeats: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Highlight Downbeats
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showVelocity}
            onChange={(e) => onUpdate({ showVelocity: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Velocity
        </label>
        {element.showVelocity && (
          <NumberInput
            label="Velocity Height"
            value={element.velocityHeight}
            onChange={(velocityHeight) => onUpdate({ velocityHeight })}
            min={10}
            max={40}
          />
        )}
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Step Off Color"
          value={element.stepOffColor}
          onChange={(stepOffColor) => onUpdate({ stepOffColor })}
        />
        <ColorInput
          label="Step On Color"
          value={element.stepOnColor}
          onChange={(stepOnColor) => onUpdate({ stepOnColor })}
        />
        <ColorInput
          label="Active Step Color"
          value={element.stepActiveColor}
          onChange={(stepActiveColor) => onUpdate({ stepActiveColor })}
        />
        <ColorInput
          label="Grid Line Color"
          value={element.gridLineColor}
          onChange={(gridLineColor) => onUpdate({ gridLineColor })}
        />
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        {element.highlightDownbeats && (
          <ColorInput
            label="Downbeat Color"
            value={element.downbeatColor}
            onChange={(downbeatColor) => onUpdate({ downbeatColor })}
          />
        )}
      </PropertySection>
    </>
  )
}
