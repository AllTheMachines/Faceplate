import { StateCreator } from 'zustand'

export interface ViewportSlice {
  // Viewport transform
  scale: number
  offsetX: number
  offsetY: number

  // Interaction state
  isPanning: boolean

  // Actions
  setViewport: (scale: number, offsetX: number, offsetY: number) => void
  setScale: (scale: number) => void
  setPanning: (isPanning: boolean) => void
}

export const createViewportSlice: StateCreator<ViewportSlice, [], [], ViewportSlice> = (set) => ({
  // Default state
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isPanning: false,

  // Actions
  setViewport: (scale, offsetX, offsetY) =>
    set({ scale, offsetX, offsetY }),

  setScale: (scale) =>
    set({ scale }),

  setPanning: (isPanning) =>
    set({ isPanning }),
})
