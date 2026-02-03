import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useStore } from '../../store'
import { Layer, LayerColor, LAYER_COLORS, LAYER_COLOR_MAP } from '../../types/layer'
import { LayerRow } from './LayerRow'
import { DeleteLayerDialog } from './DeleteLayerDialog'

export function LayersPanel() {
  const [isCreating, setIsCreating] = useState(false)
  const [newLayerName, setNewLayerName] = useState('')
  const [newLayerColor, setNewLayerColor] = useState<LayerColor>('blue')
  const inputRef = useRef<HTMLInputElement>(null)

  const layers = useStore((state) => state.layers)
  const selectedLayerId = useStore((state) => state.selectedLayerId)
  const selectLayer = useStore((state) => state.selectLayer)
  const addLayer = useStore((state) => state.addLayer)
  const getLayersInOrder = useStore((state) => state.getLayersInOrder)
  const toggleLayerVisibility = useStore((state) => state.toggleLayerVisibility)
  const reorderLayers = useStore((state) => state.reorderLayers)
  const elements = useStore((state) => state.elements)
  const selectedIds = useStore((state) => state.selectedIds)
  const selectElement = useStore((state) => state.selectElement)

  // Track which layers have selected elements (for visual indicator)
  const layersWithSelectedElements = useMemo(() => {
    const layerSet = new Set<string>()
    for (const id of selectedIds) {
      const element = elements.find((el) => el.id === id)
      if (element) {
        layerSet.add(element.layerId || 'default')
      }
    }
    return layerSet
  }, [selectedIds, elements])

  // State for delete confirmation dialog
  const [layerToDelete, setLayerToDelete] = useState<Layer | null>(null)

  // H key shortcut - toggle visibility of selected layer
  useHotkeys('h', () => {
    if (selectedLayerId) {
      toggleLayerVisibility(selectedLayerId)
    }
  }, { enabled: !!selectedLayerId })

  // Auto-focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  const handleStartCreate = () => {
    setNewLayerName('')
    setNewLayerColor('blue')
    setIsCreating(true)
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewLayerName('')
  }

  const handleCreateLayer = () => {
    const trimmed = newLayerName.trim()
    if (trimmed === '') {
      // Generate default name
      const layerCount = layers.filter((l) => l.id !== 'default').length
      const name = `Layer ${layerCount + 1}`
      addLayer(name, newLayerColor)
    } else {
      addLayer(trimmed, newLayerColor)
    }
    setIsCreating(false)
    setNewLayerName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateLayer()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelCreate()
    }
  }

  // Handle layer click - select first element in this layer
  const handleLayerClick = useCallback((layerId: string) => {
    selectLayer(layerId)
    // Find first element in this layer and select it
    const firstElement = elements.find((el) => (el.layerId || 'default') === layerId)
    if (firstElement) {
      selectElement(firstElement.id)
    }
  }, [selectLayer, selectElement, elements])

  // Get layers sorted by order (highest first for top-to-bottom display)
  // Default layer should appear at the bottom
  const orderedLayers = getLayersInOrder()
  const sortedLayers = orderedLayers.slice().reverse()

  // Create sortable layer IDs from reversed list (must match display order)
  // Exclude default layer
  const sortableLayerIds = sortedLayers
    .filter(layer => layer.id !== 'default')
    .map(layer => layer.id)

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Find indices in the REVERSED display order
    const oldIndex = sortedLayers.findIndex(l => l.id === active.id)
    const newIndex = sortedLayers.findIndex(l => l.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      // Convert reversed indices to actual order indices
      const layers = getLayersInOrder()
      const actualOldIndex = layers.length - 1 - oldIndex
      const actualNewIndex = layers.length - 1 - newIndex

      reorderLayers(actualOldIndex, actualNewIndex)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with add button */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-400 font-medium">Layers</span>
        {!isCreating && (
          <button
            onClick={handleStartCreate}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Add new layer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Create new layer form */}
      {isCreating && (
        <div className="p-3 border-b border-gray-700 bg-gray-750">
          <div className="flex flex-col gap-2">
            {/* Name input */}
            <input
              ref={inputRef}
              type="text"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Layer name (optional)"
              className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />

            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Color:</span>
              <div className="flex gap-1">
                {LAYER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLayerColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newLayerColor === color
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800 scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: LAYER_COLOR_MAP[color] }}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleCreateLayer}
                className="flex-1 py-1.5 px-3 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition-colors"
              >
                Create
              </button>
              <button
                onClick={handleCancelCreate}
                className="flex-1 py-1.5 px-3 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layer list with drag-and-drop */}
      <div className="flex-1 overflow-y-auto">
        {sortedLayers.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-gray-400 text-sm">No layers yet.</p>
              <p className="text-gray-500 text-xs mt-1">
                Click + to create a layer.
              </p>
            </div>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableLayerIds} strategy={verticalListSortingStrategy}>
              <div>
                {sortedLayers.map((layer) => (
                  <LayerRow
                    key={layer.id}
                    layer={layer}
                    isSelected={selectedLayerId === layer.id}
                    hasSelectedElements={layersWithSelectedElements.has(layer.id)}
                    onSelect={handleLayerClick}
                    onDelete={(l) => setLayerToDelete(l)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Layer count footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        {layers.length} layer{layers.length !== 1 ? 's' : ''}
      </div>

      {/* Delete layer confirmation dialog */}
      <DeleteLayerDialog
        layer={layerToDelete}
        isOpen={layerToDelete !== null}
        onClose={() => setLayerToDelete(null)}
      />
    </div>
  )
}
