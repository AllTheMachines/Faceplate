import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Tree, NodeRendererProps } from 'react-arborist'
import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../../store'
import { Layer, LayerColor, LAYER_COLORS, LAYER_COLOR_MAP } from '../../types/layer'
import { LayerRow } from './LayerRow'
import { DeleteLayerDialog } from './DeleteLayerDialog'

// Data structure for react-arborist tree nodes
interface LayerNodeData {
  id: string
  name: string
  layer: Layer
  hasSelectedElements: boolean
}

// LayerNode render component that wraps LayerRow
// Must be created as a factory function to capture the onDelete callback
function createLayerNode(onDeleteLayer: (layer: Layer) => void) {
  return function LayerNode({
    node,
    style,
    dragHandle,
  }: NodeRendererProps<LayerNodeData>) {
    const selectedLayerId = useStore((state) => state.selectedLayerId)
    const selectLayer = useStore((state) => state.selectLayer)
    const elements = useStore((state) => state.elements)
    const selectElement = useStore((state) => state.selectElement)

    // Handle layer click - select first element in this layer
    const handleLayerClick = useCallback((layerId: string) => {
      selectLayer(layerId)
      // Find first element in this layer and select it
      const firstElement = elements.find((el) => (el.layerId || 'default') === layerId)
      if (firstElement) {
        selectElement(firstElement.id)
      }
    }, [selectLayer, selectElement, elements])

    return (
      <div style={style}>
        <LayerRow
          layer={node.data.layer}
          isSelected={selectedLayerId === node.data.layer.id}
          hasSelectedElements={node.data.hasSelectedElements}
          onSelect={handleLayerClick}
          onDelete={onDeleteLayer}
          dragHandleProps={dragHandle}
        />
      </div>
    )
  }
}

export function LayersPanel() {
  const [isCreating, setIsCreating] = useState(false)
  const [newLayerName, setNewLayerName] = useState('')
  const [newLayerColor, setNewLayerColor] = useState<LayerColor>('blue')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(300)

  const layers = useStore((state) => state.layers)
  const selectedLayerId = useStore((state) => state.selectedLayerId)
  const selectLayer = useStore((state) => state.selectLayer)
  const addLayer = useStore((state) => state.addLayer)
  const getLayersInOrder = useStore((state) => state.getLayersInOrder)
  const reorderLayers = useStore((state) => state.reorderLayers)
  const toggleLayerVisibility = useStore((state) => state.toggleLayerVisibility)
  const elements = useStore((state) => state.elements)
  const selectedIds = useStore((state) => state.selectedIds)

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

  // Create the LayerNode component with delete handler
  const LayerNodeComponent = useMemo(
    () => createLayerNode((layer) => setLayerToDelete(layer)),
    []
  )

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

  // Measure container height for Tree virtualization
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

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

  // Get layers sorted by order (highest first for top-to-bottom display)
  // Default layer should appear at the bottom
  const orderedLayers = getLayersInOrder()
  const sortedLayers = orderedLayers.slice().reverse()

  // Transform layers to arborist data format (flat, no nesting)
  const treeData: LayerNodeData[] = sortedLayers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    layer: layer,
    hasSelectedElements: layersWithSelectedElements.has(layer.id),
  }))

  // Handle move (reorder) from react-arborist
  const handleMove = useCallback(
    ({
      dragIds,
      index,
    }: {
      dragIds: string[]
      parentId: string | null
      index: number
    }) => {
      const dragId = dragIds[0]
      if (!dragId) return

      // The tree shows layers in reversed order (highest order at top)
      // We need to convert the visual index to the actual layer array index

      // Get current position in the reversed (visual) order
      const visualIndex = sortedLayers.findIndex((l) => l.id === dragId)
      if (visualIndex === -1) return

      // Convert visual indices to actual layer indices (in order-sorted array)
      // Visual index 0 = highest order = last in orderedLayers (length - 1)
      // Visual index N = lowest order = first in orderedLayers (0, the default)
      const layerCount = orderedLayers.length

      // Current position in orderedLayers (sorted by order ascending)
      const fromIndex = layerCount - 1 - visualIndex

      // Target position in orderedLayers
      // When dropping at visual index, we're moving to: layerCount - 1 - index
      // But we need to account for the direction of movement
      let toIndex = layerCount - 1 - index

      // Ensure we never place anything at index 0 (default layer position)
      if (toIndex <= 0) {
        toIndex = 1
      }

      // Ensure we don't exceed array bounds
      if (toIndex >= layerCount) {
        toIndex = layerCount - 1
      }

      // Only reorder if positions are different
      if (fromIndex !== toIndex) {
        reorderLayers(fromIndex, toIndex)
      }
    },
    [orderedLayers, sortedLayers, reorderLayers]
  )

  // Disable drag for default layer
  const disableDrag = useCallback((data: { data: LayerNodeData }) => {
    return data.data.layer.id === 'default'
  }, [])

  // Prevent nesting (flat list only) and dropping below default
  const disableDrop = useCallback(
    ({
      parentNode,
      index,
    }: {
      parentNode: { id: string } | null
      dragNodes: { data: LayerNodeData }[]
      index: number
    }) => {
      // No nesting allowed (flat list) - if parentNode exists, we're trying to nest
      if (parentNode !== null) return true

      // Don't allow dropping at the very last position (visual bottom = default layer's spot)
      // The default layer is always at visual bottom, and nothing can go below it
      if (index >= sortedLayers.length) return true

      return false
    },
    [sortedLayers.length]
  )

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

      {/* Layer list with react-arborist for drag-drop */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
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
          <Tree<LayerNodeData>
            data={treeData}
            openByDefault={false}
            disableDrag={disableDrag}
            disableDrop={disableDrop}
            onMove={handleMove}
            rowHeight={40}
            width="100%"
            height={containerHeight}
            indent={0}
            overscanCount={5}
            selection={selectedLayerId || undefined}
            onSelect={(nodes) => {
              if (nodes.length > 0 && nodes[0]) {
                selectLayer(nodes[0].id)
              }
            }}
            className="layers-tree"
          >
            {LayerNodeComponent}
          </Tree>
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
