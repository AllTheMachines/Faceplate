import type { OscilloscopeElementConfig } from '../../types/elements'
import { ColorInput, NumberInput, PropertySection } from './'

interface OscilloscopePropertiesProps {
  element: OscilloscopeElementConfig
  onUpdate: (updates: Partial<OscilloscopeElementConfig>) => void
}

export function OscilloscopeProperties({ element, onUpdate }: OscilloscopePropertiesProps) {
  return (
    <>
      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Trace"
          value={element.traceColor}
          onChange={(traceColor) => onUpdate({ traceColor })}
        />
      </PropertySection>

      {/* Border */}
      <PropertySection title="Border">
        <ColorInput
          label="Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
        <NumberInput
          label="Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={10}
        />
      </PropertySection>

      {/* Grid */}
      <PropertySection title="Grid">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={element.showGrid}
            onChange={(e) => onUpdate({ showGrid: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Show Grid</span>
        </label>
        {element.showGrid && (
          <>
            <ColorInput
              label="Grid Color"
              value={element.gridColor}
              onChange={(gridColor) => onUpdate({ gridColor })}
            />
            <NumberInput
              label="Grid Divisions"
              value={element.gridDivisions}
              onChange={(gridDivisions) => onUpdate({ gridDivisions })}
              min={2}
              max={16}
            />
          </>
        )}
      </PropertySection>

      {/* Scope Settings */}
      <PropertySection title="Scope Settings">
        <NumberInput
          label="Time/Div (ms)"
          value={element.timeDiv}
          onChange={(timeDiv) => onUpdate({ timeDiv })}
          min={0.1}
          max={1000}
          step={0.1}
        />
        <NumberInput
          label="Amplitude Scale"
          value={element.amplitudeScale}
          onChange={(amplitudeScale) => onUpdate({ amplitudeScale })}
          min={0}
          max={1}
          step={0.01}
        />
        <NumberInput
          label="Trigger Level"
          value={element.triggerLevel}
          onChange={(triggerLevel) => onUpdate({ triggerLevel })}
          min={0}
          max={1}
          step={0.01}
        />
        <p className="text-xs text-gray-500 mt-1">
          Settings hints for JUCE runtime
        </p>
      </PropertySection>
    </>
  )
}
