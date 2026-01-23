import { StateCreator } from 'zustand'

export interface GradientConfig {
  type: 'linear' | 'radial'
  colors: string[]
  angle?: number // for linear gradients
}

export interface CanvasSlice {
  // Canvas dimensions
  canvasWidth: number
  canvasHeight: number

  // Background configuration
  backgroundColor: string
  backgroundType: 'color' | 'gradient' | 'image'
  gradientConfig?: GradientConfig
  imageUrl?: string

  // Snap to grid
  snapToGrid: boolean
  gridSize: number

  // Actions
  setCanvasDimensions: (width: number, height: number) => void
  setBackgroundColor: (color: string) => void
  setBackgroundType: (type: 'color' | 'gradient' | 'image') => void
  setGradientConfig: (config: GradientConfig) => void
  setSnapToGrid: (enabled: boolean) => void
  setGridSize: (size: number) => void
}

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set) => ({
  // Default state
  canvasWidth: 800,
  canvasHeight: 600,
  backgroundColor: '#1a1a1a',
  backgroundType: 'color',
  snapToGrid: false,
  gridSize: 10,

  // Actions
  setCanvasDimensions: (width, height) =>
    set({ canvasWidth: width, canvasHeight: height }),

  setBackgroundColor: (color) =>
    set({ backgroundColor: color }),

  setBackgroundType: (type) =>
    set({ backgroundType: type }),

  setGradientConfig: (config) =>
    set({ gradientConfig: config }),

  setSnapToGrid: (enabled) =>
    set({ snapToGrid: enabled }),

  setGridSize: (size) =>
    set({ gridSize: size }),
})

/**
 * Snap a value to the nearest grid position
 */
export function snapValue(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}
