import React from 'react'
import { ColorInput, NumberInput, PropertySection } from '../'
import type { EnvelopeDisplayElementConfig } from '../../../types/elements/curves'
import type { PropertyComponentProps } from '../'

export function EnvelopeDisplayProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as EnvelopeDisplayElementConfig

  return (
    <div className="space-y-6">
      {/* ADSR Parameters */}
      <PropertySection title="ADSR Parameters">
        <NumberInput
          label="Attack"
          value={config.attack}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onUpdate({ attack: v })}
        />
        <NumberInput
          label="Decay"
          value={config.decay}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onUpdate({ decay: v })}
        />
        <NumberInput
          label="Sustain"
          value={config.sustain}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onUpdate({ sustain: v })}
        />
        <NumberInput
          label="Release"
          value={config.release}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => onUpdate({ release: v })}
        />
      </PropertySection>

      {/* Curve Type */}
      <PropertySection title="Curve Type">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Type</label>
          <select
            value={config.curveType}
            onChange={(e) => onUpdate({ curveType: e.target.value as 'linear' | 'exponential' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="linear">Linear</option>
            <option value="exponential">Exponential</option>
          </select>
        </div>
      </PropertySection>

      {/* Stage Colors */}
      <PropertySection title="Stage Colors">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showStageColors}
            onChange={(e) => onUpdate({ showStageColors: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Stage Colors</span>
        </label>
        {config.showStageColors && (
          <>
            <ColorInput
              label="Attack Color"
              value={config.attackColor}
              onChange={(v) => onUpdate({ attackColor: v })}
            />
            <ColorInput
              label="Decay Color"
              value={config.decayColor}
              onChange={(v) => onUpdate({ decayColor: v })}
            />
            <ColorInput
              label="Sustain Color"
              value={config.sustainColor}
              onChange={(v) => onUpdate({ sustainColor: v })}
            />
            <ColorInput
              label="Release Color"
              value={config.releaseColor}
              onChange={(v) => onUpdate({ releaseColor: v })}
            />
          </>
        )}
      </PropertySection>

      {/* Curve Style */}
      {!config.showStageColors && (
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
      )}

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
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showStageMarkers}
            onChange={(e) => onUpdate({ showStageMarkers: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Stage Markers</span>
        </label>
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
