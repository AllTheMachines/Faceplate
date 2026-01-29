import { StateCreator } from 'zustand'
import { Layer, LayerColor, DEFAULT_LAYER } from '../types/layer'

// ============================================================================
// Slice Interface
// ============================================================================

export interface LayersSlice {
  // State
  layers: Layer[]
  selectedLayerId: string | null

  // Actions
  addLayer: (name: string, color: LayerColor) => string
  removeLayer: (id: string) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  reorderLayers: (startIndex: number, endIndex: number) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void
  selectLayer: (id: string | null) => void
  setLayers: (layers: Layer[]) => void

  // Selectors
  getLayerById: (id: string) => Layer | undefined
  getLayersInOrder: () => Layer[]
  getDefaultLayer: () => Layer
}

// ============================================================================
// Slice Creator
// ============================================================================

export const createLayersSlice: StateCreator<LayersSlice, [], [], LayersSlice> = (
  set,
  get
) => ({
  // Initial state - start with default layer
  layers: [{ ...DEFAULT_LAYER, createdAt: Date.now() }],
  selectedLayerId: null,

  // Actions
  addLayer: (name, color) => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name,
      color,
      visible: true,
      locked: false,
      order: get().layers.length, // Add at top (highest order)
      createdAt: Date.now(),
    }

    set((state) => ({
      layers: [...state.layers, newLayer],
    }))

    return newLayer.id
  },

  removeLayer: (id) => {
    // Cannot delete default layer
    if (id === 'default') {
      console.warn('Cannot delete the default layer')
      return
    }

    set((state) => {
      const filtered = state.layers.filter((l) => l.id !== id)

      // Recalculate order fields, keeping default at 0
      const reordered = filtered
        .sort((a, b) => a.order - b.order)
        .map((layer, index) => ({
          ...layer,
          order: layer.id === 'default' ? 0 : index,
        }))

      // Update selectedLayerId if the deleted layer was selected
      const newSelectedId = state.selectedLayerId === id ? null : state.selectedLayerId

      return {
        layers: reordered,
        selectedLayerId: newSelectedId,
      }
    })
  },

  updateLayer: (id, updates) => {
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      ),
    }))
  },

  reorderLayers: (startIndex, endIndex) => {
    const state = get()
    const sortedLayers = [...state.layers].sort((a, b) => a.order - b.order)

    // Find the layer being moved
    const movingLayer = sortedLayers[startIndex]
    if (!movingLayer) return

    // Cannot move default layer
    if (movingLayer.id === 'default') {
      console.warn('Cannot reorder the default layer')
      return
    }

    // Cannot drop below default layer (index 0 position)
    if (endIndex === 0) {
      console.warn('Cannot place a layer below the default layer')
      return
    }

    // Remove from old position and insert at new position
    const reordered = [...sortedLayers]
    const [removed] = reordered.splice(startIndex, 1)
    if (removed) {
      reordered.splice(endIndex, 0, removed)
    }

    // Recalculate order fields, keeping default at 0
    const withNewOrders = reordered.map((layer, index) => ({
      ...layer,
      order: layer.id === 'default' ? 0 : index,
    }))

    set({ layers: withNewOrders })
  },

  toggleLayerVisibility: (id) => {
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    }))
  },

  toggleLayerLock: (id) => {
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      ),
    }))
  },

  selectLayer: (id) => {
    set({ selectedLayerId: id })
  },

  setLayers: (layers) => {
    // Ensure default layer exists
    const hasDefault = layers.some((l) => l.id === 'default')
    const finalLayers = hasDefault
      ? layers
      : [{ ...DEFAULT_LAYER, createdAt: Date.now() }, ...layers]

    set({
      layers: finalLayers,
      selectedLayerId: null,
    })
  },

  // Selectors
  getLayerById: (id) => {
    return get().layers.find((l) => l.id === id)
  },

  getLayersInOrder: () => {
    return [...get().layers].sort((a, b) => a.order - b.order)
  },

  getDefaultLayer: () => {
    const defaultLayer = get().layers.find((l) => l.id === 'default')
    // Should always exist, but fallback to constant if somehow missing
    return defaultLayer || DEFAULT_LAYER
  },
})
