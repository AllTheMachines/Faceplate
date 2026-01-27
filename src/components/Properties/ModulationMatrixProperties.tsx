import { ModulationMatrixElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'

interface ModulationMatrixPropertiesProps {
  element: ModulationMatrixElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ModulationMatrixProperties({ element, onUpdate }: ModulationMatrixPropertiesProps) {
  return (
    <>
      {/* Matrix Configuration */}
      <PropertySection title="Matrix Configuration">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Sources (one per line)
          </label>
          <textarea
            value={element.sources.join('\n')}
            onChange={(e) => {
              const sources = e.target.value.split('\n').filter(s => s.trim())
              onUpdate({ sources })
            }}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm font-mono"
            rows={4}
            placeholder="LFO 1&#10;LFO 2&#10;ENV 1&#10;Velocity"
          />
          <p className="text-xs text-gray-500 mt-1">
            Modulation sources (rows)
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Destinations (one per line)
          </label>
          <textarea
            value={element.destinations.join('\n')}
            onChange={(e) => {
              const destinations = e.target.value.split('\n').filter(d => d.trim())
              onUpdate({ destinations })
            }}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm font-mono"
            rows={4}
            placeholder="Pitch&#10;Filter&#10;Volume&#10;Pan"
          />
          <p className="text-xs text-gray-500 mt-1">
            Modulation destinations (columns)
          </p>
        </div>
      </PropertySection>

      {/* Cell Styling */}
      <PropertySection title="Cell Styling">
        <NumberInput
          label="Cell Size"
          value={element.cellSize}
          onChange={(cellSize) => onUpdate({ cellSize })}
          min={16}
          max={48}
        />
        <ColorInput
          label="Cell Color"
          value={element.cellColor}
          onChange={(cellColor) => onUpdate({ cellColor })}
        />
        <ColorInput
          label="Active Color"
          value={element.activeColor}
          onChange={(activeColor) => onUpdate({ activeColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Header Styling */}
      <PropertySection title="Header Styling">
        <ColorInput
          label="Header Background"
          value={element.headerBackground}
          onChange={(headerBackground) => onUpdate({ headerBackground })}
        />
        <ColorInput
          label="Header Color"
          value={element.headerColor}
          onChange={(headerColor) => onUpdate({ headerColor })}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.headerFontFamily}
            onChange={(e) => onUpdate({ headerFontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            value={element.headerFontWeight}
            onChange={(e) => onUpdate({ headerFontWeight: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-Bold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
        <NumberInput
          label="Header Font Size"
          value={element.headerFontSize}
          onChange={(headerFontSize) => onUpdate({ headerFontSize })}
          min={8}
          max={16}
        />
      </PropertySection>

      {/* Design Preview Note */}
      <PropertySection title="Design Preview">
        <p className="text-xs text-gray-400">
          Active connections shown are for design preview only.
          Actual modulation routing is handled by JUCE backend.
        </p>
      </PropertySection>

      {/* Overflow */}
      <PropertySection title="Overflow">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.allowScroll ?? false}
            onChange={(e) => onUpdate({ allowScroll: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Allow Scrolling</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Enable scrollbars when matrix exceeds element bounds
        </p>
      </PropertySection>

      {element.allowScroll && (
        <ScrollbarStyleSection config={element} onUpdate={onUpdate} />
      )}
    </>
  )
}
