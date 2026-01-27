import { StateCreator } from 'zustand'
import { ElementConfig } from '../types/elements'

export interface ElementsSlice {
  // State
  elements: ElementConfig[]
  selectedIds: string[]
  lastSelectedId: string | null
  // Unix timestamp of last project modification (updated on element changes)
  lastModified: number | null

  // Actions
  addElement: (element: ElementConfig) => void
  addElements: (elements: ElementConfig[]) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<ElementConfig>) => void
  setElements: (elements: ElementConfig[]) => void
  getElement: (id: string) => ElementConfig | undefined
  setLastModified: (timestamp: number | null) => void

  // Selection actions
  selectElement: (id: string) => void
  toggleSelection: (id: string) => void
  addToSelection: (id: string) => void
  clearSelection: () => void
  selectMultiple: (ids: string[]) => void

  // Z-order actions
  moveToFront: (id: string) => void
  moveToBack: (id: string) => void
  moveForward: (id: string) => void
  moveBackward: (id: string) => void
}

export const createElementsSlice: StateCreator<ElementsSlice, [], [], ElementsSlice> = (
  set,
  get
) => ({
  // Default state
  elements: [],
  selectedIds: [],
  lastSelectedId: null,
  lastModified: null,

  // Actions
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      lastModified: Date.now(),
    })),

  addElements: (elements) =>
    set((state) => ({
      elements: [...state.elements, ...elements],
      lastModified: Date.now(),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
      lastModified: Date.now(),
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as ElementConfig) : el
      ),
      lastModified: Date.now(),
    })),

  setElements: (elements) =>
    set({
      elements,
    }),

  setLastModified: (timestamp) =>
    set({
      lastModified: timestamp,
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

  // Z-order actions
  moveToFront: (id) =>
    set((state) => {
      const element = state.elements.find((el) => el.id === id)
      if (!element) return state
      return {
        elements: [...state.elements.filter((el) => el.id !== id), element],
      }
    }),

  moveToBack: (id) =>
    set((state) => {
      const element = state.elements.find((el) => el.id === id)
      if (!element) return state
      return {
        elements: [element, ...state.elements.filter((el) => el.id !== id)],
      }
    }),

  moveForward: (id) =>
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === id)
      if (index === -1 || index === state.elements.length - 1) return state
      const newElements = [...state.elements]
      const temp = newElements[index]!
      newElements[index] = newElements[index + 1]!
      newElements[index + 1] = temp
      return { elements: newElements }
    }),

  moveBackward: (id) =>
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === id)
      if (index <= 0) return state
      const newElements = [...state.elements]
      const temp = newElements[index]!
      newElements[index] = newElements[index - 1]!
      newElements[index - 1] = temp
      return { elements: newElements }
    }),
})
