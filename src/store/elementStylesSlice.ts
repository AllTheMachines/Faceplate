import { StateCreator } from 'zustand'
import { ElementStyle, ElementCategory } from '../types/elementStyle'

export interface ElementStylesSlice {
  // State
  elementStyles: ElementStyle[]

  // Actions
  addElementStyle: (style: Omit<ElementStyle, 'id' | 'createdAt'>) => void
  removeElementStyle: (id: string) => void
  updateElementStyle: (id: string, updates: Partial<ElementStyle>) => void
  setElementStyles: (styles: ElementStyle[]) => void  // For project load
  getElementStyle: (id: string) => ElementStyle | undefined
  getStylesByCategory: (category: ElementCategory) => ElementStyle[]
}

export const createElementStylesSlice: StateCreator<ElementStylesSlice, [], [], ElementStylesSlice> = (
  set,
  get
) => ({
  // Default state
  elementStyles: [],

  // Actions
  addElementStyle: (styleData) =>
    set((state) => ({
      elementStyles: [
        ...state.elementStyles,
        {
          ...styleData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        } as ElementStyle,
      ],
    })),

  removeElementStyle: (id) =>
    set((state) => ({
      elementStyles: state.elementStyles.filter((style) => style.id !== id),
    })),

  updateElementStyle: (id, updates) =>
    set((state) => ({
      elementStyles: state.elementStyles.map((style) =>
        style.id === id ? ({ ...style, ...updates } as ElementStyle) : style
      ),
    })),

  setElementStyles: (styles) =>
    set(() => ({
      elementStyles: styles,
    })),

  getElementStyle: (id) => {
    return get().elementStyles.find((style) => style.id === id)
  },

  getStylesByCategory: (category) => {
    return get().elementStyles.filter((style) => style.category === category)
  },
})
