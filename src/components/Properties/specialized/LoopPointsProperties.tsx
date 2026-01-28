import { LoopPointsElementConfig, ElementConfig } from '../../../types/elements'
import { NumberInput, ColorInput, PropertySection } from '../'
import { CHECKBOX_CLASSNAME, LABEL_CLASSNAME } from '../constants'

interface LoopPointsPropertiesProps {
  element: LoopPointsElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function LoopPointsProperties({ element, onUpdate }: LoopPointsPropertiesProps) {
  return (
    <>
      {/* Loop Points */}
      <PropertySection title="Loop Points">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Loop Start"
            value={element.loopStart}
            onChange={(loopStart) => onUpdate({ loopStart })}
            min={0}
            max={1}
            step={0.01}
          />
          <NumberInput
            label="Loop End"
            value={element.loopEnd}
            onChange={(loopEnd) => onUpdate({ loopEnd })}
            min={0}
            max={1}
            step={0.01}
          />
        </div>
        <NumberInput
          label="Crossfade Length"
          value={element.crossfadeLength}
          onChange={(crossfadeLength) => onUpdate({ crossfadeLength })}
          min={0}
          max={0.25}
          step={0.01}
        />
      </PropertySection>

      {/* Display Options */}
      <PropertySection title="Display Options">
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showWaveform}
            onChange={(e) => onUpdate({ showWaveform: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Waveform
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showCrossfade}
            onChange={(e) => onUpdate({ showCrossfade: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Crossfade Region
        </label>
        <label className={`flex items-center gap-2 ${LABEL_CLASSNAME}`}>
          <input
            type="checkbox"
            checked={element.showTimeRuler}
            onChange={(e) => onUpdate({ showTimeRuler: e.target.checked })}
            className={CHECKBOX_CLASSNAME}
          />
          Show Time Ruler
        </label>
      </PropertySection>

      {/* Marker Styling */}
      <PropertySection title="Marker Styling">
        <NumberInput
          label="Marker Width"
          value={element.markerWidth}
          onChange={(markerWidth) => onUpdate({ markerWidth })}
          min={1}
          max={6}
        />
        <NumberInput
          label="Handle Size"
          value={element.markerHandleSize}
          onChange={(markerHandleSize) => onUpdate({ markerHandleSize })}
          min={6}
          max={16}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Waveform Color"
          value={element.waveformColor}
          onChange={(waveformColor) => onUpdate({ waveformColor })}
        />
        <ColorInput
          label="Loop Region Color"
          value={element.loopRegionColor}
          onChange={(loopRegionColor) => onUpdate({ loopRegionColor })}
        />
        <ColorInput
          label="Start Marker Color"
          value={element.startMarkerColor}
          onChange={(startMarkerColor) => onUpdate({ startMarkerColor })}
        />
        <ColorInput
          label="End Marker Color"
          value={element.endMarkerColor}
          onChange={(endMarkerColor) => onUpdate({ endMarkerColor })}
        />
        <ColorInput
          label="Crossfade Color"
          value={element.crossfadeColor}
          onChange={(crossfadeColor) => onUpdate({ crossfadeColor })}
        />
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
      </PropertySection>
    </>
  )
}
