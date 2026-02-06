import { ColorInput, NumberInput, PropertySection } from '../'
import type { LFODisplayElementConfig } from '../../../types/elements/curves'
import type { PropertyComponentProps } from '../'

export function LFODisplayProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as LFODisplayElementConfig

  return (
    <div className="space-y-6">
      {/* LFO Shape */}
      <PropertySection title="LFO Shape">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Shape</label>
          <select
            value={config.shape}
            onChange={(e) => onUpdate({
              shape: e.target.value as 'sine' | 'triangle' | 'saw-up' | 'saw-down' | 'square' | 'pulse' | 'sample-hold' | 'smooth-random'
            })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
            <option value="saw-up">Saw Up</option>
            <option value="saw-down">Saw Down</option>
            <option value="square">Square</option>
            <option value="pulse">Pulse</option>
            <option value="sample-hold">Sample & Hold</option>
            <option value="smooth-random">Smooth Random</option>
          </select>
        </div>
        {config.shape === 'pulse' && (
          <NumberInput
            label="Pulse Width"
            value={config.pulseWidth}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => onUpdate({ pulseWidth: v })}
          />
        )}
      </PropertySection>

      {/* Grid */}
      <PropertySection title="Grid">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showGrid}
            onChange={(e) => onUpdate({ showGrid: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Grid</span>
        </label>
        {config.showGrid && (
          <ColorInput
            label="Grid Color"
            value={config.gridColor}
            onChange={(v) => onUpdate({ gridColor: v })}
          />
        )}
      </PropertySection>

      {/* Waveform Style */}
      <PropertySection title="Waveform Style">
        <ColorInput
          label="Waveform Color"
          value={config.waveformColor}
          onChange={(v) => onUpdate({ waveformColor: v })}
        />
        <NumberInput
          label="Line Width"
          value={config.lineWidth}
          min={1}
          max={4}
          step={0.5}
          onChange={(v) => onUpdate({ lineWidth: v })}
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showFill}
            onChange={(e) => onUpdate({ showFill: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Fill</span>
        </label>
        {config.showFill && (
          <ColorInput
            label="Fill Color"
            value={config.fillColor}
            onChange={(v) => onUpdate({ fillColor: v })}
          />
        )}
      </PropertySection>

      {/* Background */}
      <PropertySection title="Background">
        <ColorInput
          label="Background Color"
          value={config.backgroundColor}
          onChange={(v) => onUpdate({ backgroundColor: v })}
        />
      </PropertySection>

      {/* Canvas */}
      <PropertySection title="Canvas">
        <NumberInput
          label="Scale Factor"
          value={config.canvasScale}
          min={1}
          max={4}
          step={0.5}
          onChange={(v) => onUpdate({ canvasScale: v })}
        />
      </PropertySection>
    </div>
  )
}
