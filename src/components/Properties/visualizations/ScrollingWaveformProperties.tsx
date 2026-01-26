import React from 'react'
import { useStore } from '../../../store'
import { ColorInput, NumberInput, PropertySection } from '../'
import type { ScrollingWaveformElementConfig } from '../../../types/elements'
import type { PropertyComponentProps } from '../'

export function ScrollingWaveformProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as ScrollingWaveformElementConfig

  return (
    <div className="space-y-6">
      {/* Display Mode */}
      <PropertySection title="Display">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={config.displayMode}
            onChange={(e) => onUpdate({ displayMode: e.target.value as 'line' | 'fill' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="line">Line</option>
            <option value="fill">Fill</option>
          </select>
        </div>
        <ColorInput
          label="Waveform Color"
          value={config.waveformColor}
          onChange={(v) => onUpdate({ waveformColor: v })}
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
