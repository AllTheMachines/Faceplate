import React from 'react'
import { useStore } from '../../../store'
import { NumberInput, PropertySection } from '../'
import { ColorPicker } from '../shared/ColorPicker'
import { ElementStyleSection } from '../shared'
import { SELECT_CLASSNAME } from '../constants'
import type { BaseProfessionalMeterConfig } from '../../../types/elements/displays'
import { useLicense } from '../../../hooks/useLicense'

interface SharedMeterPropertiesProps {
  elementId: string
  config: BaseProfessionalMeterConfig
  showOrientation?: boolean
  showChannelLabels?: boolean
  stereoChannelLabels?: boolean
  meterLabel: string
  minDbFixed?: boolean
  maxDbFixed?: boolean
}

export function SharedMeterProperties({
  elementId,
  config,
  showOrientation = true,
  showChannelLabels = false,
  stereoChannelLabels = false,
  meterLabel,
  minDbFixed = true,
  maxDbFixed = true,
}: SharedMeterPropertiesProps) {
  const updateElement = useStore((state) => state.updateElement)
  const { isPro } = useLicense()

  const update = (updates: Partial<BaseProfessionalMeterConfig>) => {
    updateElement(elementId, updates)
  }

  return (
    <div className="space-y-6">
      {/* Meter Type Label */}
      <div className="text-xs text-gray-400 uppercase tracking-wide">{meterLabel}</div>

      {/* Style */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="meter"
          currentStyleId={config.styleId}
          
          onStyleChange={(styleId) => update({
            styleId,
            colorOverrides: styleId ? config.colorOverrides : undefined
          })}
          isPro={isPro}
        />
      </PropertySection>

      {/* Color Overrides (only when using SVG style) */}
      {config.styleId && (
        <PropertySection title="Color Overrides">
          <ColorPicker
            label="Peak"
            value={config.colorOverrides?.peak || '#ef4444'}
            onChange={(color) => update({
              colorOverrides: { ...config.colorOverrides, peak: color }
            })}
          />
          <div className="text-xs text-gray-500 mt-2">
            Override colors for specific SVG layers
          </div>
        </PropertySection>
      )}

      {/* Orientation */}
      {showOrientation && (
        <PropertySection title="Orientation">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Orientation</label>
            <select
              value={config.orientation}
              onChange={(e) => update({ orientation: e.target.value as 'vertical' | 'horizontal' })}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>
        </PropertySection>
      )}

      {/* Scale */}
      <PropertySection title="Scale">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Scale Position</label>
          <select
            value={config.scalePosition}
            onChange={(e) => update({ scalePosition: e.target.value as 'outside' | 'inside' | 'none' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="outside">Outside</option>
            <option value="inside">Inside</option>
            <option value="none">None</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showMajorTicks}
            onChange={(e) => update({ showMajorTicks: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Major Ticks</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showMinorTicks}
            onChange={(e) => update({ showMinorTicks: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Minor Ticks</span>
        </label>
      </PropertySection>

      {/* Display */}
      <PropertySection title="Display">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showNumericReadout}
            onChange={(e) => update({ showNumericReadout: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Numeric Readout</span>
        </label>
      </PropertySection>

      {/* Segments */}
      <PropertySection title="Segments">
        <NumberInput
          label="Segment Count"
          value={config.segmentCount}
          min={10}
          max={100}
          step={1}
          onChange={(v) => update({ segmentCount: v })}
        />
        <NumberInput
          label="Segment Gap (px)"
          value={config.segmentGap}
          min={0}
          max={4}
          step={1}
          onChange={(v) => update({ segmentGap: v })}
        />
      </PropertySection>

      {/* dB Range (usually fixed per meter type) */}
      <PropertySection title="Range">
        <div className="text-xs text-gray-500">
          {config.minDb} dB to {config.maxDb > 0 ? '+' : ''}{config.maxDb} dB
        </div>
      </PropertySection>

      {/* Peak Hold */}
      <PropertySection title="Peak Hold">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.showPeakHold}
            onChange={(e) => update({ showPeakHold: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Peak Hold</span>
        </label>
        {config.showPeakHold && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Style</label>
              <select
                value={config.peakHoldStyle}
                onChange={(e) => update({ peakHoldStyle: e.target.value as 'line' | 'bar' })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
              </select>
            </div>
            <NumberInput
              label="Hold Duration (ms)"
              value={config.peakHoldDuration}
              min={500}
              max={5000}
              step={100}
              onChange={(v) => update({ peakHoldDuration: v })}
            />
          </>
        )}
      </PropertySection>

      {/* Channel Labels for stereo */}
      {showChannelLabels && stereoChannelLabels && (
        <PropertySection title="Channel Labels">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={(config as any).showChannelLabels}
              onChange={(e) => updateElement(elementId, { showChannelLabels: e.target.checked })}
              className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-300">Show L/R Labels</span>
          </label>
        </PropertySection>
      )}

      {/* Color Zones Info */}
      <PropertySection title="Color Zones">
        <div className="text-xs text-gray-500">
          Green &lt; -18dB<br />
          Yellow: -18 to -6dB<br />
          Red &ge; -6dB
        </div>
      </PropertySection>
    </div>
  )
}
