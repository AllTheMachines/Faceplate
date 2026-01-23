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

  // Actions
  setCanvasDimensions: (width: number, height: number) => void
  setBackgroundColor: (color: string) => void
  setBackgroundType: (type: 'color' | 'gradient' | 'image') => void
  setGradientConfig: (config: GradientConfig) => void
}

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set) => ({
  // Default state
  canvasWidth: 800,
  canvasHeight: 600,
  backgroundColor: '#1a1a1a',
  backgroundType: 'color',

  // Actions
  setCanvasDimensions: (width, height) =>
    set({ canvasWidth: width, canvasHeight: height }),

  setBackgroundColor: (color) =>
    set({ backgroundColor: color }),

  setBackgroundType: (type) =>
    set({ backgroundType: type }),

  setGradientConfig: (config) =>
    set({ gradientConfig: config }),
})
