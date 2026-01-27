import { StateCreator } from 'zustand'
import { ElementConfig } from '../types/elements'

// Format timestamp to "27 Jan 06:38" in CET
function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    day: '2-digit',
    month: 'short'
  })
}

export interface ElementsSlice {
  // State
  elements: ElementConfig[]
  selectedIds: string[]
  lastSelectedId: string | null
  // Pre-formatted timestamp from project file (e.g., "27 Jan 06:38")
  // Set on save/load, null for new projects
  lastSavedTimestamp: string | null

  // Actions
  addElement: (element: ElementConfig) => void
  addElements: (elements: ElementConfig[]) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<ElementConfig>) => void
  setElements: (elements: ElementConfig[]) => void
  getElement: (id: string) => ElementConfig | undefined
  // Set timestamp from file (on load) or current time (on save)
  setLastSavedTimestamp: (timestamp: number | null) => void

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
  lastSavedTimestamp: null,

  // Actions
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
    })),

  addElements: (elements) =>
    set((state) => ({
      elements: [...state.elements, ...elements],
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

  setLastSavedTimestamp: (timestamp) =>
    set({
      lastSavedTimestamp: timestamp ? formatTimestamp(timestamp) : null,
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
