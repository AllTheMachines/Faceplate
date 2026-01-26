import React from 'react'
import { useStore } from '../../../store'
import { NumberInput, PropertySection } from '../'
import type { CorrelationMeterElementConfig } from '../../../types/elements/displays'

interface Props {
  element: CorrelationMeterElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function CorrelationMeterProperties({ element }: Props) {
  const updateElement = useStore((state) => state.updateElement)

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-400 uppercase tracking-wide">Correlation Meter</div>

      <PropertySection title="Bar">
        <NumberInput
          label="Bar Height"
          value={element.barHeight}
          min={8}
          max={24}
          step={2}
          onChange={(v) => updateElement(element.id, { barHeight: v })}
        />
      </PropertySection>

      <PropertySection title="Scale">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showScale}
            onChange={(e) => updateElement(element.id, { showScale: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Scale</span>
        </label>
        {element.showScale && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Scale Position</label>
            <select
              value={element.scalePosition}
              onChange={(e) => updateElement(element.id, { scalePosition: e.target.value as 'above' | 'below' })}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
        )}
      </PropertySection>

      <PropertySection title="Display">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showNumericReadout}
            onChange={(e) => updateElement(element.id, { showNumericReadout: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Numeric Readout</span>
        </label>
      </PropertySection>

      <PropertySection title="Range">
        <div className="text-xs text-gray-500">
          -1 (out of phase) to +1 (in phase)
        </div>
      </PropertySection>
    </div>
  )
}
