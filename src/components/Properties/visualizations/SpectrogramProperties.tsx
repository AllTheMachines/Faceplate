import React from 'react'
import { useStore } from '../../../store'
import { ColorInput, NumberInput, PropertySection } from '../'
import type { SpectrogramElementConfig } from '../../../types/elements'
import type { PropertyComponentProps } from '../'

export function SpectrogramProperties({ element, onUpdate }: PropertyComponentProps) {
  const config = element as SpectrogramElementConfig

  return (
    <div className="space-y-6">
      {/* FFT Configuration */}
      <PropertySection title="FFT Configuration">
        <div>
          <label className="block text-xs text-gray-400 mb-1">FFT Size</label>
          <select
            value={config.fftSize}
            onChange={(e) => onUpdate({ fftSize: Number(e.target.value) as 512 | 1024 | 2048 | 4096 | 8192 })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="512">512</option>
            <option value="1024">1024</option>
            <option value="2048">2048</option>
            <option value="4096">4096</option>
            <option value="8192">8192</option>
          </select>
        </div>
      </PropertySection>

      {/* Visual Settings */}
      <PropertySection title="Visual Settings">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Color Map</label>
          <select
            value={config.colorMap}
            onChange={(e) => onUpdate({ colorMap: e.target.value as 'default' | 'fire' | 'cool' | 'grayscale' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="default">Default</option>
            <option value="fire">Fire</option>
            <option value="cool">Cool</option>
            <option value="grayscale">Grayscale</option>
          </select>
        </div>
        <ColorInput
          label="Background Color"
          value={config.backgroundColor}
          onChange={(v) => onUpdate({ backgroundColor: v })}
        />
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
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
            checked={config.showTimeLabels}
            onChange={(e) => onUpdate({ showTimeLabels: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Time Labels</span>
        </label>
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
