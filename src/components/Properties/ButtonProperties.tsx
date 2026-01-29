import { ButtonElementConfig, ElementConfig, ButtonAction } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'
import { useStore } from '../../store'

interface ButtonPropertiesProps {
  element: ButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ButtonProperties({ element, onUpdate }: ButtonPropertiesProps) {
  const windows = useStore((state) => state.windows)
  const activeWindowId = useStore((state) => state.activeWindowId)

  // Filter out current window from target options
  const targetWindows = windows.filter((w) => w.id !== activeWindowId)

  return (
    <>
      {/* Behavior */}
      <PropertySection title="Behavior">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={element.mode}
            onChange={(e) =>
              onUpdate({ mode: e.target.value as ButtonElementConfig['mode'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="momentary">Momentary</option>
            <option value="toggle">Toggle</option>
          </select>
        </div>
        <TextInput
          label="Label"
          value={element.label}
          onChange={(label) => onUpdate({ label })}
        />
        <label
          htmlFor="button-pressed"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="button-pressed"
            checked={element.pressed}
            onChange={(e) => onUpdate({ pressed: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Pressed</span>
        </label>
      </PropertySection>

      {/* Action */}
      <PropertySection title="Action">
        <div>
          <label className="block text-xs text-gray-400 mb-1">On Click</label>
          <select
            value={element.action || 'none'}
            onChange={(e) => {
              const action = e.target.value as ButtonAction
              onUpdate({
                action,
                // Clear target window if switching to none
                targetWindowId: action === 'none' ? undefined : element.targetWindowId,
              })
            }}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="none">None (parameter binding only)</option>
            <option value="navigate-window">Navigate to Window</option>
          </select>
        </div>
        {element.action === 'navigate-window' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Target Window</label>
            {targetWindows.length > 0 ? (
              <select
                value={element.targetWindowId || ''}
                onChange={(e) => onUpdate({ targetWindowId: e.target.value || undefined })}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="">Select a window...</option>
                {targetWindows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.type === 'developer' ? '(Dev)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-500 italic">
                No other windows available. Create another window first.
              </p>
            )}
          </div>
        )}
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
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
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
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
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={48}
        />
      </PropertySection>

      {/* Appearance */}
      <PropertySection title="Appearance">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
        <NumberInput
          label="Border Width"
          value={element.borderWidth ?? 1}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={10}
        />
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={50}
        />
      </PropertySection>
    </>
  )
}
