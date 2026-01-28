import { WavetableDisplayElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME } from '../constants'

interface WavetableDisplayPropertiesProps {
  element: WavetableDisplayElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function WavetableDisplayProperties({ element, onUpdate }: WavetableDisplayPropertiesProps) {
  return (
    <>
      {/* Frame Configuration */}
      <PropertySection title="Frame Configuration">
        <NumberInput
          label="Frame Count"
          value={element.frameCount}
          onChange={(frameCount) => onUpdate({ frameCount })}
          min={8}
          max={64}
        />
        <NumberInput
          label="Current Frame"
          value={element.currentFrame}
          onChange={(currentFrame) => onUpdate({ currentFrame })}
          min={0}
          max={element.frameCount - 1}
        />
      </PropertySection>

      {/* 3D Perspective */}
      <PropertySection title="3D Perspective">
        <NumberInput
          label="Perspective Angle"
          value={element.perspectiveAngle}
          onChange={(perspectiveAngle) => onUpdate({ perspectiveAngle })}
          min={0}
          max={45}
        />
        <NumberInput
          label="Frame Spacing"
          value={element.frameSpacing}
          onChange={(frameSpacing) => onUpdate({ frameSpacing })}
          min={2}
          max={20}
        />
      </PropertySection>

      {/* Display Options */}
      <PropertySection title="Display Options">
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
            checked={element.showFrameLabels}
            onChange={(e) => onUpdate({ showFrameLabels: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Frame Labels
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.fillWaveform}
            onChange={(e) => onUpdate({ fillWaveform: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Fill Waveform
        </label>
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Waveform Color"
          value={element.waveformColor}
          onChange={(waveformColor) => onUpdate({ waveformColor })}
        />
        <ColorInput
          label="Current Frame Color"
          value={element.currentFrameColor}
          onChange={(currentFrameColor) => onUpdate({ currentFrameColor })}
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
      </PropertySection>
    </>
  )
}
