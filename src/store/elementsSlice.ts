import { StateCreator } from 'zustand'
import { ElementConfig } from '../types/elements'

export interface ElementsSlice {
  // State
  elements: ElementConfig[]
  selectedIds: string[] // For future Phase 3 selection

  // Actions
  addElement: (element: ElementConfig) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<ElementConfig>) => void
  setElements: (elements: ElementConfig[]) => void
  getElement: (id: string) => ElementConfig | undefined
}

export const createElementsSlice: StateCreator<ElementsSlice, [], [], ElementsSlice> = (
  set,
  get
) => ({
  // Default state
  elements: [],
  selectedIds: [],

  // Actions
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              ...updates,
              // Preserve type to maintain discriminated union integrity
              type: el.type,
            }
          : el
      ),
    })),

  setElements: (elements) =>
    set({
      elements,
    }),

  // Selector helper
  getElement: (id) => {
    return get().elements.find((el) => el.id === id)
  },
})
