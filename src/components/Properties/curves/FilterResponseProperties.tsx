import { ColorInput, NumberInput, PropertySection } from '../'
import type { FilterResponseElementConfig } from '../../../types/elements/curves'
import type { PropertyComponentProps } from '../'

export function FilterResponseProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as FilterResponseElementConfig

  const showGainControl = ['lowshelf', 'highshelf', 'peak'].includes(config.filterType)

  return (
    <div className="space-y-6">
      {/* Filter Parameters */}
      <PropertySection title="Filter Parameters">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Filter Type</label>
          <select
            value={config.filterType}
            onChange={(e) => onUpdate({
              filterType: e.target.value as 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'lowshelf' | 'highshelf' | 'peak'
            })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="lowpass">Lowpass</option>
            <option value="highpass">Highpass</option>
            <option value="bandpass">Bandpass</option>
            <option value="notch">Notch</option>
            <option value="lowshelf">Low Shelf</option>
            <option value="highshelf">High Shelf</option>
            <option value="peak">Peak</option>
          </select>
        </div>
        <NumberInput
          label="Cutoff Frequency (Hz)"
          value={config.cutoffFrequency}
          min={20}
          max={20000}
          step={10}
          onChange={(v) => onUpdate({ cutoffFrequency: v })}
        />
        <NumberInput
          label="Resonance / Q"
          value={config.resonance}
          min={0.1}
          max={20}
          step={0.1}
          onChange={(v) => onUpdate({ resonance: v })}
        />
        {showGainControl && (
          <NumberInput
            label="Gain (dB)"
            value={config.gain}
            min={-24}
            max={24}
            step={1}
            onChange={(v) => onUpdate({ gain: v })}
          />
        )}
      </PropertySection>

      {/* dB Range */}
      <PropertySection title="dB Range">
        <NumberInput
          label="Min dB"
          value={config.minDb}
          min={-60}
          max={0}
          step={6}
          onChange={(v) => onUpdate({ minDb: v })}
        />
        <NumberInput
          label="Max dB"
          value={config.maxDb}
          min={0}
          max={24}
          step={6}
          onChange={(v) => onUpdate({ maxDb: v })}
        />
      </PropertySection>

      {/* Frequency Range */}
      <PropertySection title="Frequency Range">
        <NumberInput
          label="Min Frequency (Hz)"
          value={config.minFreq}
          min={10}
          max={1000}
          step={10}
          onChange={(v) => onUpdate({ minFreq: v })}
        />
        <NumberInput
          label="Max Frequency (Hz)"
          value={config.maxFreq}
          min={1000}
          max={20000}
          step={1000}
          onChange={(v) => onUpdate({ maxFreq: v })}
        />
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
          <>
            <ColorInput
              label="Grid Color"
              value={config.gridColor}
              onChange={(v) => onUpdate({ gridColor: v })}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.showFrequencyLabels}
                onChange={(e) => onUpdate({ showFrequencyLabels: e.target.checked })}
                className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-300">Show Frequency Labels</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.showDbLabels}
                onChange={(e) => onUpdate({ showDbLabels: e.target.checked })}
                className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-300">Show dB Labels</span>
            </label>
          </>
        )}
      </PropertySection>

      {/* Curve Style */}
      <PropertySection title="Curve Style">
        <ColorInput
          label="Curve Color"
          value={config.curveColor}
          onChange={(v) => onUpdate({ curveColor: v })}
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

      {/* Handle Colors */}
      <PropertySection title="Handle Colors">
        <ColorInput
          label="Handle Color"
          value={config.handleColor}
          onChange={(v) => onUpdate({ handleColor: v })}
        />
        <ColorInput
          label="Handle Hover Color"
          value={config.handleHoverColor}
          onChange={(v) => onUpdate({ handleHoverColor: v })}
        />
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
