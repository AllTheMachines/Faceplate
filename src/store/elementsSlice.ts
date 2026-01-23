import { StateCreator } from 'zustand'
import { ElementConfig } from '../types/elements'

export interface ElementsSlice {
  // State
  elements: ElementConfig[]
  selectedIds: string[]
  lastSelectedId: string | null

  // Actions
  addElement: (element: ElementConfig) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<ElementConfig>) => void
  setElements: (elements: ElementConfig[]) => void
  getElement: (id: string) => ElementConfig | undefined

  // Selection actions
  selectElement: (id: string) => void
  toggleSelection: (id: string) => void
  addToSelection: (id: string) => void
  clearSelection: () => void
  selectMultiple: (ids: string[]) => void
}

export const createElementsSlice: StateCreator<ElementsSlice, [], [], ElementsSlice> = (
  set,
  get
) => ({
  // Default state
  elements: [],
  selectedIds: [],
  lastSelectedId: null,

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
        el.id === id ? ({ ...el, ...updates } as ElementConfig) : el
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

  // Selection actions
  selectElement: (id) =>
    set({
      selectedIds: [id],
      lastSelectedId: id,
    }),

  toggleSelection: (id) =>
    set((state) => {
      const isSelected = state.selectedIds.includes(id)
      return {
        selectedIds: isSelected
          ? state.selectedIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedIds, id],
        lastSelectedId: isSelected ? state.lastSelectedId : id,
      }
    }),

  addToSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds
        : [...state.selectedIds, id],
      lastSelectedId: id,
    })),

  clearSelection: () =>
    set({
      selectedIds: [],
      lastSelectedId: null,
    }),

  selectMultiple: (ids) =>
    set({
      selectedIds: ids,
    }),
})
