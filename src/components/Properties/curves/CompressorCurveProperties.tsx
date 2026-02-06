import { ColorInput, NumberInput, PropertySection } from '../'
import type { CompressorCurveElementConfig } from '../../../types/elements/curves'
import type { PropertyComponentProps } from '../'

export function CompressorCurveProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as CompressorCurveElementConfig

  return (
    <div className="space-y-6">
      {/* Compressor Parameters */}
      <PropertySection title="Compressor Parameters">
        <NumberInput
          label="Threshold (dB)"
          value={config.threshold}
          min={-60}
          max={0}
          step={1}
          onChange={(v) => onUpdate({ threshold: v })}
        />
        <NumberInput
          label="Ratio"
          value={config.ratio}
          min={1}
          max={20}
          step={0.5}
          onChange={(v) => onUpdate({ ratio: v })}
        />
        <NumberInput
          label="Knee (dB)"
          value={config.knee}
          min={0}
          max={12}
          step={1}
          onChange={(v) => onUpdate({ knee: v })}
        />
      </PropertySection>

      {/* dB Range */}
      <PropertySection title="dB Range">
        <NumberInput
          label="Min dB"
          value={config.minDb}
          min={-80}
          max={-20}
          step={10}
          onChange={(v) => onUpdate({ minDb: v })}
        />
        <NumberInput
          label="Max dB"
          value={config.maxDb}
          min={-20}
          max={20}
          step={10}
          onChange={(v) => onUpdate({ maxDb: v })}
        />
      </PropertySection>

      {/* Display Mode */}
      <PropertySection title="Display Mode">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={config.displayMode}
            onChange={(e) => onUpdate({ displayMode: e.target.value as 'transfer' | 'gainreduction' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="transfer">Transfer Curve</option>
            <option value="gainreduction">Gain Reduction</option>
          </select>
        </div>
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
