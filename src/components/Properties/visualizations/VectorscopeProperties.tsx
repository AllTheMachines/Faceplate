import { ColorInput, NumberInput, PropertySection } from '../'
import type { VectorscopeElementConfig } from '../../../types/elements'
import type { PropertyComponentProps } from '../'

export function VectorscopeProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as VectorscopeElementConfig

  return (
    <div className="space-y-6">
      {/* Visual Settings */}
      <PropertySection title="Visual Settings">
        <ColorInput
          label="Trace Color"
          value={config.traceColor}
          onChange={(v) => onUpdate({ traceColor: v })}
        />
        <ColorInput
          label="Background Color"
          value={config.backgroundColor}
          onChange={(v) => onUpdate({ backgroundColor: v })}
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
          <ColorInput
            label="Grid Color"
            value={config.gridColor}
            onChange={(v) => onUpdate({ gridColor: v })}
          />
        )}
      </PropertySection>

      {/* Axis Lines */}
      <PropertySection title="Axis Lines">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showAxisLines}
            onChange={(e) => onUpdate({ showAxisLines: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Axis Lines</span>
        </label>
        <div className="text-xs text-gray-500">
          L on horizontal (X), R on vertical (Y)
        </div>
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
