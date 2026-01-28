import { StateCreator } from 'zustand'

export interface WindowViewport {
  scale: number
  offsetX: number
  offsetY: number
}

export interface ViewportSlice {
  // Viewport transform (current/active window)
  scale: number
  offsetX: number
  offsetY: number

  // Per-window viewport storage (preserves viewport when switching windows)
  windowViewports: Record<string, WindowViewport>

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

  // Per-window viewport actions
  saveWindowViewport: (windowId: string) => void
  restoreWindowViewport: (windowId: string) => void
  clearWindowViewport: (windowId: string) => void
}

export const createViewportSlice: StateCreator<ViewportSlice, [], [], ViewportSlice> = (set, get) => ({
  // Default state
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  windowViewports: {},
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

  // Per-window viewport actions
  saveWindowViewport: (windowId) => {
    const { scale, offsetX, offsetY } = get()
    set((state) => ({
      windowViewports: {
        ...state.windowViewports,
        [windowId]: { scale, offsetX, offsetY },
      },
    }))
  },

  restoreWindowViewport: (windowId) => {
    const viewport = get().windowViewports[windowId]
    if (viewport) {
      set({
        scale: viewport.scale,
        offsetX: viewport.offsetX,
        offsetY: viewport.offsetY,
      })
    } else {
      // Reset to default viewport for new windows
      set({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      })
    }
  },

  clearWindowViewport: (windowId) => {
    set((state) => {
      const { [windowId]: _, ...rest } = state.windowViewports
      return { windowViewports: rest }
    })
  },
})
