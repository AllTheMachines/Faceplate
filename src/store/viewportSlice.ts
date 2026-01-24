import { StateCreator } from 'zustand'

export interface ViewportSlice {
  // Viewport transform
  scale: number
  offsetX: number
  offsetY: number

  // Interaction state
  isPanning: boolean
  dragStart: { x: number; y: number } | null

  // Live drag/resize values (not persisted, not undoable)
  liveDragValues: { [elementId: string]: { x?: number; y?: number; width?: number; height?: number } } | null

  // Actions
  setViewport: (scale: number, offsetX: number, offsetY: number) => void
  setScale: (scale: number) => void
  setPanning: (isPanning: boolean) => void
  setDragStart: (dragStart: { x: number; y: number } | null) => void
  setLiveDragValues: (values: { [elementId: string]: { x?: number; y?: number; width?: number; height?: number } } | null) => void
}

export const createViewportSlice: StateCreator<ViewportSlice, [], [], ViewportSlice> = (set) => ({
  // Default state
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isPanning: false,
  dragStart: null,
  liveDragValues: null,

  // Actions
  setViewport: (scale, offsetX, offsetY) =>
    set({ scale, offsetX, offsetY }),

  setScale: (scale) =>
    set({ scale }),

  setPanning: (isPanning) =>
    set({ isPanning }),

  setDragStart: (dragStart) =>
    set({ dragStart }),

  setLiveDragValues: (values) =>
    set({ liveDragValues: values }),
})
