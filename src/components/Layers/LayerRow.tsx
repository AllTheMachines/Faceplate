import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useStore } from '../../store'
import { Layer, LAYER_COLOR_MAP } from '../../types/layer'

interface LayerRowProps {
  layer: Layer
  isSelected: boolean
  onSelect: (id: string) => void
  dragHandle?: React.RefObject<HTMLDivElement>
}

export function LayerRow({ layer, isSelected, onSelect }: LayerRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(layer.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateLayer = useStore((state) => state.updateLayer)

  // Auto-focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Sync editValue when layer name changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(layer.name)
    }
  }, [layer.name, isEditing])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed === '') {
      // Revert to original name if empty
      setEditValue(layer.name)
    } else if (trimmed !== layer.name) {
      // Save if changed
      updateLayer(layer.id, { name: trimmed })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(layer.name)
      setIsEditing(false)
    }
  }

  const handleDoubleClick = () => {
    // Allow renaming any layer except default
    if (layer.id !== 'default') {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    handleSave()
  }

  const isDefault = layer.id === 'default'
  const colorHex = LAYER_COLOR_MAP[layer.color]

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 cursor-pointer
        ${isSelected ? 'bg-blue-600/30' : 'hover:bg-gray-700/50'}
        ${!layer.visible ? 'opacity-50' : ''}
      `}
      onClick={() => onSelect(layer.id)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: colorHex }}
        title={`Color: ${layer.color}`}
      />

      {/* Name or input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 bg-gray-900 border border-blue-500 rounded px-2 py-0.5 text-sm text-white outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-sm text-gray-200 truncate">
          {layer.name}
        </span>
      )}

      {/* Default badge */}
      {isDefault && (
        <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">
          Default
        </span>
      )}

      {/* Lock indicator */}
      {layer.locked && (
        <svg
          className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          title="Locked"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      )}

      {/* Hidden indicator */}
      {!layer.visible && (
        <svg
          className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          title="Hidden"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      )}
    </div>
  )
}
