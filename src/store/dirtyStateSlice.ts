import { StateCreator } from 'zustand'
import type { Store } from './index'

export interface DirtyStateSlice {
  // State
  savedStateSnapshot: string | null
  lastSavedTimestamp: number | null

  // Actions
  setSavedState: (snapshot: string, timestamp: number) => void
  clearSavedState: () => void

  // Selector
  isDirty: () => boolean
}

export const createDirtyStateSlice: StateCreator<Store, [], [], DirtyStateSlice> = (
  set,
  get
) => ({
  // Default state
  savedStateSnapshot: null,
  lastSavedTimestamp: null,

  // Actions
  setSavedState: (snapshot, timestamp) => {
    set({ savedStateSnapshot: snapshot, lastSavedTimestamp: timestamp })
  },

  clearSavedState: () => {
    set({ savedStateSnapshot: null, lastSavedTimestamp: null })
  },

  // Selector - compares current state against saved snapshot
  isDirty: () => {
    const state = get()
    const { savedStateSnapshot, elements } = state

    // Never saved project
    if (savedStateSnapshot === null) {
      // Dirty if has content (elements added)
      return elements.length > 0
    }

    // Compare current serializable state against saved snapshot
    const currentSnapshot = JSON.stringify({
      elements: state.elements,
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      backgroundColor: state.backgroundColor,
      backgroundType: state.backgroundType,
      gradientConfig: state.gradientConfig,
      snapToGrid: state.snapToGrid,
      gridSize: state.gridSize,
      assets: state.assets,
      knobStyles: state.knobStyles,
    })

    return currentSnapshot !== savedStateSnapshot
  },
})
