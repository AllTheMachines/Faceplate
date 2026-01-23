import { create } from 'zustand'
import { temporal } from 'zundo'
import { createCanvasSlice, CanvasSlice } from './canvasSlice'
import { createViewportSlice, ViewportSlice } from './viewportSlice'

// Combined store type
export type Store = CanvasSlice & ViewportSlice

// Create the combined store with temporal middleware
export const useStore = create<Store>()(
  temporal(
    (...a) => ({
      ...createCanvasSlice(...a),
      ...createViewportSlice(...a),
    }),
    {
      limit: 50,
      // Exclude viewport state from undo history (camera position should not be undoable)
      partialize: (state) => {
        const { scale, offsetX, offsetY, isPanning, ...rest } = state
        return rest
      },
    }
  )
)

// Export temporal access for undo/redo
// Note: Access temporal store directly via useStore.temporal
export const { getState, setState, subscribe } = useStore
