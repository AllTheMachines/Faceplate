import type { WaveformElementConfig } from '../../types/elements'
import { ColorInput, NumberInput, PropertySection } from './'

interface WaveformPropertiesProps {
  element: WaveformElementConfig
  onUpdate: (updates: Partial<WaveformElementConfig>) => void
}

export function WaveformProperties({ element, onUpdate }: WaveformPropertiesProps) {
  return (
    <>
      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Waveform"
          value={element.waveformColor}
          onChange={(waveformColor) => onUpdate({ waveformColor })}
        />
      </PropertySection>

      {/* Border */}
      <PropertySection title="Border">
        <ColorInput
          label="Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
        <NumberInput
          label="Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={10}
        />
      </PropertySection>

      {/* Grid */}
      <PropertySection title="Grid">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={element.showGrid}
            onChange={(e) => onUpdate({ showGrid: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Show Grid</span>
        </label>
        {element.showGrid && (
          <ColorInput
            label="Grid Color"
            value={element.gridColor}
            onChange={(gridColor) => onUpdate({ gridColor })}
          />
        )}
      </PropertySection>

      {/* JUCE Integration */}
      <PropertySection title="JUCE Integration">
        <NumberInput
          label="Zoom Level"
          value={element.zoomLevel}
          onChange={(zoomLevel) => onUpdate({ zoomLevel })}
          min={0.1}
          max={10}
          step={0.1}
        />
        <p className="text-xs text-gray-500 mt-1">
          Zoom hint for JUCE runtime (1 = default, 2 = 2x zoom)
        </p>
      </PropertySection>
    </>
  )
}
