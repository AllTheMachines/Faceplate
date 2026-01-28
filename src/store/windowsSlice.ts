import { StateCreator } from 'zustand'
import type { GradientConfig } from './canvasSlice'

// ============================================================================
// Types
// ============================================================================

export type WindowType = 'release' | 'developer'

export interface UIWindow {
  id: string
  name: string
  type: WindowType
  width: number
  height: number
  backgroundColor: string
  backgroundType: 'color' | 'gradient' | 'image'
  gradientConfig?: GradientConfig
  elementIds: string[]  // References to elements in ElementsSlice
  createdAt: number
}

// ============================================================================
// Slice Interface
// ============================================================================

export interface WindowsSlice {
  // State
  windows: UIWindow[]
  activeWindowId: string | null

  // Actions
  addWindow: (window: Partial<UIWindow>) => string
  removeWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<UIWindow>) => void
  setActiveWindow: (id: string) => void
  duplicateWindow: (id: string) => string
  setWindows: (windows: UIWindow[]) => void

  // Element-Window association
  addElementToWindow: (elementId: string, windowId?: string) => void
  removeElementFromWindow: (elementId: string, windowId?: string) => void
  moveElementToWindow: (elementId: string, targetWindowId: string) => void

  // Selectors (computed at call time)
  getActiveWindow: () => UIWindow | undefined
  getReleaseWindows: () => UIWindow[]
  getDeveloperWindows: () => UIWindow[]
  getWindowById: (id: string) => UIWindow | undefined
  getWindowForElement: (elementId: string) => UIWindow | undefined
}

// ============================================================================
// Default Window Factory
// ============================================================================

export function createDefaultWindow(overrides: Partial<UIWindow> = {}): UIWindow {
  return {
    id: crypto.randomUUID(),
    name: 'Main Window',
    type: 'release',
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',
    backgroundType: 'color',
    elementIds: [],
    createdAt: Date.now(),
    ...overrides,
  }
}

// ============================================================================
// Slice Creator
// ============================================================================

export const createWindowsSlice: StateCreator<WindowsSlice, [], [], WindowsSlice> = (
  set,
  get
) => ({
  // Default state - start with one window
  windows: [createDefaultWindow()],
  activeWindowId: null, // Will be set to first window's ID on first access

  // Actions
  addWindow: (windowData) => {
    const newWindow = createDefaultWindow({
      name: windowData.name || `Window ${get().windows.length + 1}`,
      ...windowData,
    })

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    }))

    return newWindow.id
  },

  removeWindow: (id) => {
    const state = get()
    // Cannot delete last window
    if (state.windows.length <= 1) {
      console.warn('Cannot delete the last window')
      return
    }

    // If deleting active window, switch to another
    let newActiveId = state.activeWindowId
    if (state.activeWindowId === id) {
      const remainingWindows = state.windows.filter((w) => w.id !== id)
      newActiveId = remainingWindows[0]?.id || null
    }

    set({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: newActiveId,
    })
  },

  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }))
  },

  setActiveWindow: (id) => {
    const window = get().windows.find((w) => w.id === id)
    if (window) {
      set({ activeWindowId: id })
    }
  },

  duplicateWindow: (id) => {
    const original = get().windows.find((w) => w.id === id)
    if (!original) {
      return ''
    }

    const duplicated = createDefaultWindow({
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      elementIds: [], // Don't copy elements - user can copy/paste manually
      createdAt: Date.now(),
    })

    set((state) => ({
      windows: [...state.windows, duplicated],
      activeWindowId: duplicated.id,
    }))

    return duplicated.id
  },

  setWindows: (windows) => {
    const activeId = windows.length > 0 ? windows[0]!.id : null
    set({
      windows,
      activeWindowId: activeId,
    })
  },

  // Element-Window association
  addElementToWindow: (elementId, windowId) => {
    const state = get()
    const targetWindowId = windowId || state.activeWindowId
    if (!targetWindowId) return

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === targetWindowId && !w.elementIds.includes(elementId)
          ? { ...w, elementIds: [...w.elementIds, elementId] }
          : w
      ),
    }))
  },

  removeElementFromWindow: (elementId, windowId) => {
    const state = get()
    const targetWindowId = windowId || state.activeWindowId
    if (!targetWindowId) return

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === targetWindowId
          ? { ...w, elementIds: w.elementIds.filter((id) => id !== elementId) }
          : w
      ),
    }))
  },

  moveElementToWindow: (elementId, targetWindowId) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        // Remove from all windows
        const withoutElement = w.elementIds.filter((id) => id !== elementId)
        // Add to target window
        if (w.id === targetWindowId) {
          return { ...w, elementIds: [...withoutElement, elementId] }
        }
        return { ...w, elementIds: withoutElement }
      }),
    }))
  },

  // Selectors
  getActiveWindow: () => {
    const state = get()
    // Auto-select first window if no active window
    if (!state.activeWindowId && state.windows.length > 0) {
      // Side effect: set the active window
      set({ activeWindowId: state.windows[0]!.id })
      return state.windows[0]
    }
    return state.windows.find((w) => w.id === state.activeWindowId)
  },

  getReleaseWindows: () => {
    return get().windows.filter((w) => w.type === 'release')
  },

  getDeveloperWindows: () => {
    return get().windows.filter((w) => w.type === 'developer')
  },

  getWindowById: (id) => {
    return get().windows.find((w) => w.id === id)
  },

  getWindowForElement: (elementId) => {
    return get().windows.find((w) => w.elementIds.includes(elementId))
  },
})
