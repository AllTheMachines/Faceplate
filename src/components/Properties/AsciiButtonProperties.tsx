import { useState } from 'react'
import { AsciiButtonElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
] as const

const MONOSPACE_FONTS = [
  { value: 'Courier New, Consolas, monospace', label: 'Courier New' },
  { value: 'Consolas, Monaco, monospace', label: 'Consolas' },
  { value: 'Monaco, Courier New, monospace', label: 'Monaco' },
  { value: '"Lucida Console", Monaco, monospace', label: 'Lucida Console' },
  { value: '"Source Code Pro", monospace', label: 'Source Code Pro' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: 'monospace', label: 'System Monospace' },
] as const

const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const

const BUTTON_MODES = [
  { value: 'momentary', label: 'Momentary (pressed while clicking)' },
  { value: 'toggle', label: 'Toggle (click to switch)' },
] as const

interface AsciiButtonPropertiesProps {
  element: AsciiButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

// Dialog component for editing ASCII art
function AsciiArtEditorDialog({
  isOpen,
  onClose,
  title,
  value,
  onChange,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  value: string
  onChange: (value: string) => void
}) {
  const [localValue, setLocalValue] = useState(value)

  if (!isOpen) return null

  const handleSave = () => {
    onChange(localValue)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-gray-800 rounded-lg p-4 w-[500px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            &times;
          </button>
        </div>

        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="w-full h-64 bg-gray-900 border border-gray-600 text-green-400 rounded p-3 font-mono text-sm resize-none"
          style={{ fontFamily: 'Courier New, Consolas, monospace' }}
          autoFocus
          spellCheck={false}
        />

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500">
            {localValue.split('\n').length} lines | Ctrl+S to save, Esc to cancel
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AsciiButtonProperties({ element, onUpdate }: AsciiButtonPropertiesProps) {
  const [editingNormal, setEditingNormal] = useState(false)
  const [editingPressed, setEditingPressed] = useState(false)

  return (
    <>
      {/* Button Mode */}
      <PropertySection title="Button Mode">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={element.mode}
            onChange={(e) =>
              onUpdate({ mode: e.target.value as AsciiButtonElementConfig['mode'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {BUTTON_MODES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="pressed"
            checked={element.pressed}
            onChange={(e) => onUpdate({ pressed: e.target.checked })}
            className="rounded bg-gray-700 border-gray-600"
          />
          <label htmlFor="pressed" className="text-xs text-gray-400">
            Initially Pressed
          </label>
        </div>
      </PropertySection>

      {/* Normal State Art */}
      <PropertySection title="Normal State">
        <div
          className="w-full border border-gray-600 rounded p-2 mb-2 min-h-16"
          style={{
            fontFamily: element.fontFamily,
            fontSize: `${Math.min(element.fontSize, 12)}px`,
            color: element.textColor,
            backgroundColor: element.backgroundColor === 'transparent' ? '#1f2937' : element.backgroundColor,
            whiteSpace: 'pre',
            textAlign: element.textAlign || 'center',
          }}
        >
          {element.normalArt}
        </div>
        <button
          onClick={() => setEditingNormal(true)}
          className="w-full px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          Edit Normal State
        </button>
      </PropertySection>

      {/* Pressed State Art */}
      <PropertySection title="Pressed State">
        <div
          className="w-full border border-gray-600 rounded p-2 mb-2 min-h-16"
          style={{
            fontFamily: element.fontFamily,
            fontSize: `${Math.min(element.fontSize, 12)}px`,
            color: element.pressedTextColor,
            backgroundColor: element.pressedBackgroundColor === 'transparent' ? '#1f2937' : element.pressedBackgroundColor,
            whiteSpace: 'pre',
            textAlign: element.textAlign || 'center',
          }}
        >
          {element.pressedArt}
        </div>
        <button
          onClick={() => setEditingPressed(true)}
          className="w-full px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          Edit Pressed State
        </button>
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Normal Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Pressed Text Color"
          value={element.pressedTextColor}
          onChange={(pressedTextColor) => onUpdate({ pressedTextColor })}
        />
        <ColorInput
          label="Normal Background"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Pressed Background"
          value={element.pressedBackgroundColor}
          onChange={(pressedBackgroundColor) => onUpdate({ pressedBackgroundColor })}
        />
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={48}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {MONOSPACE_FONTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {FONT_WEIGHTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </PropertySection>

      {/* Container */}
      <PropertySection title="Container">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Text Alignment</label>
          <select
            value={element.textAlign || 'center'}
            onChange={(e) =>
              onUpdate({ textAlign: e.target.value as AsciiButtonElementConfig['textAlign'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {TEXT_ALIGNMENTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={50}
        />
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={20}
        />
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={10}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Interaction */}
      <PropertySection title="Interaction">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={element.selectable ?? false}
            onChange={(e) => onUpdate({ selectable: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Allow text selection</span>
        </label>
      </PropertySection>

      {/* Dialogs */}
      <AsciiArtEditorDialog
        isOpen={editingNormal}
        onClose={() => setEditingNormal(false)}
        title="Edit Normal State"
        value={element.normalArt}
        onChange={(normalArt) => onUpdate({ normalArt })}
      />
      <AsciiArtEditorDialog
        isOpen={editingPressed}
        onClose={() => setEditingPressed(false)}
        title="Edit Pressed State"
        value={element.pressedArt}
        onChange={(pressedArt) => onUpdate({ pressedArt })}
      />
    </>
  )
}
