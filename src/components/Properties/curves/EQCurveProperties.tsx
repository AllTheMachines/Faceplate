import React from 'react'
import { ColorInput, NumberInput, PropertySection } from '../'
import type { EQCurveElementConfig } from '../../../types/elements/curves'
import type { PropertyComponentProps } from '../'

export function EQCurveProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as EQCurveElementConfig

  return (
    <div className="space-y-6">
      {/* Band Configuration */}
      <PropertySection title="Band Configuration">
        <NumberInput
          label="Band Count"
          value={config.bandCount}
          min={1}
          max={16}
          step={1}
          onChange={(v) => onUpdate({ bandCount: v })}
        />
      </PropertySection>

      {/* dB Range */}
      <PropertySection title="dB Range">
        <NumberInput
          label="Min dB"
          value={config.minDb}
          min={-48}
          max={0}
          step={6}
          onChange={(v) => onUpdate({ minDb: v })}
        />
        <NumberInput
          label="Max dB"
          value={config.maxDb}
          min={0}
          max={48}
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
          <>
            <ColorInput
              label="Fill Color"
              value={config.fillColor}
              onChange={(v) => onUpdate({ fillColor: v })}
            />
            <NumberInput
              label="Fill Opacity"
              value={config.fillOpacity}
              min={0}
              max={1}
              step={0.1}
              onChange={(v) => onUpdate({ fillOpacity: v })}
            />
          </>
        )}
      </PropertySection>

      {/* Individual Bands */}
      <PropertySection title="Display Mode">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showIndividualBands}
            onChange={(e) => onUpdate({ showIndividualBands: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Individual Bands</span>
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
