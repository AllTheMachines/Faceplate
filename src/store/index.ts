import { create, StateCreator } from 'zustand'
import { temporal } from 'zundo'
import { createCanvasSlice, CanvasSlice } from './canvasSlice'
import { createViewportSlice, ViewportSlice } from './viewportSlice'
import { createElementsSlice, ElementsSlice } from './elementsSlice'
import { createAssetsSlice, AssetsSlice } from './assetsSlice'
import { createKnobStylesSlice, KnobStylesSlice } from './knobStylesSlice'
import { createDirtyStateSlice, DirtyStateSlice } from './dirtyStateSlice'
import { createContainerEditorSlice, ContainerEditorSlice } from './containerEditorSlice'
import type { Template } from '../types/template'

// Template functionality
export interface TemplateSlice {
  loadFromTemplate: (template: Template) => void
  clearCanvas: () => void
}

// Use Store type for createTemplateSlice since it sets properties from multiple slices
const createTemplateSlice: StateCreator<Store, [], [], TemplateSlice> = (set) => ({
  loadFromTemplate: (template: Template) => {
    set({
      elements: template.elements,
      selectedIds: [],
      canvasWidth: template.metadata.canvasWidth,
      canvasHeight: template.metadata.canvasHeight,
      backgroundColor: template.metadata.backgroundColor,
    })
  },

  clearCanvas: () => {
    set({
      elements: [],
      selectedIds: [],
    })
  },
})

// Combined store type
export type Store = CanvasSlice & ViewportSlice & ElementsSlice & TemplateSlice & AssetsSlice & KnobStylesSlice & DirtyStateSlice & ContainerEditorSlice

// Create the combined store with temporal middleware
export const useStore = create<Store>()(
  temporal(
    (...a) => ({
      ...createCanvasSlice(...a),
      ...createViewportSlice(...a),
      ...createElementsSlice(...a),
      ...createTemplateSlice(...a),
      ...createAssetsSlice(...a),
      ...createKnobStylesSlice(...a),
      ...createDirtyStateSlice(...a),
      ...createContainerEditorSlice(...a),
    }),
    {
      limit: 50,
      // Exclude viewport state and selection from undo history
      // - Viewport (camera position) should not be undoable
      // - Selection changes should not be undoable (would cause confusion)
      // - Live drag values are transient UI state
      // - Dirty state tracking (savedStateSnapshot, lastSavedTimestamp) should not be undoable
      // - Container editor state (editingContainerId, containerEditStack) is UI state
      partialize: (state) => {
        const {
          scale, offsetX, offsetY, isPanning, dragStart, lockAllMode,
          selectedIds, lastSelectedId, liveDragValues,
          savedStateSnapshot, lastSavedTimestamp,
          editingContainerId, containerEditStack,
          ...rest
        } = state
        return rest
      },
    }
  )
)

// Export temporal access for undo/redo
// Note: Access temporal store directly via useStore.temporal
export const { getState, setState, subscribe } = useStore