import { useState, useEffect, useCallback, useMemo } from 'react'
import { AsciiArtElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { useStore } from '../../store'

const FONT_WEIGHTS = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
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

const OVERFLOW_OPTIONS = [
  { value: 'hidden', label: 'Hidden' },
  { value: 'visible', label: 'Visible' },
  { value: 'scroll', label: 'Scroll' },
] as const

const CONTENT_TYPE_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'noise', label: 'Procedural Noise' },
] as const

interface AsciiArtEditorDialogProps {
  isOpen: boolean
  content: string
  textColor: string
  backgroundColor: string
  fontFamily: string
  onSave: (content: string) => void
  onCancel: () => void
}

function AsciiArtEditorDialog({
  isOpen,
  content,
  textColor,
  backgroundColor,
  fontFamily,
  onSave,
  onCancel,
}: AsciiArtEditorDialogProps) {
  const [editContent, setEditContent] = useState(content)

  // Reset content when dialog opens
  useEffect(() => {
    if (isOpen) {
      setEditContent(content)
    }
  }, [isOpen, content])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onSave(editContent)
      }
    },
    [editContent, onCancel, onSave]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-gray-800 rounded-lg p-6 w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Edit ASCII Art</h2>
          <span className="text-xs text-gray-500">Ctrl+S to save, Esc to cancel</span>
        </div>

        {/* Editor area */}
        <div
          className="flex-1 min-h-0 mb-4 border border-gray-600 rounded overflow-hidden"
          style={{
            backgroundColor:
              backgroundColor === 'transparent' ? '#1a1a2e' : backgroundColor,
          }}
        >
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none resize-none p-4"
            style={{
              fontFamily,
              fontSize: '14px',
              color: textColor,
              lineHeight: 1.2,
              minHeight: '400px',
            }}
            autoFocus
            spellCheck={false}
          />
        </div>

        {/* Character/line count */}
        <div className="text-xs text-gray-500 mb-4">
          {editContent.split('\n').length} lines, {editContent.length} characters
          {editContent.split('\n').length > 0 && (
            <span className="ml-4">
              Max width: {Math.max(...editContent.split('\n').map((l) => l.length))} chars
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editContent)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

interface AsciiArtPropertiesProps {
  element: AsciiArtElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function AsciiArtProperties({ element, onUpdate }: AsciiArtPropertiesProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [customParamId, setCustomParamId] = useState(false)
  const elements = useStore((state) => state.elements)

  // Get available parameter IDs from other elements
  const availableParams = useMemo(() => {
    const params = new Set<string>()
    for (const el of elements) {
      if (el.parameterId && el.id !== element.id) {
        params.add(el.parameterId)
      }
    }
    return Array.from(params).sort()
  }, [elements, element.id])

  // Handle content type with default for legacy elements
  const contentType = element.contentType || 'static'

  const handleSave = (content: string) => {
    onUpdate({ content })
    setIsEditorOpen(false)
  }

  const handleParamSelect = (value: string) => {
    if (value === '__custom__') {
      setCustomParamId(true)
    } else {
      setCustomParamId(false)
      onUpdate({ noiseParameterId: value })
    }
  }

  return (
    <>
      {/* Content Type */}
      <PropertySection title="Content Type">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={contentType}
            onChange={(e) =>
              onUpdate({ contentType: e.target.value as AsciiArtElementConfig['contentType'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {CONTENT_TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </PropertySection>

      {/* Static Content */}
      {contentType === 'static' && (
        <PropertySection title="Content">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">ASCII Art Content</label>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-medium"
              >
                Edit
              </button>
            </div>
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm font-mono resize-y"
              rows={6}
              style={{ fontFamily: 'Courier New, monospace', whiteSpace: 'pre' }}
              placeholder="Enter ASCII art here..."
            />
          </div>
        </PropertySection>
      )}

      {/* Noise Configuration */}
      {contentType === 'noise' && (
        <PropertySection title="Noise Configuration">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Character Set</label>
            <input
              type="text"
              value={element.noiseCharacters || '.:!*#$@%&'}
              onChange={(e) => onUpdate({ noiseCharacters: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm font-mono"
              placeholder=".:!*#$@%&"
            />
          </div>
          <NumberInput
            label="Intensity"
            value={element.noiseIntensity ?? 0.5}
            onChange={(noiseIntensity) => onUpdate({ noiseIntensity })}
            min={0}
            max={1}
            step={0.05}
          />
          <NumberInput
            label="Width (chars)"
            value={element.noiseWidth ?? 40}
            onChange={(noiseWidth) => onUpdate({ noiseWidth })}
            min={5}
            max={200}
          />
          <NumberInput
            label="Height (lines)"
            value={element.noiseHeight ?? 20}
            onChange={(noiseHeight) => onUpdate({ noiseHeight })}
            min={1}
            max={100}
          />
          <NumberInput
            label="Refresh Rate (ms)"
            value={element.noiseRefreshRate ?? 100}
            onChange={(noiseRefreshRate) => onUpdate({ noiseRefreshRate })}
            min={16}
            max={1000}
            step={10}
          />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Parameter Binding (Intensity)</label>
            {!customParamId ? (
              <select
                value={element.noiseParameterId || ''}
                onChange={(e) => handleParamSelect(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="">None</option>
                {availableParams.map((param) => (
                  <option key={param} value={param}>
                    {param}
                  </option>
                ))}
                <option value="__custom__">Custom...</option>
              </select>
            ) : (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={element.noiseParameterId || ''}
                  onChange={(e) => onUpdate({ noiseParameterId: e.target.value })}
                  className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
                  placeholder="Enter parameter ID"
                  autoFocus
                />
                <button
                  onClick={() => setCustomParamId(false)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white text-xs"
                >
                  List
                </button>
              </div>
            )}
          </div>
        </PropertySection>
      )}

      {/* Typography */}
      <PropertySection title="Typography">
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={6}
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
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {FONT_WEIGHTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <NumberInput
          label="Line Height"
          value={element.lineHeight}
          onChange={(lineHeight) => onUpdate({ lineHeight })}
          min={0.5}
          max={3}
          step={0.1}
        />
      </PropertySection>

      {/* Container */}
      <PropertySection title="Container">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={100}
        />
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={50}
        />
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={20}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Overflow */}
      <PropertySection title="Overflow">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Overflow</label>
          <select
            value={element.overflow}
            onChange={(e) =>
              onUpdate({ overflow: e.target.value as AsciiArtElementConfig['overflow'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {OVERFLOW_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
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

      {/* Preview - only for static mode */}
      {contentType === 'static' && (
        <PropertySection title="Preview">
          <div
            className="w-full border border-gray-600 rounded overflow-hidden"
            style={{
              maxHeight: '150px',
            }}
          >
            <pre
              style={{
                margin: 0,
                fontFamily: element.fontFamily,
                fontSize: `${Math.min(element.fontSize, 10)}px`,
                fontWeight: element.fontWeight,
                color: element.textColor,
                lineHeight: element.lineHeight,
                backgroundColor: element.backgroundColor === 'transparent' ? '#1f2937' : element.backgroundColor,
                padding: `${Math.min(element.padding, 4)}px`,
                overflow: 'hidden',
                whiteSpace: 'pre',
              }}
            >
              {element.content || 'No content'}
            </pre>
          </div>
        </PropertySection>
      )}

      {/* Editor Dialog */}
      <AsciiArtEditorDialog
        isOpen={isEditorOpen}
        content={element.content}
        textColor={element.textColor}
        backgroundColor={element.backgroundColor}
        fontFamily={element.fontFamily}
        onSave={handleSave}
        onCancel={() => setIsEditorOpen(false)}
      />
    </>
  )
}
