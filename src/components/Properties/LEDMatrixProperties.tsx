import { LEDMatrixElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface LEDMatrixPropertiesProps {
  element: LEDMatrixElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function LEDMatrixProperties({ element, onUpdate }: LEDMatrixPropertiesProps) {
  // Handle preset selection
  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') return

    const [rows, cols] = preset.split('x').map(Number)
    if (rows && cols) {
      // Initialize states array with all LEDs off
      const states: boolean[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => false)
      )
      onUpdate({ rows, columns: cols, states })
    }
  }

  // Determine current preset
  const getCurrentPreset = () => {
    const { rows, columns } = element
    if (rows === 4 && columns === 4) return '4x4'
    if (rows === 8 && columns === 8) return '8x8'
    if (rows === 16 && columns === 8) return '16x8'
    if (rows === 16 && columns === 16) return '16x16'
    return 'custom'
  }

  return (
    <>
      {/* Grid Size */}
      <PropertySection title="Grid Size">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Preset</label>
          <select
            value={getCurrentPreset()}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="4x4">4×4</option>
            <option value="8x8">8×8</option>
            <option value="16x8">16×8</option>
            <option value="16x16">16×16</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {getCurrentPreset() === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Rows"
              value={element.rows}
              onChange={(rows) => {
                // Resize states array
                const newStates = Array.from({ length: rows }, (_, i) =>
                  Array.from({ length: element.columns }, (_, j) =>
                    element.states[i]?.[j] ?? false
                  )
                )
                onUpdate({ rows, states: newStates })
              }}
              min={2}
              max={32}
              step={1}
            />
            <NumberInput
              label="Columns"
              value={element.columns}
              onChange={(columns) => {
                // Resize states array
                const newStates = element.states.map(row =>
                  Array.from({ length: columns }, (_, j) => row[j] ?? false)
                )
                onUpdate({ columns, states: newStates })
              }}
              min={2}
              max={32}
              step={1}
            />
          </div>
        )}
        <NumberInput
          label="Spacing"
          value={element.spacing}
          onChange={(spacing) => onUpdate({ spacing })}
          min={0}
          max={20}
          step={1}
        />
      </PropertySection>

      {/* State Preview */}
      <PropertySection title="State Preview">
        <div className="text-xs text-gray-400 mb-2">
          Current grid: {element.rows}×{element.columns}
        </div>
        <div className="text-xs text-gray-500">
          LED pattern is runtime-only. Designer shows preview state.
        </div>
      </PropertySection>

      {/* Shape */}
      <PropertySection title="Shape">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Shape</label>
          <select
            value={element.shape}
            onChange={(e) => onUpdate({ shape: e.target.value as 'round' | 'square' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="round">Round</option>
            <option value="square">Square</option>
          </select>
        </div>
        {element.shape === 'square' && (
          <NumberInput
            label="Corner Radius"
            value={element.cornerRadius}
            onChange={(cornerRadius) => onUpdate({ cornerRadius })}
            min={0}
            max={20}
            step={1}
          />
        )}
      </PropertySection>

      {/* Glow */}
      <PropertySection title="Glow">
        <label
          htmlFor="ledmatrix-glow-enabled"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="ledmatrix-glow-enabled"
            checked={element.glowEnabled}
            onChange={(e) => onUpdate({ glowEnabled: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Enable Glow</span>
        </label>
        {element.glowEnabled && (
          <>
            <NumberInput
              label="Glow Radius"
              value={element.glowRadius}
              onChange={(glowRadius) => onUpdate({ glowRadius })}
              min={0}
              max={50}
              step={1}
            />
            <NumberInput
              label="Glow Intensity"
              value={element.glowIntensity}
              onChange={(glowIntensity) => onUpdate({ glowIntensity })}
              min={0}
              max={50}
              step={1}
            />
          </>
        )}
      </PropertySection>

      {/* Color Palette */}
      <PropertySection title="Color Palette">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Preset</label>
          <select
            value={element.colorPalette}
            onChange={(e) => onUpdate({ colorPalette: e.target.value as 'classic' | 'modern' | 'neon' | 'custom' })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="neon">Neon</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {element.colorPalette === 'custom' && (
          <>
            <ColorInput
              label="On Color"
              value={element.onColor}
              onChange={(onColor) => onUpdate({ onColor })}
            />
            <ColorInput
              label="Off Color"
              value={element.offColor}
              onChange={(offColor) => onUpdate({ offColor })}
            />
          </>
        )}
      </PropertySection>
    </>
  )
}
