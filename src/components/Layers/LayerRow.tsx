import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useStore } from '../../store'
import { Layer, LAYER_COLOR_MAP } from '../../types/layer'

interface LayerRowProps {
  layer: Layer
  isSelected: boolean
  hasSelectedElements?: boolean
  onSelect: (id: string) => void
  onDelete?: (layer: Layer) => void
}

export function LayerRow({ layer, isSelected, hasSelectedElements, onSelect, onDelete }: LayerRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(layer.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateLayer = useStore((state) => state.updateLayer)
  const toggleLayerVisibility = useStore((state) => state.toggleLayerVisibility)
  const toggleLayerLock = useStore((state) => state.toggleLayerLock)

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
        group flex items-center gap-2 px-3 py-2 cursor-pointer h-10
        ${isSelected ? 'bg-blue-600/30' : 'hover:bg-gray-700/50'}
        ${!layer.visible ? 'opacity-50' : ''}
        ${hasSelectedElements ? 'border-l-2 border-l-blue-500' : ''}
      `}
      onClick={() => onSelect(layer.id)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag handle grip icon (not on default layer) */}
      {!isDefault ? (
        <div className="flex-shrink-0 text-gray-600 group-hover:text-gray-400 cursor-grab active:cursor-grabbing">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
      ) : (
        // Spacer for default layer to align with others
        <div className="w-4 flex-shrink-0" />
      )}

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
          className="flex-1 min-w-0 bg-gray-900 border border-blue-500 rounded px-2 py-0.5 text-sm text-white outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm text-gray-200 truncate">
          {layer.name}
        </span>
      )}

      {/* Default badge */}
      {isDefault && (
        <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">
          Default
        </span>
      )}

      {/* Toggle buttons */}
      <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleLayerVisibility(layer.id)
          }}
          className={`p-1 rounded hover:bg-gray-600 transition-colors ${
            layer.visible ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-400'
          }`}
          title={layer.visible ? 'Hide layer (H)' : 'Show layer (H)'}
        >
          {layer.visible ? (
            // Eye open icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            // Eye closed icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleLayerLock(layer.id)
          }}
          className={`p-1 rounded hover:bg-gray-600 transition-colors ${
            layer.locked ? 'text-yellow-500 hover:text-yellow-400' : 'text-gray-600 hover:text-gray-400'
          }`}
          title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked ? (
            // Locked icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            // Unlocked icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Delete button (only for non-default layers) */}
        {!isDefault && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(layer)
            }}
            className="p-1 rounded hover:bg-red-600/30 transition-colors text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
            title="Delete layer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
